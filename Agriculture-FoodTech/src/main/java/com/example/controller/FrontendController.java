package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    @GetMapping({"/", "/diagnose", "/about", "/profile"})
    public String appRoutes() {
        return "forward:/index.html";
    }
}