package com.example.faturamaroc_backend.repository;

import com.example.faturamaroc_backend.model.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    List<Paiement> findByDocumentId(Long documentId);
}
