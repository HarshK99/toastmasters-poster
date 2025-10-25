import React, { useState } from "react";
import type { NextPage } from "next";
import Header from "@/components/Header";
import MainContent from "@/components/MainContent";
import Footer from "@/components/Footer";

const Home: NextPage = () => {
  const [poster, setPoster] = useState<{ dataUrl: string; word: string; meaning: string; example: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MainContent poster={poster} onPosterResult={setPoster} />
      <Footer />
    </div>
  );
};

export default Home;
