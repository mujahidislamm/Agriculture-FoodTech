import React, { useState, useEffect } from 'react';
import { getCrops, getDistricts, diagnose, transcribeAudio, getWeather, getKvkInfo, getMandiPrices } from '../api/cropApi';
import { useLanguage } from '../context/LanguageContext';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import DiagnosisBadge from '../components/DiagnosisBadge';
import ConfidenceGauge from '../components/ConfidenceGauge';
import CandidateList from '../components/CandidateList';
import ActionCard from '../components/ActionCard';
import SafetyWarnings from '../components/SafetyWarnings';
import EscalationAlert from '../components/EscalationAlert';
import WeatherCard from '../components/WeatherCard';

export default function DiagnosePage() {
  const { language, t } = useLanguage();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cropType, setCropType] = useState('');
  const [cropStage, setCropStage] = useState('');
  const [district, setDistrict] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [observations, setObservations] = useState('');
  
  const [crops, setCrops] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('');
  const [liveWeather, setLiveWeather] = useState(null);
  const [kvkInfo, setKvkInfo] = useState(null);
  const [mandiPrices, setMandiPrices] = useState([]);

  const localizedLabels = {
    en: {
      cropType: 'Crop Type',
      growthStage: 'Growth Stage',
      district: 'District (West Bengal)',
      location: 'Location',
      observations: 'Observations (Optional)',
      useLocation: '📍 Use My Location',
      analyze: 'Analyze',
      diagnoseTitle: 'Diagnose Your Crop',
      actionPlan: 'Action Plan',
      alternativePossibilities: 'Alternative Possibilities',
      liveWeather: 'Live Weather',
      nearestKvk: 'Nearest KVK',
      mandiPrices: 'Mandi Prices',
      advisoryLocal: 'Advisory in Local Language',
      nextActions: 'Next Actions:',
      safetyWarnings: 'Safety Warnings:',
      startNew: 'Start New Diagnosis',
      voiceInput: '🎤 Voice input',
      recording: '🎙️ Recording',
      listening: 'Listening...',
      transcribing: 'Transcribing your voice...',
      ready: 'Voice transcription ready.',
      noSpeech: 'No speech detected.',
      failed: 'Voice capture failed.',
      micUnavailable: 'Microphone unavailable.',
      chooseImage: 'Please choose a valid image file.',
      imageTooLarge: 'Image size must be 10 MB or less.',
      imageQuality: 'Use one clear leaf in natural light. Avoid people, tables, documents, and distant plants.',
      privacy: 'Your image is used for this diagnosis and is removed from temporary processing storage after analysis.',
      readResult: 'Read result aloud',
      copied: 'Diagnosis summary copied.',
      copySummary: 'Copy summary',
      retakePhoto: 'Please retake the photo before using any treatment.',
      confidence: 'Confidence',
    },
    bn: {
      cropType: 'ফসলের ধরন',
      growthStage: 'বৃদ্ধির পর্যায়',
      district: 'জেলা (পশ্চিমবঙ্গ)',
      location: 'অবস্থান',
      observations: 'পর্যবেক্ষণ (ঐচ্ছিক)',
      useLocation: '📍 আমার অবস্থান ব্যবহার করুন',
      analyze: 'বিশ্লেষণ করুন',
      diagnoseTitle: 'আপনার ফসল শনাক্ত করুন',
      actionPlan: 'কর্ম পরিকল্পনা',
      alternativePossibilities: 'বিকল্প সম্ভাবনা',
      liveWeather: 'লাইভ আবহাওয়া',
      nearestKvk: 'নিকটতম KVK',
      mandiPrices: 'মার্কেট দর',
      advisoryLocal: 'স্থানীয় ভাষায় পরামর্শ',
      nextActions: 'পরবর্তী পদক্ষেপ:',
      safetyWarnings: 'নিরাপত্তা সতর্কতা:',
      startNew: 'নতুন রোগ নির্ণয় শুরু করুন',
      voiceInput: '🎤 ভয়েস ইনপুট',
      recording: '🎙️ রেকর্ডিং',
      listening: 'শুনছি...',
      transcribing: 'আপনার কণ্ঠ নথিভুক্ত হচ্ছে...',
      ready: 'ভয়েস ট্রান্সক্রিপশন প্রস্তুত।',
      noSpeech: 'কোনো কথা পাওয়া যায়নি।',
      failed: 'ভয়েস ক্যাপচার ব্যর্থ হয়েছে।',
      micUnavailable: 'মাইক্রোফোন উপলব্ধ নয়।',
      chooseImage: 'অনুগ্রহ করে একটি বৈধ ছবি নির্বাচন করুন।',
      imageTooLarge: 'ছবির আকার 10 MB এর কম হতে হবে।',
      imageQuality: 'প্রাকৃতিক আলোতে একটি পরিষ্কার পাতার ছবি ব্যবহার করুন। মানুষ, টেবিল, নথি ও দূরের গাছ এড়িয়ে চলুন।',
      privacy: 'এই ছবিটি শুধু রোগ নির্ণয়ের জন্য ব্যবহার করা হয় এবং বিশ্লেষণের পর অস্থায়ী স্টোরেজ থেকে মুছে ফেলা হয়।',
      readResult: 'ফলাফল পড়ে শোনান',
      copied: 'রোগ নির্ণয়ের সারাংশ কপি হয়েছে।',
      copySummary: 'সারাংশ কপি করুন',
      retakePhoto: 'কোনো চিকিৎসা ব্যবহারের আগে ছবিটি আবার তুলুন।',
      confidence: 'আত্মবিশ্বাস',
    },
    hi: {
      cropType: 'फसल का प्रकार',
      growthStage: 'विकास चरण',
      district: 'जिला (पश्चिम बंगाल)',
      location: 'स्थान',
      observations: 'अवलोकन (वैकल्पिक)',
      useLocation: '📍 मेरा स्थान उपयोग करें',
      analyze: 'विश्लेषण करें',
      diagnoseTitle: 'अपनी फसल का निदान करें',
      actionPlan: 'कार्य योजना',
      alternativePossibilities: 'वैकल्पिक संभावनाएँ',
      liveWeather: 'लाइव मौसम',
      nearestKvk: 'निकटतम KVK',
      mandiPrices: 'मंडी कीमतें',
      advisoryLocal: 'स्थानीय भाषा में सलाह',
      nextActions: 'अगले कदम:',
      safetyWarnings: 'सुरक्षा चेतावनियाँ:',
      startNew: 'नया निदान शुरू करें',
      voiceInput: '🎤 वॉयस इनपुट',
      recording: '🎙️ रिकॉर्डिंग',
      listening: 'सुन रहे हैं...',
      transcribing: 'आपकी आवाज़ का ट्रांसक्रिप्शन चल रहा है...',
      ready: 'वॉयस ट्रांसक्रिप्शन तैयार है।',
      noSpeech: 'कोई आवाज़ नहीं मिली।',
      failed: 'वॉयस कैप्चर विफल रहा।',
      micUnavailable: 'माइक्रोफोन उपलब्ध नहीं है।',
      chooseImage: 'कृपया एक सही छवि चुनें।',
      imageTooLarge: 'छवि का आकार 10 MB से कम होना चाहिए।',
      imageQuality: 'प्राकृतिक रोशनी में एक साफ़ पत्ते की तस्वीर लें। इंसान, टेबल, दस्तावेज़ और दूर के पौधों से बचें।',
      privacy: 'इस तस्वीर का उपयोग केवल निदान के लिए किया जाता है और विश्लेषण के बाद अस्थायी स्टोरेज से हटा दिया जाता है।',
      readResult: 'नतीजा सुनाएं',
      copied: 'निदान सारांश कॉपी हो गया।',
      copySummary: 'सारांश कॉपी करें',
      retakePhoto: 'किसी भी उपचार से पहले तस्वीर दोबारा लें।',
      confidence: 'विश्वास',
    },
  };

  const labelText = localizedLabels[language] || localizedLabels.en;

  const cropNameMap = {
    en: {
      Rice: 'Rice', Potato: 'Potato', Jute: 'Jute', Mustard: 'Mustard', Tea: 'Tea', Tomato: 'Tomato',
      Brinjal: 'Brinjal', Chilli: 'Chilli', Mango: 'Mango', Wheat: 'Wheat', Maize: 'Maize',
    },
    bn: {
      Rice: 'ধান', Potato: 'আলু', Jute: 'পাট', Mustard: 'সরষে', Tea: 'চা', Tomato: 'টমেটো',
      Brinjal: 'বেগুন', Chilli: 'লঙ্কা', Mango: 'আম', Wheat: 'গম', Maize: 'ভুট্টা',
    },
    hi: {
      Rice: 'धान', Potato: 'आलू', Jute: 'जूट', Mustard: 'सरसों', Tea: 'चाय', Tomato: 'टमाटर',
      Brinjal: 'बैंगन', Chilli: 'मिर्च', Mango: 'आम', Wheat: 'गेहूं', Maize: 'मक्का',
    },
  };

  const cropStageMap = {
    en: {
      Seedling: 'Seedling', Vegetative: 'Vegetative', Flowering: 'Flowering', Fruiting: 'Fruiting',
      'Early Growth': 'Early Growth', 'Tillering': 'Tillering', 'Grain Filling': 'Grain Filling',
      'Tuber Initiation': 'Tuber Initiation', 'Tuber Bulking': 'Tuber Bulking', Maturity: 'Maturity',
      Harvest: 'Harvest', 'Reproductive Stage': 'Reproductive Stage', 'Late Growth': 'Late Growth',
    },
    bn: {
      Seedling: 'চারা', Vegetative: 'বৃদ্ধি পর্যায়', Flowering: 'ফুল ধরা', Fruiting: 'ফল ধরা',
      'Early Growth': 'শুরুতে বৃদ্ধি', 'Tillering': 'কুশি উৎপাদন', 'Grain Filling': 'দানা ভরা',
      'Tuber Initiation': 'কন্দ তৈরি শুরু', 'Tuber Bulking': 'কন্দ বৃদ্ধি', Maturity: 'পরিপক্কতা',
      Harvest: 'ফসল কাটার সময়', 'Reproductive Stage': 'প্রজনন পর্যায়', 'Late Growth': 'শেষের বৃদ্ধি',
    },
    hi: {
      Seedling: 'पौधा', Vegetative: 'वानस्पतिक', Flowering: 'फूल आना', Fruiting: 'फल लगना',
      'Early Growth': 'आरंभिक वृद्धि', 'Tillering': 'कल्ले निकलना', 'Grain Filling': 'दाना भरना',
      'Tuber Initiation': 'कंद बनना शुरू', 'Tuber Bulking': 'कंद बढ़ना', Maturity: 'परिपक्वता',
      Harvest: 'कटाई', 'Reproductive Stage': 'प्रजनन चरण', 'Late Growth': 'अंतिम वृद्धि',
    },
  };

  Object.entries({
    en: { seedling: 'Seedling', vegetative: 'Vegetative', flowering: 'Flowering', fruiting: 'Fruiting', harvest: 'Harvest' },
    bn: { seedling: 'চারা', vegetative: 'বৃদ্ধি পর্যায়', flowering: 'ফুল ধরা', fruiting: 'ফল ধরা', harvest: 'ফসল কাটা' },
    hi: { seedling: 'पौधा', vegetative: 'वानस्पतिक', flowering: 'फूल आना', fruiting: 'फल लगना', harvest: 'कटाई' },
  }).forEach(([code, stagesByCode]) => Object.assign(cropStageMap[code], stagesByCode));

  const translateCropName = (name) => cropNameMap[language]?.[name] || cropNameMap.en?.[name] || name;
  const translateStageName = (stage) => cropStageMap[language]?.[stage] || cropStageMap.en?.[stage] || stage;

  const getLocalizedError = (message) => {
    const lower = (message || '').toLowerCase();
    if (lower.includes('microphone') || lower.includes('permission')) return labelText.micUnavailable;
    if (lower.includes('valid image')) return labelText.chooseImage;
    if (lower.includes('10 mb') || lower.includes('size')) return labelText.imageTooLarge;
    return message;
  };

  const localizedResult = language === 'en' ? null : result?.translatedAdvisory;
  const clientTranslations = {
    hi: {
      'Strong water spray to dislodge mites': 'माइट हटाने के लिए तेज़ पानी का छिड़काव करें',
      'Neem oil': 'नीम तेल',
      'Release predatory mites if available': 'उपलब्ध होने पर शिकारी माइट छोड़ें',
      'Maintain field hygiene': 'खेत की स्वच्छता बनाए रखें',
      'Avoid water stress': 'पानी की कमी से बचें',
      'Intercrop with marigold': 'गेंदा के साथ अंतरफसल उगाएँ',
      'Apply to leaf undersides.': 'पत्तियों की निचली सतह पर लगाएँ।',
      'Rotate chemicals to prevent resistance.': 'प्रतिरोध रोकने के लिए रसायन बदलते रहें।',
      'wear full PPE, toxic to aquatic life.': 'पूरा सुरक्षा उपकरण पहनें, यह जलीय जीवों के लिए विषैला है।',
      'Wash all harvested produce before consumption.': 'खाने से पहले सभी कटी फसल को अच्छी तरह धोएँ।',
      'New Alluvial': 'नया जलोढ़ क्षेत्र',
      'Alluvial Clay': 'जलोढ़ चिकनी मिट्टी',
      'Vegetables': 'सब्ज़ियाँ',
      'Flowers': 'फूल',
      'Pest (': 'कीट (',
      'Fruiting stage': 'फल लगने की अवस्था',
      'fruiting stage': 'फल लगने की अवस्था',
      'फल लगना चरण': 'फल लगने की अवस्था',
      'Fast-spreading water-soaked dark patches. Can kill plants within a week.': 'तेजी से फैलने वाले पानी जैसे गीले गहरे धब्बे। एक सप्ताह में पौधों को नष्ट कर सकते हैं।',
      'Dark water-soaked lesions': 'पानी जैसे गीले गहरे घाव',
      'White fuzzy growth in humid conditions': 'नम परिस्थितियों में सफेद रूई जैसी वृद्धि',
      'Brown firm fruit rot': 'फल का कड़ा भूरा सड़ना',
      'Fungal (': 'फफूंद (',
    },
    bn: {
      'Strong water spray to dislodge mites': 'জোরে জল স্প্রে করে মাইট ঝরিয়ে ফেলুন',
      'Neem oil': 'নিম তেল',
      'Release predatory mites if available': 'সম্ভব হলে শিকারি মাইট ছেড়ে দিন',
      'Maintain field hygiene': 'মাঠ পরিষ্কার-পরিচ্ছন্ন রাখুন',
      'Avoid water stress': 'জলের ঘাটতি এড়িয়ে চলুন',
      'Intercrop with marigold': 'গাঁদা ফুলের সঙ্গে আন্তঃফসল চাষ করুন',
      'Apply to leaf undersides.': 'পাতার নিচের দিকে প্রয়োগ করুন।',
      'Rotate chemicals to prevent resistance.': 'প্রতিরোধ ক্ষমতা ঠেকাতে রাসায়নিক বদলে ব্যবহার করুন।',
      'wear full PPE, toxic to aquatic life.': 'সম্পূর্ণ সুরক্ষা সরঞ্জাম পরুন, এটি জলজ প্রাণীর জন্য বিষাক্ত।',
      'Wash all harvested produce before consumption.': 'খাওয়ার আগে সব কাটা ফসল ভালোভাবে ধুয়ে নিন।',
      'New Alluvial': 'নতুন পলিমাটি অঞ্চল',
      'Alluvial Clay': 'পলিমাটির এঁটেল মাটি',
      'Vegetables': 'সবজি',
      'Flowers': 'ফুল',
      'Pest (': 'কীটপতঙ্গ (',
      'Fruiting stage': 'ফল ধরার পর্যায়',
      'fruiting stage': 'ফল ধরার পর্যায়',
      'ফল ধরা পর্যায়': 'ফল ধরার পর্যায়',
      'Fast-spreading water-soaked dark patches. Can kill plants within a week.': 'দ্রুত ছড়ানো জলভেজা কালচে দাগ। এক সপ্তাহের মধ্যে গাছ নষ্ট করতে পারে।',
      'Dark water-soaked lesions': 'জলভেজা কালচে ক্ষত',
      'White fuzzy growth in humid conditions': 'আর্দ্র পরিবেশে সাদা তুলোর মতো বৃদ্ধি',
      'Brown firm fruit rot': 'ফলের শক্ত বাদামি পচন',
      'Fungal (': 'ছত্রাক (',
    },
  }[language] || {};
  const localizeText = (value) => {
    if (typeof value !== 'string' || language === 'en') return value;
    return Object.entries(clientTranslations)
      .sort((left, right) => right[0].length - left[0].length)
      .reduce((text, [source, target]) => text.split(source).join(target), value);
  };
  const localizeList = (values) => (values || []).map(localizeText);
  const displayDiagnosis = localizeText(localizedResult?.diagnosisLabel || result?.primaryDiagnosis);
  const displayExplanation = localizeText(localizedResult?.explanation || result?.explanation);
  const displaySolution = localizeText(localizedResult?.solutionSummary || result?.solutionSummary || result?.explanation);
  const displayActions = localizeList(localizedResult?.nextActions || result?.nextActions);
  const displayWarnings = localizeList(localizedResult?.safetyWarnings || result?.safetyWarnings);
  const displayEscalation = localizeText(localizedResult?.escalationInfo || result?.escalationInfo);
  const displayCandidates = (localizedResult?.candidates?.length ? localizedResult.candidates : result?.candidates || []).map((candidate) => ({
    ...candidate,
    diseaseName: localizeText(candidate.diseaseName),
    explanation: localizeText(candidate.explanation),
  }));
  const displayWeatherContext = localizeText(localizedResult?.weatherContext || result?.weatherContext);
  const displayCropStageRelevance = localizeText(localizedResult?.cropStageRelevance || result?.cropStageRelevance);
  const displayDistrictContext = localizeText(localizedResult?.districtContext || result?.districtContext);
  const localizedWeatherCondition = (condition) => {
    if (!condition || language === 'en') return condition;
    const conditions = {
      'Partly cloudy': { bn: 'আংশিক মেঘলা', hi: 'आंशिक बादल' },
      'Rain showers': { bn: 'বৃষ্টির ঝরনা', hi: 'बारिश की बौछार' },
      'Humid and cloudy': { bn: 'আর্দ্র ও মেঘলা', hi: 'नम और बादल वाला' },
      'Windy': { bn: 'ঝোড়ো হাওয়া', hi: 'हवादार' },
      'Hot and dry': { bn: 'গরম ও শুষ্ক', hi: 'गर्म और शुष्क' },
    };
    return conditions[condition]?.[language] || condition;
  };

  useEffect(() => {
    if (!result || !selectedFile) return;
    const resultLanguage = result.translatedAdvisory?.language || 'en';
    if (resultLanguage === language) return;

    let active = true;
    diagnose(selectedFile, { cropType, cropStage, district, latitude, longitude, observations, language })
      .then((response) => {
        if (active) setResult(response.data);
      })
      .catch(() => {
        if (active) setError(language === 'bn'
          ? 'ভাষা পরিবর্তন করা যায়নি। আবার চেষ্টা করুন।'
          : language === 'hi'
            ? 'भाषा बदली नहीं जा सकी। फिर कोशिश करें।'
            : 'The language could not be changed. Please try again.');
      });

    return () => {
      active = false;
    };
  }, [language]);

  const actionGroups = (() => {
    const groups = { organic: [], chemical: [], prevention: [] };
    let currentGroup = 'organic';
    (displayActions || []).forEach((action) => {
      const text = String(action);
      if (/step\s*2|chemical|চরণ\s*২|রাসায়নিক|चरण\s*२|रासायनिक/i.test(text)) {
        currentGroup = 'chemical';
      } else if (/step\s*3|prevent|ধাপ\s*৩|প্রতিরোধ|चरण\s*३|रोकथाम/i.test(text)) {
        currentGroup = 'prevention';
      } else if (/step\s*1|organic|immediate|ধাপ\s*১|জৈব|তাৎক্ষণিক|चरण\s*१|जैविक|तुरंत/i.test(text)) {
        currentGroup = 'organic';
      } else {
        groups[currentGroup].push(action);
      }
    });
    return groups;
  })();

  const validateImageContent = (file) => new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      try {
        if (image.naturalWidth < 160 || image.naturalHeight < 160) {
          resolve('Image is too small. Please upload a clear crop-leaf photo at least 160 × 160 pixels.');
          return;
        }
        const canvas = document.createElement('canvas');
        const size = 96;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, size, size);
        const pixels = context.getImageData(0, 0, size, size).data;
        let brightnessTotal = 0;
        let brightnessSquared = 0;
        let colorfulPixels = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const brightness = (red + green + blue) / 3;
          brightnessTotal += brightness;
          brightnessSquared += brightness * brightness;
          if (Math.max(red, green, blue) - Math.min(red, green, blue) > 28) colorfulPixels += 1;
        }
        const count = pixels.length / 4;
        const averageBrightness = brightnessTotal / count;
        const variance = brightnessSquared / count - averageBrightness ** 2;
        if (averageBrightness < 18 || averageBrightness > 242) {
          resolve('This image is too dark or overexposed. Please retake the crop leaf photo in natural light.');
          return;
        }
        if (variance < 20 && colorfulPixels / count < 0.04) {
          resolve('This image does not contain enough visible leaf detail. Please upload a focused crop-leaf photo, not a table or document.');
          return;
        }
        resolve('');
      } catch {
        resolve('The image could not be checked. Please upload a JPG or PNG crop-leaf photo.');
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('This image format cannot be read in the browser. Please use JPG or PNG.');
    };
    image.src = objectUrl;
  });

  const handleFileSelect = async (file) => {
    const isImage = /^image\/(jpeg|png|webp)$/i.test(file?.type || '') || /\.(jpe?g|png|webp)$/i.test(file?.name || '');
    if (!isImage) {
      setError(getLocalizedError(labelText.chooseImage));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(getLocalizedError(labelText.imageTooLarge));
      return;
    }

    const contentError = await validateImageContent(file);
    if (contentError) {
      setError(contentError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const previewUrl = URL.createObjectURL(file);
    const previewImage = new Image();
    previewImage.onload = () => setImagePreview(previewUrl);
    previewImage.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setImagePreview(null);
      setError('This image cannot be read reliably. Please use a JPG or PNG crop-leaf photo.');
    };
    previewImage.src = previewUrl;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const cropsRes = await getCrops();
        const districtsRes = await getDistricts();
        setCrops(cropsRes.data || []);
        setDistricts(districtsRes.data || []);
      } catch (err) {
        console.error("Error fetching form data:", err);
      }
    }
    fetchData();
  }, []);

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (locationError) => {
          console.error("Error getting location", locationError);
          setError('Location access was not available. You can enter coordinates manually.');
        }
      );
    } else {
      setError('Location is not supported by this browser.');
    }
  };

  const encodeWav = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset, text) => {
      for (let i = 0; i < text.length; i += 1) {
        view.setUint8(offset + i, text.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
    return buffer;
  };

  const audioChunksToWavBlob = (chunks, mimeType = 'audio/webm') => new Promise((resolve, reject) => {
    const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        if (!reader.result) {
          reject(new Error('No microphone audio was captured.'));
          return;
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = await audioContext.decodeAudioData(reader.result.slice(0));
        const channel = buffer.getChannelData(0);
        const samples = new Float32Array(channel.length);
        for (let i = 0; i < channel.length; i += 1) {
          samples[i] = channel[i];
        }
        const wavBuffer = encodeWav(samples, buffer.sampleRate);
        resolve(new Blob([wavBuffer], { type: 'audio/wav' }));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(audioBlob);
  });

  const startVoiceCapture = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechStatus(labelText.listening);
        setError(null);
      };
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim();
        if (transcript) {
          setObservations((current) => (current ? `${current} ${transcript}` : transcript));
          setSpeechStatus(labelText.ready);
        } else {
          setSpeechStatus(labelText.noSpeech);
        }
      };
      recognition.onerror = (event) => {
        setSpeechStatus(event.error === 'not-allowed' ? labelText.micUnavailable : labelText.failed);
        setError(event.error === 'not-allowed' ? labelText.micUnavailable : 'Voice input could not be captured. Please try again or type the observation manually.');
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support microphone input. Please use Chrome or Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ].find((type) => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          setSpeechStatus(labelText.transcribing);
          const wavBlob = await audioChunksToWavBlob(chunks, recorder.mimeType || 'audio/webm');
          const res = await transcribeAudio(wavBlob, language);
          const transcript = res.data?.transcript || '';
          if (transcript) {
            setObservations((current) => (current ? `${current} ${transcript}` : transcript));
          }
          if (res.data?.error) {
            setError(res.data.error);
          }
          setSpeechStatus(transcript ? labelText.ready : labelText.noSpeech);
        } catch (speechError) {
          console.error('Speech transcription error:', speechError);
          setError('Voice input could not be converted to text right now. Please type the observation manually and continue the diagnosis.');
          setSpeechStatus(labelText.failed);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      setSpeechStatus(labelText.listening);
      setError(null);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 8000);
    } catch (captureError) {
      console.error('Microphone error:', captureError);
      setError('Microphone input is unavailable right now. You can still type your observations manually and continue the diagnosis.');
      setSpeechStatus(labelText.micUnavailable);
    }
  };

  const selectedCropObj = crops.find(c => c.name === cropType);
  const stages = selectedCropObj ? selectedCropObj.stages : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    if (!cropType) {
      setError(language === 'bn' ? 'বিশ্লেষণের আগে ফসল নির্বাচন করুন।' : language === 'hi' ? 'विश्लेषण से पहले फसल चुनें।' : 'Please select the crop before analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setLiveWeather(null);
    setKvkInfo(null);
    setMandiPrices([]);

    try {
      const payload = {
        cropType, cropStage, district, latitude, longitude, observations, language
      };
      const res = await diagnose(selectedFile, payload);
      setResult(res.data);

      const hasLocation = latitude && longitude;
      if (hasLocation) {
        const [weatherRes, kvkRes, mandiRes] = await Promise.all([
          getWeather(latitude, longitude),
          getKvkInfo(district || '', latitude, longitude),
          getMandiPrices(cropType, 'West Bengal', district)
        ]);

        setLiveWeather(weatherRes.data || null);
        setKvkInfo(kvkRes.data || null);
        setMandiPrices((mandiRes.data && Array.isArray(mandiRes.data.records)) ? mandiRes.data.records : []);
      } else if (district) {
        const [kvkRes, mandiRes] = await Promise.all([
          getKvkInfo(district, null, null),
          getMandiPrices(cropType, 'West Bengal', district)
        ]);
        setKvkInfo(kvkRes.data || null);
        setMandiPrices((mandiRes.data && Array.isArray(mandiRes.data.records)) ? mandiRes.data.records : []);
      }
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      setError(status === 400
        ? (language === 'bn' ? 'ছবিতে পর্যাপ্ত পাতার বিবরণ নেই। পরিষ্কার ছবি দিন।' : language === 'hi' ? 'छवि में पत्ती का पर्याप्त विवरण नहीं है। साफ़ तस्वीर दें।' : 'The image has too little leaf detail. Upload a clearer photo.')
        : language === 'bn'
          ? 'রোগ নির্ণয় ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
          : language === 'hi'
            ? 'निदान विफल हुआ। फिर कोशिश करें।'
            : 'Diagnosis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const speakResult = () => {
    if (!window.speechSynthesis || !displayExplanation) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${displayDiagnosis}. ${displayExplanation}`);
    utterance.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const copyResult = async () => {
    const summary = `${displayDiagnosis}\n${displayExplanation}\n${labelText.confidence}: ${Math.round((result?.confidence || 0) * 100)}%`;
    try {
      await navigator.clipboard.writeText(summary);
      setSpeechStatus(labelText.copied);
    } catch {
      setError(language === 'bn' ? 'সারাংশ কপি করা যায়নি। ফলাফলের লেখা হাতে নির্বাচন করুন।' : language === 'hi' ? 'सारांश कॉपी नहीं हो सका। परिणाम का टेक्स्ट स्वयं चुनें।' : 'The summary could not be copied. Please select the result text manually.');
    }
  };

  const resetForm = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setObservations('');
    setCropType('');
    setCropStage('');
    setDistrict('');
    setLatitude('');
    setLongitude('');
    setLiveWeather(null);
    setKvkInfo(null);
    setMandiPrices([]);
    setSpeechStatus('');
    setIsRecording(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {!result ? (
        <div className="card bg-white p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-emerald-600">
          <h2 className="section-title text-3xl font-bold mb-6 flex items-center text-gray-800">
            <span className="mr-3 text-3xl">🌿</span> {labelText.diagnoseTitle}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUpload 
              onFileSelect={handleFileSelect}
              preview={imagePreview}
              onClear={() => {
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setSelectedFile(null);
                setImagePreview(null);
              }}
            />
            <p className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">{labelText.imageQuality}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">{labelText.cropType}</label>
                <select 
                  className="select-field w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                  value={cropType} 
                  onChange={e => setCropType(e.target.value)}
                >
                  <option value="">{language === 'bn' ? 'ফসল নির্বাচন করুন' : language === 'hi' ? 'फसल चुनें' : 'Select Crop'}</option>
                  {crops.map(c => (
                    <option key={c.name} value={c.name}>{translateCropName(c.name)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{labelText.growthStage}</label>
                <select 
                  className="select-field w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100" 
                  value={cropStage} 
                  onChange={e => setCropStage(e.target.value)}
                  disabled={!cropType}
                >
                  <option value="">{language === 'bn' ? 'পর্যায় নির্বাচন করুন' : language === 'hi' ? 'चरण चुनें' : 'Select Stage'}</option>
                  {stages.map(s => (
                    <option key={s} value={s}>{translateStageName(s)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">{labelText.district}</label>
                <select 
                  className="select-field w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                  value={district} 
                  onChange={e => setDistrict(e.target.value)}
                >
                  <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : language === 'hi' ? 'जिला चुनें' : 'Select District'}</option>
                  {districts.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="block text-gray-700 font-semibold mb-2">{labelText.location}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Lat" className="input-field flex-1 p-3 border border-gray-300 rounded-lg" value={latitude} onChange={e => setLatitude(e.target.value)} />
                  <input type="text" placeholder="Lon" className="input-field flex-1 p-3 border border-gray-300 rounded-lg" value={longitude} onChange={e => setLongitude(e.target.value)} />
                </div>
                <button type="button" onClick={handleLocation} className="btn-secondary text-emerald-600 border border-emerald-600 hover:bg-emerald-50 p-2 rounded-lg text-sm transition-colors">
                  {labelText.useLocation}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 font-semibold">{labelText.observations}</label>
                <button
                  type="button"
                  onClick={startVoiceCapture}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium border transition-colors ${
                    isRecording ? 'border-red-500 bg-red-50 text-red-700' : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span>{isRecording ? labelText.recording : labelText.voiceInput}</span>
                </button>
              </div>
              <textarea 
                className="input-field w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                rows="3" 
                placeholder={language === 'bn' ? 'আপনি কী কী অন্য লক্ষণ দেখছেন তা বর্ণনা করুন...' : language === 'hi' ? 'आपको कौन-से अन्य लक्षण दिख रहे हैं, लिखें...' : 'Describe any other symptoms you see...'}
                value={observations}
                onChange={e => setObservations(e.target.value)}
              />
              {speechStatus && <p className="mt-2 text-sm text-emerald-700">{speechStatus}</p>}
            </div>
            <p className="text-xs leading-5 text-slate-400">{labelText.privacy}</p>

            {error && <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded">{error}</div>}

            <button 
              type="submit" 
              className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              disabled={!selectedFile || !cropType || loading}
            >
              {loading ? <LoadingSpinner /> : `🔍 ${labelText.analyze}`}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card bg-white p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-emerald-600">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <h2 className="text-3xl font-bold text-gray-800">{displayDiagnosis}</h2>
              <DiagnosisBadge type={result.diagnosisType} language={language} />
            </div>
            
            <div className="mb-6">
              <ConfidenceGauge value={result.confidence} language={language} />
            </div>
            
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {displayExplanation}
            </p>
            <div className="mb-8 flex flex-wrap gap-3">
              <button type="button" onClick={speakResult} className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-950/50">🔊 {labelText.readResult}</button>
              <button type="button" onClick={copyResult} className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">📋 {labelText.copySummary}</button>
            </div>

            {result.diagnosisType === 'IMAGE_NOT_MATCHED' ? (
              <div className="mb-8 rounded-xl border border-red-200 bg-red-950/40 p-5">
                <p className="text-lg font-semibold text-red-200">{labelText.retakePhoto}</p>
              </div>
            ) : displaySolution && (
              <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="text-xl font-bold text-emerald-900 mb-2">
                  {language === 'bn' ? '✅ রোগের সঠিক সমাধান' : language === 'hi' ? '✅ रोग का सही समाधान' : '✅ Proper Disease Solution'}
                </h3>
                <p className="text-emerald-900 leading-relaxed">{displaySolution}</p>
              </div>
            )}

            {result.diagnosisType !== 'IMAGE_NOT_MATCHED' && displayCandidates && displayCandidates.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{labelText.alternativePossibilities}</h3>
                <CandidateList candidates={displayCandidates} language={language} />
              </div>
            )}

            {result.diagnosisType !== 'IMAGE_NOT_MATCHED' && <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{labelText.actionPlan}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard
                  stepNumber={1}
                  icon="🌿"
                  title={language === 'bn' ? 'ধাপ ১: জৈব' : language === 'hi' ? 'चरण 1: जैविक' : 'Step 1: Organic'}
                  actions={actionGroups.organic}
                />
                <ActionCard
                  stepNumber={2}
                  icon="💊"
                  title={language === 'bn' ? 'ধাপ ২: রাসায়নিক' : language === 'hi' ? 'चरण 2: रासायनिक' : 'Step 2: Chemical'}
                  actions={actionGroups.chemical}
                />
                <ActionCard
                  stepNumber={3}
                  icon="🛡️"
                  title={language === 'bn' ? 'ধাপ ৩: প্রতিরোধ' : language === 'hi' ? 'चरण 3: रोकथाम' : 'Step 3: Prevention'}
                  actions={actionGroups.prevention}
                />
              </div>
            </div>}

            {displayWarnings && displayWarnings.length > 0 && (
              <div className="mb-8">
                <SafetyWarnings warnings={displayWarnings} language={language} />
              </div>
            )}

            <div className="mb-8">
              <EscalationAlert show={result.escalateToExpert} info={displayEscalation} language={language} />
            </div>

            <div className="mb-8">
              <WeatherCard 
                weatherContext={displayWeatherContext}
                cropStageRelevance={displayCropStageRelevance}
                districtContext={displayDistrictContext}
                language={language}
              />
            </div>

            {(liveWeather || kvkInfo || mandiPrices.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {liveWeather && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-emerald-900 mb-2">{labelText.liveWeather}</h3>
                    <p className="text-3xl font-bold text-emerald-800">{liveWeather.temperatureC ?? '--'}°C</p>
                    <p className="text-sm text-gray-700">{localizedWeatherCondition(liveWeather.condition) || (language === 'bn' ? 'আবহাওয়া ডেটা প্রস্তুত' : language === 'hi' ? 'मौसम डेटा तैयार है' : 'Weather data ready')}</p>
                    <p className="text-xs text-gray-600 mt-2">{language === 'bn' ? 'আর্দ্রতা' : language === 'hi' ? 'नमी' : 'Humidity'}: {liveWeather.humidityPercent ?? '--'}% • {language === 'bn' ? 'হাওয়া' : language === 'hi' ? 'हवा' : 'Wind'}: {liveWeather.windKph ?? '--'} km/h</p>
                  </div>
                )}

                {kvkInfo && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">{labelText.nearestKvk}</h3>
                    <p className="font-semibold text-gray-800">{kvkInfo.name}</p>
                    <p className="text-sm text-gray-700">{kvkInfo.address}</p>
                    {kvkInfo.phone && <a className="text-sm text-amber-700 underline" href={`tel:${kvkInfo.phone}`}>{kvkInfo.phone}</a>}
                    {kvkInfo.website && <a className="block text-sm text-amber-700 underline mt-1" href={kvkInfo.website} target="_blank" rel="noreferrer">{language === 'bn' ? 'সরকারী ওয়েবসাইট' : language === 'hi' ? 'अधिकारिक वेबसाइट' : 'Official website'}</a>}
                  </div>
                )}

                {mandiPrices.length > 0 && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 overflow-auto">
                    <h3 className="text-lg font-bold text-sky-900 mb-2">{labelText.mandiPrices}</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      {mandiPrices.slice(0, 3).map((market, idx) => (
                        <div key={idx} className="border-b border-sky-100 pb-2 last:border-0 last:pb-0">
                          <p className="font-semibold">{market.market || (language === 'bn' ? 'বাজার' : language === 'hi' ? 'बाजार' : 'Market')}</p>
                          <p>{language === 'bn' ? 'মোডেল' : language === 'hi' ? 'मॉडल' : 'Modal'}: ₹{market.modalPrice ?? 'N/A'} • {language === 'bn' ? 'সর্বনিম্ন' : language === 'hi' ? 'न्यूनतम' : 'Min'}: ₹{market.minPrice ?? 'N/A'}</p>
                          <p className="text-xs text-gray-500">{market.date || ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={resetForm}
              className="btn-secondary w-full py-4 text-center border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              {labelText.startNew}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
