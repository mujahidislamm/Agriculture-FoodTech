package com.example.dto;

/**
 * A single candidate diagnosis with its confidence and reasoning.
 */
public record DiagnosisDetailDTO(
        String diseaseName,
        double confidence,
        String explanation,
        boolean isTopPick) {
}
