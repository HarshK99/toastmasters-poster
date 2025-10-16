import React, { useState } from "react";
import type { NextPage } from "next";
import PosterForm, { PromptResponse } from "@/components/PosterForm";
import PromptPreview from "@/components/PromptPreview";

const Home: NextPage = () => {
  const [result, setResult] = useState<PromptResponse | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Toastmasters Poster Builder</h1>
          <p className="text-gray-600 mt-1">Generate custom posters for your Toastmasters events using AI.</p>
        </header>

        <PosterForm onResult={(data) => setResult(data)} onResultUrl={(url) => setResultUrl(url)} />

        <PromptPreview data={result} className="mt-6" />

        {resultUrl && (
          <section id="poster-preview" className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-3">Preview / Result</h2>
            <div className="bg-white p-4 rounded shadow">
              <div className="mb-3">
                <a href={resultUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  Open poster in new tab
                </a>
              </div>
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
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
