package com.scholarshub.service;

import com.scholarshub.model.OtpToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the OTP by email when SMTP is configured (MAIL_HOST etc.).
 * When it isn't, the code is written to the server log instead, so the flow is
 * still usable in development without any email account.
 */
@Service
public class MailService {
    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:no-reply@scholarshub.local}")
    private String from;

    @Value("${app.otp.ttl-minutes:10}")
    private int ttlMinutes;

    public MailService(ObjectProvider<JavaMailSender> mailSender) {
        this.mailSender = mailSender;
    }

    public boolean isConfigured() {
        return mailHost != null && !mailHost.isBlank();
    }

    public void sendOtp(String to, String code, String purpose) {
        boolean register = OtpToken.PURPOSE_REGISTER.equals(purpose);
        String subject = register
                ? "Your Scholars Hub sign-up code"
                : "Your Scholars Hub password reset code";
        String body = "Your one-time verification code is:\n\n    " + code + "\n\n"
                + "It expires in " + ttlMinutes + " minutes and can only be used once.\n\n"
                + (register ? "Enter it to finish creating your account."
                            : "Enter it to reset your password.")
                + "\n\nIf you didn't request this, you can safely ignore this email.";

        JavaMailSender sender = mailSender.getIfAvailable();
        if (!isConfigured() || sender == null) {
            log.warn("""

                    ==========================================================
                     EMAIL NOT CONFIGURED — one-time code (development only)
                     to      : {}
                     purpose : {}
                     CODE    : {}
                     Set MAIL_HOST/MAIL_USERNAME/MAIL_PASSWORD to send real mail.
                    ==========================================================
                    """, to, purpose, code);
            return;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.info("OTP email sent to {} ({})", to, purpose);
        } catch (Exception e) {
            // Never fail the request because mail is down; log the code so the
            // user isn't locked out, and surface the problem in the logs.
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            log.warn("Fallback — one-time code for {} ({}): {}", to, purpose, code);
        }
    }
}
