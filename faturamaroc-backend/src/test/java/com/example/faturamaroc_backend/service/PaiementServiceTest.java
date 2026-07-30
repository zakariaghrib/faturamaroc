package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.model.Client;
import com.example.faturamaroc_backend.model.DocumentCommercial;
import com.example.faturamaroc_backend.model.Paiement;
import com.example.faturamaroc_backend.model.enums.ModeReglement;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.repository.DocumentCommercialRepository;
import com.example.faturamaroc_backend.repository.PaiementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaiementServiceTest {

    @Mock
    private PaiementRepository paiementRepository;

    @Mock
    private DocumentCommercialRepository documentRepository;

    @InjectMocks
    private PaiementService paiementService;

    private DocumentCommercial facture;

    @BeforeEach
    void setUp() {
        facture = DocumentCommercial.builder()
                .id(1L)
                .numero("FAC-2026-0001")
                .typeDocument(TypeDocument.FACTURE)
                .statut(StatutFacture.IMPAYEE)
                .totalTTC(new BigDecimal("1000.00"))
                .soldeRestantDu(new BigDecimal("1000.00"))
                .build();
    }

    @Test
    void testCreatePaiement_Partiel_ShouldUpdateStatutToPartiellementPayee() {
        Paiement paiement = Paiement.builder()
                .montant(new BigDecimal("400.00"))
                .modeReglement(ModeReglement.VIREMENT_BANCAIRE)
                .datePaiement(LocalDate.now())
                .build();

        when(documentRepository.findById(1L)).thenReturn(Optional.of(facture));
        when(paiementRepository.save(any(Paiement.class))).thenAnswer(i -> i.getArgument(0));

        Paiement result = paiementService.createPaiement(1L, paiement);

        assertNotNull(result);
        assertEquals(new BigDecimal("600.00"), facture.getSoldeRestantDu());
        assertEquals(StatutFacture.PARTIELLEMENT_PAYEE, facture.getStatut());
    }

    @Test
    void testCreatePaiement_Total_ShouldUpdateStatutToPayee() {
        Paiement paiement = Paiement.builder()
                .montant(new BigDecimal("1000.00"))
                .modeReglement(ModeReglement.CHEQUE)
                .referencePaiement("CHQ-987654321")
                .datePaiement(LocalDate.now())
                .build();

        when(documentRepository.findById(1L)).thenReturn(Optional.of(facture));
        when(paiementRepository.save(any(Paiement.class))).thenAnswer(i -> i.getArgument(0));

        paiementService.createPaiement(1L, paiement);

        assertEquals(new BigDecimal("0.00"), facture.getSoldeRestantDu());
        assertEquals(StatutFacture.PAYEE, facture.getStatut());
    }

    @Test
    void testCreatePaiement_ChequeWithoutReference_ShouldThrowException() {
        Paiement paiement = Paiement.builder()
                .montant(new BigDecimal("500.00"))
                .modeReglement(ModeReglement.CHEQUE)
                .referencePaiement("") // Référence manquante
                .build();

        when(documentRepository.findById(1L)).thenReturn(Optional.of(facture));

        assertThrows(IllegalArgumentException.class, () -> {
            paiementService.createPaiement(1L, paiement);
        });
    }

    @Test
    void testCreatePaiement_MontantSuperieurAuSolde_ShouldThrowException() {
        Paiement paiement = Paiement.builder()
                .montant(new BigDecimal("1500.00")) // Excède le solde (1000 MAD)
                .modeReglement(ModeReglement.ESPECES)
                .build();

        when(documentRepository.findById(1L)).thenReturn(Optional.of(facture));

        assertThrows(IllegalArgumentException.class, () -> {
            paiementService.createPaiement(1L, paiement);
        });
    }
}
