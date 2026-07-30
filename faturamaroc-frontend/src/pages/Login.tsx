import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
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

export const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ email, motDePasse })
      navigate("/")
    } catch (err: any) {
      setError(
        "Identifiants incorrects. Veuillez vérifier votre email et mot de passe ou utiliser un compte de démonstration."
      )
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail)
    setMotDePasse("password123")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Brand & Badge */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-2xl shadow-lg shadow-emerald-500/20 mb-3">
          FM
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          FaturaMaroc <span className="text-emerald-400">Pro</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Solution de Facturation Conforme DGI & Art. 145 CGI
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Connexion
          </CardTitle>
          <CardDescription className="text-center">
            Accédez à votre espace sécurisé de gestion commerciale
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email professionnel
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="nom@faturamaroc.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-medium">
                Comptes de Démonstration RBAC
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fillDemoAccount("admin@faturamaroc.ma")}
              className="flex flex-col h-auto py-2 text-xs border-red-200 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/50"
            >
              <span className="font-bold text-red-700 dark:text-red-400">
                Admin
              </span>
              <span className="text-[10px] text-slate-500">Accès total</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fillDemoAccount("comptable@faturamaroc.ma")}
              className="flex flex-col h-auto py-2 text-xs border-amber-200 bg-amber-50/50 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50"
            >
              <span className="font-bold text-amber-700 dark:text-amber-400">
                Comptable
              </span>
              <span className="text-[10px] text-slate-500">Paiements</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fillDemoAccount("commercial@faturamaroc.ma")}
              className="flex flex-col h-auto py-2 text-xs border-blue-200 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50"
            >
              <span className="font-bold text-blue-700 dark:text-blue-400">
                Commercial
              </span>
              <span className="text-[10px] text-slate-500">Devis/Fact.</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>
          Sécurité JWT sans état & Rôles Marocains (RBAC) • CGI Maroc
        </span>
      </div>
    </div>
  )
}
