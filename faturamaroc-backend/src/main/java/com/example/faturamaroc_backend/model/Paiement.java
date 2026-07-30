package com.example.faturamaroc_backend.model;

import com.example.faturamaroc_backend.model.enums.ModeReglement;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Paiements / Règlements rattachés à une facture (Chèque avec suivi des numéros, LCN, Virement, Espèces).
 */
@Entity
@Table(name = "paiements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore
    private DocumentCommercial document;

    @NotNull
    @Column(nullable = false)
    private LocalDate datePaiement;

    @NotNull
    @DecimalMin("0.01")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModeReglement modeReglement;

    /**
     * Numéro de chèque, numéro de LCN, ou référence bancaire.
     */
    private String referencePaiement;

    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (datePaiement == null) {
            datePaiement = LocalDate.now();
        }
    }
}
