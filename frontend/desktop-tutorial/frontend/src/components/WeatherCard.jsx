import React from 'react';

export default function WeatherCard({ weatherContext, cropStageRelevance, districtContext }) {
  if (!weatherContext && !cropStageRelevance && !districtContext) return null;

  return (
    <div className="card p-5 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contextual Insights</h3>
      <div className="space-y-4">
        {weatherContext && (
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🌦️</span>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Weather</h4>
              <p className="text-sm text-gray-600">{weatherContext}</p>
            </div>
          </div>
        )}
        
        {weatherContext && (cropStageRelevance || districtContext) && (
          <div className="h-px bg-gray-100 w-full"></div>
        )}

        {cropStageRelevance && (
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🌱</span>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Crop Stage</h4>
              <p className="text-sm text-gray-600">{cropStageRelevance}</p>
            </div>
          </div>
        )}
        
        {cropStageRelevance && districtContext && (
          <div className="h-px bg-gray-100 w-full"></div>
        )}

        {districtContext && (
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🗺️</span>
            <div>
              <h4 className="text-sm font-medium text-gray-700">District</h4>
              <p className="text-sm text-gray-600">{districtContext}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
