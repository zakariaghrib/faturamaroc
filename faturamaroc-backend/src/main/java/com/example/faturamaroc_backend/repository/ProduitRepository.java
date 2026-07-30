package com.example.faturamaroc_backend.repository;

import com.example.faturamaroc_backend.model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    Optional<Produit> findByReference(String reference);
    boolean existsByReference(String reference);
}
