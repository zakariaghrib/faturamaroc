package com.example.faturamaroc_backend.repository;

import com.example.faturamaroc_backend.model.LigneDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LigneDocumentRepository extends JpaRepository<LigneDocument, Long> {
    List<LigneDocument> findByDocumentId(Long documentId);
}
