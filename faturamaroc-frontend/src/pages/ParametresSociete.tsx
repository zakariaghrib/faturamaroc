import React, { useEffect, useState } from "react"
import { societeService } from "../services/api"
import type { Societe } from "../types"
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

export const ParametresSociete: React.FC = () => {
  const [societe, setSociete] = useState<Societe>({
    id: 1,
    raisonSociale: "",
    ice: "",
    identifiantFiscal: "",
    registreCommerce: "",
    rib: "",
    adresse: "",
    ville: "",
    email: "",
    telephone: "",
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSociete = async () => {
      try {
        setLoading(true)
        const data = await societeService.getPrincipale()
        if (data) {
          setSociete(data)
        }
      } catch (err) {
        console.error("Erreur chargement paramètres société", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSociete()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!/^[0-9]{15}$/.test(societe.ice)) {
      setError(
        "L'ICE de votre entreprise doit comporter exactement 15 chiffres conformément au Code Général des Impôts marocain."
      )
      return
    }

    try {
      setSubmitting(true)
      const updated = await societeService.update(societe)
      setSociete(updated)
      setMessage(
        "Les paramètres DGI de votre entreprise ont été sauvegardés avec succès. Ils s'appliqueront à vos futurs PDF."
      )
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour des paramètres."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: keyof Societe, value: string) => {
    setSociete((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Paramètres Fiscaux & Société (DGI Maroc)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ces informations sont imprimées obligatoirement sur l'en-tête et le pied de page de vos PDF (CGI Art. 145)
          </p>
        </div>
      </div>

      <Card className="shadow-md border-t-4 border-t-emerald-700">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-700" />
            <span>Identité et Immatriculation Marocaine</span>
          </CardTitle>
          <CardDescription>
            {loading ? "Chargement de vos paramètres..." : "Toutes les factures générées incluront ces identifiants officiels pour la Direction Générale des Impôts"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {message && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Raison Sociale de votre Société *
                </label>
                <Input
                  placeholder="Ex: FaturaMaroc SARL AU"
                  value={societe.raisonSociale}
                  onChange={(e) =>
                    handleChange("raisonSociale", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  ICE (Identifiant Commun de l'Entreprise) - 15 chiffres *
                </label>
                <Input
                  placeholder="000000000000000"
                  value={societe.ice}
                  onChange={(e) =>
                    handleChange("ice", e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={15}
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Obligatoire depuis 2016 ({societe.ice.length}/15 chiffres).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Identifiant Fiscal (IF) *
                </label>
                <Input
                  placeholder="Ex: 52489630"
                  value={societe.identifiantFiscal || ""}
                  onChange={(e) =>
                    handleChange("identifiantFiscal", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Registre de Commerce (RC) *
                </label>
                <Input
                  placeholder="Ex: 98563 CASABLANCA"
                  value={societe.registreCommerce || ""}
                  onChange={(e) =>
                    handleChange("registreCommerce", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  RIB Bancaire Marocain (24 chiffres pour virements clients)
                </label>
                <Input
                  placeholder="Ex: 007 780 0000000000000000 12 (BMCE, Attijariwafa, CIH...)"
                  value={societe.rib || ""}
                  onChange={(e) => handleChange("rib", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ville *
                </label>
                <Input
                  placeholder="Ex: Rabat"
                  value={societe.ville || ""}
                  onChange={(e) => handleChange("ville", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Adresse complète *
                </label>
                <Input
                  placeholder="Ex: 12 Rue d'Agadir, Hassan"
                  value={societe.adresse || ""}
                  onChange={(e) => handleChange("adresse", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email de contact facture
                </label>
                <Input
                  type="email"
                  placeholder="facturation@faturamaroc.ma"
                  value={societe.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Téléphone de contact
                </label>
                <Input
                  placeholder="+212 5 37 00 00 00"
                  value={societe.telephone || ""}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t bg-slate-50/50 dark:bg-slate-900/50 p-6">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Conforme aux exigences DGI pour le calcul et le rendu PDF</span>
            </div>
            <Button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md gap-2"
              disabled={submitting}
            >
              <Save className="h-4 w-4" />
              <span>
                {submitting ? "Sauvegarde..." : "Enregistrer les Paramètres DGI"}
              </span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
