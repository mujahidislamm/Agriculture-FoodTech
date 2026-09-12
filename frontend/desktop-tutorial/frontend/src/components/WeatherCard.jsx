import React from 'react';

export default function WeatherCard({ weatherContext, cropStageRelevance, districtContext, language = 'en' }) {
  if (!weatherContext && !cropStageRelevance && !districtContext) return null;
  const labels = {
    en: { title: 'Contextual Insights', weather: 'Weather', stage: 'Crop Stage', district: 'District' },
    bn: { title: 'প্রাসঙ্গিক তথ্য', weather: 'আবহাওয়া', stage: 'ফসলের পর্যায়', district: 'জেলা' },
    hi: { title: 'संदर्भ जानकारी', weather: 'मौसम', stage: 'फसल का चरण', district: 'जिला' },
  }[language] || { title: 'Contextual Insights', weather: 'Weather', stage: 'Crop Stage', district: 'District' };

  return (
    <div className="card p-5 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{labels.title}</h3>
      <div className="space-y-4">
        {weatherContext && (
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🌦️</span>
            <div>
              <h4 className="text-sm font-medium text-gray-700">{labels.weather}</h4>
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
              <h4 className="text-sm font-medium text-gray-700">{labels.stage}</h4>
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
              <h4 className="text-sm font-medium text-gray-700">{labels.district}</h4>
              <p className="text-sm text-gray-600">{districtContext}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
