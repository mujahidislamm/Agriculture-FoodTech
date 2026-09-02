import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDistricts, getMandiPrices, getWeather } from '../api/cropApi';
import { useLanguage } from '../context/LanguageContext';

const crops = ['Rice', 'Potato', 'Jute', 'Mustard', 'Tea', 'Tomato', 'Brinjal', 'Chilli', 'Mango', 'Wheat', 'Maize'];
const typicalPrices = { Rice: 2400, Potato: 1800, Jute: 5200, Mustard: 6200, Tea: 22000, Tomato: 2400, Brinjal: 2600, Chilli: 7000, Mango: 6500, Wheat: 2500, Maize: 2200 };
const featureText = {
  en: { today: 'Today on your farm', morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Good night', choose: 'Choose your district for local updates', weather: 'Weather', weatherTask: 'Check soil moisture before irrigating; avoid watering if the soil is still damp.', rainTask: 'Rain is expected. Avoid irrigation and keep harvested produce covered.', chooseTask: 'Choose your district below to get a weather-based task reminder.', price: 'price', nearby: 'nearby', pest: 'Today', pestText: 'Check leaves, soil moisture, and infected plants.', calculator: 'Farm Profit Calculator', calculatorCopy: 'Estimate your crop income before spending money. Change any value to match your own field.', priceUsed: 'Price used', land: 'Land (acres)', crop: 'Crop', seed: 'Seed cost (₹)', fertilizer: 'Fertilizer cost (₹)', labour: 'Labour cost (₹)', production: 'Expected production (quintals)', selling: 'Selling price (₹/quintal)', revenue: 'Expected revenue', cost: 'Total cost', profit: 'Expected profit', loss: 'Expected loss', breakEven: 'Break-even price', estimateNote: 'This is an estimate, not a guarantee.' },
  bn: { today: 'আজ আপনার খামারে', morning: 'সুপ্রভাত', afternoon: 'শুভ অপরাহ্ন', evening: 'শুভ সন্ধ্যা', night: 'শুভ রাত্রি', choose: 'স্থানীয় তথ্যের জন্য জেলা বেছে নিন', weather: 'আবহাওয়া', weatherTask: 'সেচের আগে মাটির আর্দ্রতা পরীক্ষা করুন; মাটি ভেজা থাকলে জল দেবেন না।', rainTask: 'বৃষ্টির সম্ভাবনা আছে। সেচ বন্ধ রাখুন এবং কাটা ফসল ঢেকে রাখুন।', chooseTask: 'আবহাওয়ার কাজ দেখতে নিচে জেলা বেছে নিন।', price: 'দাম', nearby: 'কাছাকাছি', pest: 'আজ', pestText: 'পাতা, মাটির আর্দ্রতা ও আক্রান্ত গাছ পরীক্ষা করুন।', calculator: 'ফসলের লাভের হিসাব', calculatorCopy: 'খরচের আগে সম্ভাব্য আয় হিসাব করুন। আপনার জমির তথ্য অনুযায়ী মান বদলান।', priceUsed: 'ব্যবহৃত দাম', land: 'জমি (একর)', crop: 'ফসল', seed: 'বীজের খরচ (₹)', fertilizer: 'সারের খরচ (₹)', labour: 'শ্রমিকের খরচ (₹)', production: 'সম্ভাব্য উৎপাদন (কুইন্টাল)', selling: 'বিক্রির দাম (₹/কুইন্টাল)', revenue: 'সম্ভাব্য আয়', cost: 'মোট খরচ', profit: 'সম্ভাব্য লাভ', loss: 'সম্ভাব্য ক্ষতি', breakEven: 'খরচ ওঠার দাম', estimateNote: 'এটি একটি হিসাব, নিশ্চয়তা নয়।' },
  hi: { today: 'आज आपके खेत पर', morning: 'सुप्रभात', afternoon: 'शुभ दोपहर', evening: 'शुभ संध्या', night: 'शुभ रात्रि', choose: 'स्थानीय जानकारी के लिए जिला चुनें', weather: 'मौसम', weatherTask: 'सिंचाई से पहले मिट्टी की नमी जाँचें; मिट्टी गीली हो तो पानी न दें।', rainTask: 'बारिश की संभावना है। सिंचाई न करें और कटी फसल को ढककर रखें।', chooseTask: 'मौसम आधारित काम देखने के लिए नीचे जिला चुनें।', price: 'भाव', nearby: 'पास में', pest: 'आज', pestText: 'पत्तियों, मिट्टी की नमी और संक्रमित पौधों की जाँच करें।', calculator: 'फसल लाभ कैलकुलेटर', calculatorCopy: 'खर्च करने से पहले अपनी संभावित आय जानें। अपने खेत के अनुसार मान बदलें।', priceUsed: 'इस्तेमाल किया भाव', land: 'जमीन (एकड़)', crop: 'फसल', seed: 'बीज खर्च (₹)', fertilizer: 'उर्वरक खर्च (₹)', labour: 'मजदूरी खर्च (₹)', production: 'अनुमानित उत्पादन (क्विंटल)', selling: 'बिक्री भाव (₹/क्विंटल)', revenue: 'अनुमानित आय', cost: 'कुल खर्च', profit: 'अनुमानित लाभ', loss: 'अनुमानित नुकसान', breakEven: 'लागत वसूली भाव', estimateNote: 'यह अनुमान है, गारंटी नहीं।' },
};
const dashboardText = {
  en: { tabs: ['Weather', 'Market prices', 'Nearby shops'], tag: 'WEST BENGAL FARM SUPPORT', title: 'Grow with clarity, every day.', intro: 'One simple place to check local weather, mandi prices and nearby agricultural supplies before you step into the field.', diagnose: 'Diagnose my crop →', explore: 'Explore local tools', weatherDetail: 'Field-ready view', priceDetail: '7-day trend', shopDetail: 'Near your area', dashboard: 'Farmer dashboard', local: 'Local information, made simple', select: 'Select a district once, then switch tabs to check what matters most today.', area: 'Your area', useLocation: 'Use my location', districtFail: 'Districts could not be loaded. Please refresh and try again.', locating: 'Finding the closest West Bengal district…', nearest: (name) => `Using ${name} as your nearest district.`, locationUnsupported: 'Location is not supported by this browser. Choose your district instead.', locationFail: 'We could not access your location. Choose your district instead.', weatherFail: 'Weather is unavailable at the moment. Please try again shortly.', marketFail: 'Market prices are unavailable at the moment. Please try again shortly.', help: 'Need help with a crop problem?', helpCopy: 'Upload a clear leaf photo and receive an easy treatment advisory.', start: 'Start crop diagnosis', updating: 'Updating weather…', chooseDistrict: 'Choose a district to view its weather.', conditions: (name) => `CURRENT CONDITIONS · ${name}`, weatherUpdate: 'Weather update', celsius: 'Celsius', humidity: 'Humidity', rain: 'Rain', wind: 'Wind', next: 'Next 3 days', low: 'Low', weatherSource: 'District weather service. Check local warnings before spraying or travelling.', marketTitle: (name) => `Mandi prices in ${name}`, marketCopy: 'Prices are in ₹ per quintal. Confirm at the market before selling.', crop: 'Crop', marketLoading: 'Loading market prices…', trend: '7-day price trend', trendCopy: (crop) => `Indicative local trend for ${crop}`, estimate: 'Market estimate', marketName: 'Market', variety: 'Variety', range: 'Range', modal: 'Modal price', date: 'Date', today: 'Today', priceNote: 'Prices may change with quality, variety and arrivals.', near: (name) => `Find supplies near ${name}`, shopsTitle: 'Open nearby farming shops in Maps', shopsCopy: 'Choose what you need. We open a map search for your selected district so you can see current local shops, directions and contact details.', shopNames: ['Seeds & fertiliser', 'Farm equipment', 'Veterinary & feed'], shopDetails: ['Seeds, nutrients and crop protection inputs', 'Tools, pumps, sprayers and repair support', 'Animal feed and livestock supplies'], find: 'Find nearby ↗', shopsNote: 'Shop results and opening times are provided by the map service. Call the shop to confirm stock before travelling.' },
  bn: { tabs: ['আবহাওয়া', 'বাজারদর', 'কাছের দোকান'], tag: 'পশ্চিমবঙ্গ কৃষক সহায়তা', title: 'প্রতিদিন স্পষ্ট তথ্য নিয়ে চাষ করুন।', intro: 'মাঠে যাওয়ার আগে স্থানীয় আবহাওয়া, বাজারদর ও কাছের কৃষি-সরঞ্জামের তথ্য এক জায়গায় দেখুন।', diagnose: 'আমার ফসল পরীক্ষা করুন →', explore: 'স্থানীয় তথ্য দেখুন', weatherDetail: 'মাঠের জন্য প্রস্তুত', priceDetail: '৭ দিনের প্রবণতা', shopDetail: 'আপনার এলাকার কাছে', dashboard: 'কৃষক ড্যাশবোর্ড', local: 'সহজে স্থানীয় তথ্য', select: 'একবার জেলা বেছে নিন, তারপর প্রয়োজনীয় তথ্য দেখতে ট্যাব বদলান।', area: 'আপনার এলাকা', useLocation: 'আমার অবস্থান ব্যবহার করুন', districtFail: 'জেলার তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।', locating: 'নিকটতম পশ্চিমবঙ্গ জেলা খোঁজা হচ্ছে…', nearest: (name) => `আপনার নিকটতম জেলা হিসেবে ${name} ব্যবহার করা হচ্ছে।`, locationUnsupported: 'এই ব্রাউজারে অবস্থান সুবিধা নেই। অনুগ্রহ করে জেলা বেছে নিন।', locationFail: 'আপনার অবস্থান পাওয়া যায়নি। অনুগ্রহ করে জেলা বেছে নিন।', weatherFail: 'এই মুহূর্তে আবহাওয়ার তথ্য পাওয়া যাচ্ছে না। পরে চেষ্টা করুন।', marketFail: 'এই মুহূর্তে বাজারদর পাওয়া যাচ্ছে না। পরে চেষ্টা করুন।', help: 'ফসলের সমস্যায় সাহায্য দরকার?', helpCopy: 'পাতার পরিষ্কার ছবি আপলোড করে সহজ চিকিৎসা পরামর্শ পান।', start: 'ফসল পরীক্ষা শুরু করুন', updating: 'আবহাওয়া হালনাগাদ হচ্ছে…', chooseDistrict: 'আবহাওয়া দেখতে একটি জেলা বেছে নিন।', conditions: (name) => `বর্তমান পরিস্থিতি · ${name}`, weatherUpdate: 'আবহাওয়ার তথ্য', celsius: 'সেলসিয়াস', humidity: 'আর্দ্রতা', rain: 'বৃষ্টি', wind: 'বাতাস', next: 'পরের ৩ দিন', low: 'সর্বনিম্ন', weatherSource: 'জেলা আবহাওয়া পরিষেবা। স্প্রে বা যাত্রার আগে স্থানীয় সতর্কতা দেখুন।', marketTitle: (name) => `${name}-এর বাজারদর`, marketCopy: 'দাম ₹ প্রতি কুইন্টাল। বিক্রির আগে বাজারে নিশ্চিত করুন।', crop: 'ফসল', marketLoading: 'বাজারদর লোড হচ্ছে…', trend: '৭ দিনের দামের প্রবণতা', trendCopy: (crop) => `${crop}-এর স্থানীয় আনুমানিক প্রবণতা`, estimate: 'বাজারের আনুমানিক তথ্য', marketName: 'বাজার', variety: 'জাত', range: 'দামসীমা', modal: 'মূল দাম', date: 'তারিখ', today: 'আজ', priceNote: 'জাত, মান ও আগমনের পরিমাণ অনুযায়ী দাম বদলাতে পারে।', near: (name) => `${name}-এর কাছে সরঞ্জাম খুঁজুন`, shopsTitle: 'ম্যাপে কাছের কৃষি দোকান দেখুন', shopsCopy: 'আপনার প্রয়োজন বেছে নিন। নির্বাচিত জেলার বর্তমান দোকান, দিকনির্দেশ ও যোগাযোগের তথ্য দেখতে ম্যাপ খুলবে।', shopNames: ['বীজ ও সার', 'কৃষি যন্ত্রপাতি', 'পশুখাদ্য ও পশুচিকিৎসা'], shopDetails: ['বীজ, পুষ্টি ও ফসল সুরক্ষা সামগ্রী', 'যন্ত্র, পাম্প, স্প্রেয়ার ও মেরামত', 'পশুখাদ্য ও গবাদি পশুর সামগ্রী'], find: 'কাছে খুঁজুন ↗', shopsNote: 'দোকানের ফলাফল ও খোলার সময় ম্যাপ পরিষেবা দেয়। যাওয়ার আগে স্টক নিশ্চিত করতে ফোন করুন।' },
  hi: { tabs: ['मौसम', 'बाज़ार भाव', 'नज़दीकी दुकानें'], tag: 'पश्चिम बंगाल किसान सहायता', title: 'हर दिन सही जानकारी के साथ खेती करें।', intro: 'खेत जाने से पहले स्थानीय मौसम, मंडी भाव और पास की कृषि-सामग्री की जानकारी एक ही जगह देखें।', diagnose: 'मेरी फसल जाँचें →', explore: 'स्थानीय जानकारी देखें', weatherDetail: 'खेत के लिए तैयार', priceDetail: '7 दिन का रुझान', shopDetail: 'आपके क्षेत्र के पास', dashboard: 'किसान डैशबोर्ड', local: 'स्थानीय जानकारी, आसानी से', select: 'एक बार जिला चुनें, फिर ज़रूरी जानकारी के लिए टैब बदलें।', area: 'आपका क्षेत्र', useLocation: 'मेरा स्थान इस्तेमाल करें', districtFail: 'जिलों की सूची लोड नहीं हो सकी। फिर कोशिश करें।', locating: 'निकटतम पश्चिम बंगाल जिला खोजा जा रहा है…', nearest: (name) => `${name} को आपके निकटतम जिले के रूप में चुना गया है।`, locationUnsupported: 'इस ब्राउज़र में स्थान सुविधा उपलब्ध नहीं है। कृपया जिला चुनें।', locationFail: 'आपका स्थान नहीं मिल सका। कृपया जिला चुनें।', weatherFail: 'अभी मौसम की जानकारी उपलब्ध नहीं है। कृपया बाद में कोशिश करें।', marketFail: 'अभी बाज़ार भाव उपलब्ध नहीं है। कृपया बाद में कोशिश करें।', help: 'फसल की समस्या में मदद चाहिए?', helpCopy: 'पत्ते की साफ़ तस्वीर अपलोड करें और आसान उपचार सलाह पाएँ।', start: 'फसल जाँच शुरू करें', updating: 'मौसम अपडेट हो रहा है…', chooseDistrict: 'मौसम देखने के लिए जिला चुनें।', conditions: (name) => `वर्तमान स्थिति · ${name}`, weatherUpdate: 'मौसम जानकारी', celsius: 'सेल्सियस', humidity: 'नमी', rain: 'बारिश', wind: 'हवा', next: 'अगले 3 दिन', low: 'न्यूनतम', weatherSource: 'जिला मौसम सेवा। छिड़काव या यात्रा से पहले स्थानीय चेतावनी देखें।', marketTitle: (name) => `${name} में मंडी भाव`, marketCopy: 'कीमत ₹ प्रति क्विंटल है। बेचने से पहले मंडी में पुष्टि करें।', crop: 'फसल', marketLoading: 'बाज़ार भाव लोड हो रहे हैं…', trend: '7 दिन का मूल्य रुझान', trendCopy: (crop) => `${crop} का स्थानीय अनुमानित रुझान`, estimate: 'बाज़ार का अनुमान', marketName: 'मंडी', variety: 'किस्म', range: 'दायरा', modal: 'मुख्य मूल्य', date: 'तारीख', today: 'आज', priceNote: 'किस्म, गुणवत्ता और आवक के अनुसार कीमत बदल सकती है।', near: (name) => `${name} के पास सामान खोजें`, shopsTitle: 'मैप पर पास की कृषि दुकानें खोलें', shopsCopy: 'अपनी ज़रूरत चुनें। चुने हुए जिले की मौजूदा दुकानें, दिशा और संपर्क विवरण देखने के लिए मैप खुलेगा।', shopNames: ['बीज और उर्वरक', 'कृषि उपकरण', 'पशु आहार और चिकित्सा'], shopDetails: ['बीज, पोषण और फसल सुरक्षा सामग्री', 'औज़ार, पंप, स्प्रेयर और मरम्मत', 'पशु आहार और पशुपालन सामग्री'], find: 'पास में खोजें ↗', shopsNote: 'दुकान के परिणाम और समय मैप सेवा देती है। जाने से पहले उपलब्धता के लिए फोन करें।' },
};
const tabs = [['weather', '☀'], ['market', '₹'], ['shops', '⌖']];
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const dateLabel = (date) => new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(date));
const localCondition = (condition, text) => text.weatherConditions?.[condition] || condition || text.weatherUpdate;
const timeGreeting = (hour) => hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : hour >= 17 && hour < 21 ? 'Good evening' : 'Good night';

