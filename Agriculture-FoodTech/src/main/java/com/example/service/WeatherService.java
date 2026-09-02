package com.example.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class WeatherService {

    private final RestClient restClient;
    private final RestClient openMeteoClient;
    private final String apiKey;

    public WeatherService(RestClient.Builder builder,
                          @Value("${weather.api-key:}") String apiKey,
                          @Value("${weather.base-url:https://api.openweathermap.org/data/2.5}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.openMeteoClient = builder.baseUrl("https://api.open-meteo.com/v1").build();
        this.apiKey = apiKey;
    }

    public Map<String, Object> getDistrictWeather(Double latitude, Double longitude) {
        Map<String, Object> result = new HashMap<>();
        result.put("temperatureC", null);
        result.put("humidityPercent", null);
        result.put("rainMm", null);
        result.put("windKph", null);
        result.put("condition", "Weather data unavailable");
        result.put("forecast", new ArrayList<>());

        if (latitude == null || longitude == null) return result;

        try {
            Map<?, ?> response = openMeteoClient.get().uri(uriBuilder -> uriBuilder
                    .path("/forecast")
                    .queryParam("latitude", latitude)
                    .queryParam("longitude", longitude)
                    .queryParam("current", "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code")
                    .queryParam("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code")
                    .queryParam("forecast_days", 4)
                    .queryParam("timezone", "Asia/Kolkata")
                    .build())
                    .retrieve().body(Map.class);
            Map<?, ?> current = response == null ? null : (Map<?, ?>) response.get("current");
            Map<?, ?> daily = response == null ? null : (Map<?, ?>) response.get("daily");
            if (current == null || daily == null) return result;

            result.put("temperatureC", current.get("temperature_2m"));
            result.put("humidityPercent", current.get("relative_humidity_2m"));
            result.put("rainMm", current.get("precipitation"));
            result.put("windKph", current.get("wind_speed_10m"));
            result.put("condition", weatherCode(current.get("weather_code")));

            List<?> dates = (List<?>) daily.get("time");
            List<?> highs = (List<?>) daily.get("temperature_2m_max");
            List<?> lows = (List<?>) daily.get("temperature_2m_min");
            List<?> rain = (List<?>) daily.get("precipitation_sum");
            List<?> codes = (List<?>) daily.get("weather_code");
            List<Map<String, Object>> forecast = new ArrayList<>();
            for (int i = 1; i < dates.size(); i++) {
                Map<String, Object> day = new HashMap<>();
                day.put("date", dates.get(i));
                day.put("highC", highs.get(i));
                day.put("lowC", lows.get(i));
                day.put("rainMm", rain.get(i));
                day.put("condition", weatherCode(codes.get(i)));
                forecast.add(day);
            }
            result.put("forecast", forecast);
        } catch (Exception ignored) {
            // Keep the stable fallback response when the public service is unavailable.
        }
        return result;
    }

    private String weatherCode(Object code) {
        int value = code instanceof Number ? ((Number) code).intValue() : -1;
        if (value == 0) return "Clear sky";
        if (value <= 3) return "Partly cloudy";
        if (value <= 48) return "Foggy";
        if (value <= 67 || value >= 80 && value <= 82) return "Rain showers";
        if (value <= 77) return "Snow or sleet";
        if (value >= 95) return "Thunderstorm";
        return "Variable conditions";
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