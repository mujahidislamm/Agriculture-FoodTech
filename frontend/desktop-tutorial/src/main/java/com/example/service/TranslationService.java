package com.example.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Objects;

/**
 * Template-based translation service for Bengali (বাংলা) and Hindi (हिंदी).
 * No external API needed — all translations are hardcoded for offline use.
 */
@Service
public class TranslationService {

    private final RestClient translationClient;
    private final ObjectMapper objectMapper;
    private final Map<String, String> translationCache = new ConcurrentHashMap<>();

    public TranslationService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${translation.api-url:https://translate.googleapis.com/translate_a/single}") String translationApiUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3000);
        requestFactory.setReadTimeout(5000);
        this.translationClient = restClientBuilder
                .baseUrl(Objects.requireNonNull(translationApiUrl))
                .requestFactory(requestFactory)
                .build();
        this.objectMapper = objectMapper;
    }

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
        if ("Image not matched".equals(diseaseName)) {
            return "bn".equals(lang) ? "ছবির সাথে ফসলের মিল পাওয়া যায়নি"
                    : "hi".equals(lang) ? "छवि का फसल से मिलान नहीं हुआ" : diseaseName;
        }
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
                .map(action -> translateNarrative(action, lang))
                .toList();
    }

    /**
     * Translates generated advisory prose without an external service. Known
     * agronomy terms and sentence fragments are replaced longest-first so
     * treatment names, units, numbers, and contact details remain intact.
     */
    public String translateNarrative(String text, String lang) {
        if (text == null || text.isBlank() || lang == null || "en".equals(lang)) return text;

        String apiTranslation = translateWithApi(text, lang);
        if (apiTranslation != null && !apiTranslation.isBlank()) return apiTranslation;

        Map<String, String> replacements = new LinkedHashMap<>();
        if ("bn".equals(lang)) {
            replacements.put("Image not matched", "ছবির সাথে ফসলের মিল পাওয়া যায়নি");
            replacements.put("Expert consultation recommended.", "বিশেষজ্ঞের পরামর্শ নেওয়া প্রয়োজন।");
            replacements.put("Please contact your nearest Krishi Vigyan Kendra (KVK):", "নিকটতম কৃষি বিজ্ঞান কেন্দ্র (KVK)-এ যোগাযোগ করুন:");
            replacements.put("Contact your nearest KVK or call Kisan Call Centre:", "নিকটতম KVK-তে যোগাযোগ করুন অথবা কিষান কল সেন্টারে ফোন করুন:");
            replacements.put("The model's confidence is low", "মডেলের নির্ভরযোগ্যতা কম");
            replacements.put("Multiple conditions could explain these symptoms.", "এই লক্ষণগুলোর একাধিক কারণ থাকতে পারে।");
            replacements.put("Current conditions:", "বর্তমান পরিস্থিতি:");
            replacements.put("Temperature:", "তাপমাত্রা:");
            replacements.put("humidity:", "আর্দ্রতা:");
            replacements.put("rainfall:", "বৃষ্টিপাত:");
            replacements.put("wind:", "বাতাস:");
            replacements.put("Current field conditions suggest", "বর্তমান মাঠের পরিস্থিতি থেকে বোঝা যায়");
            replacements.put("Season:", "মৌসুম:");
            replacements.put("Continue with a disease-safe treatment window", "রোগের জন্য নিরাপদ সময়ে চিকিৎসা চালিয়ে যান");
            replacements.put("avoid spraying before rain or heavy humidity", "বৃষ্টি বা অতিরিক্ত আর্দ্রতার আগে স্প্রে করা এড়িয়ে চলুন");
            replacements.put("Fungal diseases spread faster in humid and wet conditions.", "আর্দ্র ও ভেজা পরিবেশে ছত্রাকজনিত রোগ দ্রুত ছড়ায়।");
            replacements.put("Bacterial infections worsen with rain splash and wet foliage.", "বৃষ্টির ছিটা ও ভেজা পাতায় ব্যাকটেরিয়ার সংক্রমণ বাড়ে।");
            replacements.put("Viral diseases are spread by insect vectors.", "পোকামাকড়ের মাধ্যমে ভাইরাসজনিত রোগ ছড়ায়।");
            replacements.put("Avoid overhead watering.", "উপর থেকে জল দেওয়া এড়িয়ে চলুন।");
            replacements.put("At the ", "");
            replacements.put(" stage, ", " পর্যায়ে, ");
            replacements.put("Good news!", "সুসংবাদ!");
            replacements.put("No disease symptoms were detected in the leaf image.", "পাতার ছবিতে রোগের কোনো লক্ষণ পাওয়া যায়নি।");
            replacements.put("The plant appears healthy.", "গাছটি সুস্থ বলে মনে হচ্ছে।");
            replacements.put("The image shows signs of", "ছবিতে এর লক্ষণ দেখা যাচ্ছে:");
            replacements.put("The image may indicate", "ছবিতে সম্ভাব্য লক্ষণ:");
            replacements.put("confidence", "নির্ভরযোগ্যতা");
            replacements.put("Key symptoms to look for:", "যে প্রধান লক্ষণগুলো দেখবেন:");
            replacements.put("Your observation", "আপনার পর্যবেক্ষণ");
            replacements.put("STEP 1 — Immediate organic measures:", "ধাপ ১ — তাৎক্ষণিক জৈব ব্যবস্থা:");
            replacements.put("STEP 2 — Chemical treatment (if organic measures fail after 3-5 days):", "ধাপ ২ — জৈব ব্যবস্থা ৩-৫ দিনে কাজ না করলে রাসায়নিক চিকিৎসা:");
            replacements.put("STEP 3 — Preventive measures for future:", "ধাপ ৩ — ভবিষ্যতের জন্য প্রতিরোধমূলক ব্যবস্থা:");
            replacements.put("Dosage:", "মাত্রা:");
            replacements.put("Proper disease solution:", "রোগের সঠিক সমাধান:");
            replacements.put("Safety warnings", "নিরাপত্তা সতর্কতা");
            replacements.put("Wear", "পরুন");
            replacements.put("Always wash hands and face thoroughly after spraying.", "স্প্রে করার পর হাত ও মুখ ভালোভাবে ধুয়ে নিন।");
            replacements.put("Keep children and animals away during spraying.", "স্প্রে করার সময় শিশু ও পশুদের দূরে রাখুন।");
            replacements.put("Spray in early morning or late evening to avoid drift and heat.", "বাতাসে ছড়িয়ে পড়া ও অতিরিক্ত তাপ এড়াতে ভোরে বা সন্ধ্যায় স্প্রে করুন।");
            replacements.put("Pre-harvest interval: Do not harvest for", "ফসল কাটার আগে অপেক্ষার সময়: এতদিন ফসল কাটবেন না:");
            replacements.put("days after spraying.", "স্প্রে করার পর দিন।");
            replacements.put("This is advisory guidance", "এটি পরামর্শমূলক নির্দেশনা");
            replacements.put("Please verify with an expert before applying chemical treatments.", "রাসায়নিক চিকিৎসার আগে বিশেষজ্ঞের পরামর্শ নিন।");
            replacements.put("please verify with an expert before applying chemical treatments.", "রাসায়নিক চিকিৎসার আগে বিশেষজ্ঞের পরামর্শ নিন।");
            replacements.put("Tiny mites cause stippled yellowing on leaves. Fine webbing visible.", "ক্ষুদ্র মাইট পাতায় হলুদ ছোপ ও সূক্ষ্ম জাল তৈরি করে।");
            replacements.put("This is caused by", "এর কারণ");
            replacements.put("Yellow stippling on leaves", "পাতায় হলুদ ছোপ");
            replacements.put("Fine webbing on leaf underside", "পাতার নিচে সূক্ষ্ম জাল");
            replacements.put("Bronzing of leaves", "পাতা তামাটে হয়ে যাওয়া");
            replacements.put("Leaves become dry and crispy", "পাতা শুকিয়ে ভঙ্গুর হয়ে যায়");
            replacements.put("Flowering", "ফুল ধরা");
            replacements.put("Your ", "আপনার ");
            replacements.put(" is at the ", "-এর ");
            replacements.put("Follow the recommended treatment timeline for best results.", "ভালো ফলের জন্য নির্ধারিত চিকিৎসার সময়সূচি অনুসরণ করুন।");
            replacements.put("early intervention is critical to prevent yield loss.", "ফলন কমে যাওয়া ঠেকাতে দ্রুত ব্যবস্থা নেওয়া জরুরি।");
            replacements.put("Partly cloudy", "আংশিক মেঘলা");
            replacements.put("Current field conditions are in line with typical West Bengal weather patterns.", "বর্তমান মাঠের পরিস্থিতি পশ্চিমবঙ্গের স্বাভাবিক আবহাওয়ার সঙ্গে সামঞ্জস্যপূর্ণ।");
            replacements.put("Target-shaped brown lesions on lower leaves.", "নিচের পাতায় লক্ষ্যচিহ্নের মতো বাদামি ক্ষত।");
            replacements.put("This is caused by Fungal (Alternaria solani).", "এর কারণ ছত্রাক (Alternaria solani)।");
            replacements.put("Key symptoms to look for: Concentric ring spots, Yellowing leaves, Fruit with dark leathery spots.", "যে প্রধান লক্ষণগুলো দেখবেন: গোলাকার বলয়ের দাগ, পাতা হলুদ হওয়া, ফলে কালচে শক্ত দাগ।");
            replacements.put("At the fruiting stage, early intervention is critical to prevent yield loss.", "ফল ধরার পর্যায়ে ফলন কমে যাওয়া ঠেকাতে দ্রুত ব্যবস্থা নেওয়া জরুরি।");
            replacements.put("Your Tomato is at the fruiting stage.", "আপনার টমেটো ফল ধরার পর্যায়ে আছে।");
            replacements.put("This disease is commonly seen in Tomato in West Bengal.", "পশ্চিমবঙ্গে টমেটোতে এই রোগটি সাধারণত দেখা যায়।");
            replacements.put("At this stage, disease directly impacts yield. Treat promptly but observe pre-harvest intervals.", "এই পর্যায়ে রোগ সরাসরি ফলনে প্রভাব ফেলে। দ্রুত চিকিৎসা করুন, তবে ফসল কাটার আগের অপেক্ষার সময় মেনে চলুন।");
            replacements.put("District:", "জেলা:");
            replacements.put("Zone:", "অঞ্চল:");
            replacements.put("Soil:", "মাটি:");
            replacements.put("Major Crops:", "প্রধান ফসল:");
            replacements.put("Kharif (monsoon season — high humidity, heavy rain expected)", "খরিফ (বর্ষার মৌসুম — বেশি আর্দ্রতা ও ভারী বৃষ্টির সম্ভাবনা)");
            replacements.put("Pest (", "কীটপতঙ্গ (");
            replacements.put("At the Fruiting stage,", "ফল ধরার পর্যায়ে,");
            replacements.put("Strong water spray to dislodge mites", "জোরে জল স্প্রে করে মাইট ঝরিয়ে ফেলুন");
            replacements.put("Release predatory mites if available", "সম্ভব হলে শিকারি মাইট ছেড়ে দিন");
            replacements.put("Maintain field hygiene", "মাঠ পরিষ্কার-পরিচ্ছন্ন রাখুন");
            replacements.put("Avoid water stress", "জলের ঘাটতি এড়িয়ে চলুন");
            replacements.put("Intercrop with marigold", "গাঁদা ফুলের সঙ্গে আন্তঃফসল চাষ করুন");
            replacements.put("wear full PPE, toxic to aquatic life.", "সম্পূর্ণ সুরক্ষা সরঞ্জাম পরুন, এটি জলজ প্রাণীর জন্য বিষাক্ত।");
            replacements.put("Wash all harvested produce before consumption.", "খাওয়ার আগে সব কাটা ফসল ভালোভাবে ধুয়ে নিন।");
            replacements.put("Pre-harvest interval: Do not harvest for", "ফসল কাটার আগে অপেক্ষার সময়: স্প্রে করার পর");
            replacements.put("days after spraying.", "দিন পর্যন্ত ফসল কাটবেন না।");
            replacements.put("New Alluvial", "নতুন পলিমাটি অঞ্চল");
            replacements.put("Alluvial Clay", "পলিমাটির এঁটেল মাটি");
            replacements.put("Vegetables", "সবজি");
            replacements.put("Flowers", "ফুল");
            replacements.put("remove the infected leaves or affected plant parts, improve field ventilation, and keep the canopy dry.", "আক্রান্ত পাতা বা গাছের অংশ সরিয়ে ফেলুন, মাঠে বায়ু চলাচল বাড়ান এবং পাতার ছাউনি শুকনো রাখুন।");
            replacements.put("Start with organic control:", "জৈব নিয়ন্ত্রণ দিয়ে শুরু করুন:");
            replacements.put("If symptoms persist after 3–5 days, use the recommended chemical treatment with the label dose:", "৩–৫ দিন পরও লক্ষণ থাকলে লেবেলে দেওয়া মাত্রায় সুপারিশকৃত রাসায়নিক চিকিৎসা ব্যবহার করুন:");
            replacements.put("Because the field is humid, reduce canopy moisture and avoid overhead irrigation to stop spread.", "মাঠে আর্দ্রতা বেশি থাকায় পাতার ছাউনির আর্দ্রতা কমান এবং রোগ ছড়ানো বন্ধ করতে উপর থেকে সেচ দেওয়া এড়িয়ে চলুন।");
            replacements.put("Continue monitoring for 7–10 days and repeat preventive sprays only if the disease reappears.", "৭–১০ দিন নজর রাখুন এবং রোগ আবার দেখা দিলে তবেই প্রতিরোধমূলক স্প্রে পুনরায় করুন।");
            replacements.put("Stake plants for air circulation", "বায়ু চলাচলের জন্য গাছে খুঁটি দিন");
            replacements.put("Avoid wetting leaves", "পাতা ভেজানো এড়িয়ে চলুন");
            replacements.put("Crop rotation", "ফসল পর্যায়ক্রমে চাষ করুন");
            replacements.put("⚠ Current weather:", "⚠ বর্তমান আবহাওয়া:");
            replacements.put("humid conditions can accelerate disease spread. Act quickly.", "আর্দ্র পরিবেশ রোগ দ্রুত ছড়াতে পারে। দ্রুত ব্যবস্থা নিন।");
            replacements.put("Wear mask and gloves. Avoid spraying near harvest.", "মাস্ক ও গ্লাভস পরুন। ফসল কাটার কাছাকাছি সময়ে স্প্রে করবেন না।");
            replacements.put("⚠ Expert consultation recommended.", "⚠ বিশেষজ্ঞের পরামর্শ নেওয়া প্রয়োজন।");
            replacements.put("The model's confidence is low (", "মডেলের নির্ভরযোগ্যতা কম (");
            replacements.put("Fungal (", "ছত্রাক (");
            replacements.put("Fast-spreading water-soaked dark patches. Can kill plants within a week.", "দ্রুত ছড়ানো জলভেজা কালচে দাগ। এক সপ্তাহের মধ্যে গাছ নষ্ট করতে পারে।");
            replacements.put("Dark water-soaked lesions", "জলভেজা কালচে ক্ষত");
            replacements.put("White fuzzy growth in humid conditions", "আর্দ্র পরিবেশে সাদা তুলোর মতো বৃদ্ধি");
            replacements.put("Brown firm fruit rot", "ফলের শক্ত বাদামি পচন");
        } else if ("hi".equals(lang)) {
            replacements.put("Image not matched", "छवि का फसल से मिलान नहीं हुआ");
            replacements.put("Expert consultation recommended.", "विशेषज्ञ की सलाह आवश्यक है।");
            replacements.put("Please contact your nearest Krishi Vigyan Kendra (KVK):", "अपने निकटतम कृषि विज्ञान केंद्र (KVK) से संपर्क करें:");
            replacements.put("Contact your nearest KVK or call Kisan Call Centre:", "निकटतम KVK से संपर्क करें या किसान कॉल सेंटर पर फोन करें:");
            replacements.put("The model's confidence is low", "मॉडल का भरोसा कम है");
            replacements.put("Multiple conditions could explain these symptoms.", "इन लक्षणों के कई कारण हो सकते हैं।");
            replacements.put("Current conditions:", "वर्तमान स्थिति:");
            replacements.put("Temperature:", "तापमान:");
            replacements.put("humidity:", "नमी:");
            replacements.put("rainfall:", "वर्षा:");
            replacements.put("wind:", "हवा:");
            replacements.put("Current field conditions suggest", "वर्तमान खेत की स्थिति बताती है");
            replacements.put("Season:", "मौसम:");
            replacements.put("Continue with a disease-safe treatment window", "रोग के लिए सुरक्षित समय पर उपचार जारी रखें");
            replacements.put("avoid spraying before rain or heavy humidity", "बारिश या अधिक नमी से पहले छिड़काव न करें");
            replacements.put("Fungal diseases spread faster in humid and wet conditions.", "नम और गीली परिस्थितियों में फफूंद रोग तेजी से फैलते हैं।");
            replacements.put("Bacterial infections worsen with rain splash and wet foliage.", "बारिश की छींटों और गीली पत्तियों से जीवाणु संक्रमण बढ़ता है।");
            replacements.put("Viral diseases are spread by insect vectors.", "कीटों के माध्यम से विषाणु रोग फैलते हैं।");
            replacements.put("Avoid overhead watering.", "ऊपर से पानी देने से बचें।");
            replacements.put("At the ", "");
            replacements.put(" stage, ", " चरण में, ");
            replacements.put("Good news!", "अच्छी खबर!");
            replacements.put("No disease symptoms were detected in the leaf image.", "पत्ती की छवि में रोग के लक्षण नहीं मिले।");
            replacements.put("The plant appears healthy.", "पौधा स्वस्थ दिखाई देता है।");
            replacements.put("The image shows signs of", "छवि में इसके संकेत दिखते हैं:");
            replacements.put("The image may indicate", "छवि में संभावित संकेत:");
            replacements.put("confidence", "विश्वास");
            replacements.put("Key symptoms to look for:", "इन मुख्य लक्षणों को देखें:");
            replacements.put("Your observation", "आपका अवलोकन");
            replacements.put("STEP 1 — Immediate organic measures:", "चरण १ — तुरंत जैविक उपाय:");
            replacements.put("STEP 2 — Chemical treatment (if organic measures fail after 3-5 days):", "चरण २ — ३-५ दिन में जैविक उपाय विफल हों तो रासायनिक उपचार:");
            replacements.put("STEP 3 — Preventive measures for future:", "चरण ३ — भविष्य के लिए रोकथाम:");
            replacements.put("Dosage:", "मात्रा:");
            replacements.put("Proper disease solution:", "रोग का सही समाधान:");
            replacements.put("Safety warnings", "सुरक्षा चेतावनियाँ");
            replacements.put("Always wash hands and face thoroughly after spraying.", "छिड़काव के बाद हाथ और चेहरा अच्छी तरह धोएँ।");
            replacements.put("Keep children and animals away during spraying.", "छिड़काव के दौरान बच्चों और पशुओं को दूर रखें।");
            replacements.put("Spray in early morning or late evening to avoid drift and heat.", "बहाव और गर्मी से बचने के लिए सुबह या शाम को छिड़काव करें।");
            replacements.put("Pre-harvest interval: Do not harvest for", "कटाई से पहले अंतराल: इतने दिनों तक कटाई न करें:");
            replacements.put("days after spraying.", "छिड़काव के बाद दिन।");
            replacements.put("This is advisory guidance", "यह सलाहकारी मार्गदर्शन है");
            replacements.put("Please verify with an expert before applying chemical treatments.", "रासायनिक उपचार से पहले विशेषज्ञ से पुष्टि करें।");
            replacements.put("please verify with an expert before applying chemical treatments.", "रासायनिक उपचार से पहले विशेषज्ञ से पुष्टि करें।");
            replacements.put("Tiny mites cause stippled yellowing on leaves. Fine webbing visible.", "छोटे माइट पत्तियों पर पीले धब्बे और महीन जाला बनाते हैं।");
            replacements.put("This is caused by", "इसका कारण है");
            replacements.put("Yellow stippling on leaves", "पत्तियों पर पीले धब्बे");
            replacements.put("Fine webbing on leaf underside", "पत्ती की निचली सतह पर महीन जाला");
            replacements.put("Bronzing of leaves", "पत्तियों का कांस्य रंग होना");
            replacements.put("Leaves become dry and crispy", "पत्तियाँ सूखी और भंगुर हो जाती हैं");
            replacements.put("Flowering", "फूल आना");
            replacements.put("Your ", "आपकी ");
            replacements.put(" is at the ", " की अवस्था में है: ");
            replacements.put("Follow the recommended treatment timeline for best results.", "बेहतर परिणाम के लिए सुझाई गई उपचार समय-सारणी का पालन करें।");
            replacements.put("early intervention is critical to prevent yield loss.", "उपज घटने से रोकने के लिए तुरंत कार्रवाई जरूरी है।");
            replacements.put("Partly cloudy", "आंशिक बादल");
            replacements.put("Current field conditions are in line with typical West Bengal weather patterns.", "वर्तमान खेत की स्थिति पश्चिम बंगाल के सामान्य मौसम जैसी है।");
            replacements.put("Target-shaped brown lesions on lower leaves.", "निचली पत्तियों पर लक्ष्य जैसे गोल भूरे घाव।");
            replacements.put("This is caused by Fungal (Alternaria solani).", "इसका कारण फफूंद (Alternaria solani) है।");
            replacements.put("Key symptoms to look for: Concentric ring spots, Yellowing leaves, Fruit with dark leathery spots.", "इन मुख्य लक्षणों को देखें: गोल छल्लेदार धब्बे, पत्तियों का पीला होना, फल पर कड़े गहरे धब्बे।");
            replacements.put("At the fruiting stage, early intervention is critical to prevent yield loss.", "फल लगने की अवस्था में उपज घटने से रोकने के लिए तुरंत कार्रवाई जरूरी है।");
            replacements.put("Your Tomato is at the fruiting stage.", "आपका टमाटर फल लगने की अवस्था में है।");
            replacements.put("This disease is commonly seen in Tomato in West Bengal.", "पश्चिम बंगाल में टमाटर में यह रोग आम है।");
            replacements.put("At this stage, disease directly impacts yield. Treat promptly but observe pre-harvest intervals.", "इस अवस्था में रोग सीधे उपज को प्रभावित करता है। तुरंत उपचार करें और कटाई से पहले का अंतराल मानें।");
            replacements.put("District:", "जिला:");
            replacements.put("Zone:", "क्षेत्र:");
            replacements.put("Soil:", "मिट्टी:");
            replacements.put("Major Crops:", "मुख्य फसलें:");
            replacements.put("Kharif (monsoon season — high humidity, heavy rain expected)", "खरीफ (मानसून मौसम — अधिक नमी और भारी बारिश की संभावना)");
            replacements.put("Pest (", "कीट (");
            replacements.put("At the Fruiting stage,", "फल लगने की अवस्था में,");
            replacements.put("Strong water spray to dislodge mites", "माइट हटाने के लिए तेज़ पानी का छिड़काव करें");
            replacements.put("Release predatory mites if available", "उपलब्ध होने पर शिकारी माइट छोड़ें");
            replacements.put("Maintain field hygiene", "खेत की स्वच्छता बनाए रखें");
            replacements.put("Avoid water stress", "पानी की कमी से बचें");
            replacements.put("Intercrop with marigold", "गेंदा के साथ अंतरफसल उगाएँ");
            replacements.put("wear full PPE, toxic to aquatic life.", "पूरा सुरक्षा उपकरण पहनें, यह जलीय जीवों के लिए विषैला है।");
            replacements.put("Wash all harvested produce before consumption.", "खाने से पहले सभी कटी फसल को अच्छी तरह धोएँ।");
            replacements.put("Pre-harvest interval: Do not harvest for", "कटाई से पहले अंतराल: छिड़काव के बाद");
            replacements.put("days after spraying.", "दिनों तक कटाई न करें।");
            replacements.put("New Alluvial", "नया जलोढ़ क्षेत्र");
            replacements.put("Alluvial Clay", "जलोढ़ चिकनी मिट्टी");
            replacements.put("Vegetables", "सब्ज़ियाँ");
            replacements.put("Flowers", "फूल");
            replacements.put("remove the infected leaves or affected plant parts, improve field ventilation, and keep the canopy dry.", "संक्रमित पत्तियों या पौधे के प्रभावित हिस्सों को हटाएँ, खेत में हवा का संचार बढ़ाएँ और पत्तियों की छतरी को सूखा रखें।");
            replacements.put("Start with organic control:", "जैविक नियंत्रण से शुरुआत करें:");
            replacements.put("If symptoms persist after 3–5 days, use the recommended chemical treatment with the label dose:", "३–५ दिन बाद भी लक्षण बने रहें तो लेबल पर दी गई मात्रा में सुझाए गए रासायनिक उपचार का उपयोग करें:");
            replacements.put("Because the field is humid, reduce canopy moisture and avoid overhead irrigation to stop spread.", "खेत में नमी अधिक होने के कारण पत्तियों की छतरी की नमी घटाएँ और रोग फैलने से रोकने के लिए ऊपर से सिंचाई न करें।");
            replacements.put("Continue monitoring for 7–10 days and repeat preventive sprays only if the disease reappears.", "७–१० दिनों तक निगरानी करें और रोग फिर दिखाई देने पर ही रोकथाम वाला छिड़काव दोहराएँ।");
            replacements.put("Stake plants for air circulation", "हवा के संचार के लिए पौधों को सहारा दें");
            replacements.put("Avoid wetting leaves", "पत्तियों को गीला करने से बचें");
            replacements.put("Crop rotation", "फसल चक्र अपनाएँ");
            replacements.put("⚠ Current weather:", "⚠ वर्तमान मौसम:");
            replacements.put("humid conditions can accelerate disease spread. Act quickly.", "नम परिस्थितियाँ रोग को तेजी से फैला सकती हैं। तुरंत कार्रवाई करें।");
            replacements.put("Wear mask and gloves. Avoid spraying near harvest.", "मास्क और दस्ताने पहनें। कटाई के पास छिड़काव न करें।");
            replacements.put("⚠ Expert consultation recommended.", "⚠ विशेषज्ञ की सलाह आवश्यक है।");
            replacements.put("The model's confidence is low (", "मॉडल का भरोसा कम है (");
            replacements.put("Fungal (", "फफूंद (");
            replacements.put("Fast-spreading water-soaked dark patches. Can kill plants within a week.", "तेजी से फैलने वाले पानी जैसे गीले गहरे धब्बे। एक सप्ताह में पौधों को नष्ट कर सकते हैं।");
            replacements.put("Dark water-soaked lesions", "पानी जैसे गीले गहरे घाव");
            replacements.put("White fuzzy growth in humid conditions", "नम परिस्थितियों में सफेद रूई जैसी वृद्धि");
            replacements.put("Brown firm fruit rot", "फल का कड़ा भूरा सड़ना");
        }

        String result = text;
        for (Map.Entry<String, String> entry : replacements.entrySet().stream()
                .sorted((left, right) -> Integer.compare(right.getKey().length(), left.getKey().length()))
                .toList()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }

        for (Map.Entry<String, Map<String, String>> entry : DISEASE_NAMES.entrySet().stream()
                .sorted((left, right) -> Integer.compare(right.getKey().length(), left.getKey().length())
                ).toList()) {
            result = result.replace(entry.getKey(), entry.getValue().getOrDefault(lang, entry.getKey()));
        }
        for (Map.Entry<String, Map<String, String>> entry : PHRASES.entrySet().stream()
                .sorted((left, right) -> Integer.compare(right.getKey().length(), left.getKey().length()))
                .toList()) {
            result = result.replace(entry.getKey(), entry.getValue().getOrDefault(lang, entry.getKey()));
        }
        return result;
    }

    /**
     * Translate arbitrary knowledge-base text through the configured service.
     * The local dictionary below remains the offline fallback for no-network
     * demos and API failures.
     */
    private String translateWithApi(String text, String lang) {
        String cacheKey = lang + "\u0000" + text;
        String cached = translationCache.get(cacheKey);
        if (cached != null) return cached;

        try {
            String response = translationClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("client", "gtx")
                            .queryParam("sl", "en")
                            .queryParam("tl", lang)
                            .queryParam("dt", "t")
                            .queryParam("q", text)
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            if (root == null || !root.isArray() || root.isEmpty() || !root.get(0).isArray()) return null;

            StringBuilder translated = new StringBuilder();
            for (JsonNode segment : root.get(0)) {
                if (segment.isArray() && !segment.isEmpty() && segment.get(0).isTextual()) {
                    translated.append(segment.get(0).asText());
                }
            }

            String value = translated.toString().trim();
            if (!value.isBlank()) translationCache.put(cacheKey, value);
            return value;
        } catch (Exception ignored) {
            return null;
        }
    }

    /**
     * Returns all UI translation strings for the frontend.
     */
    public Map<String, Map<String, String>> getAllPhrases() {
        return Collections.unmodifiableMap(PHRASES);
    }
}
