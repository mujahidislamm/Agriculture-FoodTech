import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-emerald-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-2">
        <h3 className="text-xl font-semibold">🌾 FasalSathi — AI Crop Disease Advisor</h3>
        <p className="text-emerald-200">Built for West Bengal Farmers</p>
        <div className="w-16 h-px bg-emerald-600 my-4"></div>
        <p className="text-sm text-emerald-300">© {new Date().getFullYear()} FasalSathi. All rights reserved.</p>
      </div>
    </footer>
  );
}
