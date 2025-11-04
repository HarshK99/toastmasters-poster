import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const router = useRouter();
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/60 backdrop-blur-md border-b z-30">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Toastmasters Tools</h1>
            <p className="text-sm text-gray-600">Essential tools for better meetings</p>
          </div>
          
          <nav className="flex space-x-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === "/" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Poster Generator
            </Link>
            <Link
              href="/voting"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === "/voting" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Voting System
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;