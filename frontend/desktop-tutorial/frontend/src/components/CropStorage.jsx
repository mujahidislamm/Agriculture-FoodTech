import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const CROPS = ['Rice', 'Potato', 'Jute', 'Mustard', 'Tea', 'Tomato', 'Brinjal', 'Chilli', 'Mango', 'Wheat', 'Maize'];
const STORAGE_KEY = 'fasal-sathi-farm-crops';
const emptyRecord = { crop: 'Tomato', acres: '2', planted: '', harvest: '', storage: 'Ventilated room', notes: '' };

export default function CropStorage() {
  const { language } = useLanguage();
  const copy = { en: { eyebrow: 'Farm records', title: 'My Crops & Storage', saved: 'Saved on this device', crop: 'Crop', acres: 'Land (acres)', planted: 'Planting date', harvest: 'Expected harvest date', method: 'Storage method', notes: 'Notes', placeholder: 'Seed variety, batch, or problem', save: '+ Save crop record', empty: 'Add crops you are growing to remember harvest and storage plans.', store: 'Store in', remove: 'Remove' }, bn: { eyebrow: 'খামারের রেকর্ড', title: 'আমার ফসল ও সংরক্ষণ', saved: 'এই ডিভাইসে সংরক্ষিত', crop: 'ফসল', acres: 'জমি (একর)', planted: 'রোপণের তারিখ', harvest: 'সম্ভাব্য কাটার তারিখ', method: 'সংরক্ষণের পদ্ধতি', notes: 'নোট', placeholder: 'বীজের জাত, ব্যাচ বা সমস্যা', save: '+ ফসলের রেকর্ড সংরক্ষণ', empty: 'আপনার চাষ করা ফসল যোগ করুন, যাতে কাটার ও সংরক্ষণের পরিকল্পনা মনে থাকে।', store: 'সংরক্ষণ', remove: 'মুছে ফেলুন' }, hi: { eyebrow: 'खेत के रिकॉर्ड', title: 'मेरी फसल और भंडारण', saved: 'इस डिवाइस पर सुरक्षित', crop: 'फसल', acres: 'जमीन (एकड़)', planted: 'बुवाई की तारीख', harvest: 'अनुमानित कटाई तारीख', method: 'भंडारण तरीका', notes: 'नोट्स', placeholder: 'बीज की किस्म, बैच या समस्या', save: '+ फसल रिकॉर्ड सहेजें', empty: 'अपनी उगाई फसलें जोड़ें ताकि कटाई और भंडारण की योजना याद रहे।', store: 'भंडारण', remove: 'हटाएँ' } }[language] || {};
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [form, setForm] = useState(emptyRecord);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const save = (event) => {
    event.preventDefault();
    if (!form.crop || Number(form.acres) <= 0) return;
    const next = [{ ...form, id: Date.now(), acres: Number(form.acres) }, ...records];
    setRecords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setForm((current) => ({ ...emptyRecord, crop: current.crop, acres: current.acres }));
  };
  const remove = (id) => {
    const next = records.filter((record) => record.id !== id);
    setRecords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-md sm:p-8" aria-labelledby="crop-storage-title">
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{copy.eyebrow}</p><h2 id="crop-storage-title" className="mt-2 text-2xl font-bold text-slate-100">{copy.title}</h2></div>
      <p className="text-xs text-slate-400">{copy.saved}</p>
    </div>
    <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
      <StorageSelect id="storage-crop" label={copy.crop} value={form.crop} options={CROPS} onChange={(value) => update('crop', value)} />
      <StorageInput id="storage-acres" label={copy.acres} type="number" min="0.1" step="0.1" value={form.acres} onChange={(value) => update('acres', value)} />
      <StorageInput id="storage-planted" label={copy.planted} type="date" value={form.planted} onChange={(value) => update('planted', value)} />
      <StorageInput id="storage-harvest" label={copy.harvest} type="date" value={form.harvest} onChange={(value) => update('harvest', value)} />
      <StorageSelect id="storage-method" label={copy.method} value={form.storage} options={['Ventilated room', 'Cold storage', 'Warehouse', 'Jute sacks', 'Sell immediately']} onChange={(value) => update('storage', value)} />
      <StorageInput id="storage-notes" label={copy.notes} value={form.notes} placeholder={copy.placeholder} onChange={(value) => update('notes', value)} />
      <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 sm:col-span-2">{copy.save}</button>
    </form>
    <div className="mt-6 space-y-3">
      {records.length === 0 ? <p className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">{copy.empty}</p> : records.map((record) => <div key={record.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4 sm:flex-row sm:items-center"><div><p className="font-bold text-slate-100">{record.crop} · {record.acres} acres</p><p className="mt-1 text-xs text-slate-400">{copy.store}: {record.storage}{record.harvest ? ` · ${copy.harvest}: ${record.harvest}` : ''}</p>{record.notes && <p className="mt-1 text-xs text-slate-300">{record.notes}</p>}</div><button type="button" onClick={() => remove(record.id)} className="self-start rounded-md border border-red-800 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950 sm:self-auto">{copy.remove}</button></div>)}
    </div>
  </section>;
}

function StorageInput({ id, label, value, onChange, type = 'text', ...props }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-slate-200">{label}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30" {...props} /></label>;
}

function StorageSelect({ id, label, value, options, onChange }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-slate-200">{label}<select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
