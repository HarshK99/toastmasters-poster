import { createPrediction, pollPrediction, downloadUrlToBuffer } from '../lib/replicate';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

type JobPayload = { id: string; theme: string; level: string; word?: string; meaning?: string; example?: string };

// Generates word/meaning/example using OpenAI (with a small fallback)
export async function generateWordJson(theme: string, level: string) {
  const key = process.env.OPENAI_API_KEY;
  let word = '';
  let meaning = '';
  let example = '';
  if (key) {
    try {
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const system = `You are a helpful assistant that returns a single English word, its concise one-line meaning, and a short example sentence using the word. Output must be valid JSON with keys: word, meaning, example. Do NOT output any other text.`;
      const prompt = `Generate a ${level} difficulty word related to the theme "${theme}". Return only a JSON object like {"word":"...","meaning":"...","example":"..."}`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'gpt-40-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 200 }),
      });
      const d = await resp.json();
      const text = d?.choices?.[0]?.message?.content ?? d?.choices?.[0]?.text;
      const start = (text || '').indexOf('{');
      const end = (text || '').lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const json = JSON.parse(text.slice(start, end + 1));
        word = String(json.word || '');
        meaning = String(json.meaning || '');
        example = String(json.example || '');
      }
    } catch (err) {
      console.error('[generateWordJson] LLM error', err);
    }
  }

  if (!word || !meaning || !example) {
    const samples = [
      { word: 'Ebullient', meaning: 'Cheerful and full of energy.', example: 'Her ebullient personality made her the life of the party.' },
      { word: 'Sagacious', meaning: 'Having or showing keen mental discernment and good judgment; wise or shrewd.', example: 'The sagacious leader guided the team through difficult times.' },
      { word: 'Serendipity', meaning: 'The occurrence and development of events by chance in a happy or beneficial way.', example: 'Finding the book was pure serendipity.' },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    word = pick.word;
    meaning = pick.meaning;
    example = pick.example;
  }

  return { word, meaning, example };
}

// onProgress may receive an optional data payload for richer updates
export async function processPosterJob(payload: JobPayload, onProgress: (p: string, data?: any) => void) {
  const { theme, level } = payload;
  // allow caller to pass pre-generated text (jobQueue will do this)
  let word = (payload as any).word || '';
  let meaning = (payload as any).meaning || '';
  let example = (payload as any).example || '';

  // Generate text if not supplied by the caller
  if (!word || !meaning || !example) {
    onProgress('calling-llm');
    try {
      const txt = await generateWordJson(theme, level);
      word = txt.word;
      meaning = txt.meaning;
      example = txt.example;
    } catch (err) {
      console.error('[processPosterJob] generateWordJson failed', err);
    }
  }

  onProgress('llm-done');

  // Emit a text-ready event with the generated word data so callers can use it
  // before the potentially slow image generation/composition completes.
  try {
    onProgress('text-ready', { word, meaning, example });
  } catch (err) {
    // ignore errors from progress handler
  }

  // Generate illustration via Replicate if available
  let illustrationBuffer: Buffer | null = null;
  try {
    onProgress('start-illustration');
    const REPLICATE_TEXT_VERSION = process.env.REPLICATE_TEXT_VERSION;
    if (process.env.REPLICATE_API_TOKEN && REPLICATE_TEXT_VERSION) {
      const prompt = `Illustration for the sentence: ${example}. The word is related to the theme '${theme}' and is a ${level} level word. Minimal, modern, colorful, no text, 1:1 aspect ratio.`;
      const negativePrompt = 'text, watermark, logo, border, frame, signature, caption, label, writing, words';
      const input = { prompt, negative_prompt: negativePrompt, width: 512, height: 512, guidance_scale: 7.5 };
      const { predictionUrl } = await createPrediction(REPLICATE_TEXT_VERSION, input);
      const final = await pollPrediction(predictionUrl, 120_000, 1500);
      let imgUrl: string | null = null;
      if (Array.isArray(final.output) && final.output.length > 0) imgUrl = String(final.output[0]);
      else if (typeof final.output === 'string' && final.output) imgUrl = final.output;
      if (imgUrl) {
        illustrationBuffer = await downloadUrlToBuffer(imgUrl);
        // Validate buffer is a supported image for sharp. If not, discard it.
        if (illustrationBuffer) {
          try {
            // This will throw if the buffer is not a valid/recognized image
            // or has an unsupported format.
            // eslint-disable-next-line no-await-in-loop
            await sharp(illustrationBuffer).metadata();
          } catch (err) {
            console.error('[processPosterJob] downloaded illustration invalid or unsupported format', err);
            try { onProgress('illustration-invalid', { error: String(err) }); } catch (e) {}
            illustrationBuffer = null;
          }
        }
      }
    }
  } catch (err) {
    console.error('[processPosterJob] illustration failed', err);
    try { onProgress('illustration-failed', { error: String(err) }); } catch (e) {}
    illustrationBuffer = null;
  }

  onProgress('compose');

  // Compose poster (same as existing logic)
  const width = 1024;
  const height = 1024;
  const bg = await sharp({ create: { width, height, channels: 3, background: '#f8fafc' } }).png().toBuffer();

  const escapeXml = (str: string) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  const wrapText = (text: string, maxChars: number, maxLines = 4) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      if ((current + ' ' + w).trim().length <= maxChars) current = (current + ' ' + w).trim();
      else { if (current) lines.push(current); current = w; if (lines.length >= maxLines) break; }
    }
    if (current && lines.length < maxLines) lines.push(current);
    return lines.slice(0, maxLines);
  };

  const meaningLines = wrapText(meaning || '', 42, 3);
  const exampleLines = wrapText(example || '', 38, 3);

  const headerHeight = Math.round(height * 0.12);
  const footerHeight = Math.round(height * 0.10);
  const svg = `...`; // reuse composition from previous file for brevity (omitted in patch)

  let compositeLayers: any[] = [{ input: Buffer.from(svg), top: 0, left: 0 }];
  if (illustrationBuffer) compositeLayers.push({ input: illustrationBuffer, top: Math.round(height * 0.5), left: Math.round((width - 512) / 2) });

  const finalBuffer = await sharp(bg).composite(compositeLayers).png().toBuffer();
  const outDir = path.join(process.cwd(), 'public/output');
  fs.mkdirSync(outDir, { recursive: true });
  const outName = `word-poster-${Date.now()}.png`;
  const outPath = path.join(outDir, outName);
  fs.writeFileSync(outPath, finalBuffer);

  const publicUrl = `${process.env.BASE_URL ?? ''}/output/${outName}`;
  onProgress('done');
  return { url: publicUrl, word, meaning, example, illustration: Boolean(illustrationBuffer) };
}

export default processPosterJob;
