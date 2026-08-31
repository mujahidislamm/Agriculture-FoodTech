package com.example.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Template-based translation service for Bengali (বাংলা) and Hindi (हिंदी).
 * No external API needed — all translations are hardcoded for offline use.
 */
@Service
public class TranslationService {

    // ── Disease name translations ────────────────────────────────────────

    private static final Map<String, Map<String, String>> DISEASE_NAMES = new HashMap<>();

    static {
        put("Early Blight", "আর্লি ব্লাইট (পাতা ঝলসানো)", "अर्ली ब्लाइट (पत्ता झुलसा)");
        put("Late Blight", "লেট ব্লাইট (মড়ক রোগ)", "लेट ब्लाइट (झुलसा रोग)");
        put("Bacterial Spot", "ব্যাকটেরিয়াল স্পট (ছত্রাক দাগ)", "बैक्टीरियल स्पॉट (जीवाणु धब्बा)");
        put("Leaf Mold", "পাতার ছাতা রোগ", "पत्ता फफूंदी");
        put("Septoria Leaf Spot", "সেপ্টোরিয়া পাতার দাগ", "सेप्टोरिया पत्ता धब्बा");
        put("Target Spot", "টার্গেট স্পট", "टार्गेट स्पॉट");
        put("Yellow Leaf Curl Virus", "হলুদ পাতা কোঁকড়ানো ভাইরাস", "पीला पत्ता मोड़क विषाणु");
        put("Tomato Mosaic Virus", "টমেটো মোজাইক ভাইরাস", "टमाटर मोज़ेक वायरस");
        put("Two-Spotted Spider Mite", "দুই দাগ মাকড়সা মাইট", "दो-धब्बा मकड़ी माइट");
        put("Healthy", "সুস্থ", "स्वस्थ");
        put("Gray Leaf Spot", "ধূসর পাতার দাগ", "भूरा पत्ता धब्बा");
        put("Northern Corn Leaf Blight", "উত্তরী ভুট্টা পাতা ঝলসানো", "उत्तरी मक्का पत्ता झुलसा");
        put("Common Rust", "সাধারণ রাস্ট", "सामान्य रतुआ");
        put("Black Rot", "কালো পচন", "काला सड़न");
        put("Apple Scab", "আপেল স্ক্যাব", "एपल स्कैब");
        put("Cedar Apple Rust", "সিডার আপেল রাস্ট", "सीडार एपल रतुआ");
        put("Powdery Mildew", "পাউডারি মিলডিউ (গুঁড়ো ছত্রাক)", "चूर्णिल फफूंदी");
        put("Blast", "ব্লাস্ট রোগ", "ब्लास्ट रोग");
        put("Brown Spot", "বাদামি দাগ রোগ", "भूरा धब्बा रोग");
        put("Sheath Blight", "শীথ ব্লাইট", "शीथ ब्लाइट");
        put("Stem Rot", "কাণ্ড পচন", "तना सड़न");
        put("White Rust", "সাদা রাস্ট", "सफेद रतुआ");
        put("Alternaria Blight", "অলটারনারিয়া ঝলসানো", "अल्टरनेरिया झुलसा");
    }

    private static void put(String en, String bn, String hi) {
        Map<String, String> m = new HashMap<>();
        m.put("bn", bn);
        m.put("hi", hi);
        m.put("en", en);
        DISEASE_NAMES.put(en, m);
    }

    // ── UI and advisory phrase translations ──────────────────────────────

    private static final Map<String, Map<String, String>> PHRASES = new HashMap<>();

