export type Role = "ADMINISTRATEUR" | "COMPTABLE" | "COMMERCIAL";

export interface Utilisateur {
  id?: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  actif?: boolean;
}

export type TypeTiers = "CLIENT" | "FOURNISSEUR";

export interface Client {
  id?: number;
  type?: TypeTiers;
  raisonSociale: string;
  adresse: string;
  ville: string;
  pays?: string;
  ice: string; // ICE 15 chiffres obligatoire au Maroc
  identifiantFiscal?: string;
  registreCommerce?: string;
  email?: string;
  telephone?: string;
}

export interface Produit {
  id?: number;
  reference: string;
  designation: string;
  prixUnitaireHT: number;
  tauxTVA: number; // Ex: 20, 14, 10, 7
  unite?: string;
  actif?: boolean;
}

export interface LigneDocument {
  id?: number;
  produit?: Produit;
  designation: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
}

export type TypeDocument = "DEVIS" | "FACTURE";

export type StatutFacture = "BROUILLON" | "VALIDE" | "EN_ATTENTE" | "PAYEE" | "ANNULEE" | "RETARD";

export interface DocumentCommercial {
  id?: number;
  numero?: string;
  typeDocument: TypeDocument;
  statut: StatutFacture;
  dateEmission: string;
  dateEcheance?: string;
  client: Client;
  lignes: LigneDocument[];
  notes?: string;
  montantTotalHT?: number;
  montantTotalTVA?: number;
  montantTotalTTC?: number;
  montantPaye?: number;
  soldeRestantDu?: number;
}

export type ModeReglement = "VIREMENT" | "CHEQUE" | "ESPECES" | "TRAITE" | "CARTE_BANCAIRE";

export interface Paiement {
  id?: number;
  documentId: number;
  datePaiement: string;
  montant: number;
  modeReglement: ModeReglement;
  referenceTransaction?: string;
  notes?: string;
}

export interface Societe {
  id?: number;
  raisonSociale: string;
  adresse?: string;
  ville?: string;
  ice: string;
  identifiantFiscal?: string;
  registreCommerce?: string;
  rib?: string;
  telephone?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  motDePasse: string;
  password?: string;
  nomComplet: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  role: Role;
}
