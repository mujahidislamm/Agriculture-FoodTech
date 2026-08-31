import React from 'react';

export default function SafetyWarnings({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-5 mb-6">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">⚠️</span>
        <h3 className="text-lg font-bold text-amber-900">Safety Warnings</h3>
      </div>
      <ul className="space-y-2">
        {warnings.map((warning, idx) => (
          <li key={idx} className="text-amber-800 text-sm">
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
}
