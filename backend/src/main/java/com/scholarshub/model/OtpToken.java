package com.scholarshub.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * A one-time code emailed to a user. Used for two purposes:
 *  - REGISTER: holds the pending signup details until the code is verified,
 *              so no account exists until the email is proven.
 *  - RESET:    authorises a password reset for an existing account.
 * Codes are single-use, expire, and are attempt-limited.
 */
@Entity
@Table(name = "otp_tokens")
public class OtpToken {

    public static final String PURPOSE_REGISTER = "REGISTER";
    public static final String PURPOSE_RESET = "RESET";

    @Id
    private String id;

    private String email;
    private String code;
    private String purpose;

    /** Pending signup details — only set when purpose = REGISTER. */
    private String name;
    private String password;

    private Instant expiresAt;
    private int attempts = 0;
    private boolean consumed = false;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public boolean isConsumed() { return consumed; }
    public void setConsumed(boolean consumed) { this.consumed = consumed; }

    public boolean isExpired() { return Instant.now().isAfter(expiresAt); }
}
