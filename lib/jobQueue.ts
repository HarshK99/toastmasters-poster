import { processPosterJob, generateWordJson } from '../lib/processPoster';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

type Job = {
  id: string;
  theme: string;
  level: string;
  status: JobStatus;
  progress?: string;
  result?: any;
  error?: string;
};

const jobs = new Map<string, Job>();

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createJob(theme: string, level: string, text?: { word: string; meaning: string; example: string }) {
  const id = generateId();
  const job: Job = { id, theme, level, status: 'pending', progress: 'queued' };
  jobs.set(id, job);
  // Start processing async
  (async () => {
    try {
      job.status = 'processing';
      job.progress = 'starting';
      jobs.set(id, job);

      // If caller provided text, use it and persist immediate partial result.
      let txt = text;
      if (txt) {
        job.result = job.result || {};
        job.result.text = { word: txt.word, meaning: txt.meaning, example: txt.example };
        jobs.set(id, job);
      } else {
        // Generate text immediately and persist partial text so callers can
        // show it without waiting for image generation.
        const generated = await generateWordJson(theme, level);
        txt = generated;
        job.result = job.result || {};
        job.result.text = { word: txt.word, meaning: txt.meaning, example: txt.example };
        jobs.set(id, job);
      }

      const result = await processPosterJob({ id, theme, level, word: txt.word, meaning: txt.meaning, example: txt.example }, (p: string, data?: any) => {
        job.progress = p;
        // if the worker provides partial text, store it immediately so clients
        // polling job-status can show the word/meaning/example before image is ready
        if (p === 'text-ready' && data) {
          job.result = job.result || {};
          job.result.text = { word: data.word, meaning: data.meaning, example: data.example };
        }
        // if illustration failed or invalid, store the error but keep text
        if ((p === 'illustration-failed' || p === 'illustration-invalid') && data) {
          job.result = job.result || {};
          job.result.illustrationError = data.error || String(data);
        }
        jobs.set(id, job);
      });
      job.status = 'completed';
      job.result = result;
      job.progress = 'done';
      jobs.set(id, job);
    } catch (err: any) {
      job.status = 'failed';
      job.error = String(err?.message || err);
      job.progress = 'error';
      jobs.set(id, job);
    }
  })();
  return id;
}

export function getJob(id: string) {
  return jobs.get(id);
}

export function listJobs() {
  return Array.from(jobs.values());
}

export default { createJob, getJob, listJobs };
