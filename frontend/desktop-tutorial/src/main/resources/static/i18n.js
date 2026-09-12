/* ── FasalSathi i18n — Bengali / Hindi / English ──────────────────── */

const I18N = {
  // ── App chrome ────────────────────────────────────────────────────
  appTitle:           { en: 'FasalSathi',                          bn: 'ফসলসাথী',                           hi: 'फसलसाथी' },
  tagline:            { en: 'Your Crop Health Companion',          bn: 'আপনার ফসল স্বাস্থ্য সহচর',             hi: 'आपका फसल स्वास्थ्य साथी' },
  offlineMode:        { en: '⚡ Offline Mode',                     bn: '⚡ অফলাইন মোড',                       hi: '⚡ ऑफलाइन मोड' },
  onlineMode:         { en: '🌐 Online',                           bn: '🌐 অনলাইন',                           hi: '🌐 ऑनलाइन' },

  // ── Form labels ──────────────────────────────────────────────────
  enterDetails:       { en: 'Enter crop details',                  bn: 'ফসলের তথ্য দিন',                     hi: 'फसल विवरण दर्ज करें' },
  newScan:            { en: 'New',                                  bn: 'নতুন',                                hi: 'नया' },
  takePhoto:          { en: '📷 Take Photo',                       bn: '📷 ছবি তুলুন',                         hi: '📷 फोटो लें' },
  chooseGallery:      { en: '🖼 Choose from Gallery',              bn: '🖼 গ্যালারি থেকে বাছুন',               hi: '🖼 गैलरी से चुनें' },
  selectDistrict:     { en: 'Select your district',                bn: 'আপনার জেলা নির্বাচন করুন',             hi: 'अपना जिला चुनें' },
  selectCrop:         { en: 'Select your crop',                    bn: 'আপনার ফসল নির্বাচন করুন',              hi: 'अपनी फसल चुनें' },
  selectStage:        { en: 'Crop stage',                          bn: 'ফসলের পর্যায়',                        hi: 'फसल का चरण' },
  observations:       { en: 'Describe what you see (optional)',    bn: 'আপনি কী দেখছেন বর্ণনা করুন (ঐচ্ছিক)', hi: 'आप क्या देख रहे हैं बताएं (वैकल्पिक)' },
  speakNow:           { en: '🎤 Speak',                            bn: '🎤 বলুন',                              hi: '🎤 बोलें' },
  stopSpeaking:       { en: '⏹ Stop',                              bn: '⏹ বন্ধ করুন',                          hi: '⏹ रुकें' },
  analyze:            { en: '🔍 Analyze Crop',                     bn: '🔍 ফসল বিশ্লেষণ',                     hi: '🔍 फसल विश्लेषण' },
  analyzing:          { en: '⏳ Analyzing...',                      bn: '⏳ বিশ্লেষণ হচ্ছে...',                 hi: '⏳ विश्लेषण हो रहा है...' },
  queued:             { en: '📥 Queued for sync',                  bn: '📥 সিঙ্কের জন্য সারিবদ্ধ',            hi: '📥 सिंक के लिए कतार में' },

  // ── Results ──────────────────────────────────────────────────────
  resultTitle:        { en: 'Diagnosis Result',                    bn: 'রোগ নির্ণয়ের ফলাফল',                 hi: 'निदान परिणाम' },
  definiteDiag:       { en: '✅ Confirmed Detection',              bn: '✅ নিশ্চিত শনাক্তকরণ',                hi: '✅ निश्चित पहचान' },
  advisorySupport:    { en: '🔶 Advisory Support',                 bn: '🔶 পরামর্শমূলক সহায়তা',               hi: '🔶 सलाहकार सहायता' },
  confidence:         { en: 'Confidence',                          bn: 'আত্মবিশ্বাস',                         hi: 'विश्वास' },
  explanation:        { en: 'Explanation',                         bn: 'ব্যাখ্যা',                             hi: 'व्याख्या' },
  nextSteps:          { en: 'Next Steps',                          bn: 'পরবর্তী পদক্ষেপ',                     hi: 'अगले कदम' },
  safetyWarnings:     { en: '⚠ Safety Warnings',                  bn: '⚠ সুরক্ষা সতর্কতা',                    hi: '⚠ सुरक्षा चेतावनी' },
  weatherImpact:      { en: '🌦 Weather Impact',                   bn: '🌦 আবহাওয়ার প্রভাব',                  hi: '🌦 मौसम का प्रभाव' },
  cropStageInfo:      { en: '🌱 Crop Stage Info',                  bn: '🌱 ফসলের পর্যায়ের তথ্য',              hi: '🌱 फसल चरण जानकारी' },
  alternativeCauses:  { en: 'Possible Alternative Causes',         bn: 'সম্ভাব্য বিকল্প কারণ',                hi: 'संभावित वैकल्पिक कारण' },
  expertEscalation:   { en: '🆘 Expert Consultation',              bn: '🆘 বিশেষজ্ঞ পরামর্শ',                 hi: '🆘 विशेषज्ञ परामर्श' },
  districtInfo:       { en: '📍 Location Context',                 bn: '📍 অবস্থানের প্রসঙ্গ',                hi: '📍 स्थान संदर्भ' },
  callExpert:         { en: '📞 Call KVK Expert',                  bn: '📞 KVK বিশেষজ্ঞকে কল করুন',          hi: '📞 KVK विशेषज्ञ को कॉल करें' },
  kisanHelpline:      { en: '📞 Kisan Helpline: 1800-180-1551',   bn: '📞 কিষাণ হেল্পলাইন: ১৮০০-১৮০-১৫৫১',  hi: '📞 किसान हेल्पलाइन: 1800-180-1551' },

  // ── Crop stages ──────────────────────────────────────────────────
  seedling:           { en: 'Seedling',          bn: 'চারা',            hi: 'पौधा' },
  vegetative:         { en: 'Vegetative',        bn: 'বৃদ্ধি পর্যায়',    hi: 'वानस्पतिक' },
  flowering:          { en: 'Flowering',         bn: 'ফুল ধরা',          hi: 'फूल आना' },
  fruiting:           { en: 'Fruiting',          bn: 'ফল ধরা',           hi: 'फल लगना' },
  harvest:            { en: 'Harvest',           bn: 'ফসল কাটা',         hi: 'कटाई' },
  tillering:          { en: 'Tillering',         bn: 'কুশি ছাড়া',       hi: 'कल्ले निकलना' },
  'grain-filling':    { en: 'Grain Filling',     bn: 'দানা ভরা',         hi: 'दाना भरना' },
  'tuber-initiation': { en: 'Tuber Initiation',  bn: 'কন্দ তৈরি শুরু',   hi: 'कंद बनना शुरू' },
  'tuber-bulking':    { en: 'Tuber Bulking',     bn: 'কন্দ বৃদ্ধি',      hi: 'कंद बढ़ना' },
  maturation:         { en: 'Maturation',        bn: 'পরিপক্কতা',        hi: 'परिपक्वता' },
  sprouting:          { en: 'Sprouting',         bn: 'অঙ্কুরোদ্গম',      hi: 'अंकुरण' },
  rosette:            { en: 'Rosette',           bn: 'রোজেট',            hi: 'रोजेट' },
  'pod-formation':    { en: 'Pod Formation',     bn: 'ফলি তৈরি',         hi: 'फली बनना' },
  maturity:           { en: 'Maturity',          bn: 'পরিপক্ক',          hi: 'परिपक्व' },
  dormant:            { en: 'Dormant',           bn: 'সুপ্ত',             hi: 'सुप्त' },
  'flush-1':          { en: 'First Flush',       bn: 'প্রথম ফ্লাশ',      hi: 'पहला फ्लश' },
  'flush-2':          { en: 'Second Flush',      bn: 'দ্বিতীয় ফ্লাশ',    hi: 'दूसरा फ्लश' },
  'flush-3':          { en: 'Third Flush',       bn: 'তৃতীয় ফ্লাশ',      hi: 'तीसरा फ्लश' },
  tasseling:          { en: 'Tasseling',         bn: 'তুরি',              hi: 'टैसलिंग' },
  heading:            { en: 'Heading',           bn: 'শীষ আসা',          hi: 'बाली निकलना' },
  'fruit-set':        { en: 'Fruit Set',         bn: 'ফল ধরা',           hi: 'फल लगना' },
  development:        { en: 'Development',       bn: 'বিকাশ',            hi: 'विकास' },
  'fibre-development':{ en: 'Fibre Development', bn: 'আঁশ বিকাশ',        hi: 'रेशा विकास' },

  // ── Misc ─────────────────────────────────────────────────────────
  pendingSync:        { en: 'pending sync',       bn: 'সিঙ্ক হচ্ছে',      hi: 'सिंक होना बाकी' },
  noImageSelected:    { en: 'Please select or take a photo first', bn: 'প্রথমে একটি ছবি তুলুন বা বাছুন', hi: 'पहले फोटो लें या चुनें' },
  syncComplete:       { en: 'Sync complete!',     bn: 'সিঙ্ক সম্পন্ন!',    hi: 'सिंक पूरा!' },
  errorOccurred:      { en: 'An error occurred',  bn: 'একটি ত্রুটি হয়েছে', hi: 'एक त्रुटि हुई' },
  retrying:           { en: 'Retrying...',        bn: 'পুনরায় চেষ্টা...', hi: 'पुनः प्रयास...' },
  imageTooLarge:      { en: 'Image will be compressed for low-bandwidth', bn: 'কম ব্যান্ডউইথের জন্য ছবি সংকুচিত হবে', hi: 'कम बैंडविड्थ के लिए छवि संपीड़ित होगी' },
};

/**
 * Get translated string for key in current language.
 * @param {string} key - Translation key
 * @param {string} lang - Language code (en/bn/hi)
 * @returns {string}
 */
function t(key, lang) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[lang] || entry['en'] || key;
}
