package com.example.service;

import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Hardcoded knowledge base for West Bengal agriculture.
 * Contains district data, crop-disease mappings, advisory templates,
 * KVK contacts, and seasonal calendars. No external DB needed.
 */
@Component
public class WBCropKnowledgeBase {

    // ── District Data (23 districts of West Bengal) ──────────────────────

    public record DistrictInfo(
            String name, double latitude, double longitude,
            String agroClimaticZone, String soilType,
            String kvkName, String kvkPhone, String kvkAddress,
            List<String> majorCrops) {
    }

    private static final Map<String, DistrictInfo> DISTRICTS = new LinkedHashMap<>();

    static {
        DISTRICTS.put("Alipurduar", new DistrictInfo("Alipurduar", 26.49, 89.52,
                "Terai", "Alluvial Sandy Loam",
                "KVK Alipurduar", "03564-255123", "Falakata, Alipurduar",
                List.of("Rice", "Jute", "Tea", "Maize")));
        DISTRICTS.put("Bankura", new DistrictInfo("Bankura", 23.23, 87.07,
                "Red & Laterite", "Red Laterite",
                "KVK Bankura", "03242-255234", "Onda, Bankura",
                List.of("Rice", "Potato", "Mustard", "Vegetables")));
        DISTRICTS.put("Birbhum", new DistrictInfo("Birbhum", 23.86, 87.62,
                "Red & Laterite", "Red Sandy Loam",
                "KVK Birbhum", "03462-255345", "Suri, Birbhum",
                List.of("Rice", "Wheat", "Mustard", "Vegetables")));
        DISTRICTS.put("Cooch Behar", new DistrictInfo("Cooch Behar", 26.32, 89.45,
                "Terai", "Sandy Loam Alluvial",
                "KVK Cooch Behar", "03582-255456", "Pundibari, Cooch Behar",
                List.of("Rice", "Jute", "Tobacco", "Maize")));
        DISTRICTS.put("Dakshin Dinajpur", new DistrictInfo("Dakshin Dinajpur", 25.18, 88.77,
                "Old Alluvial", "Alluvial Clay Loam",
                "KVK Dakshin Dinajpur", "03522-255567", "Majhian, Dakshin Dinajpur",
                List.of("Rice", "Wheat", "Jute", "Maize")));
        DISTRICTS.put("Darjeeling", new DistrictInfo("Darjeeling", 27.04, 88.26,
                "Hill", "Mountain Soil",
                "KVK Darjeeling", "0354-2255678", "Kalimpong, Darjeeling",
                List.of("Tea", "Rice", "Maize", "Ginger", "Cardamom")));
        DISTRICTS.put("Hooghly", new DistrictInfo("Hooghly", 22.89, 88.39,
                "New Alluvial", "Alluvial Clay",
                "KVK Hooghly", "03211-255789", "Chinsurah, Hooghly",
                List.of("Rice", "Potato", "Jute", "Vegetables")));
        DISTRICTS.put("Howrah", new DistrictInfo("Howrah", 22.59, 88.31,
                "New Alluvial", "Alluvial Clay",
                "KVK Howrah", "03214-255890", "Jagatballavpur, Howrah",
                List.of("Rice", "Vegetables", "Flowers")));
        DISTRICTS.put("Jalpaiguri", new DistrictInfo("Jalpaiguri", 26.52, 88.73,
                "Terai", "Alluvial Sandy",
                "KVK Jalpaiguri", "03561-255901", "Krishi Vigyan Kendra, Jalpaiguri",
                List.of("Rice", "Jute", "Tea", "Maize")));
        DISTRICTS.put("Jhargram", new DistrictInfo("Jhargram", 22.45, 86.99,
                "Red & Laterite", "Red Laterite",
                "KVK Jhargram", "03221-255012", "Jhargram",
                List.of("Rice", "Vegetables", "Cashew", "Sal")));
        DISTRICTS.put("Kalimpong", new DistrictInfo("Kalimpong", 27.06, 88.47,
                "Hill", "Mountain Soil",
                "KVK Kalimpong", "03552-255123", "Kalimpong",
                List.of("Tea", "Ginger", "Cardamom", "Orange")));
        DISTRICTS.put("Kolkata", new DistrictInfo("Kolkata", 22.57, 88.36,
                "New Alluvial", "Alluvial",
                "KVK South 24 Parganas", "033-24530000", "Kolkata",
                List.of("Vegetables", "Flowers")));
        DISTRICTS.put("Malda", new DistrictInfo("Malda", 25.01, 88.14,
                "Old Alluvial", "Alluvial Loam",
                "KVK Malda", "03512-255234", "Old Malda",
                List.of("Rice", "Mango", "Jute", "Wheat", "Maize")));
        DISTRICTS.put("Murshidabad", new DistrictInfo("Murshidabad", 24.18, 88.27,
                "New Alluvial", "Alluvial Clay Loam",
                "KVK Murshidabad", "03482-255345", "Berhampore, Murshidabad",
                List.of("Rice", "Jute", "Mango", "Silk", "Vegetables")));
        DISTRICTS.put("Nadia", new DistrictInfo("Nadia", 23.47, 88.56,
                "New Alluvial", "Alluvial Clay",
                "KVK Nadia", "03472-255456", "Gayeshpur, Nadia",
                List.of("Rice", "Jute", "Vegetables", "Flowers")));
        DISTRICTS.put("North 24 Parganas", new DistrictInfo("North 24 Parganas", 22.62, 88.45,
                "New Alluvial", "Alluvial Clay",
                "KVK North 24 Parganas", "033-25551234", "Ashokenagar, N 24 Pgns",
                List.of("Rice", "Vegetables", "Fish", "Flowers")));
        DISTRICTS.put("Paschim Bardhaman", new DistrictInfo("Paschim Bardhaman", 23.68, 87.32,
                "Red & Laterite", "Red Alluvial Mix",
                "KVK Paschim Bardhaman", "0341-2255567", "Asansol, Paschim Bardhaman",
                List.of("Rice", "Potato", "Wheat", "Vegetables")));
        DISTRICTS.put("Paschim Medinipur", new DistrictInfo("Paschim Medinipur", 22.42, 87.32,
                "Red & Laterite", "Laterite Red",
                "KVK Paschim Medinipur", "03222-255678", "Midnapore, Paschim Medinipur",
                List.of("Rice", "Vegetables", "Cashew", "Mango")));
        DISTRICTS.put("Purba Bardhaman", new DistrictInfo("Purba Bardhaman", 23.25, 87.85,
                "New Alluvial", "Alluvial Clay Loam",
                "KVK Purba Bardhaman", "0342-2255789", "Burdwan",
                List.of("Rice", "Potato", "Wheat", "Mustard")));
        DISTRICTS.put("Purba Medinipur", new DistrictInfo("Purba Medinipur", 22.28, 87.92,
                "Coastal Alluvial", "Coastal Saline Alluvial",
                "KVK Purba Medinipur", "03228-255890", "Contai, Purba Medinipur",
                List.of("Rice", "Betel", "Cashew", "Fish")));
        DISTRICTS.put("Purulia", new DistrictInfo("Purulia", 23.33, 86.37,
                "Red & Laterite", "Red Gravelly",
                "KVK Purulia", "03252-255901", "Purulia",
                List.of("Rice", "Vegetables", "Lac", "Arhar")));
        DISTRICTS.put("South 24 Parganas", new DistrictInfo("South 24 Parganas", 22.16, 88.43,
                "Coastal Alluvial", "Saline Alluvial Clay",
                "KVK South 24 Parganas", "033-24530001", "Canning, S 24 Pgns",
                List.of("Rice", "Fish", "Vegetables", "Betel")));
        DISTRICTS.put("Uttar Dinajpur", new DistrictInfo("Uttar Dinajpur", 25.62, 88.12,
                "Old Alluvial", "Alluvial Sandy Loam",
                "KVK Uttar Dinajpur", "03523-255012", "Raiganj, Uttar Dinajpur",
                List.of("Rice", "Jute", "Wheat", "Maize", "Tobacco")));
    }

