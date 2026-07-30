import React, { useEffect, useState } from "react"
import { produitService } from "../services/api"
import type { Produit } from "../types"
import { useAuth } from "../context/AuthContext"
import {
  Package,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Tag,
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

export const ProduitsPage: React.FC = () => {
  const [produits, setProduits] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Formulaire Produit
  const [reference, setReference] = useState("")
  const [designation, setDesignation] = useState("")
  const [prixUnitaireHT, setPrixUnitaireHT] = useState<number>(0)
  const [tauxTVA, setTauxTVA] = useState<number>(20)
  const [unite, setUnite] = useState("unité")

  const { hasRole } = useAuth()

  const fetchProduits = async () => {
    try {
      setLoading(true)
      const data = await produitService.getAll()
      setProduits(data)
    } catch (err) {
      console.error("Erreur de récupération du catalogue", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduits()
  }, [])

  const handleCreateProduit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const created = await produitService.create({
        reference,
        designation,
        prixUnitaireHT,
        tauxTVA,
        unite,
        actif: true,
      })

      setProduits([created, ...produits])
      setModalOpen(false)
      setReference("")
      setDesignation("")
      setPrixUnitaireHT(0)
      setTauxTVA(20)
      setUnite("unité")
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement de l'article."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    if (!window.confirm("Voulez-vous supprimer ce produit ou service ?")) {
      return
    }
    try {
      await produitService.delete(id)
      setProduits(produits.filter((p) => p.id !== id))
    } catch (err) {
      alert("Erreur lors de la suppression")
    }
  }

  const filteredProduits = produits.filter(
    (p) =>
      p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Catalogue Produits & Prestations (Maroc)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Articles, services et taux de TVA applicables (20%, 14%, 10%, 7%)
          </p>
        </div>

        <Button
          onClick={() => {
            setError(null)
            setModalOpen(true)
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-2 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nouveau Produit / Service</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par Référence ou Désignation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Taux TVA conformes CGI Maroc</span>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            Articles & Prestations ({filteredProduits.length})
          </CardTitle>
          <CardDescription>
            Tous les tarifs sont indiqués en Hors Taxe (HT) - La TVA sera ventilée sur vos factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Chargement du catalogue en cours...
            </div>
          ) : filteredProduits.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Aucun produit ou service enregistré.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead>Prix Unitaire HT</TableHead>
                  <TableHead>Taux TVA</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProduits.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {p.reference}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-600" />
                        <span>{p.designation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                      {formatMAD(p.prixUnitaireHT)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">
                        {p.tauxTVA}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {p.unite || "unité"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.actif !== false ? "success" : "secondary"}
                      >
                        {p.actif !== false ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {hasRole(["ADMINISTRATEUR", "COMPTABLE"]) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p.id)}
                          title="Supprimer l'article"
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
          )}
        </CardContent>
      </Card>

      {/* Modal Création Produit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <Package className="h-6 w-6" />
              <span>Nouveau Produit ou Service</span>
            </DialogTitle>
            <DialogDescription>
              Ajoutez une référence à votre catalogue
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProduit} className="space-y-4 mt-2">
            {error && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Référence *
              </label>
              <Input
                placeholder="Ex: PRD-2026-001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Désignation *
              </label>
              <Input
                placeholder="Ex: Prestation d'audit comptable"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Prix Unitaire HT (MAD) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={prixUnitaireHT}
                  onChange={(e) =>
                    setPrixUnitaireHT(parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Taux TVA (Maroc) *
                </label>
                <select
                  value={tauxTVA}
                  onChange={(e) =>
                    setTauxTVA(parseFloat(e.target.value) || 20)
                  }
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value={20}>20% (Normal)</option>
                  <option value={14}>14% (Transport...)</option>
                  <option value={10}>10% (Restauration...)</option>
                  <option value={7}>7% (Eau, Électricité...)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Unité
              </label>
              <Input
                placeholder="Ex: unité, jour, heure, forfait..."
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
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
                {submitting ? "Enregistrement..." : "Enregistrer au Catalogue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
