package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Serves the single React interface from the Spring Boot application. Known
 * frontend routes resolve to the React entry page instead of a legacy UI.
 */
@Controller
public class FrontendRedirectController {

    @GetMapping({"/", "/diagnose", "/tools", "/about", "/profile", "/market-info.html"})
    public String openFrontend(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        return "forward:/index.html";
    }
}
