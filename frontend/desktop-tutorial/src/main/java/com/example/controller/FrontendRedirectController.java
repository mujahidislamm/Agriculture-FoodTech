package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the single React interface from the Spring Boot application. Known
 * frontend routes resolve to the React entry page instead of a legacy UI.
 */
@Controller
public class FrontendRedirectController {

    @GetMapping({"/", "/diagnose", "/about", "/market-info.html"})
    public String openFrontend() {
        return "forward:/index.html";
    }
}
