package com.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class PredictionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime createdAt;
    private String cropType;
    private String cropStage;
    private String district;
    private Double latitude;
    private Double longitude;
    @Column(length = 1000)
    private String farmerObservation;
    private String topDisease;
    private Double confidence;
    private String diagnosisType;
    private Boolean isEscalated;
    private String language;

    protected PredictionLog() {
    }

    public PredictionLog(String cropType, String cropStage, String district,
                         Double latitude, Double longitude,
                         String farmerObservation, String topDisease,
                         Double confidence, String diagnosisType,
                         Boolean isEscalated, String language) {
        this.createdAt = LocalDateTime.now();
        this.cropType = cropType;
        this.cropStage = cropStage;
        this.district = district;
        this.latitude = latitude;
        this.longitude = longitude;
        this.farmerObservation = farmerObservation;
        this.topDisease = topDisease;
        this.confidence = confidence;
        this.diagnosisType = diagnosisType;
        this.isEscalated = isEscalated;
        this.language = language;
    }

    public Long getId() { return id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCropType() { return cropType; }
    public String getCropStage() { return cropStage; }
    public String getDistrict() { return district; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getFarmerObservation() { return farmerObservation; }
    public String getTopDisease() { return topDisease; }
    public Double getConfidence() { return confidence; }
    public String getDiagnosisType() { return diagnosisType; }
    public Boolean getIsEscalated() { return isEscalated; }
    public String getLanguage() { return language; }
}