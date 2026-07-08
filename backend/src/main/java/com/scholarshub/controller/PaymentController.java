package com.scholarshub.controller;

import com.scholarshub.model.Payment;
import com.scholarshub.repo.PaymentRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentRepository repo;

    public PaymentController(PaymentRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Payment> list() {
        return repo.findAll();
    }

    @PutMapping
    @Transactional
    public List<Payment> replaceAll(@RequestBody List<Payment> payments) {
        repo.deleteAll();
        return repo.saveAll(payments);
    }
}
