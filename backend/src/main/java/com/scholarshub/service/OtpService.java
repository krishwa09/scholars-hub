package com.scholarshub.service;

import com.scholarshub.model.OtpToken;
import com.scholarshub.repo.OtpTokenRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OtpService {

    /** Thrown when a code is wrong, expired, used, or over the attempt limit. */
    public static class OtpException extends RuntimeException {
        public OtpException(String message) { super(message); }
    }

    private final OtpTokenRepository repo;
    private final MailService mail;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.ttl-minutes:10}")
    private int ttlMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    public OtpService(OtpTokenRepository repo, MailService mail) {
        this.repo = repo;
        this.mail = mail;
    }

    /**
     * Issue a code for this email + purpose, invalidating any earlier ones,
     * and email it. Returns the code so dev mode can surface it.
     */
    @Transactional
    public String issue(String email, String purpose, String name, String password) {
        repo.deleteAll(repo.findByEmailIgnoreCaseAndPurpose(email, purpose));

        String code = String.format("%06d", random.nextInt(1_000_000));
        OtpToken token = new OtpToken();
        token.setId(UUID.randomUUID().toString());
        token.setEmail(email);
        token.setCode(code);
        token.setPurpose(purpose);
        token.setName(name);
        token.setPassword(password);
        token.setExpiresAt(Instant.now().plus(ttlMinutes, ChronoUnit.MINUTES));
        repo.save(token);

        mail.sendOtp(email, code, purpose);
        return code;
    }

    /**
     * Check a submitted code. On success the token is consumed and returned;
     * on failure the attempt is recorded and an OtpException is thrown.
     */
    @Transactional
    public OtpToken verify(String email, String purpose, String code) {
        OtpToken token = repo
                .findFirstByEmailIgnoreCaseAndPurposeAndConsumedFalseOrderByExpiresAtDesc(email, purpose)
                .orElseThrow(() -> new OtpException("No code was requested for this email. Request a new one."));

        if (token.isExpired()) {
            throw new OtpException("That code has expired. Request a new one.");
        }
        if (token.getAttempts() >= maxAttempts) {
            throw new OtpException("Too many incorrect attempts. Request a new code.");
        }
        if (!token.getCode().equals(code == null ? "" : code.trim())) {
            token.setAttempts(token.getAttempts() + 1);
            repo.save(token);
            int left = maxAttempts - token.getAttempts();
            throw new OtpException("Incorrect code. " + Math.max(left, 0) + " attempt(s) left.");
        }

        token.setConsumed(true);
        repo.save(token);
        return token;
    }

    /** True when SMTP isn't set up, so callers can tell the user to check the logs. */
    public boolean isEmailConfigured() {
        return mail.isConfigured();
    }
}
