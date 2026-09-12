package com.example.service;

import com.example.dto.DiagnosisDetailDTO;
import com.example.dto.PredictionResponseDTO;
import com.example.dto.TranslatedAdvisoryDTO;
import com.example.service.WBCropKnowledgeBase.DiseaseAdvisory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * West Bengal advisory engine. Produces explainable, location-aware,
 * crop-stage-aware advisories and clearly distinguishes
 * ADVISORY_SUPPORT from DEFINITIVE_DIAGNOSIS.
 */
@Service
public class AdvisoryService {

    private static final double DEFINITIVE_THRESHOLD = 0.70;
    private static final double ESCALATION_THRESHOLD = 0.50;
    private static final int TOP_K = 3;

    private final WBCropKnowledgeBase knowledgeBase;
    private final TranslationService translationService;

    public AdvisoryService(WBCropKnowledgeBase knowledgeBase,
                           TranslationService translationService) {
        this.knowledgeBase = knowledgeBase;
        this.translationService = translationService;
    }

    /**
     * Full advisory pipeline: predictions → explainable diagnosis → location-aware
     * next-actions → safety → translation → escalation decision.
     */
    public PredictionResponseDTO buildAdvisory(
            Map<String, Double> predictions,
            String cropType,
            String cropStage,
            String district,
            String observations,
            String weatherContext,
            String language) {

        if (predictions == null || predictions.isEmpty()) {
            throw new IllegalArgumentException("No predictions available");
        }

        String lang = (language != null && !language.isBlank()) ? language : "en";

        // ── Top-K candidates ────────────────────────────────────────
        List<Map.Entry<String, Double>> sorted = predictions.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(TOP_K)
                .toList();

        Map.Entry<String, Double> top = sorted.get(0);
        double confidence = top.getValue();
        String primaryClass = top.getKey();

        // ── Diagnosis type ──────────────────────────────────────────
        boolean isDefinitive = confidence >= DEFINITIVE_THRESHOLD;
        String diagnosisType = isDefinitive ? "DEFINITIVE_DIAGNOSIS" : "ADVISORY_SUPPORT";

        // ── Fetch disease advisory from knowledge base ──────────────
        DiseaseAdvisory advisory = knowledgeBase.getDiseaseAdvisory(primaryClass);

        // ── Build candidate list ────────────────────────────────────
        List<DiagnosisDetailDTO> candidates = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            Map.Entry<String, Double> entry = sorted.get(i);
            DiseaseAdvisory candAdvisory = knowledgeBase.getDiseaseAdvisory(entry.getKey());
            String candExplanation = candAdvisory != null
                    ? candAdvisory.description()
                    : "No detailed information available for this condition.";
            candidates.add(new DiagnosisDetailDTO(
                    candAdvisory != null ? candAdvisory.diseaseName() : entry.getKey(),
                    entry.getValue(),
                    candExplanation,
                    i == 0));
        }

        // ── Explanation ─────────────────────────────────────────────
        String diseaseName = advisory != null ? advisory.diseaseName() : primaryClass;
        String explanation = buildExplanation(advisory, confidence, cropType,
                cropStage, observations, isDefinitive);

        // ── Next actions ────────────────────────────────────────────
        List<String> nextActions = buildNextActions(advisory, cropStage, weatherContext);

        // ── Safety warnings ─────────────────────────────────────────
        List<String> safetyWarnings = buildSafetyWarnings(advisory);

        // ── Crop stage relevance ────────────────────────────────────
        String cropStageRelevance = buildCropStageRelevance(cropType, cropStage, diseaseName);

        // ── Escalation ──────────────────────────────────────────────
        boolean shouldEscalate = confidence < ESCALATION_THRESHOLD
                || (advisory != null && advisory.needsExpertConfirmation())
                || hasMixedSignals(sorted);
        String escalationInfo = buildEscalationInfo(shouldEscalate, district, confidence);

        // ── District context ────────────────────────────────────────
        String districtContext = knowledgeBase.getDistrictContext(district);

        // ── Weather integration ─────────────────────────────────────
        String weatherImpact = buildWeatherImpact(weatherContext, advisory);

        // ── Translation ─────────────────────────────────────────────
        TranslatedAdvisoryDTO translated = buildTranslation(
                lang, diseaseName, explanation, nextActions, safetyWarnings, escalationInfo);

