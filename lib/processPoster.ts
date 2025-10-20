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
      const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const system = `You are a helpful assistant that returns a single English word, its concise one-line meaning, and a short example sentence using the word. Output must be valid JSON with keys: word, meaning, example. Do NOT output any other text.`;
      const prompt = `Generate a ${level} difficulty word related to the theme "${theme}". Return only a JSON object like {"word":"...","meaning":"...","example":"..."}`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 200 }),
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
export async function processPosterJob(payload: JobPayload, onProgress: (p: string, data?: unknown) => void) {
  const { theme, level } = payload;
  // allow caller to pass pre-generated text (jobQueue will do this)
  let word = payload.word || '';
  let meaning = payload.meaning || '';
  let example = payload.example || '';

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
  } catch {
    // ignore errors from progress handler
  }

  // Illustrations removed: this pipeline composes posters without an image.
  // Emit an event so callers know illustration is intentionally skipped.
  try {
    onProgress('illustration-skipped', { reason: 'no-illustration' });
  } catch {
    // ignore
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

  // Try embedding a local font (public/fonts/*). Check multiple candidate filenames
  // so variable fonts like Inter-VariableFont_opsz,wght.ttf are picked up.
  let embeddedFontCss = '';
  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    const candidates = [
      'Inter-Regular.ttf',
      'Inter-Regular.woff2',
      'Inter-VariableFont_opsz,wght.ttf',
      'Inter-VariableFont.ttf',
      'inter.ttf',
    ];
    let found: string | null = null;
    for (const c of candidates) {
      const p = path.join(fontsDir, c);
      if (fs.existsSync(p)) {
        found = p;
        break;
      }
    }
    if (!found && fs.existsSync(fontsDir)) {
      const files = fs.readdirSync(fontsDir).filter((f) => f.toLowerCase().endsWith('.ttf') || f.toLowerCase().endsWith('.woff2'));
      if (files.length > 0) found = path.join(fontsDir, files[0]);
    }
    if (found) {
      const buf = fs.readFileSync(found);
      const b64 = buf.toString('base64');
      const mime = found.toLowerCase().endsWith('.woff2') ? 'font/woff2' : 'font/ttf';
      embeddedFontCss = `@font-face{font-family: 'EmbeddedFont'; src: url('data:${mime};base64,${b64}') format('${mime === 'font/woff2' ? 'woff2' : 'truetype'}'); font-weight: 400; font-style: normal;}`;
    }
  } catch (e) {
    // ignore
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        ${embeddedFontCss}
        .heading { font-family: 'EmbeddedFont', 'Helvetica Neue', Arial, sans-serif; font-size: 40px; fill: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
        .word { font-family: 'EmbeddedFont', 'Helvetica Neue', Arial, sans-serif; font-size: 88px; font-weight: bold; fill: #0B3D91; }
        .label { font-family: 'EmbeddedFont', 'Helvetica Neue', Arial, sans-serif; font-size: 36px; fill: #333; font-weight: 700; }
        .meaning { font-family: 'EmbeddedFont', 'Helvetica Neue', Arial, sans-serif; font-size: 50px; fill: #333; }
        .example { font-family: 'EmbeddedFont', 'Helvetica Neue', Arial, sans-serif; font-size: 50px; fill: #555; font-style: italic; }
      </style>
      <rect x="0" y="0" width="100%" height="${headerHeight}" fill="#0B3D91" />
      <rect x="0" y="${height - footerHeight}" width="100%" height="${footerHeight}" fill="#0B3D91" />
      <text x="50%" y="${Math.round(headerHeight * 0.6)}" text-anchor="middle" class="heading">Word of the Day</text>
      <text x="50%" y="24%" text-anchor="middle" class="word">${escapeXml(payload.word || word)}</text>
      <g>
        <text x="50%" y="36%" text-anchor="middle">
          <tspan class="label" x="50%" dy="0">Meaning</tspan>
          ${meaningLines.map((l, i) => `<tspan class="meaning" x="50%" dy="${i === 0 ? 1.2 : 1.2}em">${escapeXml(l)}</tspan>`).join('')}
        </text>
      </g>
      <g>
        <text x="50%" y="60%" text-anchor="middle">
          <tspan class="label" x="50%" dy="0">Example</tspan>
          ${exampleLines.map((l, i) => `<tspan class="example" x="50%" dy="${i === 0 ? 1.2 : 1.2}em">${escapeXml(l)}</tspan>`).join('')}
        </text>
      </g>
    </svg>
  `;

  const compositeLayers: { input: Buffer; top: number; left: number }[] = [{ input: Buffer.from(svg), top: 0, left: 0 }];

  const finalBuffer = await sharp(bg).composite(compositeLayers).png().toBuffer();
  const dataUrl = `data:image/png;base64,${finalBuffer.toString('base64')}`;
  onProgress('done');
  return { dataUrl, word, meaning, example, illustration: false };
}

export default processPosterJob;
