import React from "react";
import Image from "next/image";

interface PosterPreviewProps {
  poster: { dataUrl: string; word: string; meaning: string; example: string } | null;
}

const PosterPreview: React.FC<PosterPreviewProps> = ({ poster }) => {
  return (
    <div className="md:col-span-2">
      <div className="bg-white p-6 rounded shadow min-h-[520px] flex flex-col items-center justify-center gap-4">
        {poster ? (
          <div className="text-center">
            <Image 
              src={poster.dataUrl} 
              alt="Poster preview" 
              width={400} 
              height={600} 
              className="inline-block border" 
              style={{ width: 'auto', height: 'auto' }}
            />
            <div className="mt-3">
              <a
                href={poster.dataUrl}
                download={`word-poster-${Date.now()}.png`}
                className="p-2 rounded bg-gray-50 border hover:bg-gray-100 inline-flex items-center justify-center"
                aria-label="Download poster"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Poster will appear here after generation.</div>
        )}
      </div>
    </div>
  );
};

export default PosterPreview;