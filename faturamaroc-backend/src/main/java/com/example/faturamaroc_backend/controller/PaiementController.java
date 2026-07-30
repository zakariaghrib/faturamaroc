package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.Paiement;
import com.example.faturamaroc_backend.service.PaiementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour l'enregistrement et le suivi des règlements marocains (Chèques, LCN, Virements, Espèces).
 */
@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    @GetMapping("/document/{documentId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Paiement>> getPaiementsByDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(paiementService.getPaiementsByDocumentId(documentId));
    }

    @PostMapping("/document/{documentId}")
    public ResponseEntity<Paiement> createPaiement(@PathVariable Long documentId, @Valid @RequestBody Paiement paiement) {
        Paiement savedPaiement = paiementService.createPaiement(documentId, paiement);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPaiement);
    }
}
