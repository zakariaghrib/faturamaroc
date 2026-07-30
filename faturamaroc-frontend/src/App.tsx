import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Dashboard } from "./pages/Dashboard"
import { DocumentsPage } from "./pages/DocumentsPage"
import { ClientsPage } from "./pages/ClientsPage"
import { ProduitsPage } from "./pages/ProduitsPage"
import { PaiementsPage } from "./pages/PaiementsPage"
import { ParametresSociete } from "./pages/ParametresSociete"

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées avec DashboardLayout */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ADMINISTRATEUR",
                  "COMPTABLE",
                  "COMMERCIAL",
                ]}
              />
            }
          >
            <Route element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/produits" element={<ProduitsPage />} />

              {/* Encaissements réservés à ADMIN et COMPTABLE */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["ADMINISTRATEUR", "COMPTABLE"]}
                  />
                }
              >
                <Route path="/paiements" element={<PaiementsPage />} />
              </Route>

              {/* Paramètres réservés à ADMINISTRATEUR */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]} />
                }
              >
                <Route
                  path="/parametres"
                  element={<ParametresSociete />}
                />
              </Route>
            </Route>
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
