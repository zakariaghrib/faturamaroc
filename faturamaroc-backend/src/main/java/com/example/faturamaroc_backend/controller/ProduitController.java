package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.Produit;
import com.example.faturamaroc_backend.repository.ProduitRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Contrôleur REST pour le catalogue d'articles/services avec taux de TVA marocain (20% par défaut).
 */
@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitRepository produitRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Produit>> getAllProduits() {
        return ResponseEntity.ok(produitRepository.findAll());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        return produitRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new EntityNotFoundException("Produit introuvable avec l'ID : " + id));
    }

    @GetMapping("/reference/{reference}")
    @Transactional(readOnly = true)
    public ResponseEntity<Produit> getProduitByReference(@PathVariable String reference) {
        return produitRepository.findByReference(reference)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new EntityNotFoundException("Aucun produit trouvé avec la référence : " + reference));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Produit> createProduit(@Valid @RequestBody Produit produit) {
        if (produit.getTauxTVA() == null) {
            produit.setTauxTVA(new BigDecimal("20.00")); // Norme TVA Maroc 20%
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(produitRepository.save(produit));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @Valid @RequestBody Produit produitDetails) {
        Produit existing = produitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produit introuvable avec l'ID : " + id));

        existing.setReference(produitDetails.getReference());
        existing.setDesignation(produitDetails.getDesignation());
        existing.setPrixUnitaireHT(produitDetails.getPrixUnitaireHT());
        existing.setTauxTVA(produitDetails.getTauxTVA() != null ? produitDetails.getTauxTVA() : new BigDecimal("20.00"));
        existing.setUnite(produitDetails.getUnite());

        return ResponseEntity.ok(produitRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        if (!produitRepository.existsById(id)) {
            throw new EntityNotFoundException("Produit introuvable avec l'ID : " + id);
        }
        produitRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
