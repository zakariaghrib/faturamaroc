package com.example.faturamaroc_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Ligne d'article dans un devis ou une facture avec calcul dynamique
 * de la TVA marocaine (20%, 14%, 10%, 7%, 0%).
 */
@Entity
@Table(name = "lignes_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore
    private DocumentCommercial document;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produit_id")
    private Produit produit;

    @NotBlank
    @Column(nullable = false)
    private String designation;

    @NotNull
    @DecimalMin("0.01")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantite;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal prixUnitaireHT;

    /**
     * Taux de TVA (ex: 20.00, 14.00, 10.00, 7.00, 0.00)
     */
    @NotNull
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxTVA;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalLigneHT;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalLigneTVA;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalLigneTTC;

    public void recalculer() {
        if (quantite != null && prixUnitaireHT != null && tauxTVA != null) {
            this.totalLigneHT = quantite.multiply(prixUnitaireHT).setScale(2, RoundingMode.HALF_UP);
            this.totalLigneTVA = this.totalLigneHT.multiply(tauxTVA)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            this.totalLigneTTC = this.totalLigneHT.add(this.totalLigneTVA);
        }
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        recalculer();
    }
}
