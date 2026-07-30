import React, { useEffect, useState } from "react"
import { documentService, paiementService } from "../services/api"
import type { DocumentCommercial, ModeReglement } from "../types"
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign,
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
import { Badge } from "../components/ui/badge"
import { StatBadge } from "../components/ui/StatBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

export const PaiementsPage: React.FC = () => {
  const [factures, setFactures] = useState<DocumentCommercial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFacture, setSelectedFacture] =
    useState<DocumentCommercial | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Formulaire de paiement
  const [montant, setMontant] = useState<number>(0)
  const [modeReglement, setModeReglement] =
    useState<ModeReglement>("VIREMENT")
  const [datePaiement, setDatePaiement] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [referenceTransaction, setReferenceTransaction] = useState("")
  const [notes, setNotes] = useState("")

  const fetchFactures = async () => {
    try {
      setLoading(true)
      const data = await documentService.getAll()
      // Ne filtrer que les factures
      setFactures(data.filter((d) => d.typeDocument === "FACTURE"))
    } catch (err) {
      console.error("Erreur de récupération des factures pour paiement", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFactures()
  }, [])

  const handleOpenPaymentModal = (facture: DocumentCommercial) => {
    setSelectedFacture(facture)
    setMontant(facture.soldeRestantDu || facture.montantTotalTTC || 0)
    setModeReglement("VIREMENT")
    setReferenceTransaction("")
    setNotes("Règlement par virement bancaire conformément à l'échéance.")
    setError(null)
    setModalOpen(true)
  }

  const handleCreatePaiement = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedFacture || !selectedFacture.id) {
      setError("Facture introuvable.")
      return
    }

    try {
      setSubmitting(true)
      await paiementService.create({
        documentId: selectedFacture.id,
        datePaiement,
        montant,
        modeReglement,
        referenceTransaction,
        notes,
      })

      await fetchFactures()
      setModalOpen(false)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement de l'encaissement."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(amount)
  }

  const filteredFactures = factures.filter(
    (f) =>
      f.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.client.raisonSociale
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      f.client.ice.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Encaissements & Règlements (Maroc)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Suivi des soldes dus, encaissements par virement, chèque, traite ou espèces
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par N° Facture, Client ou ICE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Mise à jour automatique du statut des factures</span>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Payment Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            Factures Émises & Soldes à Encaisser ({filteredFactures.length})
          </CardTitle>
          <CardDescription>
            Enregistrez vos encaissements pour actualiser les statuts (Validée, Payée, En retard)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Chargement des factures en cours...
            </div>
          ) : filteredFactures.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Aucune facture enregistrée pour le moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Client & ICE</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Déjà Encaissé</TableHead>
                  <TableHead>Solde Restant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFactures.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-bold font-mono text-slate-900 dark:text-slate-100">
                      {f.numero}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{f.client.raisonSociale}</div>
                      <div className="text-xs text-slate-500">
                        ICE: {f.client.ice}
                      </div>
                    </TableCell>
                    <TableCell>{f.dateEmission}</TableCell>
                    <TableCell className="font-bold">
                      {formatMAD(f.montantTotalTTC || 0)}
                    </TableCell>
                    <TableCell className="text-emerald-700 font-semibold dark:text-emerald-400">
                      {formatMAD(f.montantPaye || 0)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                      {formatMAD(
                        f.soldeRestantDu !== undefined
                          ? f.soldeRestantDu
                          : (f.montantTotalTTC || 0) - (f.montantPaye || 0)
                      )}
                    </TableCell>
                    <TableCell>
                      <StatBadge statut={f.statut} />
                    </TableCell>
                    <TableCell className="text-right">
                      {f.statut !== "PAYEE" && f.statut !== "ANNULEE" && (
                        <Button
                          onClick={() => handleOpenPaymentModal(f)}
                          size="sm"
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-1"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Encaisser</span>
                        </Button>
                      )}
                      {f.statut === "PAYEE" && (
                        <Badge variant="success">Soldée</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Paiement */}
      {selectedFacture && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <CreditCard className="h-6 w-6" />
                <span>Encaisser - {selectedFacture.numero}</span>
              </DialogTitle>
              <DialogDescription>
                Client : {selectedFacture.client.raisonSociale} (ICE:{" "}
                {selectedFacture.client.ice})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePaiement} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Montant encaissé (MAD) *
                </label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={
                    selectedFacture.soldeRestantDu ||
                    selectedFacture.montantTotalTTC
                  }
                  value={montant}
                  onChange={(e) =>
                    setMontant(parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mode de règlement (Maroc) *
                </label>
                <select
                  value={modeReglement}
                  onChange={(e) =>
                    setModeReglement(e.target.value as ModeReglement)
                  }
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="VIREMENT">Virement bancaire</option>
                  <option value="CHEQUE">Chèque</option>
                  <option value="TRAITE">Traite / LCN</option>
                  <option value="ESPECES">Espèces</option>
                  <option value="CARTE_BANCAIRE">Carte Bancaire (CMI)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Référence de transaction (N° Chèque / Virement / Traite)
                </label>
                <Input
                  placeholder="Ex: CHK-485960012 BMCE"
                  value={referenceTransaction}
                  onChange={(e) => setReferenceTransaction(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Date d'encaissement *
                </label>
                <Input
                  type="date"
                  value={datePaiement}
                  onChange={(e) => setDatePaiement(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes / Mentions
                </label>
                <Input
                  placeholder="Notes facultatives..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md"
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Valider l'encaissement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