    public Map<String, DistrictInfo> getAllDistricts() {
        return Collections.unmodifiableMap(DISTRICTS);
    }

    public DistrictInfo getDistrict(String name) {
        if (name == null) return null;
        return DISTRICTS.get(name);
    }

    public DistrictInfo findNearestDistrict(double lat, double lng) {
        DistrictInfo nearest = null;
        double minDist = Double.MAX_VALUE;
        for (DistrictInfo d : DISTRICTS.values()) {
            double dist = Math.pow(d.latitude - lat, 2) + Math.pow(d.longitude - lng, 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = d;
            }
        }
        return nearest;
    }

    // ── WB Crop Database ─────────────────────────────────────────────────

    public record CropInfo(
            String name, List<String> stages,
            String kharifSeason, String rabiSeason,
            List<String> commonDiseases) {
    }

    private static final Map<String, CropInfo> CROPS = new LinkedHashMap<>();

    static {
        CROPS.put("Rice", new CropInfo("Rice",
                List.of("seedling", "vegetative", "tillering", "flowering", "grain-filling", "harvest"),
                "Jun-Nov (Aman)", "Dec-May (Boro)",
                List.of("Blast", "Brown Spot", "Sheath Blight", "Bacterial Leaf Blight", "Tungro")));
        CROPS.put("Potato", new CropInfo("Potato",
                List.of("sprouting", "vegetative", "tuber-initiation", "tuber-bulking", "maturation"),
                "N/A", "Oct-Mar",
                List.of("Early Blight", "Late Blight", "Black Scurf", "Common Scab", "Virus")));
        CROPS.put("Jute", new CropInfo("Jute",
                List.of("seedling", "vegetative", "flowering", "fibre-development"),
                "Mar-Aug", "N/A",
                List.of("Stem Rot", "Anthracnose", "Leaf Mosaic", "Root Rot")));
        CROPS.put("Mustard", new CropInfo("Mustard",
                List.of("seedling", "rosette", "flowering", "pod-formation", "maturity"),
                "N/A", "Oct-Feb",
                List.of("White Rust", "Alternaria Blight", "Downy Mildew", "Aphid Damage")));
        CROPS.put("Tea", new CropInfo("Tea",
                List.of("dormant", "flush-1", "flush-2", "flush-3"),
                "Year round", "Year round",
                List.of("Blister Blight", "Red Spider Mite", "Grey Blight", "Mosquito Bug")));
        CROPS.put("Tomato", new CropInfo("Tomato",
                List.of("seedling", "vegetative", "flowering", "fruiting", "harvest"),
                "Jun-Sep", "Oct-Mar",
                List.of("Early Blight", "Late Blight", "Leaf Curl Virus", "Bacterial Spot", "Septoria Leaf Spot")));
        CROPS.put("Brinjal", new CropInfo("Brinjal",
                List.of("seedling", "vegetative", "flowering", "fruiting"),
                "Jun-Sep", "Oct-Mar",
                List.of("Fruit & Shoot Borer", "Bacterial Wilt", "Phomopsis Blight", "Little Leaf")));
        CROPS.put("Chilli", new CropInfo("Chilli",
                List.of("seedling", "vegetative", "flowering", "fruiting"),
                "Jun-Oct", "Nov-Mar",
                List.of("Anthracnose", "Leaf Curl", "Bacterial Wilt", "Thrips Damage")));
        CROPS.put("Mango", new CropInfo("Mango",
                List.of("dormant", "flowering", "fruit-set", "development", "harvest"),
                "N/A", "Feb-Jun (harvest)",
                List.of("Anthracnose", "Powdery Mildew", "Mango Hopper", "Stem Borer")));
        CROPS.put("Wheat", new CropInfo("Wheat",
                List.of("seedling", "tillering", "heading", "grain-filling", "maturity"),
                "N/A", "Nov-Apr",
                List.of("Rust", "Loose Smut", "Karnal Bunt", "Aphid")));
        CROPS.put("Maize", new CropInfo("Maize",
                List.of("seedling", "vegetative", "tasseling", "grain-filling", "maturity"),
                "Jun-Oct", "Nov-Apr",
                List.of("Turcicum Leaf Blight", "Downy Mildew", "Fall Armyworm", "Stalk Rot")));
    }

