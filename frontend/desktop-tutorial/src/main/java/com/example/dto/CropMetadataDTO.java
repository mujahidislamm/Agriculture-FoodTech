package com.example.dto;

/**
 * Input metadata sent alongside a crop leaf image.
 *
 * @param cropType       e.g. "Rice", "Potato", "Jute"
 * @param cropStage      one of: seedling, vegetative, flowering, fruiting, harvest
 * @param district       West Bengal district name, e.g. "Murshidabad"
 * @param latitude       GPS latitude (optional, auto-detected on phone)
 * @param longitude      GPS longitude (optional, auto-detected on phone)
 * @param observations   free-text farmer observations, e.g. "pata holud hoye jachhe"
 * @param language       preferred language: "bn" (Bengali), "hi" (Hindi), "en" (English)
 */
public record CropMetadataDTO(
        String cropType,
        String cropStage,
        String district,
        Double latitude,
        Double longitude,
        String observations,
        String language) {
}