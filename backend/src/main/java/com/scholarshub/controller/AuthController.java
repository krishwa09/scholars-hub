package com.scholarshub.controller;

import com.scholarshub.model.User;
import com.scholarshub.repo.UserRepository;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints. Passwords are stored in plain text here to mirror
 * the demo frontend — swap in Spring Security + BCrypt for production.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;

    public AuthController(UserRepository users) {
        this.users = users;
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
