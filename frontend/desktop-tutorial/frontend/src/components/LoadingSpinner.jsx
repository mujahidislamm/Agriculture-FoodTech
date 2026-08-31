import React from 'react';

export default function LoadingSpinner({ message = "Analyzing..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full h-full min-h-[200px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-emerald-800 font-medium animate-pulse">{message}</p>
    </div>
  );
}
