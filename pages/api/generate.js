// pages/api/generate.js
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { runReplicateTextToImage, runReplicateImg2Img } from "../../lib/replicate";
import { composePoster } from "../../lib/composite";

export const config = { api: { bodyParser: false } };

const uploadDir = path.join(process.cwd(), "/public/temp");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm({ multiples: false, uploadDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      // parse inputs
      const {
        clubName, meetingNumber, date, time, place, zoomLink, theme, stylePreset, paletteJson
      } = fields;

      // palette (stringified JSON sent from client)
      const palette = paletteJson ? JSON.parse(paletteJson) : {
        primary: "#0B3D91", accent: "#E94B35", bg: "#FFFFFF", text: "#111827"
      };

      let portraitPath = null;
      if (files.photo) {
        portraitPath = files.photo.path;
      }

      // build base prompts (we include palette tokens)
      const basePrompt = `High-quality poster background for a Toastmasters club meeting with theme "${theme}". 
Composition: large negative space at center-right for portrait, bold headline area at top, elegant sans-serif typography placeholders, subtle texture.
Use the fixed color palette: primary=${palette.primary}, accent=${palette.accent}, bg=${palette.bg}, text=${palette.text}.
Style preset: ${stylePreset}. Print-ready, 4:5 aspect ratio, high detail.`;

      let portraitOutputBuffer = null;

      if (portraitPath) {
        // call image-to-image to stylize the uploaded portrait
        const img2imgPrompt = `Stylize this headshot into a ${stylePreset} portrait suitable for a club poster: shoulder-up, confident, studio lighting, soft vignette, match poster palette: ${palette.primary}, ${palette.accent}. Preserve facial identity.`;
        const stylized = await runReplicateImg2Img(portraitPath, img2imgPrompt);
        portraitOutputBuffer = Buffer.from(await (await fetch(stylized)).arrayBuffer());
      } else {
        // generate synthetic portrait
        const synthPrompt = `Photorealistic headshot matching theme "${theme}", ${stylePreset}, studio lighting. Use palette: ${palette.primary}, ${palette.accent}. 4:5 crop.`;
        const synthUrl = await runReplicateTextToImage(synthPrompt);
        portraitOutputBuffer = Buffer.from(await (await fetch(synthUrl)).arrayBuffer());
      }

      // generate poster background (text-to-image)
      const bgUrl = await runReplicateTextToImage(basePrompt);
      const bgBuffer = Buffer.from(await (await fetch(bgUrl)).arrayBuffer());

      // compose final poster with sharp
      const finalBuffer = await composePoster({
        backgroundBuffer: bgBuffer,
        portraitBuffer: portraitOutputBuffer,
        logoPath: path.join(process.cwd(), "public", "logo.svg"),
        texts: {
          clubName, meetingNumber, date, time, place, zoomLink, theme
        },
        palette
      });

      // save final file to /public/output for quick preview; in prod use S3 or Supabase
      const outName = `poster-${Date.now()}.png`;
      const outPath = path.join(process.cwd(), "public", "output", outName);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, finalBuffer);

      const publicUrl = `${process.env.BASE_URL || ""}/output/${outName}`;
      return res.status(200).json({ url: publicUrl });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });
}
