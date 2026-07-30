import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import type { Role } from "../types"

export const Register: React.FC = () => {
  const [nomComplet, setNomComplet] = useState("")
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [role, setRole] = useState<Role>("ADMINISTRATEUR")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register({
        email,
        motDePasse,
        password: motDePasse,
        nomComplet,
        role,
      })
      navigate("/")
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erreur lors de l'inscription. Veuillez vérifier les informations saisies."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* En-tête de marque marocaine */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-900/40 mb-2 border border-emerald-300/20">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Fatura<span className="text-emerald-400">Maroc</span>
          </h1>
          <p className="text-slate-300 text-sm">
            Création de compte professionnel (RBAC Marocain & DGI)
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl text-slate-100">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white">
              Créer votre espace
            </CardTitle>
            <CardDescription className="text-slate-400">
              Renseignez vos coordonnées pour activer votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm animate-in fade-in-50">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nom Complet */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nom et Prénom
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Karim Alami"
                    value={nomComplet}
                    onChange={(e) => setNomComplet(e.target.value)}
                    className="pl-10 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Email professionnel */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <Input
                    type="email"
                    required
                    placeholder="nom@societe.ma"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Mot de passe (minimum 6 caractères)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <Input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    className="pl-10 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Sélection de rôle Marocain RBAC */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  Rôle au sein de l'entreprise
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(
                    [
                      {
                        value: "ADMINISTRATEUR",
                        label: "Administrateur",
                        desc: "Accès total, purges DGI & gestion des rôles",
                      },
                      {
                        value: "COMPTABLE",
                        label: "Comptable",
                        desc: "Validation factures, écritures & export fiscal",
                      },
                      {
                        value: "COMMERCIAL",
                        label: "Commercial",
                        desc: "Création devis, factures & suivi clients",
                      },
                    ] as const
                  ).map((item) => (
                    <div
                      key={item.value}
                      onClick={() => setRole(item.value)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
                        role === item.value
                          ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-900/20"
                          : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      {role === item.value && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-6 rounded-xl shadow-lg shadow-emerald-900/30 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Créer mon compte professionnel
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-800/60 pt-4">
            <div className="text-center text-sm text-slate-400">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline-offset-4 hover:underline"
              >
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Note de conformité marocaine */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Conforme à la législation de la Direction Générale des Impôts (DGI)
            & du Code Général de Normalisation Comptable (CGNC).
          </p>
        </div>
      </div>
    </div>
  )
}
