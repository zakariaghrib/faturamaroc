package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.model.*;
import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.model.enums.TypeTiers;
import com.example.faturamaroc_backend.repository.ClientRepository;
import com.example.faturamaroc_backend.repository.DocumentCommercialRepository;
import com.example.faturamaroc_backend.repository.ProduitRepository;
import com.example.faturamaroc_backend.repository.SocieteRepository;
import com.example.faturamaroc_backend.service.util.NombreEnLettresMaroc;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class PdfGenerationServiceTest {

    @Autowired
    private PdfGenerationService pdfGenerationService;

    @Autowired
    private SocieteService societeService;

    @Autowired
    private DocumentCommercialService documentService;

    @Autowired
    private DocumentCommercialRepository documentRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private SocieteRepository societeRepository;

    private Client clientMarocain;
    private Produit produit1;
    private Produit produit2;

    @BeforeEach
    void setUp() {
        documentRepository.deleteAll();
        clientRepository.deleteAll();
        produitRepository.deleteAll();
        societeRepository.deleteAll();

        clientMarocain = clientRepository.save(Client.builder()
                .type(TypeTiers.CLIENT)
                .raisonSociale("Maroc Consulting SARL")
                .adresse("45 Avenue Hassan II")
                .ville("Rabat")
                .pays("Maroc")
                .ice("000123456789000") // ICE 15 chiffres
                .identifiantFiscal("12345678")
                .registreCommerce("98765 RABAT")
                .build());

        produit1 = produitRepository.save(Produit.builder()
                .reference("SRV-DEV-001")
                .designation("Developpement Logiciel Sur Mesure")
                .prixUnitaireHT(new BigDecimal("10000.00"))
                .tauxTVA(new BigDecimal("20.00")) // TVA 20%
                .build());

        produit2 = produitRepository.save(Produit.builder()
                .reference("SRV-MNT-001")
                .designation("Maintenance et Support Annuel")
                .prixUnitaireHT(new BigDecimal("5000.00"))
                .tauxTVA(new BigDecimal("14.00")) // TVA 14%
                .build());
    }

    @Test
    void testNombreEnLettresMaroc_ShouldConvertDirhamsAndCentimesCorrectly() {
        String res1 = NombreEnLettresMaroc.convertir(new BigDecimal("150.00"));
        assertThat(res1).contains("Cent cinquante Dirhams et zéro centime");

        String res2 = NombreEnLettresMaroc.convertir(new BigDecimal("1234.50"));
        assertThat(res2).contains("Mille deux cent trente-quatre Dirhams et cinquante centimes");

        String res3 = NombreEnLettresMaroc.convertir(new BigDecimal("25600.75"));
        assertThat(res3).contains("Vingt-cinq mille six cents Dirhams et soixante-quinze centimes");
    }

    @Test
    void testGenererPdfDocumentCommercial_ShouldCreateValidPdfWithMoroccanDgiRules() throws IOException {
        // 1. Créer la Facture marocaine
        DocumentCommercial facture = DocumentCommercial.builder()
                .numero("FAC-2026-0001")
                .typeDocument(TypeDocument.FACTURE)
                .statut(StatutFacture.VALIDE)
                .dateEmission(LocalDate.now())
                .dateEcheance(LocalDate.now().plusDays(30))
                .client(clientMarocain)
                .notes("Paiement par virement bancaire sous 30 jours.")
                .build();

        facture.addLigne(LigneDocument.builder()
                .produit(produit1)
                .designation("Developpement Logiciel Sur Mesure")
                .quantite(new BigDecimal("1.00"))
                .prixUnitaireHT(new BigDecimal("10000.00"))
                .tauxTVA(new BigDecimal("20.00"))
                .build());

        facture.addLigne(LigneDocument.builder()
                .produit(produit2)
                .designation("Maintenance et Support Annuel")
                .quantite(new BigDecimal("1.00"))
                .prixUnitaireHT(new BigDecimal("5000.00"))
                .tauxTVA(new BigDecimal("14.00"))
                .build());

        facture = documentService.createDocument(facture);

        // 2. Générer le PDF via le service
        Societe societe = societeService.getSocietePrincipale();
        byte[] pdfBytes = pdfGenerationService.genererPdfDocumentCommercial(facture, societe);

        // 3. Vérifications structurelles et réglementaires DGI
        assertThat(pdfBytes).isNotNull();
        assertThat(pdfBytes.length).isGreaterThan(1000);

        // 4. Lecture du texte généré à l'intérieur du PDF pour s'assurer des mentions DGI
        try (PDDocument pdDoc = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(pdDoc);

            // Vérification de la présence des mentions obligatoires DGI et ICE
            assertThat(extractedText).contains("MENTIONS LEGALES DGI (MAROC)");
            assertThat(extractedText).contains("ICE : 001524896325000"); // ICE émetteur
            assertThat(extractedText).contains("ICE CLIENT : 000123456789000"); // ICE client
            assertThat(extractedText).contains("FACTURE N° FAC-2026-0001");
            assertThat(extractedText).contains("TVA (20%)");
            assertThat(extractedText).contains("TVA (14%)");
            assertThat(extractedText).contains("Dirhams"); // Montant en lettres en Dirhams
            assertThat(extractedText).contains("Art. 145"); // Article du CGI marocain
        }
    }

    @Test
    void testGenererPdfDocument_ViaDocumentId_ShouldSucceed() throws IOException {
        DocumentCommercial devis = DocumentCommercial.builder()
                .numero("DEV-2026-0001")
                .typeDocument(TypeDocument.DEVIS)
                .statut(StatutFacture.EN_ATTENTE)
                .dateEmission(LocalDate.now())
                .client(clientMarocain)
                .build();

        devis.addLigne(LigneDocument.builder()
                .produit(produit1)
                .designation("Mission de Conseil en Architecture")
                .quantite(new BigDecimal("2.00"))
                .prixUnitaireHT(new BigDecimal("8000.00"))
                .tauxTVA(new BigDecimal("20.00"))
                .build());

        devis = documentService.createDocument(devis);

        byte[] pdfBytes = pdfGenerationService.genererPdfDocument(devis.getId());

        assertThat(pdfBytes).isNotNull().isNotEmpty();
        try (PDDocument pdDoc = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(pdDoc);
            assertThat(extractedText).contains("DEVIS N° DEV-2026-0001");
            assertThat(extractedText).contains("ICE CLIENT : 000123456789000");
        }
    }
}
