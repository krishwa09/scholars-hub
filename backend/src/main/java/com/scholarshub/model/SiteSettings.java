package com.scholarshub.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Singleton row holding the whole site-settings document (identity, hero,
 * teacher, contact, testimonials). Stored as JSON because it is edited and read
 * as one blob by the admin portal.
 */
@Entity
@Table(name = "site_settings")
public class SiteSettings {
    public static final String SINGLETON_ID = "main";

    @Id
    private String id = SINGLETON_ID;

    // Whole settings document as JSON text. Large VARCHAR is portable across H2 and Postgres.
    @Column(length = 10_485_760)
    @Convert(converter = JsonNodeConverter.class)
    private JsonNode data;

    public SiteSettings() {}

    public SiteSettings(JsonNode data) {
        this.data = data;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public JsonNode getData() { return data; }
    public void setData(JsonNode data) { this.data = data; }
}
