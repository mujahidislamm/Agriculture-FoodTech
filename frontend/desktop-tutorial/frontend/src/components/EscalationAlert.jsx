import React from 'react';

export default function EscalationAlert({ show, info }) {
  if (!show || !info) return null;

  // Extremely basic phone number extraction
  const phonePattern = /(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?)?[\d\s-]{7,10}/g;
  const phones = info.match(phonePattern) || [];
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-5 mb-6 shadow-sm">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">🚨</span>
        <h3 className="text-lg font-bold text-red-900">Expert Consultation Recommended</h3>
      </div>
      
      <p className="text-red-800 whitespace-pre-line mb-4 text-sm">
        {info}
      </p>

      {phones.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {phones.map((phone, idx) => {
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            if (cleanPhone.length >= 10) {
              return (
                <a 
                  key={idx} 
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call {phone.trim()}
                </a>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
