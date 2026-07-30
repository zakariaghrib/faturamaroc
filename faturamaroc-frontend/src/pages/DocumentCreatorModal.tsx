import React, { useState } from "react"
import type {
  Client,
  DocumentCommercial,
  LigneDocument,
  TypeDocument,
} from "../types"
import { documentService } from "../services/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { PlusCircle, Trash2, Calculator, Check, AlertCircle } from "lucide-react"

interface DocumentCreatorModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (newDoc: DocumentCommercial) => void
  initialType?: TypeDocument
  clients: Client[]
}

export const DocumentCreatorModal: React.FC<DocumentCreatorModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialType = "FACTURE",
  clients,
}) => {
  const [typeDocument, setTypeDocument] = useState<TypeDocument>(initialType)
  const [clientId, setClientId] = useState<number>(clients[0]?.id || 0)
  const [dateEmission, setDateEmission] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [notes, setNotes] = useState<string>(
    "Paiement à 30 jours par virement bancaire. Conformément à l'Article 145 du CGI marocain."
  )
  const [lignes, setLignes] = useState<LigneDocument[]>([
    {
      designation: "Prestation de service sur mesure",
      quantite: 1,
      prixUnitaireHT: 5000,
      tauxTVA: 20,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addLigne = () => {
    setLignes([
      ...lignes,
      {
        designation: "",
        quantite: 1,
        prixUnitaireHT: 0,
        tauxTVA: 20,
      },
    ])
  }

  const removeLigne = (index: number) => {
    if (lignes.length === 1) return
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const updateLigne = (
    index: number,
    field: keyof LigneDocument,
    value: string | number
  ) => {
    const updated = [...lignes]
    updated[index] = { ...updated[index], [field]: value }
    setLignes(updated)
  }

  // Calculs marocains en temps réel au frontend
  const totalHT = lignes.reduce(
    (acc, l) => acc + l.quantite * l.prixUnitaireHT,
    0
  )

  // Ventilation TVA par taux
  const tvaParTaux: Record<number, number> = {}
  lignes.forEach((l) => {
    const montantHT = l.quantite * l.prixUnitaireHT
    const tva = montantHT * (l.tauxTVA / 100)
    tvaParTaux[l.tauxTVA] = (tvaParTaux[l.tauxTVA] || 0) + tva
  })

  const totalTVA = Object.values(tvaParTaux).reduce((acc, val) => acc + val, 0)
  const totalTTC = totalHT + totalTVA

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!clientId) {
      setError("Veuillez sélectionner un client marocain (avec ICE 15 chiffres).")
      return
    }

    const selectedClient = clients.find((c) => c.id === Number(clientId))
    if (!selectedClient) {
      setError("Client sélectionné introuvable.")
      return
    }

    try {
      setLoading(true)
      const docPayload: Partial<DocumentCommercial> = {
        typeDocument,
        statut: typeDocument === "FACTURE" ? "EN_ATTENTE" : "EN_ATTENTE",
        dateEmission,
        client: selectedClient,
        lignes,
        notes,
      }

      const created = await documentService.create(docPayload)
      onSuccess(created)
      onClose()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement du document commercial."
      )
    } finally {
      setLoading(false)
    }
  }

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <Calculator className="h-6 w-6" />
            <span>
              Créer un {typeDocument === "FACTURE" ? "Nouvelle Facture" : "Nouveau Devis"} (Maroc DGI)
            </span>
          </DialogTitle>
          <DialogDescription>
            Saisie conforme aux règles fiscales marocaines • TVA 20%, 14%, 10%, 7% • Ventilation automatique
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {error && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Type & Client & Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Type de document
              </label>
              <Select
                value={typeDocument}
                onChange={(e) =>
                  setTypeDocument(e.target.value as TypeDocument)
                }
              >
                <option value="FACTURE">Facture</option>
                <option value="DEVIS">Devis</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Client (avec ICE)
              </label>
              <Select
                value={clientId}
                onChange={(e) => setClientId(Number(e.target.value))}
                required
              >
                <option value={0} disabled>
                  -- Sélectionner un client --
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.raisonSociale} (ICE: {c.ice})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Date d'émission
              </label>
              <Input
                type="date"
                value={dateEmission}
                onChange={(e) => setDateEmission(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Lignes d'articles / prestations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Lignes de facturation (HT & Taux de TVA marocain)
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLigne}
                className="gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Ajouter une ligne</span>
              </Button>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Désignation</TableHead>
                    <TableHead className="w-[15%]">Qté</TableHead>
                    <TableHead className="w-[20%]">P.U. HT (MAD)</TableHead>
                    <TableHead className="w-[15%]">TVA %</TableHead>
                    <TableHead className="w-[15%] text-right">
                      Total HT
                    </TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignes.map((l, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          placeholder="Prestation / Article"
                          value={l.designation}
                          onChange={(e) =>
                            updateLigne(index, "designation", e.target.value)
                          }
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={l.quantite}
                          onChange={(e) =>
                            updateLigne(
                              index,
                              "quantite",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={l.prixUnitaireHT}
                          onChange={(e) =>
                            updateLigne(
                              index,
                              "prixUnitaireHT",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={l.tauxTVA}
                          onChange={(e) =>
                            updateLigne(
                              index,
                              "tauxTVA",
                              parseFloat(e.target.value) || 20
                            )
                          }
                        >
                          <option value={20}>20% (Normal)</option>
                          <option value={14}>14% (Transport...)</option>
                          <option value={10}>10% (Hôtel, Rest...)</option>
                          <option value={7}>7% (Eau, Électricité...)</option>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatMAD(l.quantite * l.prixUnitaireHT)}
                      </TableCell>
                      <TableCell>
                        {lignes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLigne(index)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Récapitulatif Fiscal & Ventilation de TVA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Notes & Mentions de règlement (CGI)
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Sera affiché en pied de facture sur le PDF officiel DGI.
              </p>
            </div>

            <div className="space-y-2 border-l pl-6 border-slate-200 dark:border-slate-700 flex flex-col justify-center">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Total HT :
                </span>
                <span className="font-semibold">{formatMAD(totalHT)}</span>
              </div>

              {Object.entries(tvaParTaux).map(([taux, mnt]) => (
                <div
                  key={taux}
                  className="flex justify-between text-xs text-slate-500"
                >
                  <span>TVA marocaine ({taux}%) :</span>
                  <span>{formatMAD(mnt)}</span>
                </div>
              ))}

              <div className="flex justify-between text-base font-bold text-emerald-800 dark:text-emerald-400 border-t pt-2 border-slate-300 dark:border-slate-700">
                <span>Total TTC (MAD) :</span>
                <span>{formatMAD(totalTTC)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md gap-2"
              disabled={loading}
            >
              <Check className="h-4 w-4" />
              <span>
                {loading
                  ? "Enregistrement..."
                  : `Enregistrer le ${typeDocument === "FACTURE" ? "Facture" : "Devis"}`}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
