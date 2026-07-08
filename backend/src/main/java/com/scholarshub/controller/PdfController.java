package com.scholarshub.controller;

import com.scholarshub.model.Pdf;
import com.scholarshub.repo.PdfRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pdfs")
public class PdfController {
    private final PdfRepository repo;

    public PdfController(PdfRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Pdf> list() {
        return repo.findAll();
    }

    @PutMapping
    @Transactional
    public List<Pdf> replaceAll(@RequestBody List<Pdf> pdfs) {
        repo.deleteAll();
        return repo.saveAll(pdfs);
    }

    @PostMapping
    public Pdf create(@RequestBody Pdf pdf) {
        return repo.save(pdf);
    }
}
