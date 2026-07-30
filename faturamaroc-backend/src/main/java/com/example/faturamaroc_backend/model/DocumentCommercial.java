package com.example.faturamaroc_backend.model;

import com.example.faturamaroc_backend.model.enums.StatutFacture;
import com.example.faturamaroc_backend.model.enums.TypeDocument;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Document commercial représentant soit un DEVIS soit une FACTURE.
 * Gère le cycle de conversion d'un devis en facture en un clic (devisOrigineId).
 */
@Entity
@Table(name = "documents_commerciaux")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentCommercial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDocument typeDocument;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutFacture statut = StatutFacture.BROUILLON;

    @NotNull
    @Column(nullable = false)
    private LocalDate dateEmission;

    private LocalDate dateEcheance;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<LigneDocument> lignes = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Paiement> paiements = new ArrayList<>();

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalHT = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalTVA = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalTTC = BigDecimal.ZERO;

    /**
     * Solde restant dû sur cette facture : totalTTC - somme des paiements.
     */
    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal soldeRestantDu = BigDecimal.ZERO;

    /**
     * ID du devis d'origine si cette facture a été générée en 1 clic à partir d'un devis.
     */
    private Long devisOrigineId;

    @Column(length = 2000)
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void addLigne(LigneDocument ligne) {
        lignes.add(ligne);
        ligne.setDocument(this);
        recalculerTotaux();
    }

    public void addPaiement(Paiement paiement) {
        paiements.add(paiement);
        paiement.setDocument(this);
        recalculerTotaux();
    }

    public void recalculerTotaux() {
        BigDecimal ht = BigDecimal.ZERO;
        BigDecimal tva = BigDecimal.ZERO;
        BigDecimal ttc = BigDecimal.ZERO;

        for (LigneDocument l : lignes) {
            if (l.getTotalLigneHT() != null) ht = ht.add(l.getTotalLigneHT());
            if (l.getTotalLigneTVA() != null) tva = tva.add(l.getTotalLigneTVA());
            if (l.getTotalLigneTTC() != null) ttc = ttc.add(l.getTotalLigneTTC());
        }

        this.totalHT = ht;
        this.totalTVA = tva;
        this.totalTTC = ttc;

        BigDecimal paye = BigDecimal.ZERO;
        for (Paiement p : paiements) {
            if (p.getMontant() != null) {
                paye = paye.add(p.getMontant());
            }
        }

        this.soldeRestantDu = ttc.subtract(paye);
        if (this.soldeRestantDu.compareTo(BigDecimal.ZERO) < 0) {
            this.soldeRestantDu = BigDecimal.ZERO;
        }

        if (this.typeDocument == TypeDocument.FACTURE && this.statut != StatutFacture.ANNULEE) {
            if (paye.compareTo(BigDecimal.ZERO) <= 0) {
                this.statut = StatutFacture.IMPAYEE;
            } else if (paye.compareTo(ttc) >= 0) {
                this.statut = StatutFacture.PAYEE;
            } else {
                this.statut = StatutFacture.PARTIELLEMENT_PAYEE;
            }
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        recalculerTotaux();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        recalculerTotaux();
    }
}
