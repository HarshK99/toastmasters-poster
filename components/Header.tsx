import React from "react";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/60 backdrop-blur-md border-b z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Word of the Day Generator</h1>
          <p className="text-sm text-gray-600">Create theme-based words and posters for Toastmasters meetings in seconds</p>
        </div>
      </div>
    </header>
  );
};

export default Header;