        return new PredictionResponseDTO(
                diagnosisType,
                diseaseName,
                confidence,
                candidates,
                explanation,
                nextActions,
                safetyWarnings,
                weatherImpact,
                cropStageRelevance,
                shouldEscalate,
                escalationInfo,
                translated,
                districtContext);
    }

    // ── Private helpers ─────────────────────────────────────────────────

    private String buildExplanation(DiseaseAdvisory advisory, double confidence,
                                     String cropType, String cropStage,
                                     String observations, boolean isDefinitive) {
        StringBuilder sb = new StringBuilder();

        if (advisory == null) {
            sb.append("The model detected a possible condition but we don't have detailed advisory information for it. ");
            sb.append("Please consult your nearest KVK for expert guidance.");
            return sb.toString();
        }

        if ("Healthy".equals(advisory.diseaseName())) {
            sb.append("Good news! No disease symptoms were detected in the leaf image. ");
            sb.append("The plant appears healthy. Continue regular monitoring and maintain good agricultural practices.");
            return sb.toString();
        }

        if (isDefinitive) {
            sb.append(String.format("With %.0f%% confidence, the image shows signs of %s. ",
                    confidence * 100, advisory.diseaseName()));
        } else {
            sb.append(String.format("The image may indicate %s (%.0f%% confidence). ",
                    advisory.diseaseName(), confidence * 100));
            sb.append("This is advisory guidance — please verify with an expert before applying chemical treatments. ");
        }

        sb.append(advisory.description()).append(" ");

        if (advisory.causeType() != null && !"None".equals(advisory.causeType())) {
            sb.append("This is caused by ").append(advisory.causeType()).append(". ");
        }

        if (advisory.symptoms() != null && !advisory.symptoms().isEmpty()) {
            sb.append("Key symptoms to look for: ").append(String.join(", ", advisory.symptoms())).append(". ");
        }

        if (cropStage != null && !cropStage.isBlank()) {
            sb.append(String.format("At the %s stage, ", cropStage));
            sb.append("early intervention is critical to prevent yield loss. ");
        }

        if (observations != null && !observations.isBlank()) {
            sb.append("Your observation (\"").append(observations).append("\") ");
            sb.append("has been noted and factored into this advisory. ");
        }

        return sb.toString();
    }

    private List<String> buildNextActions(DiseaseAdvisory advisory, String cropStage,
                                           String weatherContext) {
        List<String> actions = new ArrayList<>();

        if (advisory == null) {
            actions.add("Take a clear photo and consult your nearest Krishi Vigyan Kendra (KVK).");
            return actions;
        }

        if ("Healthy".equals(advisory.diseaseName())) {
            actions.addAll(advisory.preventiveMeasures());
            return actions;
        }

        // Step 1: Immediate organic measures
        actions.add("STEP 1 — Immediate organic measures:");
        actions.addAll(advisory.organicTreatment());

        // Step 2: Chemical treatment if organic is not enough
        if (advisory.chemicalTreatment() != null && !advisory.chemicalTreatment().isEmpty()) {
            actions.add("STEP 2 — Chemical treatment (if organic measures fail after 3-5 days):");
            actions.addAll(advisory.chemicalTreatment());
            if (advisory.dosage() != null) {
                actions.add("Dosage: " + advisory.dosage());
            }
        }

        // Step 3: Prevention for future
        actions.add("STEP 3 — Preventive measures for future:");
        actions.addAll(advisory.preventiveMeasures());

        // Weather-aware advice
        if (weatherContext != null && weatherContext.contains("humidity")) {
            actions.add("⚠ Current weather: " + weatherContext
                    + " — humid conditions can accelerate disease spread. Act quickly.");
        }

        return actions;
    }

    private List<String> buildSafetyWarnings(DiseaseAdvisory advisory) {
        List<String> warnings = new ArrayList<>();
        if (advisory == null || "None".equals(advisory.causeType())) return warnings;

        if (advisory.safetyPPE() != null && !"N/A".equals(advisory.safetyPPE())) {
            warnings.add("🧤 PPE: " + advisory.safetyPPE());
        }

        if (advisory.preHarvestIntervalDays() > 0) {
            warnings.add("⏱ Pre-harvest interval: Do not harvest for "
                    + advisory.preHarvestIntervalDays()
                    + " days after spraying.");
        }

        warnings.add("🚿 Always wash hands and face thoroughly after spraying.");
        warnings.add("🍎 Wash all harvested produce before consumption.");
        warnings.add("🧒 Keep children and animals away during spraying.");
        warnings.add("💨 Spray in early morning or late evening to avoid drift and heat.");

        return warnings;
    }

    private String buildCropStageRelevance(String cropType, String cropStage, String diseaseName) {
        if (cropStage == null || cropStage.isBlank()) {
            return "Crop stage not specified. Providing general advice.";
        }

        WBCropKnowledgeBase.CropInfo crop = knowledgeBase.getCrop(cropType);
        if (crop == null) {
            return String.format("At the %s stage, monitor closely and follow the recommended actions.", cropStage);
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Your %s is at the %s stage. ", cropType, cropStage));

        if (crop.commonDiseases().stream().anyMatch(d -> diseaseName.toLowerCase().contains(d.toLowerCase().split(" ")[0]))) {
            sb.append("This disease is commonly seen in ").append(cropType).append(" in West Bengal. ");
        }

        switch (cropStage) {
            case "seedling" -> sb.append("At seedling stage, the plant is most vulnerable. Act immediately to protect young growth.");
            case "vegetative", "tillering" -> sb.append("During vegetative growth, disease can significantly reduce plant vigour and future yield.");
            case "flowering" -> sb.append("⚠ At flowering stage, be careful with chemical sprays — avoid harming pollinators. Prefer organic treatment.");
            case "fruiting", "grain-filling", "tuber-bulking" -> sb.append("At this stage, disease directly impacts yield. Treat promptly but observe pre-harvest intervals.");
            case "harvest", "maturation" -> sb.append("Near harvest — only apply treatments with short pre-harvest intervals. Focus on post-harvest measures.");
            default -> sb.append("Follow the recommended treatment timeline for best results.");
        }

        return sb.toString();
    }

    private boolean hasMixedSignals(List<Map.Entry<String, Double>> sorted) {
        if (sorted.size() < 2) return false;
        double diff = sorted.get(0).getValue() - sorted.get(1).getValue();
        return diff < 0.15; // Top two are close → uncertain
    }

    private String buildEscalationInfo(boolean shouldEscalate, String district, double confidence) {
        if (!shouldEscalate) return null;

        StringBuilder sb = new StringBuilder();
        sb.append("⚠ Expert consultation recommended. ");

        if (confidence < ESCALATION_THRESHOLD) {
            sb.append(String.format("The model's confidence is low (%.0f%%). ", confidence * 100));
            sb.append("Multiple conditions could explain these symptoms. ");
        }

        sb.append("Please contact your nearest Krishi Vigyan Kendra (KVK): ");

        WBCropKnowledgeBase.DistrictInfo districtInfo = knowledgeBase.getDistrict(district);
        if (districtInfo != null) {
            sb.append(String.format("\n📞 %s: %s\n📍 %s",
                    districtInfo.kvkName(), districtInfo.kvkPhone(), districtInfo.kvkAddress()));
        } else {
            sb.append("\nContact your nearest KVK or call Kisan Call Centre: 1800-180-1551 (toll-free).");
        }

        return sb.toString();
    }

    private String buildWeatherImpact(String weatherContext, DiseaseAdvisory advisory) {
        if (weatherContext == null || "Weather unavailable".equals(weatherContext)) {
            String season = knowledgeBase.getCurrentSeason();
            return "Live weather data unavailable. Current season: " + season
                    + ". Plan treatments according to seasonal patterns.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Current conditions: ").append(weatherContext).append(". ");

        if (advisory != null && !"None".equals(advisory.causeType())) {
            if (advisory.causeType().contains("Fungal")) {
                sb.append("Fungal diseases spread faster in humid and wet conditions. ");
                if (weatherContext.contains("humidity") && weatherContext.matches(".*humidity:\\s*[7-9]\\d+.*")) {
                    sb.append("⚠ High humidity detected — apply fungicide promptly and ensure drainage.");
                }
            } else if (advisory.causeType().contains("Bacterial")) {
                sb.append("Bacterial infections worsen with rain splash and wet foliage. Avoid overhead watering.");
            } else if (advisory.causeType().contains("Viral")) {
                sb.append("Viral diseases are spread by insect vectors. Monitor whitefly/aphid populations.");
            }
        }

        return sb.toString();
    }

    private TranslatedAdvisoryDTO buildTranslation(String lang, String diseaseName,
                                                     String explanation, List<String> nextActions,
                                                     List<String> safetyWarnings, String escalationInfo) {
        if ("en".equals(lang)) return null; // No translation needed

        return new TranslatedAdvisoryDTO(
                lang,
                translationService.translateDiseaseName(diseaseName, lang),
                explanation, // Keep explanation in English for now (complex sentences)
                translationService.translateActions(nextActions, lang),
                translationService.translateActions(safetyWarnings, lang),
                escalationInfo != null
                        ? translationService.translate("Contact Expert", lang) + ": " + escalationInfo
                        : null);
    }
}