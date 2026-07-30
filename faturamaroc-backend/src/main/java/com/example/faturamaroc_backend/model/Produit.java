package com.example.faturamaroc_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Catalogue des articles ou services vendus avec prix unitaire HT et taux de TVA en vigueur au Maroc
 * (20%, 14%, 10%, 7%, 0%).
 */
@Entity
@Table(name = "produits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La référence est obligatoire")
    @Column(nullable = false, unique = true)
    private String reference;

    @NotBlank(message = "La désignation est obligatoire")
    @Column(nullable = false)
    private String designation;

    @NotNull(message = "Le prix unitaire HT est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix ne peut pas être négatif")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal prixUnitaireHT;

    /**
     * Taux de TVA en % : 20.0, 14.0, 10.0, 7.0, 0.0
     */
    @NotNull(message = "Le taux de TVA est obligatoire")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxTVA;

    @Builder.Default
    private String unite = "Unité";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