    static {
        phrase("DEFINITIVE_DIAGNOSIS", "নিশ্চিত শনাক্তকরণ", "निश्चित पहचान");
        phrase("ADVISORY_SUPPORT", "পরামর্শমূলক সহায়তা", "सलाहकार सहायता");
        phrase("Confidence", "আত্মবিশ্বাস", "विश्वास");
        phrase("Next Steps", "পরবর্তী পদক্ষেপ", "अगले कदम");
        phrase("Safety Warnings", "সুরক্ষা সতর্কতা", "सुरक्षा चेतावनी");
        phrase("Contact Expert", "বিশেষজ্ঞের সাথে যোগাযোগ করুন", "विशेषज्ञ से संपर्क करें");
        phrase("Weather Impact", "আবহাওয়ার প্রভাব", "मौसम का प्रभाव");
        phrase("Crop Stage", "ফসলের পর্যায়", "फसल का चरण");
        phrase("Alternative Causes", "বিকল্প কারণ", "वैकल्पिक कारण");
        phrase("District Info", "জেলা তথ্য", "जिला जानकारी");
        phrase("Organic Treatment", "জৈব চিকিৎসা", "जैविक उपचार");
        phrase("Chemical Treatment", "রাসায়নিক চিকিৎসা", "रासायनिक उपचार");
        phrase("Prevention", "প্রতিরোধ", "रोकथाम");
        phrase("Upload Image", "ছবি আপলোড করুন", "छवि अपलोड करें");
        phrase("Take Photo", "ছবি তুলুন", "फोटो लें");
        phrase("Select District", "জেলা নির্বাচন করুন", "जिला चुनें");
        phrase("Select Crop", "ফসল নির্বাচন করুন", "फसल चुनें");
        phrase("Describe Problem", "সমস্যা বর্ণনা করুন", "समस्या का वर्णन करें");
        phrase("Analyze", "বিশ্লেষণ করুন", "विश्लेषण करें");
        phrase("Offline Mode", "অফলাইন মোড", "ऑफलाइन मोड");
        phrase("Speak Now", "এখন বলুন", "अब बोलें");
        phrase("No disease detected", "কোনো রোগ শনাক্ত হয়নি", "कोई रोग नहीं पाया गया");
        phrase("Expert consultation recommended", "বিশেষজ্ঞ পরামর্শ প্রয়োজন", "विशेषज्ञ परामर्श की सिफारिश");
        phrase("Wear protective equipment", "সুরক্ষা সরঞ্জাম পরুন", "सुरक्षा उपकरण पहनें");
        phrase("Do not spray near harvest", "ফসল কাটার কাছে স্প্রে করবেন না", "कटाई के पास स्प्रे न करें");
        phrase("Wash hands after spraying", "স্প্রে করার পর হাত ধুয়ে নিন", "स्प्रे करने के बाद हाथ धोएं");
        phrase("Pre-harvest interval", "ফসল কাটার আগে অপেক্ষা", "कटाई पूर्व अंतराल");
        phrase("days", "দিন", "दिन");
        phrase("High", "উচ্চ", "उच्च");
        phrase("Medium", "মাঝারি", "मध्यम");
        phrase("Low", "কম", "कम");
        phrase("FasalSathi", "ফসলসাথী", "फसलसाथी");
        phrase("Your crop health companion", "আপনার ফসল স্বাস্থ্য সহচর", "आपका फसल स्वास्थ्य साथी");

        // Crop stages
        phrase("seedling", "চারা", "पौधा");
        phrase("vegetative", "বৃদ্ধি পর্যায়", "वानस्पतिक");
        phrase("flowering", "ফুল ধরা", "फूल आना");
        phrase("fruiting", "ফল ধরা", "फल लगना");
        phrase("harvest", "ফসল কাটা", "कटाई");
        phrase("tillering", "কুশি ছাড়া", "कल्ले निकलना");
        phrase("grain-filling", "দানা ভরা", "दाना भरना");
        phrase("tuber-initiation", "কন্দ তৈরি শুরু", "कंद बनना शुरू");
        phrase("tuber-bulking", "কন্দ বৃদ্ধি", "कंद बढ़ना");
        phrase("maturation", "পরিপক্কতা", "परिपक्वता");

        // Crop names
        phrase("Rice", "ধান", "धान");
        phrase("Potato", "আলু", "आलू");
        phrase("Jute", "পাট", "जूट/पटसन");
        phrase("Mustard", "সরষে", "सरसों");
        phrase("Tea", "চা", "चाय");
        phrase("Tomato", "টমেটো", "टमाटर");
        phrase("Brinjal", "বেগুন", "बैंगन");
        phrase("Chilli", "লঙ্কা", "मिर्च");
        phrase("Mango", "আম", "आम");
        phrase("Wheat", "গম", "गेहूं");
        phrase("Maize", "ভুট্টা", "मक्का");
    }

    private static void phrase(String en, String bn, String hi) {
        Map<String, String> m = new HashMap<>();
        m.put("bn", bn);
        m.put("hi", hi);
        m.put("en", en);
        PHRASES.put(en, m);
    }

    // ── Public API ───────────────────────────────────────────────────────

    /**
     * Translate a disease name to the requested language.
     */
    public String translateDiseaseName(String diseaseName, String lang) {
        if (lang == null || "en".equals(lang)) return diseaseName;
        Map<String, String> t = DISEASE_NAMES.get(diseaseName);
        return t != null ? t.getOrDefault(lang, diseaseName) : diseaseName;
    }

    /**
     * Translate a UI phrase/label to the requested language.
     */
    public String translate(String key, String lang) {
        if (lang == null || "en".equals(lang)) return key;
        Map<String, String> t = PHRASES.get(key);
        return t != null ? t.getOrDefault(lang, key) : key;
    }

    /**
     * Translate a list of action steps — applies template translation for known patterns.
     */
    public List<String> translateActions(List<String> actions, String lang) {
        if (actions == null || lang == null || "en".equals(lang)) return actions;
        return actions.stream()
                .map(action -> translateActionStep(action, lang))
                .toList();
    }

    /**
     * Best-effort translation of an action step sentence.
     * For the hackathon we translate known fragments and prepend a language marker.
     */
    private String translateActionStep(String action, String lang) {
        // Try to translate known sub-phrases
        String result = action;
        for (Map.Entry<String, Map<String, String>> entry : PHRASES.entrySet()) {
            String en = entry.getKey();
            String localized = entry.getValue().getOrDefault(lang, en);
            if (!en.equals(localized) && result.contains(en)) {
                result = result.replace(en, localized);
            }
        }
        // If nothing changed, prefix with a language note
        if (result.equals(action)) {
            if ("bn".equals(lang)) {
                return "🌾 " + action; // Keep English but mark it
            } else if ("hi".equals(lang)) {
                return "🌾 " + action;
            }
        }
        return result;
    }

    /**
     * Returns all UI translation strings for the frontend.
     */
    public Map<String, Map<String, String>> getAllPhrases() {
        return Collections.unmodifiableMap(PHRASES);
    }
}
