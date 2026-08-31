import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="card bg-white rounded-2xl shadow-lg overflow-hidden border-t-8 border-emerald-600">
        <div className="p-8 md:p-12">
          <h1 className="section-title text-4xl font-bold text-gray-800 mb-8 border-b pb-4">About FasalSathi</h1>
          
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed mb-12">
            <p>
              FasalSathi is an AI-powered crop disease advisory system designed specifically for West Bengal farmers.
            </p>
            <p>
              Using deep learning (ResNet-18) trained on PlantVillage and PlantDoc datasets, FasalSathi can identify 43 crop diseases from leaf images.
            </p>
            <p>
              The system provides comprehensive advisories including organic treatments, chemical treatments with exact dosages, safety warnings, and expert escalation when needed.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="text-2xl mr-4 bg-emerald-100 p-2 rounded-lg text-emerald-700 font-bold">1</span>
                <span className="text-lg pt-2">📷 Take a photo of the affected crop leaf</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-4 bg-emerald-100 p-2 rounded-lg text-emerald-700 font-bold">2</span>
                <span className="text-lg pt-2">🌱 Select your crop type and growth stage</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-4 bg-emerald-100 p-2 rounded-lg text-emerald-700 font-bold">3</span>
                <span className="text-lg pt-2">📍 Share your location for weather-aware advice</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-4 bg-emerald-100 p-2 rounded-lg text-emerald-700 font-bold">4</span>
                <span className="text-lg pt-2">🤖 Our AI analyzes the image and identifies the disease</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-4 bg-emerald-100 p-2 rounded-lg text-emerald-700 font-bold">5</span>
                <span className="text-lg pt-2">💊 Receive a complete treatment plan in your language</span>
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center">🌾 Supported Crops</h3>
              <p className="text-gray-700">Rice, Potato, Jute, Mustard, Tea, Tomato, Brinjal, Chilli, Mango, Wheat, Maize</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">📍 Coverage</h3>
              <p className="text-gray-700">Covering 23 districts of West Bengal with district-specific soil and agro-climatic context</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Technology Stack</h2>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">ResNet-18 CNN</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">PyTorch/DJL</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">Spring Boot</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">React</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">Tailwind CSS</span>
            </div>
          </div>

          <div className="text-center bg-gray-50 p-8 rounded-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to get started?</h2>
            <Link 
              to="/diagnose" 
              className="inline-block btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-1"
            >
              Diagnose a Crop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
