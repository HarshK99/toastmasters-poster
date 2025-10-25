import React from "react";
import PosterFormWord from "@/components/PosterFormWord";
import PosterPreview from "@/components/PosterPreview";

interface MainContentProps {
  poster: { dataUrl: string; word: string; meaning: string; example: string } | null;
  onPosterResult: (poster: { dataUrl: string; word: string; meaning: string; example: string }) => void;
}

const MainContent: React.FC<MainContentProps> = ({ poster, onPosterResult }) => {
  return (
    <main className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PosterFormWord onResult={onPosterResult} />
          </div>
          <PosterPreview poster={poster} />
        </div>
      </div>
    </main>
  );
};

export default MainContent;