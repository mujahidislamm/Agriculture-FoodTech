package com.example.controller;

import com.example.dto.CropMetadataDTO;
import com.example.dto.CropMarketInfoDTO;
import com.example.dto.HarvestInfoDTO;
import com.example.dto.MandiPriceDTO;
import com.example.dto.PredictionResponseDTO;
import com.example.entity.PredictionLog;
import com.example.repository.PredictionLogRepository;
import com.example.service.AdvisoryService;
import com.example.service.HarvestTimeService;
import com.example.service.MandiPriceService;
import com.example.service.ModelInferenceService;
import com.example.service.TranslationService;
import com.example.service.WBCropKnowledgeBase;
import com.example.service.WeatherService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class CropPredictionController {

    private final ModelInferenceService modelInferenceService;
    private final AdvisoryService advisoryService;
    private final WeatherService weatherService;
    private final WBCropKnowledgeBase knowledgeBase;
    private final TranslationService translationService;
    private final PredictionLogRepository predictionLogRepository;
    private final HarvestTimeService harvestTimeService;
    private final MandiPriceService mandiPriceService;

    public CropPredictionController(ModelInferenceService modelInferenceService,
                                    AdvisoryService advisoryService,
                                    WeatherService weatherService,
                                    WBCropKnowledgeBase knowledgeBase,
                                    TranslationService translationService,
                                    PredictionLogRepository predictionLogRepository,
                                    HarvestTimeService harvestTimeService,
                                    MandiPriceService mandiPriceService) {
        this.modelInferenceService = modelInferenceService;
        this.advisoryService = advisoryService;
        this.weatherService = weatherService;
        this.knowledgeBase = knowledgeBase;
        this.translationService = translationService;
        this.predictionLogRepository = predictionLogRepository;
        this.harvestTimeService = harvestTimeService;
        this.mandiPriceService = mandiPriceService;
    }

    /**
     * Main diagnosis endpoint — accepts leaf image + farm metadata,
     * returns full explainable advisory with translation.
     */
    @PostMapping(value = "/diagnose", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PredictionResponseDTO diagnose(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "cropType", required = false) String cropType,
            @RequestParam(value = "cropStage", required = false) String cropStage,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "latitude", required = false) String latitude,
            @RequestParam(value = "longitude", required = false) String longitude,
            @RequestParam(value = "observations", required = false) String observations,
            @RequestParam(value = "language", required = false) String language) {

        // 1. Run model inference
        Map<String, Double> predictions = modelInferenceService.predict(image);

        // 2. Resolve district from GPS if not specified
        Double lat = parseDouble(latitude);
        Double lng = parseDouble(longitude);
        if ((district == null || district.isBlank()) && lat != null && lng != null) {
            WBCropKnowledgeBase.DistrictInfo nearest = knowledgeBase.findNearestDistrict(lat, lng);
            if (nearest != null) district = nearest.name();
        }

        // 3. Get weather context
        String weather = weatherService.getWeatherContext(lat, lng);

        // 4. Build full advisory
        PredictionResponseDTO response = advisoryService.buildAdvisory(
                predictions, cropType, cropStage, district,
                observations, weather,
                language != null ? language : "en");

        // 5. Log prediction
        try {
            predictionLogRepository.save(new PredictionLog(
                    cropType, cropStage, district, lat, lng,
                    observations, response.primaryDiagnosis(),
                    response.confidence(), response.diagnosisType(),
                    response.escalateToExpert(),
                    language != null ? language : "en"));
        } catch (Exception ignored) {
            // Don't fail the response if logging fails
        }

        return response;
    }

    /**
     * Returns all WB districts for the mobile UI dropdown.
     */
    @GetMapping("/districts")
    public List<Map<String, Object>> getDistricts() {
        return knowledgeBase.getAllDistricts().values().stream()
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", d.name());
                    m.put("latitude", d.latitude());
                    m.put("longitude", d.longitude());
                    m.put("zone", d.agroClimaticZone());
                    m.put("majorCrops", d.majorCrops());
                    m.put("kvkPhone", d.kvkPhone());
                    return m;
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns all WB crops with stages for the mobile UI.
     */
    @GetMapping("/crops")
    public List<Map<String, Object>> getCrops() {
        return knowledgeBase.getAllCrops().values().stream()
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", c.name());
                    m.put("stages", c.stages());
                    m.put("kharifSeason", c.kharifSeason());
                    m.put("rabiSeason", c.rabiSeason());
                    m.put("commonDiseases", c.commonDiseases());
                        boolean covered = modelInferenceService.hasDatasetCoverage(c.name());
                        m.put("datasetAvailable", covered);
                        m.put("datasetNote", covered
                            ? "The trained model has matching image classes for this crop."
                            : "No matching image class is currently available for this crop; expert verification is recommended.");
                    return m;
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns all translation strings for frontend i18n.
     */
    @GetMapping("/translations")
    public Map<String, Map<String, String>> getTranslations() {
        return translationService.getAllPhrases();
    }

    /**
     * Health check for PWA connectivity detection.
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> h = new LinkedHashMap<>();
        h.put("status", "UP");
        h.put("service", "FasalSathi");
        h.put("timestamp", System.currentTimeMillis());
        return h;
    }

    // ── Market Info (Harvest Time + Mandi Prices) ─────────────────────────

    /**
     * Returns combined harvest-time info and mandi prices for a single crop.
     */
    @GetMapping("/market-info/{cropName}")
    public CropMarketInfoDTO getMarketInfoForCrop(@PathVariable("cropName") String cropName) {
        HarvestInfoDTO harvest = harvestTimeService.getHarvestInfo(cropName);
        List<MandiPriceDTO> prices = mandiPriceService.getPrices(cropName);
        return new CropMarketInfoDTO(harvest, prices, Instant.now().toString());
    }

    /**
     * Returns combined harvest-time info and mandi prices for ALL crops.
     */
    @GetMapping("/market-info")
    public Map<String, Object> getAllMarketInfo() {
        List<CropMarketInfoDTO> items = new ArrayList<>();
        for (String crop : harvestTimeService.getAvailableCrops()) {
            HarvestInfoDTO harvest = harvestTimeService.getHarvestInfo(crop);
            List<MandiPriceDTO> prices = mandiPriceService.getPrices(crop);
            items.add(new CropMarketInfoDTO(harvest, prices, Instant.now().toString()));
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("crops", items);
        result.put("liveApiAvailable", mandiPriceService.isLiveApiAvailable());
        result.put("timestamp", Instant.now().toString());
        return result;
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}