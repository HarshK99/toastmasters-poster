import React from "react";
import type { NextPage } from "next";
import PosterFormWord from "@/components/PosterFormWord";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Toastmasters Poster Builder</h1>
          <p className="text-gray-600 mt-1">Generate custom posters for your Toastmasters events using AI.</p>
        </header>

  <PosterFormWord />
      </div>
    </div>
  );
};

export default Home;
