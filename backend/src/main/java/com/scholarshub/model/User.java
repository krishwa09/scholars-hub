package com.scholarshub.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;
    private String role;        // ADMIN | STUDENT
    private String createdAt;
    private String lastLogin;
    private boolean blocked = false;

    /** IDs of PDFs this user has unlocked. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_purchases", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "pdf_id")
    private List<String> purchases = new ArrayList<>();

    /** IDs of this user's payment records. Serialized as "payments" to match the frontend. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_payment_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "payment_id")
    private List<String> paymentIds = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getLastLogin() { return lastLogin; }
    public void setLastLogin(String lastLogin) { this.lastLogin = lastLogin; }

    public boolean getBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }

    public List<String> getPurchases() { return purchases; }
    public void setPurchases(List<String> purchases) {
        this.purchases = purchases == null ? new ArrayList<>() : purchases;
    }

    @JsonProperty("payments")
    public List<String> getPaymentIds() { return paymentIds; }

    @JsonProperty("payments")
    public void setPaymentIds(List<String> paymentIds) {
        this.paymentIds = paymentIds == null ? new ArrayList<>() : paymentIds;
    }
}
