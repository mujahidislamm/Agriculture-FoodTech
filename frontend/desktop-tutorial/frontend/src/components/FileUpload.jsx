import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function FileUpload({ onFileSelect, preview, onClear }) {
  const { language } = useLanguage();
  const copy = { en: { preview: 'Crop preview', upload: 'Take a photo or upload', hint: 'Tap to use camera on mobile or drag and drop', label: 'Upload crop leaf image', remove: 'Remove image' }, bn: { preview: 'ফসলের ছবি', upload: 'ছবি তুলুন বা আপলোড করুন', hint: 'মোবাইলে ক্যামেরা ব্যবহার করুন বা ছবি টেনে আনুন', label: 'ফসলের পাতার ছবি আপলোড করুন', remove: 'ছবি মুছে ফেলুন' }, hi: { preview: 'फसल की तस्वीर', upload: 'फोटो लें या अपलोड करें', hint: 'मोबाइल पर कैमरा इस्तेमाल करें या फोटो यहाँ खींचें', label: 'फसल के पत्ते की तस्वीर अपलोड करें', remove: 'तस्वीर हटाएँ' } }[language] || {};
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
    // Allow the same image to be selected again after clearing or a failed upload.
    e.target.value = '';
  };

  const handleClick = () => {
    if (!preview) {
      fileInputRef.current.value = '';
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !preview) {
      event.preventDefault();
      fileInputRef.current.value = '';
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
      />
      
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500 shadow-sm">
          <img src={preview} alt={copy.preview} className="w-full h-auto object-cover max-h-96" />
          <button
            onClick={() => {
              fileInputRef.current.value = '';
              onClear();
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-md"
            aria-label={copy.remove}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors min-h-[250px] flex flex-col items-center justify-center ${
            isDragging ? 'border-emerald-500 bg-emerald-50 drop-zone-active' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={copy.label}
        >
          <div className="bg-emerald-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-1">{copy.upload}</p>
          <p className="text-sm text-gray-500">{copy.hint}</p>
        </div>
      )}
    </div>
  );
}
