package com.example.service;

import com.example.dto.MandiPriceDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fetches live mandi (agricultural market) prices from the
 * Government of India's Open Government Data (data.gov.in) API.
 *
 * API endpoint: /resource/{resource-id}?api-key=...&format=json
 *   &filters[commodity]={crop}&filters[state]=West Bengal&limit=10
 *
 * Falls back to representative built-in price data when:
 *   - No API key is configured
 *   - The external API is unreachable or returns an error
 *   - The commodity is not found in data.gov.in records
 */
@Service
public class MandiPriceService {

    private static final Logger log = LoggerFactory.getLogger(MandiPriceService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String baseUrl;

    // ── Simple in-memory cache (5 min TTL) ──
    private record CacheEntry(List<MandiPriceDTO> prices, Instant expiresAt) {}
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_SECONDS = 300;

    // ── Crop name → data.gov.in commodity name mapping ──
    private static final Map<String, String> COMMODITY_MAP = Map.ofEntries(
            Map.entry("Rice",     "Rice"),
            Map.entry("Potato",   "Potato"),
            Map.entry("Wheat",    "Wheat"),
            Map.entry("Maize",    "Maize"),
            Map.entry("Tomato",   "Tomato"),
            Map.entry("Brinjal",  "Brinjal"),
            Map.entry("Chilli",   "Green Chilli"),
            Map.entry("Jute",     "Jute"),
            Map.entry("Mustard",  "Mustard"),
            Map.entry("Tea",      "Tea"),
            Map.entry("Mango",    "Mango (Raw-Loss Ripe)")
    );

    public MandiPriceService(RestClient.Builder builder,
                             @Value("${mandi.api-key:}") String apiKey,
                             @Value("${mandi.base-url:https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070}") String baseUrl) {
        this.restClient = builder.build();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    /**
     * Returns mandi prices for a crop. Attempts live API first, then cache, then fallback.
     */
    public List<MandiPriceDTO> getPrices(String cropName) {
        if (cropName == null) return List.of();

        // Normalise crop name
        String normCrop = normalizeCropName(cropName);
        String commodity = COMMODITY_MAP.getOrDefault(normCrop, normCrop);

        // Check cache
        CacheEntry cached = cache.get(normCrop);
        if (cached != null && Instant.now().isBefore(cached.expiresAt())) {
            return cached.prices();
        }

        // Try live API
        if (!apiKey.isBlank()) {
            try {
                List<MandiPriceDTO> live = fetchFromApi(commodity, normCrop);
                if (!live.isEmpty()) {
                    cache.put(normCrop, new CacheEntry(live, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
                    return live;
                }
            } catch (Exception e) {
                log.warn("data.gov.in API call failed for commodity '{}': {}", commodity, e.getMessage());
            }
        }

        // Fallback to built-in representative prices
        List<MandiPriceDTO> fallback = getFallbackPrices(normCrop);
        cache.put(normCrop, new CacheEntry(fallback, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
        return fallback;
    }

    /**
     * Returns prices for all mapped crops.
     */
    public Map<String, List<MandiPriceDTO>> getAllPrices() {
        Map<String, List<MandiPriceDTO>> result = new LinkedHashMap<>();
        for (String crop : COMMODITY_MAP.keySet()) {
            result.put(crop, getPrices(crop));
        }
        return result;
    }

    /**
     * Whether the service has a live API key configured.
     */
    public boolean isLiveApiAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    // ── data.gov.in API call ──────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<MandiPriceDTO> fetchFromApi(String commodity, String cropName) {
        Map<?, ?> response = restClient.get()
                .uri(baseUrl + "?api-key={key}&format=json&limit=10"
                        + "&filters[commodity]={commodity}&filters[state]=West Bengal",
                        apiKey, commodity)
                .retrieve()
                .body(Map.class);

        if (response == null) return List.of();

        Object recordsObj = response.get("records");
        if (!(recordsObj instanceof List<?> records) || records.isEmpty()) {
            return List.of();
        }

        List<MandiPriceDTO> results = new ArrayList<>();
        for (Object rec : records) {
            if (!(rec instanceof Map<?, ?> r)) continue;
            try {
                results.add(new MandiPriceDTO(
                        cropName,
                        str(r, "market"),
                        str(r, "district"),
                        str(r, "state"),
                        parsePrice(r, "min_price"),
                        parsePrice(r, "max_price"),
                        parsePrice(r, "modal_price"),
                        "₹/Quintal",
                        str(r, "arrival_date"),
                        true
                ));
            } catch (Exception e) {
                log.debug("Skipping malformed record: {}", e.getMessage());
            }
        }
        return results;
    }

    private static String str(Map<?, ?> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : "N/A";
    }

    private static double parsePrice(Map<?, ?> map, String key) {
        Object val = map.get(key);
        if (val == null) return 0.0;
        try {
            return Double.parseDouble(val.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private String normalizeCropName(String name) {
        for (String key : COMMODITY_MAP.keySet()) {
            if (key.equalsIgnoreCase(name)) return key;
        }
        // Capitalise first letter as a best-effort
        if (name.length() > 1) {
            return name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
        }
        return name;
    }

    // ── Fallback representative prices (WB averages) ──────────────────────

    private List<MandiPriceDTO> getFallbackPrices(String cropName) {
        return switch (cropName) {
            case "Rice" -> List.of(
                    MandiPriceDTO.fallback("Rice", "Burdwan Mandi", "Purba Bardhaman", 1800, 2400, 2100),
                    MandiPriceDTO.fallback("Rice", "Hooghly Market", "Hooghly", 1750, 2350, 2050),
                    MandiPriceDTO.fallback("Rice", "Midnapore Market", "Paschim Medinipur", 1700, 2300, 2000));
            case "Potato" -> List.of(
                    MandiPriceDTO.fallback("Potato", "Hooghly Market", "Hooghly", 800, 1500, 1100),
                    MandiPriceDTO.fallback("Potato", "Burdwan Mandi", "Purba Bardhaman", 750, 1400, 1050),
                    MandiPriceDTO.fallback("Potato", "Kolkata Market", "Kolkata", 900, 1600, 1200));
            case "Wheat" -> List.of(
                    MandiPriceDTO.fallback("Wheat", "Malda Market", "Malda", 2200, 2800, 2500),
                    MandiPriceDTO.fallback("Wheat", "Murshidabad Market", "Murshidabad", 2150, 2750, 2450));
            case "Maize" -> List.of(
                    MandiPriceDTO.fallback("Maize", "Malda Market", "Malda", 1600, 2200, 1900),
                    MandiPriceDTO.fallback("Maize", "Uttar Dinajpur Market", "Uttar Dinajpur", 1550, 2100, 1800));
            case "Tomato" -> List.of(
                    MandiPriceDTO.fallback("Tomato", "Kolkata Market", "Kolkata", 1000, 3500, 2000),
                    MandiPriceDTO.fallback("Tomato", "Hooghly Market", "Hooghly", 900, 3200, 1800),
                    MandiPriceDTO.fallback("Tomato", "Howrah Market", "Howrah", 1100, 3600, 2100));
            case "Brinjal" -> List.of(
                    MandiPriceDTO.fallback("Brinjal", "Kolkata Market", "Kolkata", 800, 2500, 1500),
                    MandiPriceDTO.fallback("Brinjal", "Hooghly Market", "Hooghly", 700, 2300, 1400));
            case "Chilli" -> List.of(
                    MandiPriceDTO.fallback("Chilli", "Kolkata Market", "Kolkata", 3000, 8000, 5000),
                    MandiPriceDTO.fallback("Chilli", "Murshidabad Market", "Murshidabad", 2800, 7500, 4800));
            case "Jute" -> List.of(
                    MandiPriceDTO.fallback("Jute", "Kolkata Market", "Kolkata", 4500, 5500, 5000),
                    MandiPriceDTO.fallback("Jute", "Nadia Market", "Nadia", 4300, 5300, 4800));
            case "Mustard" -> List.of(
                    MandiPriceDTO.fallback("Mustard", "Nadia Market", "Nadia", 4800, 6500, 5500),
                    MandiPriceDTO.fallback("Mustard", "Birbhum Market", "Birbhum", 4600, 6200, 5300));
            case "Tea" -> List.of(
                    MandiPriceDTO.fallback("Tea", "Siliguri Auction", "Darjeeling", 15000, 45000, 25000),
                    MandiPriceDTO.fallback("Tea", "Kolkata Auction", "Kolkata", 12000, 40000, 22000));
            case "Mango" -> List.of(
                    MandiPriceDTO.fallback("Mango", "Malda Market", "Malda", 2000, 6000, 3500),
                    MandiPriceDTO.fallback("Mango", "English Bazar", "Malda", 2200, 6500, 3800));
            default -> List.of(
                    MandiPriceDTO.fallback(cropName, "Representative Market", "West Bengal", 1000, 3000, 2000));
        };
    }
}
