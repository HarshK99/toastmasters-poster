import React, { useState } from "react";
import type { NextPage } from "next";
import PosterFormWord from "@/components/PosterFormWord";

const Home: NextPage = () => {
  const [poster, setPoster] = useState<{ dataUrl: string; word: string; meaning: string; example: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header with blur */}
      <header className="fixed top-0 left-0 right-0 bg-white/60 backdrop-blur-md border-b z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Word of the Day</h1>
            <p className="text-sm text-gray-600">AI generated word of the day for toastmasters meetings</p>
          </div>
         
        </div>
      </header>

      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <PosterFormWord onResult={(r) => setPoster(r)} />
            </div>
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded shadow min-h-[520px] flex flex-col items-center justify-center gap-4">
                {poster ? (
                  <div className="text-center">
                    <img src={poster.dataUrl} alt="Poster preview" className="inline-block border" />
                    <div className="mt-3">
                      <a href={poster.dataUrl} download={`word-poster-${Date.now()}.png`} className="p-2 rounded bg-gray-50 border hover:bg-gray-100 inline-flex items-center justify-center" aria-label="Download poster">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Poster preview will appear here after generation.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t">
        <div className="max-w-6xl mx-auto px-6 py-3 text-sm text-gray-600">Developed for Toastmasters by HK</div>
      </footer>
    </div>
  );
};

export default Home;
