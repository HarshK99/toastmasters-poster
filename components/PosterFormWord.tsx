import React, { useState } from 'react';


const PosterFormWord: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [level, setLevel] = useState('easy');
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonPrompt, setJsonPrompt] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const res = await fetch('/api/generate-word-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, level, word, meaning, example }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setResultUrl(data.url);
      } else {
        setError(data.error || 'Failed to generate poster.');
      }
    } catch (err) {
      setError('Failed to generate poster.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate AI call to get word, meaning, example
  const handleGenerateAIWord = async () => {
    setAiLoading(true);
    setError(null);
    setWord('');
    setMeaning('');
    setExample('');
    try {
      // Replace this with your actual AI API call
      const res = await fetch('/api/generate-word-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, level }),
      });
      const data = await res.json();
      if (res.ok && data.word && data.meaning && data.example) {
        setWord(data.word);
        setMeaning(data.meaning);
        setExample(data.example);
      } else {
        setError(data.error || 'Failed to generate word.');
      }
    } catch (err) {
      setError('Failed to generate word.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateJsonPrompt = () => {
    const promptObj = {
      theme,
      level,
      word,
      meaning,
      example,
    };
    setJsonPrompt(JSON.stringify(promptObj, null, 2));
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded shadow max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <select
            id="level"
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button
          type="button"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-semibold"
          onClick={handleGenerateAIWord}
          disabled={aiLoading}
        >
          {aiLoading ? 'Generating Word...' : 'Generate Word, Meaning & Example'}
        </button>
        {word && meaning && example && (
          <div className="bg-gray-50 p-3 rounded mt-2">
            <div><span className="font-semibold">Word:</span> {word}</div>
            <div><span className="font-semibold">Meaning:</span> {meaning}</div>
            <div><span className="font-semibold">Example:</span> {example}</div>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
          disabled={loading || !word || !meaning || !example}
        >
          {loading ? 'Generating Poster...' : 'Generate Word Poster'}
        </button>
      </form>
      <button
        onClick={handleGenerateJsonPrompt}
        className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors font-semibold"
      >
        Generate JSON Prompt
      </button>
      {jsonPrompt && (
        <div className="mt-4 bg-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap break-all">
          {jsonPrompt}
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      {resultUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Poster Result</h2>
          <div className="bg-white p-4 rounded shadow">
            <img src={resultUrl} alt="poster" className="max-w-full border" />
            <div className="mt-3 flex space-x-2">
              <a href={resultUrl} download className="px-3 py-2 border rounded text-sm">
                Download
              </a>
              <button className="px-3 py-2 border rounded text-sm" onClick={() => navigator.clipboard?.writeText(resultUrl)}>
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterFormWord;
