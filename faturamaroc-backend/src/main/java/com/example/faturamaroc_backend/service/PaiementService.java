package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.model.DocumentCommercial;
import com.example.faturamaroc_backend.model.Paiement;
import com.example.faturamaroc_backend.model.enums.ModeReglement;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.repository.DocumentCommercialRepository;
import com.example.faturamaroc_backend.repository.PaiementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Service gérant les règlements marocains (Chèque avec numéro, LCN, Virement, Espèces)
 * et la mise à jour dynamique du solde et du statut de la facture.
 */
@Service
@RequiredArgsConstructor
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final DocumentCommercialRepository documentRepository;

    /**
     * Enregistre un règlement sur une facture et met à jour automatiquement le solde et le statut.
     */
    @Transactional
    public Paiement createPaiement(Long documentId, Paiement paiement) {
        DocumentCommercial facture = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Facture introuvable avec l'ID : " + documentId));

        if (facture.getTypeDocument() != TypeDocument.FACTURE) {
            throw new IllegalArgumentException("Les règlements ne peuvent être associés qu'à des factures.");
        }

        if (facture.getStatut() == StatutFacture.ANNULEE) {
            throw new IllegalStateException("Impossible de régler une facture annulée.");
        }

        if (paiement.getMontant() == null || paiement.getMontant().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant du règlement doit être strictement positif.");
        }

        // Validation spécifique marocaine : Chèque et LCN exigent un numéro de référence
        if ((paiement.getModeReglement() == ModeReglement.CHEQUE || paiement.getModeReglement() == ModeReglement.EFFET_COMMERCE_LCN)
                && (paiement.getReferencePaiement() == null || paiement.getReferencePaiement().trim().isEmpty())) {
            throw new IllegalArgumentException("Le numéro de référence est obligatoire pour les règlements par Chèque ou LCN.");
        }

        BigDecimal soldeActuel = facture.getSoldeRestantDu() != null ? facture.getSoldeRestantDu() : facture.getTotalTTC();
        if (paiement.getMontant().compareTo(soldeActuel) > 0) {
            throw new IllegalArgumentException("Le montant du paiement (" + paiement.getMontant() + " MAD) excède le solde restant dû (" + soldeActuel + " MAD).");
        }

        if (paiement.getDatePaiement() == null) {
            paiement.setDatePaiement(LocalDate.now());
        }

        paiement.setDocument(facture);
        Paiement savedPaiement = paiementRepository.save(paiement);

        // Mise à jour du solde restant dû (arrondi exact 2 décimales)
        BigDecimal nouveauSolde = soldeActuel.subtract(paiement.getMontant()).setScale(2, RoundingMode.HALF_UP);
        facture.setSoldeRestantDu(nouveauSolde);

        // Mise à jour automatique du statut de la facture
        if (nouveauSolde.compareTo(BigDecimal.ZERO) == 0) {
            facture.setStatut(StatutFacture.PAYEE);
        } else {
            facture.setStatut(StatutFacture.PARTIELLEMENT_PAYEE);
        }

        documentRepository.save(facture);
        return savedPaiement;
    }

    @Transactional(readOnly = true)
    public List<Paiement> getPaiementsByDocumentId(Long documentId) {
        return paiementRepository.findByDocumentId(documentId);
    }
}