    public Map<String, CropInfo> getAllCrops() {
        return Collections.unmodifiableMap(CROPS);
    }

    public CropInfo getCrop(String name) {
        if (name == null) return null;
        return CROPS.get(name);
    }

    // ── Disease Advisory Knowledge ───────────────────────────────────────

    public record DiseaseAdvisory(
            String diseaseName,
            String causeType,
            String description,
            List<String> symptoms,
            List<String> organicTreatment,
            List<String> chemicalTreatment,
            String dosage,
            String safetyPPE,
            int preHarvestIntervalDays,
            List<String> preventiveMeasures,
            boolean needsExpertConfirmation,
            String escalationReason) {
    }

    private static final Map<String, DiseaseAdvisory> DISEASE_DB = new LinkedHashMap<>();

    static {
        // ── Potato diseases ──
        DISEASE_DB.put("Potato___Early_blight", new DiseaseAdvisory(
                "Early Blight", "Fungal (Alternaria solani)",
                "Brown concentric ring spots ('target spots') on lower leaves, spreading upward.",
                List.of("Dark brown spots with concentric rings", "Yellowing around spots", "Lower leaves affected first"),
                List.of("Neem oil spray (5ml/L)", "Trichoderma viride soil application", "Remove and destroy infected leaves"),
                List.of("Mancozeb 75% WP @ 2.5g/L", "Chlorothalonil 75% WP @ 2g/L"),
                "Mancozeb: 2.5g per litre of water, spray every 7-10 days",
                "Wear gloves, mask, and full-sleeve clothing during spraying. Wash hands after.",
                15,
                List.of("Use certified disease-free seed tubers", "Maintain proper spacing", "Avoid overhead irrigation", "Crop rotation with non-solanaceous crops"),
                false, null));

        DISEASE_DB.put("Potato___Late_blight", new DiseaseAdvisory(
                "Late Blight", "Fungal (Phytophthora infestans)",
                "Rapidly spreading water-soaked lesions. Can destroy the entire crop in days. URGENT action needed.",
                List.of("Water-soaked dark patches on leaves", "White cottony growth on leaf underside in humid conditions", "Rapidly spreading", "Tuber rot with brown discoloration"),
                List.of("Remove and burn infected plants immediately", "Improve air circulation", "Avoid overhead watering"),
                List.of("Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L", "Cymoxanil + Mancozeb @ 3g/L"),
                "Ridomil Gold: 2.5g per litre, start spraying preventively when humidity > 80%",
                "Wear full PPE. This is a systemic fungicide — handle with care. Do not eat tubers from heavily infected plants without expert advice.",
                21,
                List.of("Use resistant varieties (Kufri Jyoti)", "Prophylactic spraying in foggy weather", "Destroy infected plant debris", "Avoid waterlogging"),
                true, "Late blight can destroy entire fields in 48 hours. Urgent expert consultation recommended."));

        DISEASE_DB.put("Potato___healthy", new DiseaseAdvisory(
                "Healthy", "None",
                "No disease symptoms detected. The plant appears healthy.",
                List.of(),
                List.of("Continue regular monitoring", "Maintain good agricultural practices"),
                List.of(),
                "No treatment needed", "N/A", 0,
                List.of("Regular field scouting", "Balanced fertilization", "Proper irrigation scheduling"),
                false, null));

        DISEASE_DB.put("Potato leaf early blight", new DiseaseAdvisory(
                "Early Blight", "Fungal (Alternaria solani)",
                "Concentric ring-pattern spots on older leaves, typical early blight.",
                List.of("Target-shaped spots", "Leaf yellowing", "Progressive defoliation"),
                List.of("Neem oil spray", "Trichoderma application", "Remove infected foliage"),
                List.of("Mancozeb 75% WP @ 2.5g/L"),
                "2.5g per litre, 7-10 day interval",
                "Wear gloves and mask during application.",
                15,
                List.of("Crop rotation", "Resistant varieties", "Avoid excessive nitrogen"),
                false, null));

        DISEASE_DB.put("Potato leaf late blight", new DiseaseAdvisory(
                "Late Blight", "Fungal (Phytophthora infestans)",
                "Aggressive water-soaked lesions — requires immediate intervention.",
                List.of("Water-soaked patches", "White mould on leaf underside", "Rapid spread"),
                List.of("Remove and destroy infected material", "Improve drainage"),
                List.of("Metalaxyl + Mancozeb @ 2.5g/L"),
                "Apply immediately and repeat in 7 days",
                "Full PPE required. Handle systemic fungicides carefully.",
                21,
                List.of("Use resistant varieties", "Preventive spraying in humid weather"),
                true, "Late blight is extremely aggressive. Contact KVK for emergency guidance."));

        // ── Rice diseases (West Bengal staple crop) ──
        DISEASE_DB.put("Rice___Brown_spot", new DiseaseAdvisory(
                "Brown Spot", "Fungal (Bipolaris oryzae)",
                "Circular to oval brown spots with grey centres on leaves; can cause 'blank neck' and poor grain filling.",
                List.of("Brown circular spots with grey centre", "Spots appear on older leaves first", "Infected grains become discoloured and lightweight"),
                List.of("Neem oil spray (5ml/L)", "Pseudomonas fluorescens seed treatment", "Apply muriate of potash (K) to correct deficiency"),
                List.of("Tricyclazole 75% WP @ 0.3g/L", "Edifenphos 45% EC @ 1.5ml/L"),
                "Tricyclazole: 0.3g per litre, spray at early spotting",
                "Wear gloves, mask and full-sleeve clothing. Wash hands after spraying.",
                15,
                List.of("Use certified seed and treat before sowing", "Avoid potassium deficiency", "Crop rotation", "Maintain field drainage"),
                false, null));

        DISEASE_DB.put("Rice___Leaf_blast", new DiseaseAdvisory(
                "Blast", "Fungal (Pyricularia oryzae)",
                "Spindle-shaped whitish-grey lesions with dark brown borders on leaves; neck and node blast cause direct yield loss.",
                List.of("Spindle-shaped lesions on leaves", "Dark-bordered leaf spots", "Neck blast causes empty panicles"),
                List.of("Remove infected tillers", "Avoid excessive nitrogen", "Pseudomonas fluorescens spray"),
                List.of("Tricyclazole 75% WP @ 0.3g/L", "Isoprothiolane 40% EC @ 1.25ml/L"),
                "Tricyclazole: 0.3g per litre; repeat after 10 days if needed",
                "Full PPE. Do not spray near harvest — observe pre-harvest interval.",
                15,
                List.of("Use resistant varieties (Swarna, IR36, MTU1010)", "Treat nursery seed", "Balanced nitrogen use", "Avoid late heavy nitrogen"),
                false, null));

        DISEASE_DB.put("Rice___Hispa", new DiseaseAdvisory(
                "Hispa (Leaf Beetle)", "Insect pest (Dicladispa armigera)",
                "Beetle scrapes leaf tissue leaving white parallel streaks; larvae mine inside leaves, reducing photosynthesis.",
                List.of("White scraping streaks on leaves", "Shot-hole appearance", "Reduced leaf area"),
                List.of("Hand collection of beetles in small fields", "Neem oil (5ml/L)", "Conserve natural enemies"),
                List.of("Cartap hydrochloride 50% SP @ 1g/L", "Fenitrothion 50% EC @ 1ml/L"),
                "Spray when beetle count rises; target leaf whorls",
                "Wear full PPE. Toxic to fish — do not spray near ponds/canals.",
                14,
                List.of("Raise clean nursery", "Avoid staggered planting", "Remove weeds from bunds"),
                false, null));

        DISEASE_DB.put("Rice___Bacterial_leaf_blight", new DiseaseAdvisory(
                "Bacterial Leaf Blight", "Bacterial (Xanthomonas oryzae pv. oryzae)",
                "Water-soaked yellow stripes along leaf margins that turn white; 'Kresek' wilting of young plants in severe cases.",
                List.of("Yellow stripes from leaf tip/margin", "Water-soaked lesions", "Wilting of seedlings (kresek)"),
                List.of("Hot-water seed treatment (52-54°C, 15 min)", "Avoid excess nitrogen", "Surface drainage of fields"),
                List.of("Streptomycin sulphate @ 0.5g/L + Copper oxychloride @ 3g/L"),
                "Apply at disease onset, repeat after 7 days",
                "Wear gloves. Antibiotics require careful handling and dosage.",
                10,
                List.of("Use certified disease-free seed", "Resistant varieties", "Avoid overhead/flood irrigation", "Balanced fertilization"),
                false, null));

        DISEASE_DB.put("Rice___Tungro", new DiseaseAdvisory(
                "Tungro", "Viral (Rice tungro bacilliform virus, spread by green leafhopper)",
                "Yellow to orange leaf discolouration, severe stunting and reduced tillering. No direct cure — manage the leafhopper vector.",
                List.of("Yellow/orange leaf discolouration", "Stunted bushy plants", "Few short panicles", "Reduced tillering"),
                List.of("Remove and destroy infected plants", "Yellow sticky traps for leafhopper", "Neem oil to deter vectors", "Synchronised planting"),
                List.of("Buprofezin 25% SC @ 1ml/L or Imidacloprid 17.8% SL @ 0.3ml/L (vector control only)"),
                "Target the green leafhopper vector, not the virus. 0.3ml/L Imidacloprid.",
                "Imidacloprid is toxic to fish and bees. Do not spray near flowering or water bodies. Full PPE.",
                21,
                List.of("Use resistant varieties", "Synchronised community planting", "Remove infected plants early", "Nursery insect-net covers", "Control leafhopper in nursery"),
                true, "Tungro cannot be cured. Expert should confirm whether to rogue or replant the field."));

        DISEASE_DB.put("Rice___healthy", new DiseaseAdvisory(
                "Healthy", "None",
                "No disease or pest symptoms detected in the rice leaf. The plant appears healthy.",
                List.of(),
                List.of("Continue regular monitoring", "Maintain balanced fertilization and good water management"),
                List.of(),
                "No treatment needed", "N/A", 0,
                List.of("Regular field scouting", "Balanced NPK", "Proper water management"),
                false, null));

        // ── Tomato diseases ──
        DISEASE_DB.put("Tomato_Early_blight", new DiseaseAdvisory(
                "Early Blight", "Fungal (Alternaria solani)",
                "Target-shaped brown lesions on lower leaves.",
                List.of("Concentric ring spots", "Yellowing leaves", "Fruit with dark leathery spots"),
                List.of("Neem oil spray (5ml/L)", "Remove infected leaves", "Mulching to prevent soil splash"),
                List.of("Mancozeb 75% WP @ 2.5g/L", "Azoxystrobin 23% SC @ 1ml/L"),
                "Mancozeb: 2.5g/L every 10 days",
                "Wear mask and gloves. Avoid spraying near harvest.",
                14,
                List.of("Stake plants for air circulation", "Avoid wetting leaves", "Crop rotation"),
                false, null));

        DISEASE_DB.put("Tomato_Late_blight", new DiseaseAdvisory(
                "Late Blight", "Fungal (Phytophthora infestans)",
                "Fast-spreading water-soaked dark patches. Can kill plants within a week.",
                List.of("Dark water-soaked lesions", "White fuzzy growth in humid conditions", "Brown firm fruit rot"),
                List.of("Remove severely infected plants", "Improve spacing"),
                List.of("Metalaxyl + Mancozeb @ 2.5g/L", "Copper oxychloride @ 3g/L"),
                "Apply immediately upon first symptoms",
                "Full PPE. Systemic fungicide — observe pre-harvest interval strictly.",
                21,
                List.of("Resistant hybrids", "Avoid overhead irrigation", "Preventive copper spray"),
                true, "Late blight in tomato is an emergency. Expert verification recommended."));

        DISEASE_DB.put("Tomato_Bacterial_spot", new DiseaseAdvisory(
                "Bacterial Spot", "Bacterial (Xanthomonas spp.)",
                "Small dark water-soaked spots on leaves and fruit.",
                List.of("Small angular dark spots", "Spots may have yellow halo", "Fruit lesions become raised and scabby"),
                List.of("Remove infected leaves", "Avoid overhead watering", "Copper hydroxide spray"),
                List.of("Streptomycin sulphate @ 0.5g/L + Copper oxychloride @ 3g/L"),
                "Apply at 10-day intervals",
                "Wear gloves. Antibiotics in agriculture require careful handling.",
                10,
                List.of("Use disease-free seed", "Hot water seed treatment (50°C, 25 min)", "Crop rotation"),
                false, null));

        DISEASE_DB.put("Tomato_Leaf_Mold", new DiseaseAdvisory(
                "Leaf Mold", "Fungal (Passalora fulva)",
                "Yellowish-green spots on upper leaf surface with olive-brown mold underneath.",
                List.of("Yellow patches on upper surface", "Olive-brown velvety growth below", "Leaves curl and drop"),
                List.of("Improve ventilation", "Reduce humidity", "Remove affected leaves"),
                List.of("Mancozeb @ 2.5g/L", "Carbendazim 50% WP @ 1g/L"),
                "Spray at first signs, repeat in 10 days",
                "Wear mask. Avoid inhaling spray mist.",
                14,
                List.of("Adequate plant spacing", "Avoid overcrowding", "Resistant varieties"),
                false, null));

        DISEASE_DB.put("Tomato_Septoria_leaf_spot", new DiseaseAdvisory(
                "Septoria Leaf Spot", "Fungal (Septoria lycopersici)",
                "Numerous small circular spots with dark borders and grey centers.",
                List.of("Many small round spots (1-3mm)", "Dark margins with light grey center", "Lower leaves affected first"),
                List.of("Remove infected lower leaves", "Mulch to prevent splash", "Neem oil"),
                List.of("Chlorothalonil 75% WP @ 2g/L", "Mancozeb @ 2.5g/L"),
                "Begin when spots first appear, repeat every 7-10 days",
                "Wear full protection during spraying.",
                14,
                List.of("Remove crop debris after season", "Avoid working in wet fields", "Crop rotation"),
                false, null));

        DISEASE_DB.put("Tomato__Target_Spot", new DiseaseAdvisory(
                "Target Spot", "Fungal (Corynespora cassiicola)",
                "Large brown spots with concentric rings on leaves.",
                List.of("Large spots with target-like rings", "Can affect stems and fruit", "Severe in warm humid conditions"),
                List.of("Remove affected leaves", "Improve air flow"),
                List.of("Azoxystrobin @ 1ml/L", "Mancozeb @ 2.5g/L"),
                "Start spraying at disease onset",
                "Wear protective gear.",
                14,
                List.of("Proper spacing", "Avoid excess irrigation"),
                false, null));

        DISEASE_DB.put("Tomato__Tomato_YellowLeaf__Curl_Virus", new DiseaseAdvisory(
                "Yellow Leaf Curl Virus", "Viral (TYLCV, transmitted by whitefly)",
                "Severe leaf curling, yellowing, and stunted growth. No direct cure — manage the vector.",
                List.of("Upward leaf curling", "Yellowing of leaf margins", "Stunted bushy growth", "Flower drop"),
                List.of("Remove and destroy infected plants", "Yellow sticky traps for whitefly", "Neem oil spray to deter whitefly"),
                List.of("Imidacloprid 17.8% SL @ 0.3ml/L (for whitefly control only)"),
                "Target whitefly, not the virus. 0.3ml/L Imidacloprid as foliar or drench.",
                "Imidacloprid is toxic to bees. Do not spray during flowering. Wear full PPE.",
                21,
                List.of("Use virus-resistant varieties", "Reflective mulch to repel whitefly", "Remove weeds that host whitefly", "Use nursery net covers"),
                true, "Viral infections cannot be cured. Expert should confirm whether to salvage or replant."));

        DISEASE_DB.put("Tomato__Tomato_mosaic_virus", new DiseaseAdvisory(
                "Tomato Mosaic Virus", "Viral (ToMV, spread by contact)",
                "Mottled light/dark green pattern on leaves. Spreads through handling.",
                List.of("Mosaic pattern on leaves", "Leaf distortion", "Reduced fruit size", "Sometimes fern-like leaves"),
                List.of("Remove and destroy infected plants", "Disinfect tools with 10% bleach", "Wash hands between plants"),
                List.of("No chemical cure for viruses"),
                "No chemical treatment. Focus on prevention.",
                "Wash hands with soap before handling healthy plants.",
                0,
                List.of("Use resistant varieties", "Disinfect all tools", "Do not smoke near tomato fields (tobacco mosaic cross-infects)", "Sanitize greenhouse"),
                true, "Virus identification requires expert confirmation. Similar symptoms can have different causes."));

        DISEASE_DB.put("Tomato_Spider_mites_Two_spotted_spider_mite", new DiseaseAdvisory(
                "Two-Spotted Spider Mite", "Pest (Tetranychus urticae)",
                "Tiny mites cause stippled yellowing on leaves. Fine webbing visible.",
                List.of("Yellow stippling on leaves", "Fine webbing on leaf underside", "Bronzing of leaves", "Leaves become dry and crispy"),
                List.of("Strong water spray to dislodge mites", "Neem oil 5ml/L", "Release predatory mites if available"),
                List.of("Dicofol 18.5% EC @ 2.5ml/L", "Abamectin 1.9% EC @ 0.5ml/L"),
                "Apply to leaf undersides. Rotate chemicals to prevent resistance.",
                "Dicofol: wear full PPE, toxic to aquatic life.",
                14,
                List.of("Maintain field hygiene", "Avoid water stress", "Intercrop with marigold"),
                false, null));

        DISEASE_DB.put("Tomato_healthy", new DiseaseAdvisory(
                "Healthy", "None",
                "No disease or pest symptoms detected.",
                List.of(),
                List.of("Continue monitoring", "Maintain current practices"),
                List.of(),
                "No treatment needed", "N/A", 0,
                List.of("Regular scouting", "Balanced nutrition", "Good drainage"),
                false, null));

        // ── Pepper / Bell Pepper ──
        DISEASE_DB.put("Pepper__bell___Bacterial_spot", new DiseaseAdvisory(
                "Bacterial Spot", "Bacterial (Xanthomonas euvesicatoria)",
                "Water-soaked spots on leaves turning brown with yellow margins.",
                List.of("Small dark spots with yellow halo", "Leaf drop", "Fruit blemishes"),
                List.of("Remove infected leaves", "Copper-based sprays", "Avoid overhead watering"),
                List.of("Copper oxychloride @ 3g/L"),
                "Apply preventively in wet weather",
                "Wash hands after handling copper products.",
                7,
                List.of("Disease-free seed", "Crop rotation", "Sanitation"),
                false, null));

        DISEASE_DB.put("Pepper__bell___healthy", new DiseaseAdvisory(
                "Healthy", "None",
                "Plant appears healthy.",
                List.of(),
                List.of("Continue monitoring"),
                List.of(),
                "No treatment needed", "N/A", 0,
                List.of("Regular scouting"),
                false, null));

        // ── Corn / Maize ──
        DISEASE_DB.put("Corn Gray leaf spot", new DiseaseAdvisory(
                "Gray Leaf Spot", "Fungal (Cercospora zeae-maydis)",
                "Rectangular grey-brown lesions parallel to leaf veins.",
                List.of("Long rectangular grey spots", "Lesions run between veins", "Lower leaves first"),
                List.of("Remove crop debris", "Crop rotation with non-cereals"),
                List.of("Propiconazole 25% EC @ 1ml/L"),
                "Apply at first sign of disease",
                "Wear PPE during spraying.",
                21,
                List.of("Resistant hybrids", "Tillage to bury debris"),
                false, null));

        DISEASE_DB.put("Corn leaf blight", new DiseaseAdvisory(
                "Northern Corn Leaf Blight", "Fungal (Exserohilum turcicum)",
                "Long cigar-shaped grey-green lesions on leaves.",
                List.of("Cigar-shaped lesions 5-15cm", "Grey-green turning tan", "Can cause significant yield loss"),
                List.of("Crop rotation", "Remove residue"),
                List.of("Mancozeb @ 2.5g/L", "Propiconazole @ 1ml/L"),
                "Spray at disease onset",
                "Standard PPE.",
                14,
                List.of("Resistant varieties", "Balanced fertilization"),
                false, null));

        DISEASE_DB.put("Corn rust leaf", new DiseaseAdvisory(
                "Common Rust", "Fungal (Puccinia sorghi)",
                "Small reddish-brown pustules on both leaf surfaces.",
                List.of("Rust-colored pustules", "Can occur on both surfaces", "Yellow halo around pustules"),
                List.of("Early sowing to avoid rust season", "Resistant varieties"),
                List.of("Mancozeb @ 2.5g/L", "Propiconazole @ 1ml/L"),
                "Spray when pustules first appear",
                "Wear mask and gloves.",
                14,
                List.of("Timely sowing", "Resistant hybrids"),
                false, null));

        // ── Grape ──
        DISEASE_DB.put("grape leaf black rot", new DiseaseAdvisory(
                "Black Rot", "Fungal (Guignardia bidwellii)",
                "Brown circular leaf lesions with black dots. Can destroy fruit clusters.",
                List.of("Brown spots with dark margin", "Small black dots in lesions", "Fruit mummifies and turns black"),
                List.of("Remove mummified fruit", "Prune for air circulation"),
                List.of("Mancozeb @ 2.5g/L", "Myclobutanil @ 0.5g/L"),
                "Preventive sprays from bud break",
                "Standard PPE.",
                14,
                List.of("Good canopy management", "Remove infected debris"),
                false, null));

        // ── General "healthy" leaves ──
        for (String healthy : List.of("Apple leaf", "Bell_pepper leaf", "Blueberry leaf",
                "Cherry leaf", "Peach leaf", "Raspberry leaf", "Soyabean leaf",
                "Strawberry leaf", "Tomato leaf", "grape leaf")) {
            DISEASE_DB.put(healthy, new DiseaseAdvisory(
                    "Healthy", "None",
                    "Leaf appears healthy with no visible disease or pest symptoms.",
                    List.of(),
                    List.of("Continue regular monitoring", "Maintain current agricultural practices"),
                    List.of(),
                    "No treatment needed", "N/A", 0,
                    List.of("Regular field scouting", "Proper nutrition", "Water management"),
                    false, null));
        }

        // ── Apple diseases (mapped for model coverage) ──
        DISEASE_DB.put("Apple Scab Leaf", new DiseaseAdvisory(
                "Apple Scab", "Fungal (Venturia inaequalis)",
                "Olive-brown velvety spots on leaves and fruit.",
                List.of("Olive-brown spots", "Velvety texture", "Leaf distortion"),
                List.of("Remove fallen leaves", "Prune for airflow"),
                List.of("Mancozeb @ 2.5g/L"),
                "Preventive spray from green-tip stage",
                "Standard PPE.",
                14,
                List.of("Resistant varieties", "Sanitation"),
                false, null));

        DISEASE_DB.put("Apple rust leaf", new DiseaseAdvisory(
                "Cedar Apple Rust", "Fungal (Gymnosporangium juniperi-virginianae)",
                "Bright orange-yellow spots on leaf upper surface.",
                List.of("Orange-yellow raised spots", "Small tubes on leaf underside", "Leaf drop in severe cases"),
                List.of("Remove nearby juniper trees (alternate host)"),
                List.of("Myclobutanil @ 0.5g/L"),
                "Apply at petal fall",
                "Standard PPE.",
                14,
                List.of("Remove juniper hosts within 300m", "Resistant apple varieties"),
                false, null));

        DISEASE_DB.put("Squash Powdery mildew leaf", new DiseaseAdvisory(
                "Powdery Mildew", "Fungal (Podosphaera xanthii)",
                "White powdery coating on leaf surfaces.",
                List.of("White powder on leaves", "Leaves yellow and wilt", "Reduced fruit quality"),
                List.of("Baking soda spray (1 tsp/L)", "Neem oil", "Milk spray (1:9 with water)"),
                List.of("Sulphur 80% WP @ 3g/L", "Karathane @ 1ml/L"),
                "Spray at first sign of white patches",
                "Sulphur: avoid in temperatures above 35°C. Standard PPE.",
                7,
                List.of("Adequate spacing", "Morning watering", "Resistant varieties"),
                false, null));

        // Aliases for duplicate model classes
        DISEASE_DB.put("Tomato Early blight leaf", DISEASE_DB.get("Tomato_Early_blight"));
        DISEASE_DB.put("Tomato Septoria leaf spot", DISEASE_DB.get("Tomato_Septoria_leaf_spot"));
        DISEASE_DB.put("Tomato leaf bacterial spot", DISEASE_DB.get("Tomato_Bacterial_spot"));
        DISEASE_DB.put("Tomato leaf late blight", DISEASE_DB.get("Tomato_Late_blight"));
        DISEASE_DB.put("Tomato leaf mosaic virus", DISEASE_DB.get("Tomato__Tomato_mosaic_virus"));
        DISEASE_DB.put("Tomato leaf yellow virus", DISEASE_DB.get("Tomato__Tomato_YellowLeaf__Curl_Virus"));
        DISEASE_DB.put("Tomato mold leaf", DISEASE_DB.get("Tomato_Leaf_Mold"));
        DISEASE_DB.put("Tomato two spotted spider mites leaf", DISEASE_DB.get("Tomato_Spider_mites_Two_spotted_spider_mite"));
        DISEASE_DB.put("Bell_pepper leaf spot", DISEASE_DB.get("Pepper__bell___Bacterial_spot"));
    }

