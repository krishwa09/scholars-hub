package com.scholarshub.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.scholarshub.model.SiteSettings;
import com.scholarshub.repo.SiteSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final SiteSettingsRepository repo;

    public SettingsController(SiteSettingsRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<JsonNode> get() {
        return repo.findById(SiteSettings.SINGLETON_ID)
                .map(SiteSettings::getData)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    public JsonNode save(@RequestBody JsonNode body) {
        SiteSettings settings = repo.findById(SiteSettings.SINGLETON_ID)
                .orElseGet(SiteSettings::new);
        settings.setId(SiteSettings.SINGLETON_ID);
        settings.setData(body);
        return repo.save(settings).getData();
    }
}
