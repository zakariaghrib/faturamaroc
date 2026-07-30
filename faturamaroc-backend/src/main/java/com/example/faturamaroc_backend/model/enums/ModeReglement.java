package com.example.faturamaroc_backend.model.enums;

/**
 * Modes de règlement adaptés au marché marocain :
 * - Virement bancaire
 * - Chèque (avec suivi des numéros de chèques)
 * - Effet de commerce (LCN / Lettre de Change Négociée)
 * - Espèces (Cash)
 */
public enum ModeReglement {
    VIREMENT_BANCAIRE,
    CHEQUE,
    EFFET_COMMERCE_LCN,
    ESPECES
}
