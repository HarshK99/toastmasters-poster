// pages/api/generate-word-poster.tsx
import type { NextApiRequest, NextApiResponse } from "next";
import { createPrediction, pollPrediction, downloadUrlToBuffer } from "../../lib/replicate";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { word, meaning, example, level = "medium", theme = "" } = req.body || {};
  if (!word || !meaning || !example || !level) {
    return res.status(400).json({ error: "Missing required fields: word, meaning, example, level." });
  }

  // 1. Generate a small illustration for the example sentence
  let illustrationBuffer: Buffer | null = null;
  try {
    const prompt = `Illustration for the sentence: ${example}. The word is related to the theme '${theme}' and is a ${level} level word. Minimal, modern, colorful, no text, 1:1 aspect ratio.`;
    const negativePrompt = "text, watermark, logo, border, frame, signature, caption, label, writing, words";
    const REPLICATE_TEXT_VERSION = process.env.REPLICATE_TEXT_VERSION;
    if (!process.env.REPLICATE_API_TOKEN || !REPLICATE_TEXT_VERSION) {
      throw new Error("Missing Replicate API credentials.");
    }
    const input = {
      prompt,
      negative_prompt: negativePrompt,
      width: 512,
      height: 512,
      guidance_scale: 7.5,
    };
    const { predictionUrl } = await createPrediction(REPLICATE_TEXT_VERSION, input);
    const final = await pollPrediction(predictionUrl, 120_000, 1500);
    let imgUrl: string | null = null;
    if (Array.isArray(final.output) && final.output.length > 0) {
      imgUrl = String(final.output[0]);
    } else if (typeof final.output === "string" && final.output) {
      imgUrl = final.output;
    }
    if (imgUrl) {
      illustrationBuffer = await downloadUrlToBuffer(imgUrl);
    }
  } catch (err) {
    console.error("[generate-word-poster] Illustration generation failed:", err);
    illustrationBuffer = null;
  }

  // 2. Compose the poster
  try {
    // Poster size
    const width = 1024;
    const height = 1280;
    // Background
    const bg = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: '#f8fafc',
      },
    }).png().toBuffer();

    // Compose SVG overlay
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .word { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 80px; font-weight: bold; fill: #0B3D91; }
          .level { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 32px; fill: #E94B35; font-weight: bold; }
          .meaning { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 36px; fill: #333; }
          .example { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 28px; fill: #555; font-style: italic; }
        </style>
        <text x="50%" y="13%" text-anchor="middle" class="level">${level.charAt(0).toUpperCase() + level.slice(1)} word${theme ? ` • Theme: ${theme}` : ''}</text>
        <text x="50%" y="22%" text-anchor="middle" class="word">${word}</text>
        <text x="50%" y="32%" text-anchor="middle" class="meaning">${meaning}</text>
        <text x="50%" y="42%" text-anchor="middle" class="example">${example}</text>
      </svg>
    `;

    // Compose layers
    let compositeLayers: any[] = [
      { input: Buffer.from(svg), top: 0, left: 0 },
    ];
    if (illustrationBuffer) {
      compositeLayers.push({
        input: illustrationBuffer,
        top: Math.round(height * 0.5),
        left: Math.round((width - 512) / 2),
      });
    }

    const finalBuffer = await sharp(bg)
      .composite(compositeLayers)
      .png()
      .toBuffer();

    // Save and return URL
    const outDir = path.join(process.cwd(), "public/output");
    fs.mkdirSync(outDir, { recursive: true });
    const outName = `word-poster-${Date.now()}.png`;
    const outPath = path.join(outDir, outName);
    fs.writeFileSync(outPath, finalBuffer);
    const publicUrl = `${process.env.BASE_URL ?? ""}/output/${outName}`;
    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error("[generate-word-poster] error:", err);
    return res.status(500).json({ error: "Failed to compose poster." });
  }
}
