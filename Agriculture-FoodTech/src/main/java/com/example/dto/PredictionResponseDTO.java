package com.example.dto;

import java.util.List;

/**
 * Full advisory response returned by the /diagnose endpoint.
 * Clearly distinguishes ADVISORY_SUPPORT from DEFINITIVE_DIAGNOSIS.
 */
public record PredictionResponseDTO(
        /* "DEFINITIVE_DIAGNOSIS" (≥70% confidence) or "ADVISORY_SUPPORT" (<70%) */
        String diagnosisType,
        /* Primary diagnosis label */
        String primaryDiagnosis,
        /* Confidence as 0.0–1.0 */
        double confidence,
        /* Top 3 candidate diagnoses with individual confidence and explanation */
        List<DiagnosisDetailDTO> candidates,
        /* Human-readable explanation of why this diagnosis was chosen */
        String explanation,
        /* Ordered next-action steps the farmer should take */
        List<String> nextActions,
        /* Safety warnings: pesticide dosage, PPE, pre-harvest interval */
        List<String> safetyWarnings,
        /* Weather context and its impact on the detected stress */
        String weatherContext,
        /* How the current crop stage relates to the diagnosis */
        String cropStageRelevance,
        /* Whether the farmer should consult an expert */
        boolean escalateToExpert,
        /* Expert escalation details: reason + nearest KVK contact */
        String escalationInfo,
        /* Full advisory translated into the requested language */
        TranslatedAdvisoryDTO translatedAdvisory,
        /* District-specific context (soil, common issues, season) */
        String districtContext) {
}