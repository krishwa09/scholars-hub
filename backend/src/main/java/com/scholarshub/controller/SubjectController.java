package com.scholarshub.controller;

import com.scholarshub.model.Subject;
import com.scholarshub.repo.SubjectRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectRepository repo;

    public SubjectController(SubjectRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Subject> list() {
        return repo.findAll();
    }

    /** Replace the whole collection (the admin portal saves the full list). */
    @PutMapping
    @Transactional
    public List<Subject> replaceAll(@RequestBody List<Subject> subjects) {
        repo.deleteAll();
        return repo.saveAll(subjects);
    }

    @PostMapping
    public Subject create(@RequestBody Subject subject) {
        return repo.save(subject);
    }
}
