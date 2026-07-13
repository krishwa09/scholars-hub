package com.scholarshub.repo;

import com.scholarshub.model.OtpToken;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {

    /** The most recent still-usable code for this email + purpose. */
    Optional<OtpToken> findFirstByEmailIgnoreCaseAndPurposeAndConsumedFalseOrderByExpiresAtDesc(
            String email, String purpose);

    /** Existing codes for this email + purpose, so a new request invalidates the old ones. */
    List<OtpToken> findByEmailIgnoreCaseAndPurpose(String email, String purpose);
}
