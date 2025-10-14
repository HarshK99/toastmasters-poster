// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import * as formidableModule from "formidable";
import type { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

// ensure temp dir exists
const uploadDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Helper: normalize formidable field -> string
function fieldToString(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

/**
 * parseForm: compatible with multiple formidable versions.
 * We intentionally use `any` in the parse callback to avoid type mismatches
 * caused by varying formidable typings across versions.
 */
function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  const options = { multiples: false, uploadDir, keepExtensions: true };

  return new Promise((resolve, reject) => {
    try {
      const imported: unknown = formidableModule;

      // Case A: formidable exported as a factory function (v3+): formidable(options)
      if (typeof imported === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const form: any = (imported as any)(options);
        form.parse(req, (err: any, fields: any, files: any) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
        return;
      }

      // Case B: formidable exported as an object with IncomingForm constructor (v1/v2)
      if (typeof imported === "object" && imported !== null && "IncomingForm" in imported) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const FormCtor: any = (imported as any).IncomingForm;
        const form: any = new FormCtor(options);
        form.parse(req, (err: any, fields: any, files: any) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
        return;
      }

      // Case C: fallback if `parse` function exists on import
      if (typeof (imported as any)?.parse === "function") {
        // some older shapes call parse(req, options, cb)
        (imported as any).parse(req, options, (err: any, fields: any, files: any) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
        return;
      }

      reject(new Error("Unsupported formidable import shape. Please check installed formidable version."));
    } catch (err) {
      reject(err);
    }
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow CORS preflight (helpful for separate frontend)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: `Method ${req.method} not allowed. Use POST.` });
  }

  try {
    const { fields, files } = await parseForm(req);

    // normalize inputs (Fields from formidable can be string | string[] | undefined)
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

    const hasPhoto = Boolean(files && Object.keys(files).length && (files as Files)["photo"]);

    const negativePrompt = "watermark, text, low-resolution, extra fingers, deformed face, extra limbs, artifacts, blurred";

    const basePromptParts: string[] = [
      `High-quality poster background for a Toastmasters club meeting with theme "${theme}".`,
      `Composition: large negative space at center-right for portrait, bold headline area at top, elegant sans-serif typography placeholders, subtle paper texture.`,
      `Include space for: club name ("${clubName}"), meeting number (${meetingNumber}), date (${date}), time (${time}), place (${place}), and a small area for Zoom link.`,
      `Use the fixed color palette: primary=${palette.primary}, accent=${palette.accent}, bg=${palette.bg}, text=${palette.text}.`,
      `Style preset: ${stylePreset}. Print-ready, 4:5 aspect ratio, high detail, clean composition.`,
      `Prefer minimal text from the model; final text will be overlaid during compositing.`,
    ];
    const basePrompt = basePromptParts.join(" ");

    const img2imgPrompt = hasPhoto ? [
      `Stylize this uploaded headshot into a ${stylePreset} portrait suitable for a club poster: shoulder-up crop, confident expression, studio lighting, soft vignette.`,
      `Match poster color palette: ${palette.primary} and ${palette.accent}. Preserve facial identity and realism.`,
      `Output a high-resolution crop suitable for a 4:5 poster portrait.`
    ].join(" ") : null;

    const synthPrompt = !hasPhoto ? [
      `Photorealistic headshot for a Toastmasters poster: ${stylePreset}, shoulder-up, confident smile, studio lighting, neutral background.`,
      `Match poster palette: primary=${palette.primary}, accent=${palette.accent}. High-detail, 4:5 crop, realistic facial features.`
    ].join(" ") : null;

    const imageApiPayload = {
      basePrompt,
      negativePrompt,
      portraitMode: hasPhoto ? "img2img" : "text2img",
      img2imgPrompt,
      synthPrompt,
      params: {
        width: 1024,
        height: 1280,
        guidance_scale: 7.5,
        seed: null,
        samples: 1,
      },
      palette,
      overlayLogo: fieldToString(fields.useLogo, "1") !== "0",
    };

    return res.status(200).json({
      ok: true,
      inputs: {
        clubName,
        meetingNumber,
        date,
        time,
        place,
        zoomLink,
        theme,
        stylePreset,
        palette,
        hasPhoto,
      },
      prompts: imageApiPayload,
    });
  } catch (err) {
    console.error("[generate] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
