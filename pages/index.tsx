import React, { useState } from "react";
import type { NextPage } from "next";
import PosterFormWord from "@/components/PosterFormWord";

const Home: NextPage = () => {

  const handlePosterFormWordSubmit = (data: { theme: string; level: string }) => {
    // TODO: Implement what should happen after form submit
    // For now, just log the data
    console.log('PosterFormWord submitted:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Toastmasters Poster Builder</h1>
          <p className="text-gray-600 mt-1">Generate custom posters for your Toastmasters events using AI.</p>
        </header>

        <PosterFormWord onSubmit={handlePosterFormWordSubmit} />
      </div>
    </div>
  );
};

export default Home;
