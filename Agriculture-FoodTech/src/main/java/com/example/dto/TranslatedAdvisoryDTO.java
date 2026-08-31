package com.example.dto;

import java.util.List;

/**
 * Advisory content translated into the farmer's preferred language.
 */
public record TranslatedAdvisoryDTO(
        String language,
        String diagnosisLabel,
        String explanation,
        List<String> nextActions,
        List<String> safetyWarnings,
        String escalationInfo) {
}
