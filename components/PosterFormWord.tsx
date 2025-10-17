import React, { useState } from 'react';

interface PosterFormWordProps {
  onSubmit?: (data: {
    theme: string;
    level: string;
    word: string;
    meaning: string;
    example: string;
    url?: string;
  }) => void;
}

const PosterFormWord: React.FC<PosterFormWordProps> = ({ onSubmit }) => {
  const [theme, setTheme] = useState('');
  const [level, setLevel] = useState('easy');
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const Spinner = ({ size = 5 }: { size?: number }) => {
    const px = size * 4;
    return (
      <svg style={{ width: px, height: px }} className={`animate-spin text-gray-600`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    );
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded shadow max-w-md mx-auto">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <input
            id="theme"
            type="text"
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a theme (e.g. Motivation)"
            required
          />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <select id="level" value={level} onChange={e => setLevel(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-semibold"
            onClick={async () => {
              setAiLoading(true);
              setError(null);
              setResultUrl(null);
              try {
                const res = await fetch('/api/generate-word-json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme, level }) });
                const data = await res.json();
                if (res.ok && data.word && data.meaning && data.example) {
                  setWord(data.word);
                  setMeaning(data.meaning);
                  setExample(data.example);
                  onSubmit?.({ theme, level, word: data.word, meaning: data.meaning, example: data.example });
                } else {
                  setError(data.error || 'Failed to generate word.');
                }
              } catch (err) {
                setError('Failed to generate word.');
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading || loading}
          >
            {aiLoading ? 'Generating word...' : 'Generate Word'}
          </button>

          <button
            type="button"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-semibold"
            onClick={async () => {
              setLoading(true);
              setAiLoading(false);
              setError(null);
              setResultUrl(null);
              try {
                if (!word || !meaning || !example) throw new Error('Generate the word first');
                const createRes = await fetch('/api/create-poster-job', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme, level, word, meaning, example }) });
                const createData = await createRes.json();
                if (!createRes.ok || !createData.jobId) throw new Error(createData.error || 'Failed to create job');
                const jobId = createData.jobId;
                if (createData.partial) {
                  setWord(createData.partial.word || '');
                  setMeaning(createData.partial.meaning || '');
                  setExample(createData.partial.example || '');
                }
                // poll for job status
                let attempts = 0;
                while (attempts < 120) {
                  await new Promise((r) => setTimeout(r, 2000));
                  attempts++;
                  const statusRes = await fetch(`/api/job-status/${jobId}`);
                  const job = await statusRes.json();
                  if (job.status === 'completed') {
                    const final = job.result || job.result?.text || {};
                    if (final.url) setResultUrl(final.url);
                    break;
                  }
                  if (job.status === 'failed') {
                    throw new Error(job.error || 'Job failed');
                  }
                }
              } catch (err: any) {
                setError(err?.message || 'Failed to create or complete job');
              } finally {
                setAiLoading(false);
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Creating poster...' : 'Create Poster'}
          </button>
        </div>

        {aiLoading && (
          <div className="bg-gray-50 p-3 rounded mt-2 flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {word && meaning && example && !aiLoading && (
          <div className="bg-gray-50 p-3 rounded mt-2 relative">
            <button
              type="button"
              onClick={async () => {
                try {
                  const combined = `Word: ${word}\nMeaning: ${meaning}\nExample: ${example}`;
                  await navigator.clipboard.writeText(combined);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                } catch (err) {
                  setError('Failed to copy to clipboard.');
                }
              }}
              aria-label="Copy word, meaning and example"
              className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded border text-gray-600 hover:bg-gray-100"
              title="Copy word, meaning & example"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3h8l3 3v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8v3" />
              </svg>
            </button>
            {copied && <span className="absolute top-2 right-10 text-sm text-green-600">Copied!</span>}
            <div>
              <div><span className="font-semibold">Word:</span> <span className="text-gray-800 font-medium">{word}</span></div>
              <div className="mt-2"><span className="font-semibold">Meaning:</span> {meaning}</div>
              <div><span className="font-semibold">Example:</span> {example}</div>
            </div>
          </div>
        )}

      </form>

      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

      {loading && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Poster Result</h2>
          <div className="bg-white p-4 rounded shadow flex items-center justify-center">
            <Spinner size={8} />
          </div>
        </div>
      )}

      {!loading && !resultUrl && word && (
        <div className="mt-4 text-sm text-gray-600">Poster is being generated. Text is shown above.</div>
      )}

      {resultUrl && !loading && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Poster Result</h2>
          <div className="bg-white p-4 rounded shadow">
            <img src={resultUrl} alt="poster" className="max-w-full border" />
            <div className="mt-3">
              <a href={resultUrl} download className="px-3 py-2 border rounded text-sm">Download</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterFormWord;

