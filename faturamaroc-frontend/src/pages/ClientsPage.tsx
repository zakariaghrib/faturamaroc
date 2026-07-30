import React, { useEffect, useState } from "react"
import { clientService } from "../services/api"
import type { Client, TypeTiers } from "../types"
import { useAuth } from "../context/AuthContext"
import {
  Users,
  PlusCircle,
  Building2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  MapPin,
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

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Formulaire de nouveau client
  const [raisonSociale, setRaisonSociale] = useState("")
  const [type, setType] = useState<TypeTiers>("CLIENT")
  const [adresse, setAdresse] = useState("")
  const [ville, setVille] = useState("")
  const [ice, setIce] = useState("")
  const [identifiantFiscal, setIdentifiantFiscal] = useState("")
  const [registreCommerce, setRegistreCommerce] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")

  const { hasRole } = useAuth()

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await clientService.getAll()
      setClients(data)
    } catch (err) {
      console.error("Erreur de récupération des clients", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const isValidMoroccanIce = (iceValue: string) => {
    return /^[0-9]{15}$/.test(iceValue)
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValidMoroccanIce(ice)) {
      setError(
        "L'ICE (Identifiant Commun de l'Entreprise) doit obligatoirement comporter exactement 15 chiffres numériques au Maroc."
      )
      return
    }

    try {
      setSubmitting(true)
      const newClient = await clientService.create({
        raisonSociale,
        type,
        adresse,
        ville,
        pays: "Maroc",
        ice,
        identifiantFiscal,
        registreCommerce,
        email,
        telephone,
      })

      setClients([newClient, ...clients])
      setModalOpen(false)
      // Réinitialiser les champs
      setRaisonSociale("")
      setAdresse("")
      setVille("")
      setIce("")
      setIdentifiantFiscal("")
      setRegistreCommerce("")
      setEmail("")
      setTelephone("")
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement du client marocain."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce client de l'annuaire ?"
      )
    ) {
      return
    }
    try {
      await clientService.delete(id)
      setClients(clients.filter((c) => c.id !== id))
    } catch (err) {
      alert("Erreur lors de la suppression")
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.raisonSociale.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ice.includes(searchQuery) ||
      c.ville.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Clients & Tiers (ICE Marocain)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestion de l'annuaire avec contrôle de conformité légale (ICE 15 chiffres, IF, RC)
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
          <span>Nouveau Client</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par Raison Sociale, Ville ou ICE (15 chiffres)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Validation automatique de l'ICE conformément au CGI</span>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            Annuaire des Clients ({filteredClients.length})
          </CardTitle>
          <CardDescription>
            Tous les clients doivent posséder un numéro ICE de 15 chiffres valide pour pouvoir émettre des factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Chargement de l'annuaire en cours...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Aucun client enregistré ne correspond à votre recherche.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raison Sociale</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>ICE (15 Chiffres)</TableHead>
                  <TableHead>Identifiant Fiscal (IF)</TableHead>
                  <TableHead>Registre Commerce (RC)</TableHead>
                  <TableHead>Adresse & Ville</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600" />
                        <span>{c.raisonSociale}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.type === "CLIENT" ? "default" : "secondary"
                        }
                      >
                        {c.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        {c.ice}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {c.identifiantFiscal || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {c.registreCommerce || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {c.ville} • {c.adresse}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {hasRole(["ADMINISTRATEUR", "COMPTABLE"]) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
                          title="Supprimer le client"
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

      {/* Create Client Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <Users className="h-6 w-6" />
              <span>Nouveau Client / Fournisseur (Maroc DGI)</span>
            </DialogTitle>
            <DialogDescription>
              Veuillez saisir les coordonnées réglementaires de l'entreprise marocaine
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClient} className="space-y-4 mt-2">
            {error && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Raison Sociale *
                </label>
                <Input
                  placeholder="Ex: Maroc Consulting SARL"
                  value={raisonSociale}
                  onChange={(e) => setRaisonSociale(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TypeTiers)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="CLIENT">Client</option>
                  <option value="FOURNISSEUR">Fournisseur</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  ICE (Identifiant Commun de l'Entreprise) - 15 chiffres *
                </label>
                <Input
                  placeholder="000123456789000 (15 chiffres numériques)"
                  value={ice}
                  onChange={(e) => setIce(e.target.value.replace(/\D/g, ""))}
                  maxLength={15}
                  required
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  L'ICE est obligatoire au Maroc et doit faire exactement 15 chiffres ({ice.length}/15).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Identifiant Fiscal (IF)
                </label>
                <Input
                  placeholder="Ex: 15248963"
                  value={identifiantFiscal}
                  onChange={(e) => setIdentifiantFiscal(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Registre de Commerce (RC)
                </label>
                <Input
                  placeholder="Ex: 45890 RABAT"
                  value={registreCommerce}
                  onChange={(e) => setRegistreCommerce(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ville *
                </label>
                <Input
                  placeholder="Ex: Casablanca, Rabat, Marrakech..."
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Adresse complète *
                </label>
                <Input
                  placeholder="Ex: 45 Avenue Hassan II"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="contact@client.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Téléphone
                </label>
                <Input
                  placeholder="+212 6 00 00 00 00"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </div>
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
                {submitting ? "Enregistrement..." : "Enregistrer le Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
