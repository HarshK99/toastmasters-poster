import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-2 text-xs text-gray-400 text-center">
        Made for toastmaster meetings by HK • Contact:{" "}
        <a
          href="mailto:harshkankaria9@gmail.com"
          className="text-gray-400 hover:text-gray-700"
        >
          harshkankaria9@gmail.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;