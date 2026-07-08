package com.scholarshub.repo;

import com.scholarshub.model.Pdf;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PdfRepository extends JpaRepository<Pdf, String> {
}
