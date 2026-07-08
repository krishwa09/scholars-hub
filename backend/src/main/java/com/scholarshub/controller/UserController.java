package com.scholarshub.controller;

import com.scholarshub.model.User;
import com.scholarshub.repo.UserRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<User> list() {
        return repo.findAll();
    }

    @PutMapping
    @Transactional
    public List<User> replaceAll(@RequestBody List<User> users) {
        repo.deleteAll();
        return repo.saveAll(users);
    }
}
