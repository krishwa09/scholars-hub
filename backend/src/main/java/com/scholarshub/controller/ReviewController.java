package com.scholarshub.controller;

import com.scholarshub.model.Review;
import com.scholarshub.repo.ReviewRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewRepository repo;

    public ReviewController(ReviewRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Review> list() {
        return repo.findAll();
    }

    @PutMapping
    @Transactional
    public List<Review> replaceAll(@RequestBody List<Review> reviews) {
        repo.deleteAll();
        return repo.saveAll(reviews);
    }

    /** A student submitting a single review (always starts PENDING). */
    @PostMapping
    public Review create(@RequestBody Review review) {
        review.setStatus("PENDING");
        return repo.save(review);
    }
}
