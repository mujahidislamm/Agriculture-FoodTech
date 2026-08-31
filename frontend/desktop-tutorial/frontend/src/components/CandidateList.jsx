import React, { useState } from 'react';

export default function CandidateList({ candidates }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="space-y-3">
      {candidates.slice(0, 3).map((candidate, index) => {
        const isExpanded = expandedIndex === index;
        const percentage = Math.round((candidate.confidence || 0) * 100);
        
        return (
          <div 
            key={index}
            className={`border rounded-lg transition-all overflow-hidden cursor-pointer ${
              candidate.isTopPick 
                ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                : 'border-gray-200 hover:border-emerald-300'
            }`}
            onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
          >
            <div className={`p-4 flex items-center justify-between ${candidate.isTopPick ? 'bg-emerald-50/50' : 'bg-white'}`}>
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="font-medium text-gray-800">{candidate.diseaseName}</h4>
                  {candidate.isTopPick && <span title="Top Pick">⭐</span>}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${candidate.isTopPick ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center text-sm font-semibold text-gray-700 w-12 justify-end">
                {percentage}%
              </div>
              
              <div className="ml-3 text-gray-400">
                <svg 
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {isExpanded && candidate.explanation && (
              <div className="p-4 pt-0 text-sm text-gray-600 bg-white border-t border-gray-100">
                <p className="mt-3">{candidate.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
