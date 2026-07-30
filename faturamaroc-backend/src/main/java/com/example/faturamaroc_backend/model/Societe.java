package com.example.faturamaroc_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Informations légales de l'entreprise émettrice pour impression sur les devis et factures PDF.
 */
@Entity
@Table(name = "societes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Societe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String raisonSociale;

    private String adresse;
    private String ville;

    @Builder.Default
    private String pays = "Maroc";

    @Column(nullable = false, length = 15)
    @Pattern(regexp = "^[0-9]{15}$", message = "L'ICE de l'entreprise doit obligatoirement comporter exactement 15 chiffres")
    private String ice;

    @Column(name = "if_fiscal")
    private String identifiantFiscal;

    @Column(name = "rc")
    private String registreCommerce;

    private String rib;
    private String telephone;
    private String email;
    private String logoUrl;
}
