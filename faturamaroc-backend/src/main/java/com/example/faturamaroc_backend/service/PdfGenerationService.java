package com.example.faturamaroc_backend.service;

import com.example.faturamaroc_backend.model.*;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import com.example.faturamaroc_backend.service.util.NombreEnLettresMaroc;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Service de génération de PDF pour les factures et devis conformes aux normes de la DGI au Maroc.
 * Respecte les obligations de l'article 145 du Code Général des Impôts (CGI) :
 * - ICE 15 chiffres obligatoire (émetteur et client)
 * - Identifiant Fiscal (IF), Registre du Commerce (RC), RIB
 * - Ventilation détaillée de la TVA par taux (20%, 14%, 10%, 7%)
 * - Arrêté du montant en toutes lettres en Dirhams TTC
 */
@Service
@RequiredArgsConstructor
public class PdfGenerationService {

    private final DocumentCommercialService documentService;
    private final SocieteService societeService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] genererPdfDocument(Long documentId) throws IOException {
        DocumentCommercial doc = documentService.getDocumentById(documentId);
        Societe societe = societeService.getSocietePrincipale();
        return genererPdfDocumentCommercial(doc, societe);
    }

    public byte[] genererPdfDocumentCommercial(DocumentCommercial doc, Societe societe) throws IOException {
        try (PDDocument pdfDocument = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            pdfDocument.addPage(page);

            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font fontItalic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

            PDPageContentStream cs = new PDPageContentStream(pdfDocument, page);

            // 1. BLOC ÉMETTEUR (Société - Haut Gauche)
            float y = 780;
            drawText(cs, fontBold, 14, 50, y, sanitize(societe.getRaisonSociale()));
            y -= 16;
            drawText(cs, fontRegular, 10, 50, y, sanitize(societe.getAdresse()));
            y -= 14;
            drawText(cs, fontRegular, 10, 50, y, sanitize(societe.getVille() + " - " + societe.getPays()));
            y -= 14;
            if (societe.getTelephone() != null && !societe.getTelephone().isEmpty()) {
                drawText(cs, fontRegular, 10, 50, y, "Tel : " + sanitize(societe.getTelephone()));
                y -= 14;
            }
            if (societe.getEmail() != null && !societe.getEmail().isEmpty()) {
                drawText(cs, fontRegular, 10, 50, y, "Email : " + sanitize(societe.getEmail()));
            }

            // 2. BLOC MENTIONS LÉGALES DGI (Encadré - Haut Droite)
            drawBox(cs, 330, 705, 215, 80);
            drawText(cs, fontBold, 9, 340, 770, "MENTIONS LEGALES DGI (MAROC)");
            drawText(cs, fontBold, 10, 340, 752, "ICE : " + sanitize(societe.getIce())); // 15 chiffres
            drawText(cs, fontRegular, 9, 340, 737, "IF : " + sanitize(societe.getIdentifiantFiscal()) +
                    "   RC : " + sanitize(societe.getRegistreCommerce()));
            drawText(cs, fontRegular, 8, 340, 722, "RIB : " + sanitize(societe.getRib()));

            // 3. BLOC TITRE DU DOCUMENT
            y = 665;
            String titreDoc = doc.getTypeDocument() == TypeDocument.FACTURE ? "FACTURE N° " : "DEVIS N° ";
            drawText(cs, fontBold, 16, 50, y, titreDoc + sanitize(doc.getNumero()));
            y -= 16;
            drawText(cs, fontRegular, 10, 50, y, "Date d'emission : " + (doc.getDateEmission() != null ? doc.getDateEmission().format(DATE_FORMATTER) : "-"));
            y -= 14;
            if (doc.getDateEcheance() != null) {
                drawText(cs, fontRegular, 10, 50, y, "Date d'echeance : " + doc.getDateEcheance().format(DATE_FORMATTER));
            }

            // 4. BLOC CLIENT (Destinataire - Droite)
            Client client = doc.getClient();
            drawBox(cs, 300, 560, 245, 95);
            drawText(cs, fontBold, 10, 310, 640, "DESTINATAIRE / CLIENT :");
            drawText(cs, fontBold, 11, 310, 623, sanitize(client.getRaisonSociale()));
            drawText(cs, fontRegular, 10, 310, 607, sanitize(client.getAdresse() != null ? client.getAdresse() : "-"));
            drawText(cs, fontRegular, 10, 310, 591, sanitize(client.getVille() != null ? client.getVille() : "-"));
            drawText(cs, fontBold, 10, 310, 572, "ICE CLIENT : " + (client.getIce() != null ? sanitize(client.getIce()) : "N/A"));

            // 5. TABLEAU DES ARTICLES (Lignes du document)
            float tableTopY = 525;
            float rowHeight = 22;
            drawBox(cs, 50, tableTopY - rowHeight, 495, rowHeight);
            drawText(cs, fontBold, 9, 58, tableTopY - 15, "Designation");
            drawText(cs, fontBold, 9, 275, tableTopY - 15, "Qte");
            drawText(cs, fontBold, 9, 325, tableTopY - 15, "P.U. HT (DH)");
            drawText(cs, fontBold, 9, 405, tableTopY - 15, "TVA");
            drawText(cs, fontBold, 9, 455, tableTopY - 15, "Total HT (DH)");

            float currentY = tableTopY - rowHeight;

            // Calcul de la ventilation de TVA en même temps
            Map<BigDecimal, BigDecimal> ventilationTva = new HashMap<>();

            for (LigneDocument ligne : doc.getLignes()) {
                if (currentY < 230) {
                    // Si on dépasse, on pourrait gérer plusieurs pages (ici on s'assure d'un affichage clair)
                    break;
                }
                currentY -= rowHeight;
                drawBox(cs, 50, currentY, 495, rowHeight);

                String des = sanitize(ligne.getDesignation());
                if (des.length() > 38) des = des.substring(0, 35) + "...";
                drawText(cs, fontRegular, 9, 58, currentY + 7, des);
                drawText(cs, fontRegular, 9, 275, currentY + 7, ligne.getQuantite().toString());
                drawText(cs, fontRegular, 9, 325, currentY + 7, formatAmount(ligne.getPrixUnitaireHT()));
                drawText(cs, fontRegular, 9, 405, currentY + 7, ligne.getTauxTVA().setScale(0, RoundingMode.HALF_UP) + "%");
                drawText(cs, fontRegular, 9, 455, currentY + 7, formatAmount(ligne.getTotalLigneHT()));

                // Agréger la ventilation TVA
                BigDecimal taux = ligne.getTauxTVA().setScale(2, RoundingMode.HALF_UP);
                BigDecimal montantTvaLigne = ligne.getTotalLigneHT()
                        .multiply(taux)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                ventilationTva.merge(taux, montantTvaLigne, BigDecimal::add);
            }

            // 6. TABLEAU DE SYNTHÈSE DES TOTAUX & VENTILATION TVA MAROCAINE
            float summaryTopY = currentY - 20;
            float summaryWidth = 220;
            float summaryX = 325;

            drawText(cs, fontBold, 10, summaryX, summaryTopY, "Total HT :");
            drawTextRight(cs, fontRegular, 10, summaryX + summaryWidth, summaryTopY, formatAmount(doc.getTotalHT()) + " DH");
            summaryTopY -= 16;

            // Ventilation TVA par taux marocaine
            for (Map.Entry<BigDecimal, BigDecimal> entry : ventilationTva.entrySet()) {
                String labelTva = "TVA (" + entry.getKey().setScale(0, RoundingMode.HALF_UP) + "%) :";
                drawText(cs, fontRegular, 9, summaryX, summaryTopY, labelTva);
                drawTextRight(cs, fontRegular, 9, summaryX + summaryWidth, summaryTopY, formatAmount(entry.getValue()) + " DH");
                summaryTopY -= 14;
            }

            drawText(cs, fontBold, 10, summaryX, summaryTopY, "Total TVA :");
            drawTextRight(cs, fontBold, 10, summaryX + summaryWidth, summaryTopY, formatAmount(doc.getTotalTVA()) + " DH");
            summaryTopY -= 18;

            drawBox(cs, summaryX - 5, summaryTopY - 6, summaryWidth + 10, 20);
            drawText(cs, fontBold, 11, summaryX, summaryTopY, "TOTAL TTC :");
            drawTextRight(cs, fontBold, 11, summaryX + summaryWidth, summaryTopY, formatAmount(doc.getTotalTTC()) + " DH");

            if (doc.getTypeDocument() == TypeDocument.FACTURE) {
                summaryTopY -= 22;
                BigDecimal paiementsRecus = doc.getTotalTTC().subtract(doc.getSoldeRestantDu());
                drawText(cs, fontRegular, 9, summaryX, summaryTopY, "Paiements recus :");
                drawTextRight(cs, fontRegular, 9, summaryX + summaryWidth, summaryTopY, formatAmount(paiementsRecus) + " DH");
                summaryTopY -= 16;
                drawText(cs, fontBold, 10, summaryX, summaryTopY, "SOLDE RESTANT DU :");
                drawTextRight(cs, fontBold, 10, summaryX + summaryWidth, summaryTopY, formatAmount(doc.getSoldeRestantDu()) + " DH");
            }

            // 7. MONTANT ARRÊTÉ EN TOUTES LETTRES (Obligatoire DGI Maroc)
            float lettresY = 175;
            String mentionType = doc.getTypeDocument() == TypeDocument.FACTURE ? "Arretee la presente facture a la somme de :" : "Arrete le present devis a la somme de :";
            drawText(cs, fontBold, 9, 50, lettresY, mentionType);
            lettresY -= 15;
            String montantLettres = NombreEnLettresMaroc.convertir(doc.getTotalTTC()) + " TTC.";
            drawText(cs, fontItalic, 10, 50, lettresY, sanitize(montantLettres));

            if (doc.getNotes() != null && !doc.getNotes().isEmpty()) {
                lettresY -= 20;
                drawText(cs, fontRegular, 9, 50, lettresY, "Note : " + sanitize(doc.getNotes()));
            }

            // 8. PIED DE PAGE RÉGLEMENTAIRE (DGI / Art. 145 CGI)
            drawHorizontalLine(cs, 50, 545, 50);
            String footerLine1 = sanitize(societe.getRaisonSociale() + " | ICE : " + societe.getIce() + " | IF : " +
                    societe.getIdentifiantFiscal() + " | RC : " + societe.getRegistreCommerce() + " | RIB : " + societe.getRib());
            String footerLine2 = "Document conforme a la reglementation fiscale marocaine (Art. 145 du Code General des Impots - DGI)";

            drawTextCenter(cs, fontRegular, 7.5f, 297, 36, footerLine1);
            drawTextCenter(cs, fontItalic, 7.5f, 297, 24, footerLine2);

            cs.close();

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            pdfDocument.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void drawText(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text != null ? text : "");
        cs.endText();
    }

    private void drawTextRight(PDPageContentStream cs, PDType1Font font, float size, float rightX, float y, String text) throws IOException {
        float width = font.getStringWidth(text != null ? text : "") / 1000 * size;
        drawText(cs, font, size, rightX - width, y, text);
    }

    private void drawTextCenter(PDPageContentStream cs, PDType1Font font, float size, float centerX, float y, String text) throws IOException {
        float width = font.getStringWidth(text != null ? text : "") / 1000 * size;
        drawText(cs, font, size, centerX - (width / 2), y, text);
    }

    private void drawBox(PDPageContentStream cs, float x, float y, float width, float height) throws IOException {
        cs.setLineWidth(0.7f);
        cs.addRect(x, y, width, height);
        cs.stroke();
    }

    private void drawHorizontalLine(PDPageContentStream cs, float startX, float endX, float y) throws IOException {
        cs.setLineWidth(0.5f);
        cs.moveTo(startX, y);
        cs.lineTo(endX, y);
        cs.stroke();
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "0.00";
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String sanitize(String input) {
        if (input == null) return "";
        // Remplacer les caractères accentués ou Unicode qui pourraient ne pas exister dans la font WinAnsi standard Helvetica
        return input.replace('é', 'e').replace('è', 'e').replace('ê', 'e').replace('ë', 'e')
                .replace('à', 'a').replace('â', 'a').replace('ä', 'a')
                .replace('ô', 'o').replace('ö', 'o')
                .replace('î', 'i').replace('ï', 'i')
                .replace('ù', 'u').replace('û', 'u').replace('ü', 'u')
                .replace('ç', 'c').replace('Ç', 'C')
                .replace('É', 'E').replace('È', 'E').replace('À', 'A')
                .replace('\u00A0', ' ')
                .replace('€', 'E')
                .replace("–", "-").replace("—", "-")
                .replaceAll("[^\\x20-\\x7E]", "");
    }
}
