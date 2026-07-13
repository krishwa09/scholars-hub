package com.scholarshub.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Friendly landing at "/" so that opening the API host in a browser explains
 * what this is instead of showing the default Whitelabel 404.
 */
@RestController
public class RootController {

    @Value("${app.website-url:http://localhost:5173}")
    private String websiteUrl;

    @GetMapping("/")
    public Map<String, Object> index() {
        return Map.of(
            "service", "Scholars Hub API",
            "status", "ok",
            "message", "This is the backend API. The website is at " + websiteUrl,
            "endpoints", List.of(
                "/api/settings", "/api/subjects", "/api/pdfs",
                "/api/users", "/api/payments",
                "/api/auth/login", "/api/auth/register"
            )
        );
    }

    @GetMapping("/api")
    public Map<String, Object> api() {
        return index();
    }
}
