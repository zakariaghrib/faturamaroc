package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.model.Client;
import com.example.faturamaroc_backend.model.DocumentCommercial;
import com.example.faturamaroc_backend.model.LigneDocument;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.model.enums.TypeTiers;
import com.example.faturamaroc_backend.repository.DocumentCommercialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentCommercialServiceTest {

    @Mock
    private DocumentCommercialRepository documentRepository;

    @InjectMocks
    private DocumentCommercialService documentService;

    private Client client;

    @BeforeEach
    void setUp() {
        client = Client.builder()
                .id(1L)
                .raisonSociale("CLIENT MAROC SARL")
                .ice("001122334455667")
                .type(TypeTiers.CLIENT)
                .build();
    }

    @Test
    void testRecalculerTotaux_ExactMarocTaxPrecision() {
        DocumentCommercial doc = DocumentCommercial.builder()
                .typeDocument(TypeDocument.FACTURE)
                .client(client)
                .lignes(new ArrayList<>())
                .build();

        // Ligne 1 : 10 x 100.00 HT = 1000.00 HT, TVA 20% = 200.00, TTC = 1200.00
        doc.getLignes().add(LigneDocument.builder()
                .designation("Prestation Conseil")
                .quantite(new BigDecimal("10.00"))
                .prixUnitaireHT(new BigDecimal("100.00"))
                .tauxTVA(new BigDecimal("20.00"))
                .build());

        // Ligne 2 : 3 x 33.33 HT = 99.99 HT, TVA 20% = 20.00, TTC = 119.99
        doc.getLignes().add(LigneDocument.builder()
                .designation("Hébergement Cloud")
                .quantite(new BigDecimal("3.00"))
                .prixUnitaireHT(new BigDecimal("33.33"))
                .tauxTVA(new BigDecimal("20.00"))
                .build());

        documentService.recalculerTotaux(doc);

        assertEquals(new BigDecimal("1099.99"), doc.getTotalHT());
        assertEquals(new BigDecimal("220.00"), doc.getTotalTVA());
        assertEquals(new BigDecimal("1319.99"), doc.getTotalTTC());
        assertEquals(new BigDecimal("1319.99"), doc.getSoldeRestantDu());
    }

    @Test
    void testGenererNumeroSequentiel_ShouldFormatCorrectly() {
        int annee = 2026;
        when(documentRepository.findByTypeDocument(TypeDocument.FACTURE)).thenReturn(List.of());

        String numero = documentService.genererNumeroSequentiel(TypeDocument.FACTURE, annee);

        assertEquals("FAC-2026-0001", numero);
    }

    @Test
    void testConvertirDevisEnFacture_ShouldCopyLinesAndLinkDevis() {
        DocumentCommercial devis = DocumentCommercial.builder()
                .id(100L)
                .numero("DEV-2026-0005")
                .typeDocument(TypeDocument.DEVIS)
                .client(client)
                .lignes(new ArrayList<>())
                .build();

        devis.getLignes().add(LigneDocument.builder()
                .designation("Développement Application web")
                .quantite(new BigDecimal("1.00"))
                .prixUnitaireHT(new BigDecimal("5000.00"))
                .tauxTVA(new BigDecimal("20.00"))
                .build());

        when(documentRepository.findById(100L)).thenReturn(Optional.of(devis));
        when(documentRepository.save(any(DocumentCommercial.class))).thenAnswer(i -> i.getArgument(0));

        DocumentCommercial facture = documentService.convertirDevisEnFacture(100L);

        assertNotNull(facture);
        assertEquals(TypeDocument.FACTURE, facture.getTypeDocument());
        assertEquals(StatutFacture.IMPAYEE, facture.getStatut());
        assertEquals(100L, facture.getDevisOrigineId());
        assertEquals(1, facture.getLignes().size());
        assertEquals("Développement Application web", facture.getLignes().get(0).getDesignation());
    }
}
