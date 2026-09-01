import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'About FasalSathi',
      intro: [
        'FasalSathi is an AI-powered crop disease advisory system designed specifically for West Bengal farmers.',
        'Using deep learning (ResNet-18) trained on PlantVillage and PlantDoc datasets, FasalSathi can identify 43 crop diseases from leaf images.',
        'The system provides comprehensive advisories including organic treatments, chemical treatments with exact dosages, safety warnings, and expert escalation when needed.',
      ],
      steps: [
        '📷 Take a photo of the affected crop leaf',
        '🌱 Select your crop type and growth stage',
        '📍 Share your location for weather-aware advice',
        '🤖 Our AI analyzes the image and identifies the disease',
        '💊 Receive a complete treatment plan in your language',
      ],
      how: 'How It Works',
      supported: 'Supported Crops',
      supportedList: 'Rice, Potato, Jute, Mustard, Tea, Tomato, Brinjal, Chilli, Mango, Wheat, Maize',
      coverage: 'Coverage',
      coverageText: 'Covering 23 districts of West Bengal with district-specific soil and agro-climatic context',
      stack: 'Technology Stack',
      ready: 'Ready to get started?',
      cta: 'Diagnose a Crop',
    },
    bn: {
      title: 'ফসলসাথী সম্পর্কে',
      intro: [
        'ফসলসাথী পশ্চিমবঙ্গের কৃষকদের জন্য বিশেষভাবে ডিজাইন করা একটি এআই-চালিত ফসলের রোগ পরামর্শ ব্যবস্থা।',
        'PlantVillage ও PlantDoc ডেটাসেটের উপর প্রশিক্ষিত ডিপ লার্নিং (ResNet-18) ব্যবহার করে ফসলসাথী পাতার ছবির উপর ভিত্তি করে ৪৩টি ফসলের রোগ শনাক্ত করতে পারে।',
        'এই সিস্টেম জৈব চিকিৎসা, সঠিক ডোজের রাসায়নিক চিকিৎসা, নিরাপত্তা সতর্কতা এবং প্রয়োজনে বিশেষজ্ঞের সহায়তার মতো বিস্তৃত পরামর্শ প্রদান করে।',
      ],
      steps: [
        '📷 আক্রান্ত ফসলের পাতার ছবি তুলুন',
        '🌱 আপনার ফসলের ধরন ও বৃদ্ধির পর্যায় নির্বাচন করুন',
        '📍 আবহাওয়া-সচেতন পরামর্শের জন্য আপনার অবস্থান শেয়ার করুন',
        '🤖 আমাদের এআই ছবি বিশ্লেষণ করে রোগ শনাক্ত করে',
        '💊 আপনার ভাষায় সম্পূর্ণ চিকিৎসা পরিকল্পনা পান',
      ],
      how: 'এটি কীভাবে কাজ করে',
      supported: 'সমর্থিত ফসল',
      supportedList: 'ধান, আলু, পাট, সরষে, চা, টমেটো, বেগুন, লঙ্কা, আম, গম, ভুট্টা',
      coverage: 'কভারেজ',
      coverageText: 'পশ্চিমবঙ্গের ২৩টি জেলার জন্য জেলা-নির্দিষ্ট মাটি ও কৃষি-জলবায়ু প্রেক্ষাপট নিয়ে কাজ করে',
      stack: 'টেকনোলজি স্ট্যাক',
      ready: 'শুরু করতে প্রস্তুত?',
      cta: 'ফসল শনাক্ত করুন',
    },
    hi: {
      title: 'फसलसाथी के बारे में',
      intro: [
        'फसलसाथी पश्चिम बंगाल के किसानों के लिए विशेष रूप से तैयार एक एआई-संचालित फसल रोग सलाह प्रणाली है।',
        'PlantVillage और PlantDoc डेटासेट पर प्रशिक्षित डीप लर्निंग (ResNet-18) का उपयोग करके फसलसाथी पत्ती की तस्वीरों से 43 फसल रोगों की पहचान कर सकता है।',
        'यह प्रणाली जैविक उपचार, सही मात्रा वाले रासायनिक उपचार, सुरक्षा चेतावनियाँ और आवश्यकतानुसार विशेषज्ञ सहयोग सहित व्यापक सलाह प्रदान करती है।',
      ],
      steps: [
        '📷 संक्रमित फसल की पत्ती की फोटो लें',
        '🌱 अपनी फसल का प्रकार और विकास चरण चुनें',
        '📍 मौसम-आधारित सलाह के लिए अपना स्थान साझा करें',
        '🤖 हमारा एआई फोटो का विश्लेषण करके रोग पहचानता है',
        '💊 अपनी भाषा में पूर्ण उपचार योजना प्राप्त करें',
      ],
      how: 'यह कैसे काम करता है',
      supported: 'समर्थित फसलें',
      supportedList: 'धान, आलू, जूट, सरसों, चाय, टमाटर, बैंगन, मिर्च, आम, गेहूं, मक्का',
      coverage: 'कवरेज',
      coverageText: 'पश्चिम बंगाल के 23 जिलों में जिला-विशिष्ट मिट्टी और कृषि-जलवायु संदर्भ के साथ कवरेज',
      stack: 'प्रौद्योगिकी स्टैक',
      ready: 'शुरू करने के लिए तैयार हैं?',
      cta: 'फसल का निदान करें',
    },
  };

  const page = content[language] || content.en;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="card bg-white rounded-2xl shadow-lg overflow-hidden border-t-8 border-emerald-600">
        <div className="p-8 md:p-12">
          <h1 className="section-title text-4xl font-bold text-gray-800 mb-8 border-b pb-4">{page.title}</h1>

          <div className="space-y-6 text-lg text-gray-700 leading-relaxed mb-12">
            {page.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{page.how}</h2>
            <ol className="space-y-4">
              {page.steps.map((step, index) => (
                <li key={step} className="flex items-start">
                  <span className="text-2xl mr-4 bg-emerald-100 p-2 rounded-lg text-emerald-700 font-bold">{index + 1}</span>
                  <span className="text-lg pt-2">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center">🌾 {page.supported}</h3>
              <p className="text-gray-700">{page.supportedList}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">📍 {page.coverage}</h3>
              <p className="text-gray-700">{page.coverageText}</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{page.stack}</h2>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">ResNet-18 CNN</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">PyTorch/DJL</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">Spring Boot</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">React</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm">Tailwind CSS</span>
            </div>
          </div>

          <div className="text-center bg-gray-50 p-8 rounded-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{page.ready}</h2>
            <Link
              to="/diagnose"
              className="inline-block btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-1"
            >
              {page.cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
