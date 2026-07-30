import axios from "axios";
import type {
  AuthResponse,
  Client,
  DocumentCommercial,
  LoginRequest,
  Paiement,
  Produit,
  Societe,
} from "../types";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour attacher le Token JWT aux requêtes protégées
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer l'expiration du token ou une erreur 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nettoyage de session si 401 Unauthorized
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },
};

export const documentService = {
  getAll: async (): Promise<DocumentCommercial[]> => {
    const response = await api.get<DocumentCommercial[]>("/documents");
    return response.data;
  },
  getById: async (id: number): Promise<DocumentCommercial> => {
    const response = await api.get<DocumentCommercial>(`/documents/${id}`);
    return response.data;
  },
  create: async (doc: Partial<DocumentCommercial>): Promise<DocumentCommercial> => {
    const response = await api.post<DocumentCommercial>("/documents", doc);
    return response.data;
  },
  convertirEnFacture: async (id: number): Promise<DocumentCommercial> => {
    const response = await api.post<DocumentCommercial>(`/documents/${id}/convert`);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
  downloadPdf: async (id: number, filename: string): Promise<void> => {
    const response = await api.get(`/documents/${id}/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  openPdfPreview: async (id: number): Promise<void> => {
    const response = await api.get(`/documents/${id}/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  },
};

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<Client[]>("/clients");
    return response.data;
  },
  getById: async (id: number): Promise<Client> => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },
  create: async (client: Partial<Client>): Promise<Client> => {
    const response = await api.post<Client>("/clients", client);
    return response.data;
  },
  update: async (id: number, client: Partial<Client>): Promise<Client> => {
    const response = await api.put<Client>(`/clients/${id}`, client);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

export const produitService = {
  getAll: async (): Promise<Produit[]> => {
    const response = await api.get<Produit[]>("/produits");
    return response.data;
  },
  getById: async (id: number): Promise<Produit> => {
    const response = await api.get<Produit>(`/produits/${id}`);
    return response.data;
  },
  create: async (produit: Partial<Produit>): Promise<Produit> => {
    const response = await api.post<Produit>("/produits", produit);
    return response.data;
  },
  update: async (id: number, produit: Partial<Produit>): Promise<Produit> => {
    const response = await api.put<Produit>(`/produits/${id}`, produit);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/produits/${id}`);
  },
};

export const paiementService = {
  getByDocument: async (documentId: number): Promise<Paiement[]> => {
    const response = await api.get<Paiement[]>(`/paiements/document/${documentId}`);
    return response.data;
  },
  create: async (paiement: Partial<Paiement>): Promise<Paiement> => {
    const response = await api.post<Paiement>("/paiements", paiement);
    return response.data;
  },
};

export const societeService = {
  getPrincipale: async (): Promise<Societe> => {
    const response = await api.get<Societe>("/societe");
    return response.data;
  },
  update: async (societe: Societe): Promise<Societe> => {
    const response = await api.put<Societe>("/societe", societe);
    return response.data;
  },
};

export default api;
