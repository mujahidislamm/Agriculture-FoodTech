package com.example.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class WeatherService {

    private final RestClient restClient;
    private final String apiKey;

    public WeatherService(RestClient.Builder builder,
                          @Value("${weather.api-key:}") String apiKey,
                          @Value("${weather.base-url:https://api.openweathermap.org/data/2.5}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public String getWeatherContext(Double latitude, Double longitude) {
        if (latitude == null || longitude == null || apiKey.isBlank()) {
            return "Weather unavailable";
        }
        Map<?, ?> response = restClient.get().uri(uriBuilder -> uriBuilder
                        .path("/weather")
                        .queryParam("lat", latitude)
                        .queryParam("lon", longitude)
                        .queryParam("appid", apiKey)
                        .queryParam("units", "metric")
                        .build())
                .retrieve().body(Map.class);
        if (response == null) {
            return "Weather unavailable";
        }
        Map<?, ?> main = (Map<?, ?>) response.get("main");
        if (main == null) {
            return "Weather unavailable";
        }
        return "Temperature: " + main.get("temp") + " C, relative humidity: "
                + main.get("humidity") + "%";
    }
}