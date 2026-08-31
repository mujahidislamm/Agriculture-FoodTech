import React from 'react';

export default function DiagnosisBadge({ type }) {
  const isDefinitive = type === "DEFINITIVE_DIAGNOSIS";

  return (
    <div 
      className={`inline-flex items-center px-4 py-1.5 rounded-full font-semibold text-sm ${
        isDefinitive 
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
          : 'bg-amber-100 text-amber-800 border border-amber-200'
      }`}
    >
      {isDefinitive ? (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Definitive Diagnosis
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Advisory Support
        </>
      )}
    </div>
  );
}
