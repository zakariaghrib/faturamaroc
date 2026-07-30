package com.example.faturamaroc_backend.model.enums;

/**
 * Statuts des factures selon le cahier des charges : Impayée, Partiellement Payée, Payée.
 * Nous ajoutons également BROUILLON et ANNULEE pour la gestion complète du cycle de vie.
 */
public enum StatutFacture {
    BROUILLON,
    VALIDE,
    EN_ATTENTE,
    IMPAYEE,
    PARTIELLEMENT_PAYEE,
    PAYEE,
    RETARD,
    ANNULEE
}
