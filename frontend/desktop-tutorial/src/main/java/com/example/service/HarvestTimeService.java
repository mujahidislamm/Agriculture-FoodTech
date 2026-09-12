package com.example.service;

import com.example.dto.HarvestInfoDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

/**
 * Provides best harvest time information for all crops in the
 * WBCropKnowledgeBase, tailored to West Bengal's agro-climatic zones.
 *
 * Data is hardcoded from ICAR / KVK / State Agriculture Department
 * recommendations for the Gangetic alluvial plains of WB.
 */
@Service
public class HarvestTimeService {

    // ── Harvest data keyed by crop name (matching WBCropKnowledgeBase keys) ──

    private record HarvestEntry(
            String sowingWindow,
            String harvestWindow,
            String durationDays,
            String season,
            List<String> indicators,
            List<Integer> harvestMonths  // 1-12
    ) {}

    private static final Map<String, HarvestEntry> HARVEST_DB = new LinkedHashMap<>();

    static {
        HARVEST_DB.put("Rice", new HarvestEntry(
                "June – July (Aman / Kharif); November – January (Boro)",
                "October – November (Aman); April – May (Boro)",
                "120–150 days (Aman); 140–160 days (Boro)",
                "Kharif (Aman) & Rabi (Boro)",
                List.of(
                        "Grains turn golden-yellow and hard when pressed with thumbnail",
                        "80% of panicles turn straw-coloured",
                        "Leaves start drying from tip downward",
                        "Grain moisture drops to 20–22% — ideal for mechanical harvesting",
                        "Harvest within 30 days of grain maturity to avoid shattering losses"
                ),
                List.of(4, 5, 10, 11)));

        HARVEST_DB.put("Potato", new HarvestEntry(
                "October – November",
                "January – March",
                "75–120 days depending on variety",
                "Rabi",
                List.of(
                        "Vines (haulms) turn yellow and begin to dry naturally",
                        "Tuber skin does not peel when rubbed with thumb (skin-set)",
                        "Cut the haulms 10–15 days before harvest to improve skin firmness",
                        "Harvest on dry days to reduce storage rot",
                        "Avoid harvesting when soil is waterlogged"
                ),
                List.of(1, 2, 3)));

        HARVEST_DB.put("Wheat", new HarvestEntry(
                "November – December",
                "March – April",
                "110–130 days",
                "Rabi",
                List.of(
                        "Ears turn golden-brown and droop under grain weight",
                        "Grain becomes hard — cannot be dented by thumbnail",
                        "Grain moisture at 12–14% is ideal for safe storage",
                        "Straw turns completely yellow with no green tinge",
                        "Delay beyond maturity causes shattering losses (2–5% per week)"
                ),
                List.of(3, 4)));

        HARVEST_DB.put("Maize", new HarvestEntry(
                "June – July (Kharif); November – December (Rabi)",
                "September – October (Kharif); March – April (Rabi)",
                "90–120 days",
                "Kharif & Rabi",
                List.of(
                        "Cob husks turn dry and papery brown",
                        "Kernels are firm and glossy — dent appears at top of kernel",
                        "Black layer visible at kernel base (physiological maturity)",
                        "Grain moisture at 20–25% for cob harvest, 14% for grain storage",
                        "Silk turns dark brown and dry"
                ),
                List.of(3, 4, 9, 10)));

        HARVEST_DB.put("Tomato", new HarvestEntry(
                "September – October (Rabi); June – July (Kharif)",
                "December – March (Rabi); August – October (Kharif)",
                "60–90 days after transplanting",
                "Kharif & Rabi",
                List.of(
                        "Fruit changes from green to 'breaker' stage (slight pink/red at blossom end)",
                        "Harvest at mature-green or breaker stage for distant markets",
                        "Fully red/ripe for local sale within 1–2 days",
                        "Harvest in cool morning hours to extend shelf life",
                        "Fruits yield slightly to gentle pressure when ripe"
                ),
                List.of(8, 9, 10, 12, 1, 2, 3)));

        HARVEST_DB.put("Brinjal", new HarvestEntry(
                "June – July (Kharif); October – November (Rabi)",
                "August – November (Kharif); January – April (Rabi)",
                "55–75 days after transplanting (first pick)",
                "Kharif & Rabi",
                List.of(
                        "Fruit has glossy, bright skin — dull skin indicates over-maturity",
                        "Press fruit gently: flesh springs back when ready",
                        "Seeds inside are still white/soft (not brown/hard)",
                        "Harvest every 4–5 days for continuous picking",
                        "Use sharp knife to cut with a short stem attached"
                ),
                List.of(1, 2, 3, 4, 8, 9, 10, 11)));

        HARVEST_DB.put("Chilli", new HarvestEntry(
                "June – July (Kharif); September – October (Rabi)",
                "September – December (Kharif); January – April (Rabi)",
                "60–80 days after transplanting (first pick)",
                "Kharif & Rabi",
                List.of(
                        "Green chillies: harvest when firm, bright green, and full-sized",
                        "Red/dry chillies: wait until fruit turns fully red on plant",
                        "For dry chilli, allow 75% of fruits to turn red before bulk harvest",
                        "Harvest in dry weather to prevent fungal rot",
                        "Multiple pickings every 7–10 days for green chilli"
                ),
                List.of(1, 2, 3, 4, 9, 10, 11, 12)));

        HARVEST_DB.put("Jute", new HarvestEntry(
                "March – May",
                "July – September",
                "100–120 days",
                "Kharif",
                List.of(
                        "Harvest at small pod stage (50% flowering) for best fibre quality",
                        "Stem base starts turning brown at ground level",
                        "Plants shed lower leaves naturally",
                        "Delayed harvest reduces fibre quality (becomes coarse)",
                        "Ret (soak) immediately after cutting for 10–15 days"
                ),
                List.of(7, 8, 9)));

        HARVEST_DB.put("Mustard", new HarvestEntry(
                "October – November",
                "February – March",
                "100–130 days",
                "Rabi",
                List.of(
                        "75–80% of pods turn yellowish-brown",
                        "Seeds inside pods change from green to brown/black",
                        "Leaves have mostly fallen; stems begin to dry",
                        "Harvest early morning when pods are slightly moist to prevent shattering",
                        "Thresh within a week of harvest to avoid moisture damage"
                ),
                List.of(2, 3)));

        HARVEST_DB.put("Tea", new HarvestEntry(
                "Year-round (perennial plantation crop)",
                "March – November (main plucking season in WB)",
                "First flush: March–April; Second flush: May–June; Autumn flush: Oct–Nov",
                "Year-round",
                List.of(
                        "Pluck 'two leaves and a bud' for quality tea",
                        "First flush (March–April) — lightest, most prized flavour",
                        "Second flush (May–June) — muscatel character, Darjeeling specialty",
                        "Plucking rounds every 7–10 days during flush season",
                        "Avoid coarse plucking (more than 3 leaves) — degrades quality"
                ),
                List.of(3, 4, 5, 6, 7, 8, 9, 10, 11)));

        HARVEST_DB.put("Mango", new HarvestEntry(
                "N/A (perennial tree — flowers December–February)",
                "May – July (Malda mangoes peak in June)",
                "100–130 days from fruit set",
                "Pre-Kharif / Summer",
                List.of(
                        "Fruit shoulder fills out and rounds — no longer flat at stem end",
                        "Skin colour changes from dark green to lighter green/yellowish",
                        "Fruit sinks in water when mature (specific gravity > 1.0)",
                        "Slight aroma develops at stem end",
                        "Harvest with 1 cm stem attached to prevent sap burn"
                ),
                List.of(5, 6, 7)));
    }

