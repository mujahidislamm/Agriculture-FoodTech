import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, languages } = useLanguage();
  const labels = { en: ['Home', 'Diagnose', 'Tools', 'About', 'Profile'], bn: ['হোম', 'রোগ নির্ণয়', 'সরঞ্জাম', 'সম্পর্কে', 'প্রোফাইল'], hi: ['होम', 'जाँच', 'उपकरण', 'जानकारी', 'प्रोफ़ाइल'] }[language] || ['Home', 'Diagnose', 'Tools', 'About', 'Profile'];

  const navLinks = [
    { path: '/', label: labels[0], icon: '🏠' },
    { path: '/diagnose', label: labels[1], icon: '🔍' },
    { path: '/tools', label: labels[2], icon: '🧰' },
    { path: '/about', label: labels[3], icon: 'ℹ️' },
    { path: '/profile', label: labels[4], icon: '👤' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 font-bold text-xl hover:opacity-90 transition-opacity">
            <span className="text-2xl">🌾</span>
            <span className="hidden sm:inline">FasalSathi</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
                title={link.label}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Language Selector & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Language Buttons */}
            <div className="hidden sm:flex gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 text-xs font-bold rounded transition-all ${
                    language === lang.code
                      ? 'bg-white text-emerald-700 shadow-md'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={lang.label}
                >
                  {lang.short}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-emerald-600 bg-emerald-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-white/20 text-white'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Language Selector */}
            <div className="px-3 py-3 border-t border-emerald-600 mt-2">
              <p className="text-xs text-emerald-200 font-semibold mb-2">Language</p>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`flex-1 px-2 py-1 text-xs font-bold rounded transition-all ${
                      language === lang.code
                        ? 'bg-white text-emerald-700'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {lang.short}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
