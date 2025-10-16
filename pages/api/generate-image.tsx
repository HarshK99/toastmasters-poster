// pages/api/generate-image.ts
import type { NextApiRequest, NextApiResponse } from "next";
import * as formidableModule from "formidable";
import type { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";
import { composePoster } from "../../lib/composite";
import { uploadToReplicate, createPrediction, pollPrediction, downloadUrlToBuffer } from "../../lib/replicate";

export const config = { api: { bodyParser: false } };

// temp upload dir
const uploadDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// normalize field
function fieldToString(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

// parseForm compatible with multiple formidable versions
function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  const options = { multiples: false, uploadDir, keepExtensions: true };

  return new Promise((resolve, reject) => {
    try {
      const imported: unknown = formidableModule;

      if (typeof imported === "function") {
        // v3+
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const form: any = (imported as any)(options);
        form.parse(req, (err: any, fields: any, files: any) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
        return;
      }

      if (typeof imported === "object" && imported !== null && "IncomingForm" in imported) {
        // v1/v2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const FormCtor: any = (imported as any).IncomingForm;
        const form: any = new FormCtor(options);
        form.parse(req, (err: any, fields: any, files: any) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
        return;
      }

      if (typeof (imported as any)?.parse === "function") {
        // older shape parse(req, options, cb)
        (imported as any).parse(req, options, (err: any, fields: any, files: any) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
        return;
      }

      reject(new Error("Unsupported formidable import shape."));
    } catch (e) {
      reject(e);
    }
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  // check env
  const REPLICATE_TEXT_VERSION = process.env.REPLICATE_TEXT_VERSION;
  const REPLICATE_IMG2IMG_VERSION = process.env.REPLICATE_IMG2IMG_VERSION;
  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "Missing REPLICATE_API_TOKEN environment variable." });
  }
  if (!REPLICATE_TEXT_VERSION) {
    return res.status(500).json({ error: "Missing REPLICATE_TEXT_VERSION environment variable." });
  }
  if (!REPLICATE_IMG2IMG_VERSION) {
    return res.status(500).json({ error: "Missing REPLICATE_IMG2IMG_VERSION environment variable." });
  }

  try {
    const { fields, files } = await parseForm(req);

    // normalize inputs
    const clubName = fieldToString(fields.clubName, "Bright Beginning Toastmasters");
    const meetingNumber = fieldToString(fields.meetingNumber, "274");
    const date = fieldToString(fields.date, "");
    const time = fieldToString(fields.time, "");
    const place = fieldToString(fields.place, "");
    const zoomLink = fieldToString(fields.zoomLink, "");
    const theme = fieldToString(fields.theme, "");
    const stylePreset = fieldToString(fields.stylePreset, "minimalist");
    const palette = fields.paletteJson ? JSON.parse(fieldToString(fields.paletteJson)) : {
      primary: "#0B3D91",
      accent: "#E94B35",
      bg: "#FFFFFF",
      text: "#111827",
    };
    const useLogo = fieldToString(fields.useLogo, "1") !== "0";

    // detect uploaded photo (support multiple formidable shapes)
    // typical props: filepath (v3+), path (older)
    let uploadedFilePath: string | null = null;
    if (files && Object.keys(files).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fAny: any = files;
      const photoField = fAny.photo ?? fAny["photo"];
      if (photoField) {
        uploadedFilePath = photoField.filepath ?? photoField.filePath ?? photoField.path ?? null;
      } else {
        // if client used different field name, pick first file entry's path
        const keys = Object.keys(fAny);
        if (keys.length > 0) {
          const first = fAny[keys[0]];
          uploadedFilePath = first?.filepath ?? first?.path ?? null;
        }
      }
    }

    const hasPhoto = Boolean(uploadedFilePath);

    // build prompts
    const negativePrompt = "watermark, text, low-resolution, extra fingers, deformed face, extra limbs, artifacts, blurred";

    const basePrompt = [
      `Create a high-quality poster background for a Toastmasters club meeting with theme "${theme}".`,
      `Design with strong visual hierarchy:`,
      `- Bold, prominent headline area at the top using modern sans-serif typography.`,
      `- Large, clearly separated portrait area at center-right as the main focal point.`,
      `- Metadata (club name, meeting number, date, time, place, Zoom link) arranged in a clean, modular grid below the headline.`,
      `- Use generous whitespace and padding between sections for clarity.`,
      `- Apply gradients, subtle drop shadows, and clean lines for a modern look.`,
      `- Ensure high contrast between headline, portrait, and metadata areas.`,
      `- Use the fixed color palette: primary=${palette.primary}, accent=${palette.accent}, bg=${palette.bg}, text=${palette.text}.`,
      `- Print-ready, 4:5 aspect ratio, high detail.`,
      `- Avoid excessive text; only placeholders for text, as final text will be overlaid during compositing.`,
    ].join(" ");

    const img2imgPrompt = [
      `Stylize this uploaded headshot into a ${stylePreset} portrait suitable for a club poster: shoulder-up crop, confident expression, studio lighting, soft vignette.`,
      `Match poster color palette: ${palette.primary} and ${palette.accent}. Preserve facial identity and realism.`,
      `Output a high-resolution crop suitable for a 4:5 poster portrait.`,
    ].join(" ");

    const synthPrompt = [
      `Photorealistic headshot for a Toastmasters poster: ${stylePreset}, shoulder-up, confident smile, studio lighting, neutral background.`,
      `Match poster palette: primary=${palette.primary}, accent=${palette.accent}. High-detail, 4:5 crop, realistic facial features.`,
    ].join(" ");

    // ---------- 1) Create background (text→image) ----------
    const textInput = {
      prompt: basePrompt,
      negative_prompt: negativePrompt,
      width: 1024,
      height: 1280,
      guidance_scale: 7.5,
    };

    const { predictionUrl: bgPredictionUrl } = await createPrediction(REPLICATE_TEXT_VERSION, textInput);
    const bgFinal = await pollPrediction(bgPredictionUrl, 180_000, 1500);
    // Detailed logging for debugging
    console.log("[generate-image] Background prediction result:", JSON.stringify(bgFinal, null, 2));
    let bgImageUrl: string | null = null;
    if (Array.isArray(bgFinal.output)) {
      if (bgFinal.output.length === 0) {
        console.error("[generate-image] Background generation failed. Full response:", JSON.stringify(bgFinal, null, 2));
        throw new Error("Background generation returned no outputs. See server logs for details.");
      }
      bgImageUrl = String(bgFinal.output[0]);
    } else if (typeof bgFinal.output === "string" && bgFinal.output) {
      bgImageUrl = bgFinal.output;
    } else {
      console.error("[generate-image] Background generation failed. Full response:", JSON.stringify(bgFinal, null, 2));
      throw new Error("Background generation returned no outputs. See server logs for details.");
    }

    // ---------- 2) Portrait (img2img if uploaded, else text2img) ----------
    let portraitBuffer: Buffer;
    if (hasPhoto && uploadedFilePath) {
      // upload file to Replicate uploads endpoint
      const uploadUrl = await uploadToReplicate(uploadedFilePath);

      const img2imgInput = {
        image: uploadUrl,
        prompt: img2imgPrompt,
        negative_prompt: negativePrompt,
        width: 768,
        height: 960,
        guidance_scale: 7.0,
      };

      const { predictionUrl: pPredictionUrl } = await createPrediction(REPLICATE_IMG2IMG_VERSION, img2imgInput);
      const pFinal = await pollPrediction(pPredictionUrl, 180_000, 1500);
      console.log("[generate-image] Portrait img2img prediction result:", JSON.stringify(pFinal, null, 2));
      let portraitUrl: string | null = null;
      if (Array.isArray(pFinal.output)) {
        if (pFinal.output.length === 0) {
          console.error("[generate-image] Portrait img2img failed. Full response:", JSON.stringify(pFinal, null, 2));
          throw new Error("Portrait img2img returned no outputs. See server logs for details.");
        }
        portraitUrl = String(pFinal.output[0]);
      } else if (typeof pFinal.output === "string" && pFinal.output) {
        portraitUrl = pFinal.output;
      } else {
        console.error("[generate-image] Portrait img2img failed. Full response:", JSON.stringify(pFinal, null, 2));
        throw new Error("Portrait img2img returned no outputs. See server logs for details.");
      }
      portraitBuffer = await downloadUrlToBuffer(portraitUrl);
    } else {
      // synthetic portrait via text model (use same text model or a dedicated portrait variant)
      const portraitInput = {
        prompt: synthPrompt,
        negative_prompt: negativePrompt,
        width: 768,
        height: 960,
        guidance_scale: 7.0,
      };

      const { predictionUrl: pPredictionUrl } = await createPrediction(REPLICATE_TEXT_VERSION, portraitInput);
      const pFinal = await pollPrediction(pPredictionUrl, 180_000, 1500);
      console.log("[generate-image] Synthetic portrait prediction result:", JSON.stringify(pFinal, null, 2));
      let portraitUrl: string | null = null;
      if (Array.isArray(pFinal.output)) {
        if (pFinal.output.length === 0) {
          console.error("[generate-image] Synthetic portrait failed. Full response:", JSON.stringify(pFinal, null, 2));
          throw new Error("Synthetic portrait returned no outputs. See server logs for details.");
        }
        portraitUrl = String(pFinal.output[0]);
      } else if (typeof pFinal.output === "string" && pFinal.output) {
        portraitUrl = pFinal.output;
      } else {
        console.error("[generate-image] Synthetic portrait failed. Full response:", JSON.stringify(pFinal, null, 2));
        throw new Error("Synthetic portrait returned no outputs. See server logs for details.");
      }
      portraitBuffer = await downloadUrlToBuffer(portraitUrl);
    }

    // download background buffer
    const bgBuffer = await downloadUrlToBuffer(bgImageUrl);

    // compose final poster
    const logoPath = useLogo ? path.join(process.cwd(), "public", "logo.png") : null;
    const finalBuffer = await composePoster({
      backgroundBuffer: bgBuffer,
      portraitBuffer,
      logoPath,
      texts: { clubName, meetingNumber, date, time, place, zoomLink, theme },
      palette,
    });

    // save final file
    const outDir = path.join(process.cwd(), "public/output");
    fs.mkdirSync(outDir, { recursive: true });
    const outName = `poster-${Date.now()}.png`;
    const outPath = path.join(outDir, outName);
    fs.writeFileSync(outPath, finalBuffer);

    const publicUrl = `${process.env.BASE_URL ?? ""}/output/${outName}`;
    return res.status(200).json({ url: publicUrl });
  } catch (err: unknown) {
    console.error("[generate-image] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
