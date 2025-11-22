import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main header content */}
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Toastmasters Tools
              </h1>
              <p className="hidden sm:block text-xs text-white/80">
                Essential tools for better meetings
              </p>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                router.pathname === "/" 
                  ? "bg-white/20 text-white shadow-sm" 
                  : "text-white/90 hover:bg-white/10"
              } ${router.pathname.startsWith('/voting') ? 'glow-once' : ''}`}
            >
              Word of the Day Generator
            </Link>
            <Link
              href="/voting"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                router.pathname.startsWith("/voting") 
                  ? "bg-white/20 text-white shadow-sm" 
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              Voting System
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-48 opacity-100 pb-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <nav className="flex flex-col space-y-2 pt-2 border-t border-white/20">
            <p className="text-xs text-white/80 px-2 mb-2">
              Essential tools for better meetings
            </p>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === "/" 
                  ? "bg-white/20 text-white" 
                  : "text-white/90 hover:bg-white/10"
              } ${router.pathname.startsWith('/voting') ? 'glow-once' : ''}`}
            >
              📄 Word of the Day Generator
            </Link>
            <Link
              href="/voting"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                router.pathname.startsWith("/voting") 
                  ? "bg-white/20 text-white" 
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              🗳️ Voting System
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;