import type { NextApiRequest, NextApiResponse } from 'next';
import { getJob } from '../../../lib/jobQueue';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
  } = req;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'Missing id' });
  const job = getJob(id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  return res.status(200).json(job);
}
