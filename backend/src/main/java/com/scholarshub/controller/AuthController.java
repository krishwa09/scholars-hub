package com.scholarshub.controller;

import com.scholarshub.model.OtpToken;
import com.scholarshub.model.User;
import com.scholarshub.repo.UserRepository;
import com.scholarshub.service.OtpService;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints. Passwords are stored in plain text here to mirror
 * the demo frontend — swap in Spring Security + BCrypt for production.
 *
 * Sign-up and password reset are both verified by a one-time code emailed to the
 * address, so an account can only be created or recovered by someone who can
 * actually receive mail there.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final int MIN_PASSWORD = 6;

    private final UserRepository users;
    private final OtpService otp;

    /** Dev convenience: return the code in the response when email isn't set up. */
    @Value("${app.otp.expose-in-response:false}")
    private boolean exposeCode;

    public AuthController(UserRepository users, OtpService otp) {
        this.users = users;
        this.otp = otp;
    }

    private static Map<String, Object> fail(String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("ok", false);
        m.put("msg", msg);
        return m;
    }

    /** Adds the code to the response only in dev mode, so the flow is testable without email. */
    private Map<String, Object> issued(String email, String code) {
        Map<String, Object> m = new HashMap<>();
        m.put("ok", true);
        m.put("emailSent", otp.isEmailConfigured());
        m.put("msg", otp.isEmailConfigured()
                ? "We sent a 6-digit code to " + email + "."
                : "Email isn't configured on the server, so the code was written to the server log.");
        if (exposeCode && !otp.isEmailConfigured()) {
            m.put("devCode", code); // never included when SMTP is configured
        }
        return m;
    }

    /* ---------------- sign-up with OTP ---------------- */

    /** Step 1: validate the details and email a code. No account is created yet. */
    @PostMapping("/register/request")
    public Map<String, Object> registerRequest(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            return fail("Please fill all fields.");
        }
        if (!EMAIL.matcher(email).matches()) {
            return fail("Enter a valid email address.");
        }
        if (password.length() < MIN_PASSWORD) {
            return fail("Password must be at least " + MIN_PASSWORD + " characters.");
        }
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            return fail("Email already registered. Try logging in.");
        }

        String code = otp.issue(email, OtpToken.PURPOSE_REGISTER, name, password);
        return issued(email, code);
    }

    /** Step 2: check the code and only then create the account. */
    @PostMapping("/register/verify")
    public Map<String, Object> registerVerify(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String code = body.getOrDefault("code", "").trim();

        OtpToken token;
        try {
            token = otp.verify(email, OtpToken.PURPOSE_REGISTER, code);
        } catch (OtpService.OtpException e) {
            return fail(e.getMessage());
        }

        // Guard against a duplicate signup racing this verification.
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            return fail("Email already registered. Try logging in.");
        }

        User u = new User();
        u.setId("u_" + UUID.randomUUID().toString().substring(0, 8));
        u.setName(token.getName());
        u.setEmail(token.getEmail());
        u.setPassword(token.getPassword());
        u.setRole("STUDENT");
        u.setCreatedAt(Instant.now().toString());
        u.setLastLogin(Instant.now().toString());
        u.setBlocked(false);
        users.save(u);

        Map<String, Object> m = new HashMap<>();
        m.put("ok", true);
        m.put("user", u);
        return m;
    }

    /* ---------------- forgot password with OTP ---------------- */

    /** Step 1: email a reset code. Always reports success so emails can't be enumerated. */
    @PostMapping("/password/forgot")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        if (email.isEmpty() || !EMAIL.matcher(email).matches()) {
            return fail("Enter a valid email address.");
        }

        Optional<User> found = users.findByEmailIgnoreCase(email);
        if (found.isEmpty() || found.get().getBlocked()) {
            // Don't reveal whether the account exists.
            Map<String, Object> m = new HashMap<>();
            m.put("ok", true);
            m.put("emailSent", otp.isEmailConfigured());
            m.put("msg", "If an account exists for " + email + ", we've sent it a 6-digit code.");
            return m;
        }

        String code = otp.issue(email, OtpToken.PURPOSE_RESET, null, null);
        return issued(email, code);
    }

    /** Step 2: check the code and set the new password. */
    @PostMapping("/password/reset")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String code = body.getOrDefault("code", "").trim();
        String newPassword = body.getOrDefault("newPassword", "");

        if (newPassword.length() < MIN_PASSWORD) {
            return fail("Password must be at least " + MIN_PASSWORD + " characters.");
        }

        try {
            otp.verify(email, OtpToken.PURPOSE_RESET, code);
        } catch (OtpService.OtpException e) {
            return fail(e.getMessage());
        }

        Optional<User> found = users.findByEmailIgnoreCase(email);
        if (found.isEmpty()) {
            return fail("No account with that email.");
        }
        User u = found.get();
        u.setPassword(newPassword);
        users.save(u);

        Map<String, Object> m = new HashMap<>();
        m.put("ok", true);
        m.put("msg", "Password updated. You can log in now.");
        return m;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");
        Optional<User> found = users.findByEmailIgnoreCase(email);
        if (found.isEmpty()) {
            return Map.of("ok", false, "msg", "No account with that email.");
        }
        User u = found.get();
        if (!u.getPassword().equals(password)) {
            return Map.of("ok", false, "msg", "Incorrect password.");
        }
        if (u.getBlocked()) {
            return Map.of("ok", false, "msg", "This account is blocked. Contact the academy.");
        }
        u.setLastLogin(Instant.now().toString());
        users.save(u);
        return Map.of("ok", true, "role", u.getRole(), "user", u);
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");
        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            return Map.of("ok", false, "msg", "Please fill all fields.");
        }
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            return Map.of("ok", false, "msg", "Email already registered.");
        }
        User u = new User();
        u.setId("u_" + Long.toHexString(System.nanoTime()));
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole("STUDENT");
        u.setCreatedAt(Instant.now().toString());
        u.setLastLogin(Instant.now().toString());
        u.setBlocked(false);
        users.save(u);
        return Map.of("ok", true, "user", u);
    }
}