    /**
     * Returns harvest info for a single crop, or null if unknown.
     */
    public HarvestInfoDTO getHarvestInfo(String cropName) {
        if (cropName == null) return null;
        HarvestEntry entry = HARVEST_DB.get(cropName);
        if (entry == null) {
            // Try case-insensitive match
            for (Map.Entry<String, HarvestEntry> e : HARVEST_DB.entrySet()) {
                if (e.getKey().equalsIgnoreCase(cropName)) {
                    entry = e.getValue();
                    cropName = e.getKey();
                    break;
                }
            }
        }
        if (entry == null) return null;

        String relevance = computeCurrentRelevance(cropName, entry);
        return new HarvestInfoDTO(
                cropName, entry.sowingWindow(), entry.harvestWindow(),
                entry.durationDays(), entry.season(), entry.indicators(),
                relevance);
    }

    /**
     * Returns harvest info for all crops.
     */
    public List<HarvestInfoDTO> getAllHarvestInfo() {
        List<HarvestInfoDTO> result = new ArrayList<>();
        for (String crop : HARVEST_DB.keySet()) {
            result.add(getHarvestInfo(crop));
        }
        return result;
    }

    /**
     * Returns the set of crop names we have harvest data for.
     */
    public Set<String> getAvailableCrops() {
        return Collections.unmodifiableSet(HARVEST_DB.keySet());
    }

    // ── Relevance computation ─────────────────────────────────────────────

    private String computeCurrentRelevance(String cropName, HarvestEntry entry) {
        int month = LocalDate.now().getMonthValue();

        if (entry.harvestMonths().contains(month)) {
            return "🟢 " + cropName + " harvest season is ACTIVE right now! Check maturity indicators above.";
        }

        // Find nearest upcoming harvest month
        int nearest = -1;
        int minDist = 13;
        for (int hm : entry.harvestMonths()) {
            int dist = hm > month ? hm - month : hm + 12 - month;
            if (dist < minDist) {
                minDist = dist;
                nearest = hm;
            }
        }
        if (nearest != -1) {
            String monthName = java.time.Month.of(nearest).toString();
            monthName = monthName.charAt(0) + monthName.substring(1).toLowerCase();
            if (minDist == 1) {
                return "🟡 " + cropName + " harvest starts next month (" + monthName + "). Prepare harvesting equipment.";
            } else {
                return "⏳ Next " + cropName + " harvest window opens in " + monthName + " (" + minDist + " months away).";
            }
        }
        return "Harvest timing information available — see windows above.";
    }
}
