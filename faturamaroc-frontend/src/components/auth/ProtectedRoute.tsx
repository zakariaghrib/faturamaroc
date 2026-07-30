import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import type { Role } from "../../types"

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
