package com.scholarshub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** A chapter/unit inside a subject. Stored inside the subject's collection table. */
@Embeddable
public class Chapter {
    private String id;
    @Column(length = 300)
    private String title;

    public Chapter() {}

    public Chapter(String id, String title) {
        this.id = id;
        this.title = title;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
