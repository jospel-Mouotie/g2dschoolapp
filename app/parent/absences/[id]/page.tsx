// app/parent/absences/[id]/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Printer, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Absence {
  id: number;
  eleveId: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  heuresAbsence: number;
  justifiee: boolean;
  motif: string | null;
  cours?: {
    matiere: string;
    salle: string;
  };
}

export default function ParentAbsencesDetail() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [eleve, setEleve] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "justifiees" | "nonJustifiees">("all");

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !params.id) return;
      
      try {
        const headers = getAuthHeaders();
        
        // Récupérer les infos de l'élève
        const eleveRes = await fetch(`/api/eleves/${params.id}`, { headers });
        if (eleveRes.ok) {
          const eleveData = await eleveRes.json();
          setEleve(eleveData);
        }
        
        // Récupérer toutes les absences de l'élève
        const absencesRes = await fetch(`/api/absences?eleveId=${params.id}`, { headers });
        if (absencesRes.ok) {
          const absencesData = await absencesRes.json();
          setAbsences(Array.isArray(absencesData) ? absencesData : []);
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, params.id, getAuthHeaders]);

  const absencesFiltrees = absences.filter(a => {
    if (filter === "justifiees") return a.justifiee;
    if (filter === "nonJustifiees") return !a.justifiee;
    return true;
  });

  const totalHeures = absences.reduce((sum, a) => sum + (a.heuresAbsence || a.duree || 2), 0);
  const justifiees = absences.filter(a => a.justifiee).length;
  const nonJustifiees = absences.length - justifiees;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition">
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-red-600">
              <Clock size={28} strokeWidth={1.8} />
            </div>
            Relevé d'absences
          </h1>
          {eleve && <p className="text-sm text-slate-500 mt-1 ml-14">{eleve.nom} • {eleve.classe}</p>}
        </div>
        <button onClick={() => window.print()} className="p-2 bg-white border rounded-lg text-slate-500 hover:bg-slate-50">
          <Printer size={18} />
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-800">{totalHeures}h</p>
          <p className="text-xs text-slate-500">Total heures d'absence</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{justifiees}</p>
          <p className="text-xs text-slate-500">Absences justifiées</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-600">{nonJustifiees}</p>
          <p className="text-xs text-slate-500">Absences non justifiées</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter("justifiees")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "justifiees" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Justifiées
          </button>
          <button
            onClick={() => setFilter("nonJustifiees")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "nonJustifiees" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Non justifiées
          </button>
        </div>
      </div>

      {/* Tableau des absences */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-500 text-[11px] font-bold uppercase">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Horaire</th>
                <th className="px-4 py-3 text-left">Matière</th>
                <th className="px-4 py-3 text-center">Durée</th>
                <th className="px-4 py-3 text-center">Justifiée</th>
                <th className="px-4 py-3 text-left">Motif</th>
              </tr>
            </thead>
            <tbody>
              {absencesFiltrees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Aucune absence à afficher
                  </td>
                </tr>
              ) : (
                absencesFiltrees.map((absence) => (
                  <tr key={absence.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">{absence.heureDebut} - {absence.heureFin}</td>
                    <td className="px-4 py-3">{absence.cours?.matiere || "—"}</td>
                    <td className="px-4 py-3 text-center">{absence.heuresAbsence || absence.duree}h</td>
                    <td className="px-4 py-3 text-center">
                      {absence.justifiee ? 
                        <CheckCircle size={16} className="text-green-500 mx-auto" /> : 
                        <XCircle size={16} className="text-red-500 mx-auto" />
                      }
                    </td>
                    <td className="px-4 py-3">{absence.motif || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}