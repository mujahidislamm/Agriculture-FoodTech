package com.example.dto;

import java.util.List;

/**
 * Harvest timing and readiness information for a specific crop,
 * tailored to West Bengal's agro-climatic conditions.
 */
public record HarvestInfoDTO(
        String crop,
        String sowingWindow,
        String harvestWindow,
        String durationDays,
        String season,
        List<String> bestHarvestIndicators,
        String currentRelevance
) {}
