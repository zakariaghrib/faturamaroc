import React from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  Settings,
  LogOut,
  ShieldAlert,
  Building2,
  Menu,
  X,
} from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems = [
    {
      to: "/",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      roles: ["ADMINISTRATEUR", "COMPTABLE", "COMMERCIAL"],
    },
    {
      to: "/documents",
      label: "Devis & Factures",
      icon: FileText,
      roles: ["ADMINISTRATEUR", "COMPTABLE", "COMMERCIAL"],
    },
    {
      to: "/clients",
      label: "Clients (ICE)",
      icon: Users,
      roles: ["ADMINISTRATEUR", "COMPTABLE", "COMMERCIAL"],
    },
    {
      to: "/produits",
      label: "Catalogue & Services",
      icon: Package,
      roles: ["ADMINISTRATEUR", "COMPTABLE", "COMMERCIAL"],
    },
    {
      to: "/paiements",
      label: "Encaissements",
      icon: CreditCard,
      roles: ["ADMINISTRATEUR", "COMPTABLE"],
    },
    {
      to: "/parametres",
      label: "Paramètres DGI / Société",
      icon: Settings,
      roles: ["ADMINISTRATEUR"],
    },
  ]

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "ADMINISTRATEUR":
        return "destructive"
      case "COMPTABLE":
        return "warning"
      case "COMMERCIAL":
        return "info"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between border-b bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400 text-lg">
          <Building2 className="h-6 w-6" />
          <span>FaturaMaroc</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold shadow-sm">
            FM
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100">
              FaturaMaroc
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Fiscalité DGI • Art. 145
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) =>
              item.roles.includes(user?.role || "COMMERCIAL")
            )
            .map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
        </nav>

        {/* User Role Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {user?.email || "Utilisateur"}
              </span>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user?.role) as any}>
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  {user?.role || "MEMBRE"}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Déconnexion"
              className="text-slate-500 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Serveur DGI Connecté • Dirham Marocain (MAD)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Conforme au Code Général des Impôts (CGI)
            </span>
          </div>
        </header>

        {/* Dynamic route outlet */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
