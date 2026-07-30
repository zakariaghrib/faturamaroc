import React from "react"
import type { StatutFacture } from "../../types"
import { Badge } from "./badge"
import { CheckCircle2, Clock, FileText, AlertCircle, XCircle } from "lucide-react"

interface StatBadgeProps {
  statut: StatutFacture
}

export const StatBadge: React.FC<StatBadgeProps> = ({ statut }) => {
  switch (statut) {
    case "PAYEE":
      return (
        <Badge variant="success" className="gap-1 px-2.5 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          Payée
        </Badge>
      )
    case "VALIDE":
      return (
        <Badge variant="info" className="gap-1 px-2.5 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          Validée
        </Badge>
      )
    case "EN_ATTENTE":
      return (
        <Badge variant="warning" className="gap-1 px-2.5 py-0.5">
          <Clock className="h-3 w-3" />
          En attente
        </Badge>
      )
    case "BROUILLON":
      return (
        <Badge variant="secondary" className="gap-1 px-2.5 py-0.5">
          <FileText className="h-3 w-3" />
          Brouillon
        </Badge>
      )
    case "RETARD":
      return (
        <Badge variant="destructive" className="gap-1 px-2.5 py-0.5">
          <AlertCircle className="h-3 w-3" />
          En retard
        </Badge>
      )
    case "ANNULEE":
      return (
        <Badge variant="destructive" className="gap-1 px-2.5 py-0.5">
          <XCircle className="h-3 w-3" />
          Annulée
        </Badge>
      )
    default:
      return <Badge variant="outline">{statut}</Badge>
  }
}
