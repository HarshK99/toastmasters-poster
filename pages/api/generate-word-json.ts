// pages/api/generate-word-json.ts
import type { NextApiRequest, NextApiResponse } from "next";

type WordJson = { word: string; meaning: string; example: string };

const sampleFallback = (): WordJson[] => [
  { word: "Ebullient", meaning: "Cheerful and full of energy.", example: "Her ebullient personality made her the life of the party." },
  { word: "Sagacious", meaning: "Having or showing keen mental discernment and good judgment; wise or shrewd.", example: "The sagacious leader guided the team through difficult times." },
  { word: "Serendipity", meaning: "The occurrence and development of events by chance in a happy or beneficial way.", example: "Finding the book was pure serendipity." },
];

async function callOpenAI(theme: string, level: string): Promise<WordJson | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const system = `You are a helpful assistant that returns a single English word, its concise one-line meaning, and a short example sentence using the word. Output must be valid JSON with keys: word, meaning, example. Do NOT output any other text.`;
  const prompt = `Generate a ${level} difficulty word related to the theme "${theme}". Return the JSON object only.`;
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });
    if (!resp.ok) {
      console.error('[generate-word-json] OpenAI error', await resp.text());
      return null;
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
    if (!text || typeof text !== 'string') return null;
    // Try parse JSON from the model output
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;
    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonStr);
    if (parsed.word && parsed.meaning && parsed.example) {
      return { word: String(parsed.word), meaning: String(parsed.meaning), example: String(parsed.example) };
    }
    return null;
  } catch (err) {
    console.error('[generate-word-json] exception', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { theme, level } = req.body || {};
  if (!theme || !level) {
    return res.status(400).json({ error: 'Missing required fields: theme, level.' });
  }

  // If OPENAI_API_KEY is configured, attempt to call OpenAI for a structured JSON response.
  const useOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (useOpenAI) {
    const ai = await callOpenAI(theme, level);
    if (ai) return res.status(200).json(ai);
    // fallback to samples on failure
  }

  const samples = sampleFallback();
  const pick = samples[Math.floor(Math.random() * samples.length)];
  return res.status(200).json(pick);
}
