import React, { useState } from 'react';
import Image from 'next/image';

const PosterFormWord: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [level, setLevel] = useState('easy');
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);

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

      setResultUrl(posterData.dataUrl);
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
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
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
            <div><span className="font-semibold">Word:</span> {word}</div>
            <div><span className="font-semibold">Meaning:</span> {meaning}</div>
            <div><span className="font-semibold">Example:</span> {example}</div>
          </div>
        )}

        {resultUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-3">Poster Result</h2>
            <div className="bg-white p-4 rounded shadow">
              <div className="max-w-full border inline-block">
                <Image src={resultUrl} alt="Generated Poster" width={512} height={512} />
              </div>
              <div className="mt-3">
                <a href={resultUrl} download className="px-3 py-2 border rounded text-sm">Download</a>
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default PosterFormWord;