function weekFrom(records) {
  const base = number(records?.[0]?.modalPrice) || 2100;
  return [-.055, -.025, .018, -.012, .042, .02, 0].map((change, index) => {
    const date = new Date(); date.setDate(date.getDate() - 6 + index);
    return { date, price: Math.round(base * (1 + change) / 10) * 10 };
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = dashboardText[language] || dashboardText.en;
  const [tab, setTab] = useState('weather');
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState('');
  const [crop, setCrop] = useState('Rice');
  const [weather, setWeather] = useState(null);
  const [market, setMarket] = useState(null);
  const [profitInputs, setProfitInputs] = useState({ land: '2', crop: 'Tomato', seed: '4000', fertilizer: '7000', labour: '12000', production: '80', price: '2400' });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const selected = districts.find((item) => item.name === district);
  const week = useMemo(() => weekFrom(market?.records), [market]);

  useEffect(() => {
    getDistricts().then(({ data }) => {
      const availableDistricts = data || [];
      setDistricts(availableDistricts);
      setWeather(null);
      let profileDistrict = '';
      try { profileDistrict = JSON.parse(localStorage.getItem('fasal-sathi-farmer-profile') || '{}').district || ''; } catch { /* use location instead */ }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
          const closest = availableDistricts.reduce((best, item) => {
            const distance = Math.hypot(item.latitude - coords.latitude, item.longitude - coords.longitude);
            return !best || distance < best.distance ? { item, distance } : best;
          }, null);
          setDistrict(closest?.item?.name || profileDistrict);
        }, () => setDistrict(availableDistricts.some((item) => item.name === profileDistrict) ? profileDistrict : ''), { maximumAge: 300000, timeout: 8000 });
      } else {
        setDistrict(availableDistricts.some((item) => item.name === profileDistrict) ? profileDistrict : '');
      }
    })
      .catch(() => setNotice(text.districtFail));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selected || tab !== 'weather') {
      if (!district && tab === 'weather') setWeather(null);
      return;
    }
    setWeather(null);
    setLoading(true); setNotice('');
    getWeather(selected.latitude, selected.longitude).then(({ data }) => setWeather(data))
      .catch(() => setNotice(text.weatherFail))
      .finally(() => setLoading(false));
  }, [selected, tab]);

  useEffect(() => {
    if (!district || tab !== 'market') return;
    setLoading(true); setNotice('');
    getMandiPrices(crop, 'West Bengal', district).then(({ data }) => setMarket(data))
      .catch(() => setNotice(text.marketFail))
      .finally(() => setLoading(false));
  }, [crop, district, tab]);

  const useLocation = () => {
    if (!navigator.geolocation) return setNotice(text.locationUnsupported);
    setLoading(true); setNotice(text.locating);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const closest = districts.reduce((best, item) => {
        const distance = Math.hypot(item.latitude - coords.latitude, item.longitude - coords.longitude);
        return !best || distance < best.distance ? { item, distance } : best;
      }, null);
      if (closest) { setDistrict(closest.item.name); setNotice(text.nearest(closest.item.name)); }
      setLoading(false);
    }, () => { setNotice(text.locationFail); setLoading(false); }, { timeout: 10000, maximumAge: 300000 });
  };

  const updateProfitInput = (field, value) => {
    setProfitInputs((current) => ({ ...current, [field]: value }));
  };

  return <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800">
    <MorningBrief district={district} crop={crop} weather={weather} market={market} currentTime={currentTime} language={language} />
    {/* Hero Section */}
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-4 py-14 text-white sm:py-20">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
        <div>
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-emerald-50 backdrop-blur-sm">
            {text.tag}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            {text.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
            {text.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/diagnose')} 
              className="rounded-xl bg-lime-300 px-6 py-3 font-bold text-emerald-950 shadow-lg hover:shadow-xl hover:bg-lime-200 transition-all duration-200 transform hover:scale-105"
            >
              {text.diagnose}
            </button>
            <a 
              href="#farm-tools" 
              className="rounded-xl border-2 border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
            >
              {text.explore}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
          <HeroStat icon="☀" title={text.tabs[0]} detail={text.weatherDetail} />
          <HeroStat icon="₹" title={text.tabs[1]} detail={text.priceDetail} />
          <HeroStat icon="⌖" title={text.tabs[2]} detail={text.shopDetail} />
        </div>
      </div>
    </section>

    {/* Dashboard Section */}
    <section id="farm-tools" className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            {text.dashboard}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {text.local}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          {text.select}
        </p>
      </div>
      <a href="#profit-calculator-title" className="mt-4 inline-flex items-center rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-900/70">🧮 Explore more tools: Farm Profit Calculator</a>
      
      {/* Dashboard Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
        {/* District Selection */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {text.area}
            </label>
            <select 
              value={district} 
              onChange={(event) => setDistrict(event.target.value)} 
              className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all"
            >
              <option value="">{text.chooseDistrict}</option>
              {districts.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={useLocation} 
            className="rounded-xl border-2 border-emerald-600 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-50 hover:shadow-md"
          >
            ⌖ {text.useLocation}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b-2 border-slate-200" role="tablist">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(([id, icon], index) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => {
                  setTab(id);
                  setNotice('');
                }}
                className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-all border-b-2 -mb-0.5 ${
                  tab === id
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="mr-2 text-lg">{icon}</span>
                {text.tabs[index]}
              </button>
            ))}
          </div>
        </div>

        {/* Notice Alert */}
        {notice && (
          <div className="mt-6 rounded-lg bg-amber-50 border-l-4 border-amber-500 px-4 py-3 text-sm text-amber-900 font-medium">
            {notice}
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-8">
          {tab === 'weather' && <Weather weather={weather} district={district} loading={loading} text={text} />}
          {tab === 'market' && <Market crop={crop} setCrop={setCrop} market={market} week={week} district={district} loading={loading} text={text} />}
          {tab === 'shops' && <Shops district={district} text={text} />}
        </div>
      </div>
    </section>

    <ProfitCalculator
      inputs={profitInputs}
      onChange={updateProfitInput}
      market={market}
      language={language}
    />

    {/* CTA Section */}
    <section className="border-t-2 border-b-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div>
          <p className="text-lg font-bold text-emerald-950">
            {text.help}
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            {text.helpCopy}
          </p>
        </div>
        <button 
          onClick={() => navigate('/diagnose')} 
          className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
        >
          {text.start}
        </button>
      </div>
    </section>
  </div>;
}

function MorningBrief({ district, crop, weather, market, currentTime, language }) {
  const copy = featureText[language] || featureText.en;
  const price = Number(market?.records?.[0]?.modalPrice) || typicalPrices[crop] || 2400;
  const greeting = timeGreeting(currentTime.getHours()).replace('Good morning', copy.morning).replace('Good afternoon', copy.afternoon).replace('Good evening', copy.evening).replace('Good night', copy.night);
  const weatherAdvice = weather?.rainMm > 5 ? copy.rainTask : weather ? copy.weatherTask : copy.chooseTask;
  return <section className="mx-auto max-w-7xl px-4 pt-6 sm:pt-8" aria-labelledby="morning-brief-title"><div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-5 shadow-md sm:p-6"><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{copy.today}</p><h2 id="morning-brief-title" className="mt-2 text-2xl font-bold text-slate-100">{greeting}, farmer</h2><p className="mt-2 text-sm text-slate-300">{district ? `📍 ${copy.choose.split(' ')[0]} — ${district}` : `📍 ${copy.choose}`}</p><div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-3"><p>🌦️ <strong>{copy.weather}:</strong> {weatherAdvice}</p><p>💰 <strong>{crop} {copy.price}:</strong> ₹{price.toLocaleString('en-IN')}/quintal {copy.nearby}.</p><p>🐛 <strong>{copy.pest}:</strong> {copy.pestText}</p></div></div></section>;
}

function FarmerPlanner({ district, crop, weather, market, farmCrops, onSave, onRemove }) {
  const [form, setForm] = useState({ crop: crop || 'Tomato', acres: '2', planted: '', harvest: '', storage: 'Ventilated room', notes: '' });
  const price = Number(market?.records?.[0]?.modalPrice) || typicalPrices[crop] || 2400;
  const weatherAdvice = weather?.rainMm > 5 ? "Rain is expected. Avoid irrigation and keep harvested produce covered." : weather ? "Check soil moisture before irrigating; avoid watering if the soil is still damp." : "Choose your district above to get a weather-based task reminder.";
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.crop || !Number(form.acres)) return;
    onSave({ ...form, acres: Number(form.acres) });
    setForm((current) => ({ ...current, notes: '' }));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:pb-16" aria-labelledby="farmer-planner-title">
      <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-6 shadow-md sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Today on your farm</p>
          <h2 id="farmer-planner-title" className="mt-2 text-2xl font-bold text-slate-100">Good morning, farmer</h2>
          <p className="mt-3 text-sm text-slate-300">{district ? `📍 Your farm — ${district}` : '📍 Choose your district for local updates'}</p>
          <div className="mt-6 space-y-4 text-sm text-slate-200">
            <p><span className="mr-2">🌦️</span><strong>Weather task:</strong> {weatherAdvice}</p>
            <p><span className="mr-2">💰</span><strong>{crop} prices:</strong> ₹{price.toLocaleString('en-IN')}/quintal nearby. Confirm at the market before selling.</p>
            <p><span className="mr-2">🐛</span><strong>Pest check:</strong> Inspect the underside of leaves and isolate any infected plants.</p>
            <div>
              <strong>📅 Today&apos;s tasks</strong>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-300">
                <li>Check leaves and soil moisture</li>
                <li>Remove and safely dispose of infected plants</li>
                <li>Review storage space before harvest</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-md sm:p-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Keep your farm record</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-100">My Crops &amp; Storage</h2>
            </div>
            <p className="text-xs text-slate-400">Saved on this device</p>
          </div>
          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <PlannerSelect label="Crop" value={form.crop} options={crops} onChange={(value) => update('crop', value)} />
            <PlannerInput label="Land (acres)" type="number" min="0.1" step="0.1" value={form.acres} onChange={(value) => update('acres', value)} />
            <PlannerInput label="Planting date" type="date" value={form.planted} onChange={(value) => update('planted', value)} />
            <PlannerInput label="Expected harvest date" type="date" value={form.harvest} onChange={(value) => update('harvest', value)} />
            <PlannerSelect label="Storage method" value={form.storage} options={['Ventilated room', 'Cold storage', 'Warehouse', 'Jute sacks', 'Sell immediately']} onChange={(value) => update('storage', value)} />
            <PlannerInput label="Notes" value={form.notes} placeholder="Seed variety, batch, or problem" onChange={(value) => update('notes', value)} />
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 sm:col-span-2">+ Save crop record</button>
          </form>
          <div className="mt-6 space-y-3">
            {farmCrops.length === 0 ? <p className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">Add the crops you are growing to remember harvest and storage plans.</p> : farmCrops.map((record) => (
              <div key={record.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4 sm:flex-row sm:items-center">
                <div><p className="font-bold text-slate-100">{record.crop} · {record.acres} acres</p><p className="mt-1 text-xs text-slate-400">Store in: {record.storage}{record.harvest ? ` · Harvest: ${record.harvest}` : ''}</p>{record.notes && <p className="mt-1 text-xs text-slate-300">{record.notes}</p>}</div>
                <button type="button" onClick={() => onRemove(record.id)} className="self-start rounded-md border border-red-800 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950 sm:self-auto">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlannerInput({ label, value, onChange, type = 'text', ...props }) {
  const id = `planner-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <label htmlFor={id} className="block text-sm font-semibold text-slate-200">{label}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30" {...props} /></label>;
}

function PlannerSelect({ label, value, options, onChange }) {
  const id = `planner-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <label htmlFor={id} className="block text-sm font-semibold text-slate-200">{label}<select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ProfitCalculator({ inputs, onChange, market, language }) {
  const copy = featureText[language] || featureText.en;
  const numberValue = (value) => Math.max(0, Number(value) || 0);
  const marketPrice = numberValue(market?.records?.[0]?.modalPrice);
  const price = numberValue(inputs.price) || marketPrice || typicalPrices[inputs.crop] || 2100;
  const production = numberValue(inputs.production);
  const totalCost = numberValue(inputs.seed) + numberValue(inputs.fertilizer) + numberValue(inputs.labour);
  const revenue = production * price;
  const profit = revenue - totalCost;
  const breakEven = production > 0 ? totalCost / production : 0;
  const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:pb-16" aria-labelledby="profit-calculator-title">
      <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-6 shadow-md sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{copy.today}</p>
            <h2 id="profit-calculator-title" className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">{copy.calculator}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{copy.calculatorCopy}</p>
          </div>
          <p className="text-xs text-slate-400">Price used: {money(price)} per quintal</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProfitInput label={copy.land} value={inputs.land} onChange={(value) => onChange('land', value)} />
          <label className="block text-sm font-semibold text-slate-200">{copy.crop}
            <select value={inputs.crop} onChange={(event) => onChange('crop', event.target.value)} className="mt-2 w-full rounded-lg border border-emerald-800 bg-slate-900 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30">
              {crops.map((cropName) => <option key={cropName}>{cropName}</option>)}
            </select>
          </label>
          <ProfitInput label={copy.seed} value={inputs.seed} onChange={(value) => onChange('seed', value)} />
          <ProfitInput label={copy.fertilizer} value={inputs.fertilizer} onChange={(value) => onChange('fertilizer', value)} />
          <ProfitInput label={copy.labour} value={inputs.labour} onChange={(value) => onChange('labour', value)} />
          <ProfitInput label={copy.production} value={inputs.production} onChange={(value) => onChange('production', value)} />
          <ProfitInput label={copy.selling} value={inputs.price} onChange={(value) => onChange('price', value)} />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProfitResult label={copy.revenue} value={money(revenue)} tone="text-sky-300" />
          <ProfitResult label={copy.cost} value={money(totalCost)} tone="text-amber-300" />
          <ProfitResult label={profit >= 0 ? copy.profit : copy.loss} value={money(Math.abs(profit))} tone={profit >= 0 ? 'text-emerald-300' : 'text-red-300'} />
          <ProfitResult label={copy.breakEven} value={`${money(breakEven)}/q`} tone="text-violet-300" />
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-400">{copy.estimateNote} Actual prices, yield, transport, water, land rent, packaging, and crop losses can change the final result.</p>
      </div>
    </section>
  );
}

function ProfitInput({ label, value, onChange }) {
  return <label className="block text-sm font-semibold text-slate-200">{label}<input type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-emerald-800 bg-slate-900 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30" /></label>;
}

function ProfitResult({ label, value, tone }) {
  return <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p></div>;
}

function HeroStat({ icon, title, detail }) { return <div className="rounded-xl bg-white/10 p-3 text-center"><div className="text-2xl">{icon}</div><strong className="mt-2 block text-sm">{title}</strong><span className="text-xs text-emerald-100">{detail}</span></div>; }
function Metric({ label, value }) { return <div className="rounded-xl bg-white/80 p-3 text-center shadow-sm"><span className="block text-lg font-bold text-slate-900">{value}</span><span className="text-xs font-medium text-slate-500">{label}</span></div>; }

function Weather({ weather, district, loading, text }) {
  if (!weather) return <div className="py-10 text-center text-sm text-slate-500">{loading ? text.updating : text.chooseDistrict}</div>;
  return <div className="mt-6"><div className="rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-semibold text-sky-700">{text.conditions(district)}</p><h3 className="mt-1 text-3xl font-bold text-slate-900">{localCondition(weather.condition, text)}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{text.weatherUpdate}</p></div><div className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm"><span className="block text-4xl font-bold text-slate-900">{weather.temperatureC}°</span><span className="text-xs font-semibold text-slate-500">{text.celsius}</span></div></div><div className="mt-6 grid grid-cols-3 gap-3"><Metric label={text.humidity} value={`${weather.humidityPercent}%`} /><Metric label={text.rain} value={`${weather.rainMm} mm`} /><Metric label={text.wind} value={`${weather.windKph} km/h`} /></div></div><div className="mt-5"><h4 className="font-bold text-slate-900">{text.next}</h4><div className="mt-3 grid gap-3 sm:grid-cols-3">{(weather.forecast || []).map((day) => <div key={day.date} className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-800">{dateLabel(day.date)}</p><p className="mt-3 text-2xl font-bold text-emerald-800">{day.highC}°</p><p className="text-xs text-slate-500">{text.low} {day.lowC}° · {text.rain} {day.rainMm} mm</p></div>)}</div></div><p className="mt-4 text-xs text-slate-500">{text.weatherSource}</p></div>;
}

function Market({ crop, setCrop, market, week, district, loading, text }) {
  const max = Math.max(...week.map((item) => item.price), 1);
  return <div className="mt-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h3 className="text-xl font-bold text-slate-900">{text.marketTitle(district)}</h3><p className="mt-1 text-sm text-slate-500">{text.marketCopy}</p></div><label className="text-sm font-semibold text-slate-700">{text.crop}<select value={crop} onChange={(event) => setCrop(event.target.value)} className="ml-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-emerald-600">{crops.map((name) => <option key={name}>{name}</option>)}</select></label></div>{!market && loading ? <div className="py-10 text-sm text-slate-500">{text.marketLoading}</div> : <><div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="flex items-center justify-between"><div><p className="font-bold text-slate-900">{text.trend}</p><p className="text-xs text-slate-500">{text.trendCopy(crop)}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{text.estimate}</span></div><div className="mt-5 flex h-32 items-end gap-2 sm:gap-4">{week.map((item) => <div key={item.date.toISOString()} className="flex flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-semibold text-slate-600">₹{item.price.toLocaleString('en-IN')}</span><div className="w-full max-w-10 rounded-t-md bg-emerald-600" style={{ height: `${Math.max(18, item.price / max * 92)}px` }} /><span className="text-[10px] text-slate-500">{dateLabel(item.date).split(' ')[0]}</span></div>)}</div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">{text.marketName}</th><th className="px-3 py-3">{text.variety}</th><th className="px-3 py-3">{text.range}</th><th className="px-3 py-3">{text.modal}</th><th className="px-3 py-3">{text.date}</th></tr></thead><tbody>{(market?.records || []).map((record, index) => <tr key={`${record.market}-${index}`} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold text-slate-800">{record.market}</td><td className="px-3 py-3 text-slate-600">{record.variety || text.variety}</td><td className="px-3 py-3 text-slate-600">₹{number(record.minPrice).toLocaleString('en-IN')}–₹{number(record.maxPrice).toLocaleString('en-IN')}</td><td className="px-3 py-3 font-bold text-emerald-800">₹{number(record.modalPrice).toLocaleString('en-IN')}</td><td className="px-3 py-3 text-slate-600">{record.date || text.today}</td></tr>)}</tbody></table></div><p className="mt-4 text-xs text-slate-500">{text.priceNote}</p></>}</div>;
}

function Shops({ district, text }) {
  const mapUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const queries = ['agricultural seed fertilizer shops', 'farm equipment shops', 'animal feed veterinary shops'];
  return <div className="mt-6"><div className="rounded-2xl bg-amber-50 p-5 sm:p-7"><p className="text-sm font-bold uppercase tracking-wider text-amber-800">{text.near(district)}</p><h3 className="mt-2 text-2xl font-bold text-slate-900">{text.shopsTitle}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{text.shopsCopy}</p></div><div className="mt-5 grid gap-4 md:grid-cols-3">{queries.map((query, index) => <div key={query} className="rounded-xl border border-slate-200 p-5 shadow-sm"><div className="text-2xl">⌖</div><h4 className="mt-3 font-bold text-slate-900">{text.shopNames[index]}</h4><p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{text.shopDetails[index]}</p><a className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800" href={mapUrl(`${query} in ${district}, West Bengal`)} target="_blank" rel="noreferrer">{text.find}</a></div>)}</div><p className="mt-5 text-xs text-slate-500">{text.shopsNote}</p></div>;
}
