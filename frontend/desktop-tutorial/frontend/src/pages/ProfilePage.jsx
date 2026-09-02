import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import CropStorage from '../components/CropStorage';

const STORAGE_KEY = 'fasal-sathi-farmer-profile';
const emptyProfile = { name: '', village: '', district: '', phone: '', language: 'English' };

export default function ProfilePage() {
  const { language, setLanguage } = useLanguage();
  const copy = { en: { eyebrow: 'Your farm details', title: 'Farmer Profile', intro: 'Save your details on this device so your farm tools can feel personal. No account or internet connection is required.', name: 'Farmer name', village: 'Village / town', district: 'District', phone: 'Phone number', language: 'Preferred language', save: 'Save profile', edit: 'Edit profile', cancel: 'Cancel', saved: 'Profile saved on this device.' }, bn: { eyebrow: 'আপনার খামারের তথ্য', title: 'কৃষক প্রোফাইল', intro: 'এই ডিভাইসে আপনার তথ্য রাখুন, যাতে খামারের সরঞ্জাম আপনার জন্য সহজ হয়। কোনো অ্যাকাউন্ট বা ইন্টারনেট দরকার নেই।', name: 'কৃষকের নাম', village: 'গ্রাম / শহর', district: 'জেলা', phone: 'ফোন নম্বর', language: 'পছন্দের ভাষা', save: 'প্রোফাইল সংরক্ষণ', edit: 'প্রোফাইল সম্পাদনা', cancel: 'বাতিল', saved: 'এই ডিভাইসে প্রোফাইল সংরক্ষিত হয়েছে।' }, hi: { eyebrow: 'आपके खेत की जानकारी', title: 'किसान प्रोफ़ाइल', intro: 'अपनी जानकारी इस डिवाइस पर रखें, ताकि खेत के औज़ार आपके लिए आसान रहें। किसी खाते या इंटरनेट की ज़रूरत नहीं है।', name: 'किसान का नाम', village: 'गाँव / शहर', district: 'जिला', phone: 'फ़ोन नंबर', language: 'पसंदीदा भाषा', save: 'प्रोफ़ाइल सहेजें', edit: 'प्रोफ़ाइल संपादित करें', cancel: 'रद्द करें', saved: 'प्रोफ़ाइल इस डिवाइस पर सहेजी गई।' } }[language] || { en: { eyebrow: 'Your farm details', title: 'Farmer Profile', intro: '', name: 'Farmer name', village: 'Village / town', district: 'District', phone: 'Phone number', language: 'Preferred language', save: 'Save profile', edit: 'Edit profile', cancel: 'Cancel', saved: 'Profile saved.' } };
  const [profile, setProfile] = useState(() => {
    try { return { ...emptyProfile, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { return emptyProfile; }
  });
  const [editing, setEditing] = useState(() => {
    try { return !JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').name; } catch { return true; }
  });
  const [saved, setSaved] = useState(false);
  const [savedProfile, setSavedProfile] = useState(profile);

  const update = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
  const save = (event) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSavedProfile(profile);
    setEditing(false);
    if (profile.language === 'বাংলা') setLanguage('bn');
    else if (profile.language === 'हिन्दी') setLanguage('hi');
    else setLanguage('en');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-6 shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-100">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{copy.intro}</p>

        <form onSubmit={save} className="mt-8 grid gap-5 sm:grid-cols-2">
          <ProfileInput id="farmer-name" label={copy.name} value={profile.name} placeholder={copy.name} disabled={!editing} onChange={(value) => update('name', value)} />
          <ProfileInput id="farmer-village" label={copy.village} value={profile.village} placeholder={copy.village} disabled={!editing} onChange={(value) => update('village', value)} />
          <ProfileInput id="farmer-district" label={copy.district} value={profile.district} placeholder={copy.district} disabled={!editing} onChange={(value) => update('district', value)} />
          <ProfileInput id="farmer-phone" label={copy.phone} type="tel" value={profile.phone} placeholder={copy.phone} disabled={!editing} onChange={(value) => update('phone', value)} />
          <label htmlFor="farmer-language" className="block text-sm font-semibold text-slate-200 sm:col-span-2">{copy.language}
            <select id="farmer-language" value={profile.language} disabled={!editing} onChange={(event) => update('language', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-70">
              <option>English</option><option>বাংলা</option><option>हिन्दी</option>
            </select>
          </label>
          {editing ? <div className="flex gap-3 sm:col-span-2"><button type="submit" className="flex-1 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">{copy.save}</button><button type="button" onClick={() => { setProfile(savedProfile); setEditing(false); }} className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-800">{copy.cancel}</button></div> : <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-emerald-600 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-950 sm:col-span-2">{copy.edit}</button>}
        </form>
        {saved && <p className="mt-4 rounded-lg border border-emerald-700 bg-emerald-950/70 p-3 text-sm text-emerald-200" role="status">{copy.saved}</p>}
      </div>
      <div className="mt-6">
        <CropStorage />
      </div>
    </div>
  );
}

function ProfileInput({ id, label, value, onChange, type = 'text', placeholder, disabled }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-slate-200">{label}<input id={id} type={type} value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-70" /></label>;
}
