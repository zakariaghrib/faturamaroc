import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { documentService, clientService } from "../services/api"
import type { DocumentCommercial, Client } from "../types"
import {
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  ArrowRight,
  Building2,
  Download,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { StatBadge } from "../components/ui/StatBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

export const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentCommercial[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [docsData, clientsData] = await Promise.all([
          documentService.getAll(),
          clientService.getAll(),
        ])
        setDocuments(docsData)
        setClients(clientsData)
      } catch (err) {
        console.error("Erreur de chargement du tableau de bord", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  // Calcul des indicateurs marocains
  const factures = documents.filter((d) => d.typeDocument === "FACTURE")
  const facturesValidees = factures.filter((f) =>
    ["VALIDE", "PAYEE", "EN_ATTENTE"].includes(f.statut)
  )

  const caTotalTTC = facturesValidees.reduce(
    (acc, f) => acc + (f.montantTotalTTC || 0),
    0
  )
  const caTotalHT = facturesValidees.reduce(
    (acc, f) => acc + (f.montantTotalHT || 0),
    0
  )
  const tvaCollectee = facturesValidees.reduce(
    (acc, f) => acc + (f.montantTotalTVA || 0),
    0
  )

  const facturesEnAttente = factures.filter(
    (f) => f.statut === "EN_ATTENTE" || f.statut === "RETARD"
  )
  const montantEnAttente = facturesEnAttente.reduce(
    (acc, f) => acc + (f.montantTotalTTC || 0),
    0
  )

  const handleDownloadPdf = async (doc: DocumentCommercial) => {
    if (!doc.id || !doc.numero) return
    try {
      await documentService.downloadPdf(doc.id, `${doc.typeDocument}_${doc.numero}.pdf`)
    } catch (err) {
      alert("Erreur lors de la génération ou du téléchargement du PDF")
    }
  }

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord FaturaMaroc</h1>
          <p className="text-sm text-emerald-200 mt-1">
            Suivi en temps réel de la facturation marocaine • TVA 20%, 14%, 10%, 7% • ICE 15 chiffres
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/documents?new=DEVIS">
            <Button variant="amber" className="shadow-md">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouveau Devis
            </Button>
          </Link>
          <Link to="/documents?new=FACTURE">
            <Button className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold shadow-md">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouvelle Facture
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Chiffre d'Affaires TTC
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatMAD(caTotalTTC)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              HT : {formatMAD(caTotalHT)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              TVA Collectée (DGI)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatMAD(tvaCollectee)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              À déclarer sur factures validées
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              En Attente / Retard
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatMAD(montantEnAttente)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {facturesEnAttente.length} facture(s) non réglée(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Portefeuille Clients (ICE)
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {clients.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Clients immatriculés conformes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Derniers Devis & Factures</CardTitle>
            <CardDescription>
              Aperçu en temps réel de votre activité commerciale
            </CardDescription>
          </div>
          <Link to="/documents">
            <Button variant="outline" size="sm" className="gap-2">
              <span>Voir tout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">
              Chargement des documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Aucun document commercial enregistré pour le moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date Émission</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action DGI / PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.slice(0, 6).map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {doc.numero}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          doc.typeDocument === "FACTURE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {doc.typeDocument}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {doc.client.raisonSociale}
                      </div>
                      <div className="text-xs text-slate-500">
                        ICE : {doc.client.ice}
                      </div>
                    </TableCell>
                    <TableCell>{doc.dateEmission}</TableCell>
                    <TableCell className="font-bold">
                      {formatMAD(doc.montantTotalTTC || 0)}
                    </TableCell>
                    <TableCell>
                      <StatBadge statut={doc.statut} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(doc)}
                        className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF DGI</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
