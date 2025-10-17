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
    // Poster size (square)
    const width = 1024;
    const height = 1024;
    // Background
    const bg = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: '#f8fafc',
      },
    }).png().toBuffer();

    // Helper: escape XML
    const escapeXml = (str: string) =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    // Helper: simple word-wrap by max chars per line (preserves words)
    const wrapText = (text: string, maxChars: number, maxLines = 4) => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = '';
      for (const w of words) {
        if ((current + ' ' + w).trim().length <= maxChars) {
          current = (current + ' ' + w).trim();
        } else {
          if (current) lines.push(current);
          current = w;
          if (lines.length >= maxLines) break;
        }
      }
      if (current && lines.length < maxLines) lines.push(current);
      return lines.slice(0, maxLines);
    };

    const meaningLines = wrapText(meaning || '', 42, 3);
    const exampleLines = wrapText(example || '', 38, 3);

    // Compose SVG overlay (no level text; add labels, header/footer)
    const headerHeight = Math.round(height * 0.12); // 12% header
    const footerHeight = Math.round(height * 0.10); // 10% footer

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .heading { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 40px; fill: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
          .word { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 88px; font-weight: bold; fill: #0B3D91; }
          .label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 36px; fill: #333; font-weight: 700; }
          .meaning { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 50px; fill: #333; }
          .example { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 50px; fill: #555; font-style: italic; }
        </style>
        <!-- header background -->
        <rect x="0" y="0" width="100%" height="${headerHeight}" fill="#0B3D91" />
        <!-- footer background -->
        <rect x="0" y="${height - footerHeight}" width="100%" height="${footerHeight}" fill="#0B3D91" />
  <!-- heading inside header (white) -->
  <text x="50%" y="${Math.round(headerHeight * 0.6)}" text-anchor="middle" class="heading">Word of the Day</text>
  <!-- extra space after header: move word further down -->
  <text x="50%" y="24%" text-anchor="middle" class="word">${escapeXml(word)}</text>
        <g>
          <!-- meaning block moved slightly down to add spacing -->
          <text x="50%" y="36%" text-anchor="middle">
            <tspan class="label" x="50%" dy="0">Meaning</tspan>
            ${meaningLines
              .map((l, i) => `<tspan class="meaning" x="50%" dy="${i === 0 ? 1.2 : 1.2}em">${escapeXml(l)}</tspan>`)
              .join('')}
          </text>
        </g>
        <g>
          <!-- example block moved down a bit -->
          <text x="50%" y="60%" text-anchor="middle">
            <tspan class="label" x="50%" dy="0">Example</tspan>
            ${exampleLines
              .map((l, i) => `<tspan class="example" x="50%" dy="${i === 0 ? 1.2 : 1.2}em">${escapeXml(l)}</tspan>`)
              .join('')}
          </text>
        </g>
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
