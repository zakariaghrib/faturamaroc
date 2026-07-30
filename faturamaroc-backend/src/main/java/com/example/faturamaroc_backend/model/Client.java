package com.example.faturamaroc_backend.model;

import com.example.faturamaroc_backend.model.enums.TypeTiers;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Tiers (Client ou Fournisseur) aux normes marocaines :
 * ICE 15 chiffres obligatoire, IF, RC, historique et solde restant dû.
 */
@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TypeTiers type = TypeTiers.CLIENT;

    @NotBlank(message = "La Raison Sociale / Nom complet est obligatoire")
    @Column(nullable = false)
    private String raisonSociale;

    private String adresse;
    private String ville;

    @Builder.Default
    private String pays = "Maroc";

    /**
     * ICE (Identifiant Commun de l'Entreprise) : obligatoirement 15 chiffres au Maroc.
     */
    @NotBlank(message = "L'ICE est obligatoire")
    @Pattern(regexp = "^[0-9]{15}$", message = "L'ICE doit obligatoirement comporter exactement 15 chiffres")
    @Column(nullable = false, length = 15)
    private String ice;

    @Column(name = "if_fiscal")
    private String identifiantFiscal;

    @Column(name = "rc")
    private String registreCommerce;

    private String telephone;
    private String email;

    /**
     * Solde restant dû par le client (calculé par rapport aux factures impayées/partiellement payées).
     */
    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal soldeRestantDu = BigDecimal.ZERO;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (soldeRestantDu == null) {
            soldeRestantDu = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
