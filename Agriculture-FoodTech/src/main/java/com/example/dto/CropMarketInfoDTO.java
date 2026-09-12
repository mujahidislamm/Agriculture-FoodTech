package com.example.dto;

import java.util.List;

/**
 * Combined response containing harvest calendar information and
 * live/fallback mandi prices for a specific crop.
 */
public record CropMarketInfoDTO(
        HarvestInfoDTO harvestInfo,
        List<MandiPriceDTO> mandiPrices,
        String lastUpdated
) {}
