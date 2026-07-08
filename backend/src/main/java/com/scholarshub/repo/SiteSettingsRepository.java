package com.scholarshub.repo;

import com.scholarshub.model.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, String> {
}
