import type { NextApiRequest, NextApiResponse } from 'next';
import { createJob, getJob } from '../../lib/jobQueue';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { theme = '', level = 'medium', word, meaning, example } = req.body || {};
  if (!theme) return res.status(400).json({ error: 'Missing theme' });
  const text = (word && meaning && example) ? { word: String(word), meaning: String(meaning), example: String(example) } : undefined;
  const id = createJob(theme, level, text);
  const job = getJob(id);
  const partial = job?.result?.text || null;
  return res.status(200).json({ jobId: id, partial });
}
