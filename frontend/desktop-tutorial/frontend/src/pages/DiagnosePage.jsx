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

  const translateCropName = (name) => cropNameMap[language]?.[name] || cropNameMap.en?.[name] || name;
  const translateStageName = (stage) => cropStageMap[language]?.[stage] || cropStageMap.en?.[stage] || stage;

  const getLocalizedError = (message) => {
    const lower = (message || '').toLowerCase();
    if (lower.includes('microphone') || lower.includes('permission')) return labelText.micUnavailable;
    if (lower.includes('valid image')) return labelText.chooseImage;
    if (lower.includes('10 mb') || lower.includes('size')) return labelText.imageTooLarge;
    return message;
  };

  const displayDiagnosis = language === 'en' ? result?.primaryDiagnosis : result?.translatedAdvisory?.diagnosisLabel || result?.primaryDiagnosis;
  const displayExplanation = language === 'en' ? result?.explanation : result?.translatedAdvisory?.explanation || result?.explanation;
  const displaySolution = language === 'en' ? result?.solutionSummary : result?.translatedAdvisory?.solutionSummary || result?.solutionSummary || result?.explanation;
  const displayActions = language === 'en' ? result?.nextActions : result?.translatedAdvisory?.nextActions || result?.nextActions;
  const displayWarnings = language === 'en' ? result?.safetyWarnings : result?.translatedAdvisory?.safetyWarnings || result?.safetyWarnings;
  const displayEscalation = language === 'en' ? result?.escalationInfo : result?.translatedAdvisory?.escalationInfo || result?.escalationInfo;

  const actionGroups = (() => {
    const groups = { organic: [], chemical: [], prevention: [] };
    let currentGroup = 'organic';
    (displayActions || []).forEach((action) => {
      const text = String(action);
      if (/step\s*2|chemical/i.test(text)) {
        currentGroup = 'chemical';
      } else if (/step\s*3|prevent/i.test(text)) {
        currentGroup = 'prevention';
      } else if (/step\s*1|organic|immediate/i.test(text)) {
        currentGroup = 'organic';
      } else {
        groups[currentGroup].push(action);
      }
    });
    return groups;
  })();

  const handleFileSelect = (file) => {
    const isImage = file?.type?.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file?.name || '');
    if (!isImage) {
      setError(getLocalizedError(labelText.chooseImage));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(getLocalizedError(labelText.imageTooLarge));
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
      setError(getLocalizedError(labelText.chooseImage));
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
      setError('The diagnosis could not complete with the current image or connection, but the field symptoms still provide useful guidance. Re-check the photo, adjust the crop stage, and continue with the advisory steps using local observation and KVK support.');
    } finally {
      setLoading(false);
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
                placeholder={language === 'bn' ? 'আপনি কী other symptoms দেখছেন তা বর্ণনা করুন...' : language === 'hi' ? 'आपको कौन-सी अन्य लक्षण दिख रहे हैं, लिखें...' : 'Describe any other symptoms you see...'}
                value={observations}
                onChange={e => setObservations(e.target.value)}
              />
              {speechStatus && <p className="mt-2 text-sm text-emerald-700">{speechStatus}</p>}
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded">{error}</div>}

            <button 
              type="submit" 
              className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              disabled={!selectedFile || loading}
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
              <DiagnosisBadge type={result.diagnosisType} />
            </div>
            
            <div className="mb-6">
              <ConfidenceGauge value={result.confidence} />
            </div>
            
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {displayExplanation}
            </p>

            {displaySolution && (
              <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="text-xl font-bold text-emerald-900 mb-2">
                  {language === 'bn' ? '✅ রোগের সঠিক সমাধান' : language === 'hi' ? '✅ रोग का सही समाधान' : '✅ Proper Disease Solution'}
                </h3>
                <p className="text-emerald-900 leading-relaxed">{displaySolution}</p>
              </div>
            )}

            {result.candidates && result.candidates.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{labelText.alternativePossibilities}</h3>
                <CandidateList candidates={result.candidates} />
              </div>
            )}

            <div className="mb-8">
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
            </div>

            {displayWarnings && displayWarnings.length > 0 && (
              <div className="mb-8">
                <SafetyWarnings warnings={displayWarnings} />
              </div>
            )}

            <div className="mb-8">
              <EscalationAlert show={result.escalateToExpert} info={displayEscalation} />
            </div>

            <div className="mb-8">
              <WeatherCard 
                weatherContext={result.weatherContext} 
                cropStageRelevance={result.cropStageRelevance} 
                districtContext={result.districtContext} 
              />
            </div>

            {(liveWeather || kvkInfo || mandiPrices.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {liveWeather && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-emerald-900 mb-2">{labelText.liveWeather}</h3>
                    <p className="text-3xl font-bold text-emerald-800">{liveWeather.temperatureC ?? '--'}°C</p>
                    <p className="text-sm text-gray-700">{liveWeather.condition || (language === 'bn' ? 'আবহাওয়া ডেটা প্রস্তুত' : language === 'hi' ? 'मौसम डेटा तैयार है' : 'Weather data ready')}</p>
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

            {language !== 'en' && result.translatedAdvisory && (
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">{labelText.advisoryLocal}</h3>
                <h4 className="font-bold text-lg mb-2">{result.translatedAdvisory.diagnosisLabel}</h4>
                <p className="mb-4 text-gray-800">{result.translatedAdvisory.explanation}</p>
                
                <h5 className="font-semibold mb-2 mt-4">{labelText.nextActions}</h5>
                <ul className="list-disc pl-5 mb-4 text-gray-800">
                  {result.translatedAdvisory.nextActions?.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>

                {result.translatedAdvisory.safetyWarnings?.length > 0 && (
                  <>
                    <h5 className="font-semibold mb-2 mt-4 text-red-800">{labelText.safetyWarnings}</h5>
                    <ul className="list-disc pl-5 mb-4 text-red-800">
                      {result.translatedAdvisory.safetyWarnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {result.escalateToExpert && result.translatedAdvisory.escalationInfo && (
                  <div className="mt-4 p-4 bg-orange-100 text-orange-900 rounded-lg font-medium">
                    {result.translatedAdvisory.escalationInfo}
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
