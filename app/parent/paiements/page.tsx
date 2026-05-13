// app/parent/paiements/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet, CreditCard, Calendar, Download, Printer, Eye,
  CheckCircle, XCircle, AlertCircle, Loader2, User,
  FileText, TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: number;
  eleve: string;
  classe: string;
  type: string;
  montant: number;
  date: string;
  statut: string;
  methode: string;
  reference: string;
}

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  matricule: string;
}

export default function ParentPaiementsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("Tous");

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'parent')) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user?.eleveId) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        
        // Récupérer les infos de l'élève
        const eleveRes = await fetch(`/api/eleves/${user.eleveId}`, { headers });
        if (eleveRes.ok) {
          const eleveData = await eleveRes.json();
          setEleve(eleveData);
        }
        
        // Récupérer les transactions de l'élève
        const transactionsRes = await fetch(`/api/transactions?eleveId=${user.eleveId}`, { headers });
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user, getAuthHeaders]);

  const transactionsFiltrees = transactions.filter(t => 
    selectedType === "Tous" || t.type === selectedType
  );

  // Calculer les totaux
  const totalPaye = transactions
    .filter(t => t.statut === "payé")
    .reduce((sum, t) => sum + t.montant, 0);
  
  const totalImpaye = transactions
    .filter(t => t.statut === "impayé")
    .reduce((sum, t) => sum + t.montant, 0);
  
  const totalAnnuel = totalPaye + totalImpaye;

  const getStatutColor = (statut: string) => {
    switch(statut) {
      case "payé": return "bg-green-100 text-green-700";
      case "impayé": return "bg-red-100 text-red-700";
      case "en attente": return "bg-amber-100 text-amber-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatutIcon = (statut: string) => {
    switch(statut) {
      case "payé": return <CheckCircle size={14} className="text-green-600" />;
      case "impayé": return <XCircle size={14} className="text-red-600" />;
      default: return <AlertCircle size={14} className="text-amber-600" />;
    }
  };

  const handlePrint = () => window.print();

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aucun enfant associé</h2>
          <p className="text-slate-500">Aucun enfant n'est associé à votre compte parent.</p>
          <button onClick={() => router.push('/parent/enfant')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Retour à mon enfant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-green-600">
              <Wallet size={28} strokeWidth={1.8} />
            </div>
            Finances
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">
            {eleve.nom} • {eleve.classe}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="p-2 bg-white border rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Imprimer">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs">Total annuel</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalAnnuel.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle size={16} />
            <span className="text-xs">Total payé</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{totalPaye.toLocaleString()} FCFA</p>
          <p className="text-xs text-slate-400 mt-1">{((totalPaye / totalAnnuel) * 100 || 0).toFixed(1)}% du total</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle size={16} />
            <span className="text-xs">Reste à payer</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{totalImpaye.toLocaleString()} FCFA</p>
          <p className="text-xs text-slate-400 mt-1">{((totalImpaye / totalAnnuel) * 100 || 0).toFixed(1)}% du total</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("Tous")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedType === "Tous" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedType("inscription")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedType === "inscription" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            Inscription
          </button>
          <button
            onClick={() => setSelectedType("scolarité")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedType === "scolarité" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            Scolarité
          </button>
          <button
            onClick={() => setSelectedType("cantine")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedType === "cantine" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            Cantine
          </button>
          <button
            onClick={() => setSelectedType("transport")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedType === "transport" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            Transport
          </button>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-500 text-[11px] font-bold uppercase">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Montant</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Méthode</th>
                <th className="px-4 py-3 text-center">Référence</th>
              </tr>
            </thead>
            <tbody>
              {transactionsFiltrees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                transactionsFiltrees.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(transaction.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 capitalize">{transaction.type}</td>
                    <td className="px-4 py-3">{transaction.eleve} - {transaction.type}</td>
                    <td className="px-4 py-3 text-center font-medium">{transaction.montant.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(transaction.statut)}`}>
                        {getStatutIcon(transaction.statut)}
                        {transaction.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{transaction.methode}</td>
                    <td className="px-4 py-3 text-center text-xs font-mono">{transaction.reference || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message si l'API n'existe pas encore */}
      {transactions.length === 0 && !loading && (
        <div className="text-center py-8 bg-amber-50 rounded-2xl border border-amber-200">
          <AlertCircle size={32} className="mx-auto text-amber-500 mb-2" />
          <p className="text-amber-700">Aucune transaction enregistrée</p>
          <p className="text-xs text-amber-600 mt-1">Les informations financières apparaîtront ici une fois disponibles.</p>
        </div>
      )}
    </div>
  );
}