    public DiseaseAdvisory getDiseaseAdvisory(String modelClassName) {
        if (modelClassName == null) return null;
        DiseaseAdvisory exact = DISEASE_DB.get(modelClassName);
        if (exact != null) return exact;

        // Fallback: model class names vary (underscores, Rice___X, Tomato leaf X).
        // Normalise and match by suffix so detections still map to an advisory.
        String norm = normalize(modelClassName);
        for (Map.Entry<String, DiseaseAdvisory> entry : DISEASE_DB.entrySet()) {
            String keyNorm = normalize(entry.getKey());
            if (keyNorm.equals(norm) || keyNorm.endsWith(norm) || norm.endsWith(keyNorm)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private static String normalize(String value) {
        return value.toLowerCase()
                .replace("___", " ")
                .replace('_', ' ')
                .replace("-", " ")
                .trim();
    }

    /**
     * Returns the current season context for West Bengal based on month.
     */
    public String getCurrentSeason() {
        int month = java.time.LocalDate.now().getMonthValue();
        if (month >= 6 && month <= 9) return "Kharif (monsoon season — high humidity, heavy rain expected)";
        if (month >= 10 && month <= 11) return "Post-Kharif (retreating monsoon — moderate humidity)";
        if (month >= 12 || month <= 2) return "Rabi (winter season — cool and dry, foggy mornings)";
        return "Pre-Kharif / Zaid (hot summer — increasing temperatures)";
    }

    /**
     * Returns generic WB district context string.
     */
    public String getDistrictContext(String districtName) {
        DistrictInfo info = getDistrict(districtName);
        if (info == null) return "District information not available. Please select your district for location-specific advice.";
        return String.format("District: %s | Zone: %s | Soil: %s | Major Crops: %s | Season: %s",
                info.name, info.agroClimaticZone, info.soilType,
                String.join(", ", info.majorCrops), getCurrentSeason());
    }
}
