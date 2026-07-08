package com.scholarshub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A student-submitted review/testimonial. Shown publicly only once APPROVED. */
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    private String id;

    private String userId;
    private String userEmail;
    private String name;
    private String role;       // e.g. "Class 12 · Commerce"

    @Column(length = 2000)
    private String text;

    private String status;     // PENDING | APPROVED
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
