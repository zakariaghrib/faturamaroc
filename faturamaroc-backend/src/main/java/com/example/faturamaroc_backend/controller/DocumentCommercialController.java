package com.example.faturamaroc_backend.controller;

import com.example.faturamaroc_backend.model.DocumentCommercial;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.repository.DocumentCommercialRepository;
import com.example.faturamaroc_backend.service.DocumentCommercialService;
import com.example.faturamaroc_backend.service.PdfGenerationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des Devis & Factures marocaines :
 * - Calcul automatique HT/TVA/TTC en arrière-plan
 * - Conversion 1-clic Devis -> Facture via le endpoint /convert
 * - Numérotation légale (FAC-YYYY-XXXX / DEV-YYYY-XXXX)
 */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentCommercialController {

    private final DocumentCommercialService documentService;
    private final DocumentCommercialRepository documentRepository;
    private final PdfGenerationService pdfGenerationService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<DocumentCommercial>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<DocumentCommercial> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @GetMapping("/type/{type}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<DocumentCommercial>> getDocumentsByType(@PathVariable TypeDocument type) {
        return ResponseEntity.ok(documentRepository.findByTypeDocument(type));
    }

    @PostMapping
    public ResponseEntity<DocumentCommercial> createDocument(@Valid @RequestBody DocumentCommercial document) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.createDocument(document));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<DocumentCommercial> convertDevisToFacture(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.convertirDevisEnFacture(id));
    }

    @PutMapping("/{id}/statut")
    @Transactional
    public ResponseEntity<DocumentCommercial> updateStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        DocumentCommercial doc = documentService.getDocumentById(id);
        String statutStr = body.get("statut");
        if (statutStr == null) {
            throw new IllegalArgumentException("Le champ 'statut' est requis.");
        }
        doc.setStatut(StatutFacture.valueOf(statutStr));
        return ResponseEntity.ok(documentRepository.save(doc));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        if (!documentRepository.existsById(id)) {
            throw new EntityNotFoundException("Document introuvable avec l'ID : " + id);
        }
        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> generatePdf(@PathVariable Long id) throws IOException {
        DocumentCommercial doc = documentService.getDocumentById(id);
        byte[] pdfBytes = pdfGenerationService.genererPdfDocument(id);
        String filename = doc.getTypeDocument().name() + "_" + doc.getNumero() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

