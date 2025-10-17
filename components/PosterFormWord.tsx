import React, { useState } from 'react';

interface PosterFormWordProps {
  onSubmit: (data: { theme: string; level: string }) => void;
}

const PosterFormWord: React.FC<PosterFormWordProps> = ({ onSubmit }) => {
  const [theme, setTheme] = useState('');
  const [level, setLevel] = useState('easy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ theme, level });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded shadow max-w-md mx-auto">
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
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
      >
        Generate Word Poster
      </button>
    </form>
  );
};

export default PosterFormWord;
