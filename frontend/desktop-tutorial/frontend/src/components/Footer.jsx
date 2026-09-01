import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const version = '1.0.0';

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>🌾</span>
              <span>FasalSathi</span>
            </div>
            <p className="text-sm text-slate-400">AI-powered crop disease advisor for West Bengal farmers</p>
            <p className="text-xs text-slate-500">v{version}</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-200">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/diagnose" className="text-sm text-slate-400 hover:text-white transition-colors">Crop Diagnosis</Link></li>
              <li><Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-200">Resources</h4>
            <ul className="space-y-2">
              <li><a href="/SETUP_GUIDE.md" className="text-sm text-slate-400 hover:text-white transition-colors">Setup Guide</a></li>
              <li><a href="https://github.com/mujahidislamm/Agriculture-FoodTech" className="text-sm text-slate-400 hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">API Docs</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-200">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400 text-center md:text-left">
              <p>© {currentYear} FasalSathi. Built with ❤️ for West Bengal Farmers.</p>
              <p className="text-xs text-slate-500 mt-1">Using React, Spring Boot, TorchScript ML Models</p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20v-7.21H5.5V9.25h2.79V7.44c0-2.77 1.693-4.285 4.194-4.285 1.192 0 2.22.089 2.52.129v2.923h-1.728c-1.356 0-1.619.646-1.619 1.593v2.088h3.237l-4.212 3.54V20"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
