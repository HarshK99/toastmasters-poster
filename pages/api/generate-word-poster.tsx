// pages/api/generate-word-poster.tsx
import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

export const config = { api: { bodyParser: true } };

type WordJson = { word: string; meaning: string; example: string };

async function callOpenAIForWord(theme: string, level: string): Promise<WordJson | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    const system = `You are a helpful assistant that returns a single English word, its concise one-line meaning, and a short example sentence using the word. Output must be valid JSON with keys: word, meaning, example. Do NOT output any other text.`;
    const prompt = `Generate a ${level} difficulty word related to the theme "${theme}". Return only a JSON object like {"word":"...","meaning":"...","example":"..."}`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 200 }),
    });
    if (!resp.ok) {
      console.error('[generate-word-poster] OpenAI failed', await resp.text());
      return null;
    }
    const d = await resp.json();
    const text = d?.choices?.[0]?.message?.content ?? d?.choices?.[0]?.text;
    if (!text || typeof text !== 'string') return null;
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    const json = JSON.parse(text.slice(start, end + 1));
    if (json.word && json.meaning && json.example) return { word: String(json.word), meaning: String(json.meaning), example: String(json.example) };
    return null;
  } catch (err) {
    console.error('[generate-word-poster] callOpenAI error', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { theme = '', level = 'medium' } = req.body || {};
  if (!level) return res.status(400).json({ error: 'Missing level' });

  // Step A: if word/meaning/example not provided, call OpenAI to get them
  let word: string | undefined = undefined;
  let meaning: string | undefined = undefined;
  let example: string | undefined = undefined;
  try {
    const ai = await callOpenAIForWord(theme, level);
    if (ai) {
      word = ai.word;
      meaning = ai.meaning;
      example = ai.example;
    }
  } catch (err) {
    console.error('[generate-word-poster] LLM step failed', err);
  }
  // If LLM failed and request provided fields, try to use them
  const body = req.body || {};
  if (!word) word = body.word;
  if (!meaning) meaning = body.meaning;
  if (!example) example = body.example;

  if (!word || !meaning || !example) {
    return res.status(500).json({ error: 'Failed to obtain word/meaning/example from LLM or request body.' });
  }

  // Illustrations removed - poster will be composed without an image.

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
    const compositeLayers: { input: Buffer; top: number; left: number }[] = [
      { input: Buffer.from(svg), top: 0, left: 0 },
    ];
    // No illustration layer is added (illustration removed)

    const finalBuffer = await sharp(bg)
      .composite(compositeLayers)
      .png()
      .toBuffer();

    // Return image as base64 data URL instead of saving to disk
    const dataUrl = `data:image/png;base64,${finalBuffer.toString('base64')}`;
    const respObj: { dataUrl: string; word: string; meaning: string; example: string; note?: string } = { dataUrl, word, meaning, example };
    respObj.note = 'Poster created without illustration (not saved to disk).';
    return res.status(200).json(respObj);
  } catch (err) {
    console.error("[generate-word-poster] error:", err);
    return res.status(500).json({ error: "Failed to compose poster." });
  }
}
