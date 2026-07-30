package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.Societe;
import com.example.faturamaroc_backend.service.SocieteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la gestion des informations légales et fiscales de l'entreprise marocaine.
 */
@RestController
@RequestMapping("/api/societe")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SocieteController {

    private final SocieteService societeService;

    @GetMapping
    public ResponseEntity<Societe> getSocietePrincipale() {
        return ResponseEntity.ok(societeService.getSocietePrincipale());
    }

    @PutMapping
    public ResponseEntity<Societe> updateSociete(@Valid @RequestBody Societe societe) {
        return ResponseEntity.ok(societeService.updateSociete(societe));
    }
}
