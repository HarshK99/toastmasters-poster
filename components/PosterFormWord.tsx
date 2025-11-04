import React, { useState } from 'react';

type PosterResult = { dataUrl: string; word: string; meaning: string; example: string };

const PosterFormWord: React.FC<{ onResult?: (r: PosterResult) => void }> = ({ onResult }) => {
  const [theme, setTheme] = useState('');
  const [level, setLevel] = useState('medium');
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [loading, setLoading] = useState(false);
  // poster data is lifted to parent via onResult; no local preview needed
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
  setLoading(true);
  setError(null);

    try {
      // Step 1: Generate word
      const wordResponse = await fetch('/api/generate-word-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, level }),
      });
      const wordData = await wordResponse.json();

      if (!wordResponse.ok || !wordData.word || !wordData.meaning || !wordData.example) {
        throw new Error(wordData.error || 'Failed to generate word.');
      }

      setWord(wordData.word);
      setMeaning(wordData.meaning);
      setExample(wordData.example);

      // Step 2: Generate poster synchronously (server composes and returns URL)
      const posterResponse = await fetch('/api/generate-word-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          level,
          word: wordData.word,
          meaning: wordData.meaning,
          example: wordData.example,
        }),
      });
      const posterData = await posterResponse.json();

      if (!posterResponse.ok || !posterData.dataUrl) {
        throw new Error(posterData.error || 'Failed to generate poster.');
      }

  if (onResult) onResult({ dataUrl: posterData.dataUrl, word: wordData.word, meaning: wordData.meaning, example: wordData.example });
    } catch (err: unknown) {
      let message: string;
      if (err instanceof Error) {
        message = err.message;
      } else {
        message = String(err);
      }
      setError(message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
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
            onChange={(e) => setTheme(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a theme (e.g. Motivation)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
          <div className="flex gap-3">
            {['easy', 'medium', 'hard'].map((lvl) => {
              const isSelected = lvl === level;
              const title = lvl.charAt(0).toUpperCase() + lvl.slice(1);
              return (
                <button
                  key={lvl}
                  type="button"
                  role="button"
                  aria-pressed={isSelected}
                  onClick={() => setLevel(lvl)}
                  className={`flex-1 p-4 rounded-lg border text-center transform transition duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isSelected ? 'bg-indigo-600 text-white shadow-lg border-transparent scale-105' : 'bg-white text-gray-700 border-gray-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'} `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-sm font-semibold">{title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-semibold"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Word & Poster'}
        </button>

        {word && (
          <div className="bg-gray-50 p-3 rounded mt-2">
            <div className="flex items-start justify-between">
              <div>
                <div><span className="font-semibold">Word:</span> {word}</div>
                <div><span className="font-semibold">Meaning:</span> {meaning}</div>
                <div><span className="font-semibold">Example:</span> {example}</div>
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                <button
                  type="button"
                  title={copied ? 'Copied' : 'Copy text'}
                  aria-pressed={copied}
                  onClick={async () => {
                    const text = `Word: ${word}\nMeaning: ${meaning}\nExample: ${example}`;
                    try {
                      await navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    } catch {
                      const ta = document.createElement('textarea');
                      ta.value = text;
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand('copy');
                      document.body.removeChild(ta);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    }
                  }}
                  className="p-2 rounded bg-gray-100 border hover:bg-gray-200 flex items-center justify-center"
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* poster preview lifted to parent */}

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default PosterFormWord;

