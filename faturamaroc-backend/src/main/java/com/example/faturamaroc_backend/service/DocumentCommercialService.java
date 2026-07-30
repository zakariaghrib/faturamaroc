package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.model.DocumentCommercial;
import com.example.faturamaroc_backend.model.LigneDocument;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.repository.DocumentCommercialRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Service gérant la logique métier et fiscale marocaine des devis et factures :
 * - Calcul automatique et exact (HT, TVA 20% par défaut, TTC) par ligne et global
 * - Numérotation séquentielle légale et sans trou (FAC-YYYY-XXXX / DEV-YYYY-XXXX)
 * - Conversion Devis -> Facture avec traçabilité (devisOrigineId)
 */
@Service
@RequiredArgsConstructor
public class DocumentCommercialService {

    private final DocumentCommercialRepository documentRepository;

    /**
     * Crée et enregistre un document commercial en calculant les totaux et générant un numéro séquentiel.
     */
    @Transactional
    public DocumentCommercial createDocument(DocumentCommercial doc) {
        if (doc.getDateEmission() == null) {
            doc.setDateEmission(LocalDate.now());
        }

        // 1. Calcul exact des lignes et des totaux HT / TVA / TTC
        recalculerTotaux(doc);

        // 2. Génération séquentielle légale du numéro
        if (doc.getNumero() == null || doc.getNumero().trim().isEmpty()) {
            doc.setNumero(genererNumeroSequentiel(doc.getTypeDocument(), doc.getDateEmission().getYear()));
        }

        // 3. Statut par défaut et solde restant dû
        if (doc.getStatut() == null) {
            doc.setStatut(doc.getTypeDocument() == TypeDocument.FACTURE ? StatutFacture.IMPAYEE : StatutFacture.BROUILLON);
        }
        if (doc.getTypeDocument() == TypeDocument.FACTURE) {
            doc.setSoldeRestantDu(doc.getTotalTTC());
        } else {
            doc.setSoldeRestantDu(BigDecimal.ZERO);
        }

        return documentRepository.save(doc);
    }

    /**
     * Recalcule à la décimale près (2 décimales, HALF_UP selon normes DGI marocaines) tous les montants.
     */
    public void recalculerTotaux(DocumentCommercial doc) {
        BigDecimal totalHT = BigDecimal.ZERO;
        BigDecimal totalTVA = BigDecimal.ZERO;

        if (doc.getLignes() != null) {
            for (LigneDocument ligne : doc.getLignes()) {
                ligne.setDocument(doc);
                if (ligne.getQuantite() == null) ligne.setQuantite(BigDecimal.ONE);
                if (ligne.getPrixUnitaireHT() == null) ligne.setPrixUnitaireHT(BigDecimal.ZERO);
                if (ligne.getTauxTVA() == null) ligne.setTauxTVA(new BigDecimal("20.00")); // Taux TVA marocain par défaut 20%

                BigDecimal ligneHT = ligne.getQuantite().multiply(ligne.getPrixUnitaireHT())
                        .setScale(2, RoundingMode.HALF_UP);
                BigDecimal ligneTVA = ligneHT.multiply(ligne.getTauxTVA())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                BigDecimal ligneTTC = ligneHT.add(ligneTVA).setScale(2, RoundingMode.HALF_UP);

                ligne.setTotalLigneHT(ligneHT);
                ligne.setTotalLigneTVA(ligneTVA);
                ligne.setTotalLigneTTC(ligneTTC);

                totalHT = totalHT.add(ligneHT);
                totalTVA = totalTVA.add(ligneTVA);
            }
        }

        BigDecimal totalTTC = totalHT.add(totalTVA).setScale(2, RoundingMode.HALF_UP);

        doc.setTotalHT(totalHT.setScale(2, RoundingMode.HALF_UP));
        doc.setTotalTVA(totalTVA.setScale(2, RoundingMode.HALF_UP));
        doc.setTotalTTC(totalTTC);
        if (doc.getTypeDocument() == TypeDocument.FACTURE) {
            doc.setSoldeRestantDu(totalTTC);
        }
    }

    /**
     * Génération séquentielle automatique (FAC-YYYY-XXXX / DEV-YYYY-XXXX) selon le nombre de documents existants.
     */
    public synchronized String genererNumeroSequentiel(TypeDocument type, int annee) {
        String prefix = (type == TypeDocument.FACTURE) ? "FAC" : "DEV";
        long count = documentRepository.findByTypeDocument(type).stream()
                .filter(d -> d.getDateEmission() != null && d.getDateEmission().getYear() == annee)
                .count();
        long numero = count + 1;
        return String.format("%s-%04d-%04d", prefix, annee, numero);
    }

    /**
     * Convertit un devis existant en facture avec traçabilité et reprise des lignes.
     */
    @Transactional
    public DocumentCommercial convertirDevisEnFacture(Long devisId) {
        DocumentCommercial devis = documentRepository.findById(devisId)
                .orElseThrow(() -> new EntityNotFoundException("Devis introuvable avec l'ID : " + devisId));

        if (devis.getTypeDocument() != TypeDocument.DEVIS) {
            throw new IllegalArgumentException("Le document spécifié n'est pas un Devis.");
        }

        DocumentCommercial facture = DocumentCommercial.builder()
                .typeDocument(TypeDocument.FACTURE)
                .statut(StatutFacture.IMPAYEE)
                .client(devis.getClient())
                .dateEmission(LocalDate.now())
                .dateEcheance(LocalDate.now().plusDays(30))
                .notes("Facture issue du Devis N° " + devis.getNumero())
                .devisOrigineId(devis.getId())
                .build();

        if (devis.getLignes() != null) {
            List<LigneDocument> lignesFacture = devis.getLignes().stream()
                    .map(l -> LigneDocument.builder()
                            .produit(l.getProduit())
                            .designation(l.getDesignation())
                            .quantite(l.getQuantite())
                            .prixUnitaireHT(l.getPrixUnitaireHT())
                            .tauxTVA(l.getTauxTVA())
                            .build())
                    .toList();
            facture.setLignes(lignesFacture);
        }

        return createDocument(facture);
    }

    @Transactional(readOnly = true)
    public DocumentCommercial getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document introuvable avec l'ID : " + id));
    }

    @Transactional(readOnly = true)
    public List<DocumentCommercial> getAllDocuments() {
        return documentRepository.findAll();
    }
}
