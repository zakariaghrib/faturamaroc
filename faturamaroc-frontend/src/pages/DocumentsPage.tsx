import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { documentService, clientService } from "../services/api"
import type {
  DocumentCommercial,
  Client,
  TypeDocument,
} from "../types"
import { useAuth } from "../context/AuthContext"
import {
  PlusCircle,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Eye,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { StatBadge } from "../components/ui/StatBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { DocumentCreatorModal } from "./DocumentCreatorModal"

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentCommercial[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [statutFilter, setStatutFilter] = useState<string>("ALL")
  const [modalOpen, setModalOpen] = useState(false)
  const [newDocType, setNewDocType] = useState<TypeDocument>("FACTURE")

  const [searchParams] = useSearchParams()
  const { hasRole } = useAuth()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [docsData, clientsData] = await Promise.all([
        documentService.getAll(),
        clientService.getAll(),
      ])
      setDocuments(docsData)
      setClients(clientsData)
    } catch (err) {
      console.error("Erreur lors de la récupération des documents", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const newParam = searchParams.get("new")
    if (newParam === "DEVIS" || newParam === "FACTURE") {
      setNewDocType(newParam)
      setModalOpen(true)
    }
  }, [searchParams])

  const handleOpenCreateModal = (type: TypeDocument) => {
    setNewDocType(type)
    setModalOpen(true)
  }

  const handleConvertDevis = async (id: number) => {
    try {
      await documentService.convertirEnFacture(id)
      await fetchData()
    } catch (err: any) {
      alert(
        "Erreur lors de la conversion du devis en facture : " +
          (err.response?.data?.message || err.message)
      )
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    if (
      !window.confirm(
        "Confirmez-vous la suppression de ce document ? (Réservé aux administrateurs)"
      )
    ) {
      return
    }
    try {
      await documentService.delete(id)
      setDocuments(documents.filter((d) => d.id !== id))
    } catch (err) {
      alert("Erreur lors de la suppression")
    }
  }

  const handleDownloadPdf = async (doc: DocumentCommercial) => {
    if (!doc.id || !doc.numero) return
    try {
      await documentService.downloadPdf(doc.id, `${doc.typeDocument}_${doc.numero}.pdf`)
    } catch (err) {
      alert("Erreur lors du téléchargement du PDF DGI")
    }
  }

  const handlePreviewPdf = async (doc: DocumentCommercial) => {
    if (!doc.id) return
    try {
      await documentService.openPdfPreview(doc.id)
    } catch (err) {
      alert("Erreur lors de l'aperçu du PDF")
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchType =
      typeFilter === "ALL" || doc.typeDocument === typeFilter
    const matchStatut =
      statutFilter === "ALL" || doc.statut === statutFilter
    const matchSearch =
      doc.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client.raisonSociale
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      doc.client.ice.includes(searchQuery)
    return matchType && matchStatut && matchSearch
  })

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Devis & Factures (Maroc DGI)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestion du cycle commercial, conversion 1-clic et impression PDF réglementaire (Art. 145 CGI)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenCreateModal("DEVIS")}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4 text-amber-600" />
            <span>Nouveau Devis</span>
          </Button>
          <Button
            onClick={() => handleOpenCreateModal("FACTURE")}
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nouvelle Facture</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par N°, Client ou ICE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Filter className="h-4 w-4" />
              <span>Type :</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">Tous les types</option>
              <option value="FACTURE">Factures uniquement</option>
              <option value="DEVIS">Devis uniquement</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 ml-2">
              <span>Statut :</span>
            </div>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Validée</option>
              <option value="PAYEE">Payée</option>
              <option value="RETARD">En retard</option>
              <option value="BROUILLON">Brouillon</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            Liste des Documents ({filteredDocuments.length})
          </CardTitle>
          <CardDescription>
            Tous les numéros sont générés conformément aux normes de numérotation séquentielle de la DGI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Chargement des documents en cours...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Aucun document ne correspond à vos filtres.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client & ICE</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                      {doc.numero}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          doc.typeDocument === "FACTURE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {doc.typeDocument}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {doc.client.raisonSociale}
                      </div>
                      <div className="text-xs text-slate-500">
                        ICE : {doc.client.ice}
                      </div>
                    </TableCell>
                    <TableCell>{doc.dateEmission}</TableCell>
                    <TableCell className="font-bold text-emerald-800 dark:text-emerald-400">
                      {formatMAD(doc.montantTotalTTC || 0)}
                    </TableCell>
                    <TableCell>
                      <StatBadge statut={doc.statut} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Convertir Devis -> Facture */}
                        {doc.typeDocument === "DEVIS" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvertDevis(doc.id!)}
                            className="text-xs border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold gap-1 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
                            title="Convertir ce devis en facture en 1 clic"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Facturer</span>
                          </Button>
                        )}

                        {/* Voir et Télécharger PDF DGI */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewPdf(doc)}
                          className="text-xs gap-1"
                          title="Aperçu PDF"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPdf(doc)}
                          title="Télécharger le PDF réglementaire"
                          className="text-slate-600 hover:text-emerald-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Suppression réservée à l'ADMINISTRATEUR */}
                        {hasRole(["ADMINISTRATEUR"]) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.id)}
                            title="Supprimer (Réservé Admin)"
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modale de création */}
      {modalOpen && (
        <DocumentCreatorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={(newDoc) => {
            setDocuments([newDoc, ...documents])
          }}
          initialType={newDocType}
          clients={clients}
        />
      )}
    </div>
  )
}
