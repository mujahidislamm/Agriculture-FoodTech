package com.example.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Keeps the backend URL from serving the retired static interface. The React
 * frontend started by run-app.bat is the single supported user interface.
 */
@Controller
public class FrontendRedirectController {

    private final String frontendUrl;

    public FrontendRedirectController(
            @Value("${app.frontend-url:http://localhost:4173}") String frontendUrl) {
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @GetMapping({"/", "/index.html", "/market-info.html"})
    public RedirectView openFrontend() {
        return new RedirectView(frontendUrl + "/");
    }
}
