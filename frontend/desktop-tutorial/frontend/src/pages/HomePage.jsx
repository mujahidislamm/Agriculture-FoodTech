import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">🌾 FasalSathi</h1>
        <p className="text-xl md:text-2xl mb-8">AI-Powered Crop Disease Advisory</p>
        
        <div className="flex flex-col items-center gap-2 mb-10 text-sm md:text-base opacity-90">
          <p>EN: "Protecting your crops with artificial intelligence"</p>
          <p>বাং: "কৃত্রিম বুদ্ধিমত্তা দিয়ে আপনার ফসল রক্ষা"</p>
          <p>हिं: "कृत्रिम बुद्धिमत्ता से आपकी फसलों की सुरक्षा"</p>
        </div>

        <button 
          onClick={() => navigate('/diagnose')}
          className="btn-primary text-emerald-700 bg-white hover:bg-emerald-50 px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-transform transform hover:-translate-y-1"
        >
          Diagnose My Crop &rarr;
        </button>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="section-title text-center text-3xl font-bold text-gray-800 mb-12">Why FasalSathi?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 bg-white rounded-xl shadow-md border-t-4 border-emerald-500">
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-2xl mr-2">🤖</span> AI Detection</h3>
            <p className="text-gray-600">Upload a photo of your crop leaf and get instant disease identification</p>
          </div>
          <div className="card p-6 bg-white rounded-xl shadow-md border-t-4 border-emerald-500">
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-2xl mr-2">💊</span> Expert Advice</h3>
            <p className="text-gray-600">Receive step-by-step treatment plans with organic and chemical options</p>
          </div>
          <div className="card p-6 bg-white rounded-xl shadow-md border-t-4 border-emerald-500">
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-2xl mr-2">🌐</span> Multilingual</h3>
            <p className="text-gray-600">Get advisories in English, Bengali, and Hindi</p>
          </div>
          <div className="card p-6 bg-white rounded-xl shadow-md border-t-4 border-emerald-500">
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-2xl mr-2">🌦️</span> Weather-Aware</h3>
            <p className="text-gray-600">Advisories consider current weather conditions in your area</p>
          </div>
          <div className="card p-6 bg-white rounded-xl shadow-md border-t-4 border-emerald-500">
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-2xl mr-2">🛡️</span> Safety First</h3>
            <p className="text-gray-600">PPE guidance and pre-harvest interval warnings included</p>
          </div>
          <div className="card p-6 bg-white rounded-xl shadow-md border-t-4 border-emerald-500">
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-2xl mr-2">📞</span> Expert Connect</h3>
            <p className="text-gray-600">Direct contact with nearest KVK when expert consultation is needed</p>
          </div>
        </div>
      </section>

      {/* Supported Crops */}
      <section className="bg-emerald-50 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Supporting 11 crops across 23 West Bengal districts</h2>
        <p className="text-emerald-700 font-medium">Empowering farmers with localized, precise, and timely crop protection.</p>
      </section>
    </div>
  );
}
