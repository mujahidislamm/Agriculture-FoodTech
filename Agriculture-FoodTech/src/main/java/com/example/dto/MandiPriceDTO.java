package com.example.dto;

import java.util.List;

/**
 * Market price data for a single commodity at a specific mandi (market).
 * Populated from the data.gov.in Open Government Data API or built-in fallback.
 */
public record MandiPriceDTO(
        String commodity,
        String market,
        String district,
        String state,
        double minPrice,
        double maxPrice,
        double modalPrice,
        String unit,
        String arrivalDate,
        boolean isLive
) {
    /**
     * Convenience factory for fallback/representative data.
     */
    public static MandiPriceDTO fallback(String commodity, String market, String district,
                                          double min, double max, double modal) {
        return new MandiPriceDTO(commodity, market, district, "West Bengal",
                min, max, modal, "₹/Quintal", "N/A (representative)", false);
    }
}
