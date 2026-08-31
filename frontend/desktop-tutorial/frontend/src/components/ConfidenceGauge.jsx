import React from 'react';

export default function ConfidenceGauge({ value }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~283
  const percentage = Math.round(value * 100);
  const strokeDashoffset = circumference - (value * circumference);
  
  let colorClass = 'text-red-500';
  if (value >= 0.7) {
    colorClass = 'text-emerald-500';
  } else if (value >= 0.4) {
    colorClass = 'text-amber-500';
  }

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-current text-gray-200"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={`stroke-current ${colorClass} gauge-circle`}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-800">{percentage}%</span>
      </div>
    </div>
  );
}
