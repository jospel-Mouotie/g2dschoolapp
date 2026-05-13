// app/parent/notes/[id]/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Printer, Loader2, Award, TrendingUp, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Note {
  id: number;
  eleveId: number;
  matiereId: string;
  periode: string;
  eval1: number | null;
  eval2: number | null;
  moyenne: number | null;
  appreciation: string | null;
  matiere?: {
    nom: string;
    coefficient: number;
  };
}

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  matricule: string;
  email?: string;
  telephone?: string;
  img?: string;
  photo?: string;
}

export default function ParentNotesDetail() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriode, setSelectedPeriode] = useState("1er TRIMESTRE");
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !params.id) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        
        // Récupérer les infos de l'élève
        const eleveRes = await fetch(`/api/eleves/${params.id}`, { headers });
        if (eleveRes.ok) {
          const eleveData = await eleveRes.json();
          setEleve(eleveData);
        } else {
          setError("Élève non trouvé");
        }
        
        // Récupérer toutes les notes de l'élève
        const notesRes = await fetch(`/api/notes?eleveId=${params.id}`, { headers });
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          console.log("Notes reçues:", notesData);
          setNotes(Array.isArray(notesData) ? notesData : []);
        } else {
          console.error("Erreur chargement notes:", notesRes.status);
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, params.id, getAuthHeaders]);

  const notesFiltrees = notes.filter(n => n.periode === selectedPeriode);
  const periodes = ["1er TRIMESTRE", "2nd TRIMESTRE", "3ème TRIMESTRE"];

  // Calculer la moyenne générale
  const moyenneGenerale = (() => {
    let totalPoints = 0;
    let totalCoef = 0;
    notesFiltrees.forEach(n => {
      if (n.moyenne !== null && n.matiere) {
        totalPoints += n.moyenne * n.matiere.coefficient;
        totalCoef += n.matiere.coefficient;
      }
    });
    return totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : "N/A";
  })();

  // Calculer les statistiques
  const notesStats = (() => {
    const moyennes = notesFiltrees.filter(n => n.moyenne !== null).map(n => n.moyenne as number);
    if (moyennes.length === 0) return { meilleure: 0, pire: 0, moyenne: 0 };
    return {
      meilleure: Math.max(...moyennes),
      pire: Math.min(...moyennes),
      moyenne: moyennes.reduce((a, b) => a + b, 0) / moyennes.length
    };
  })();

  // Obtenir la mention
  const getMention = (moyenne: string | number) => {
    const value = typeof moyenne === 'string' ? parseFloat(moyenne) : moyenne;
    if (isNaN(value)) return { text: "Non évalué", color: "text-slate-400", bg: "bg-slate-100" };
    if (value >= 16) return { text: "Très Bien", color: "text-purple-700", bg: "bg-purple-100" };
    if (value >= 14) return { text: "Bien", color: "text-blue-700", bg: "bg-blue-100" };
    if (value >= 12) return { text: "Assez Bien", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (value >= 10) return { text: "Passable", color: "text-amber-700", bg: "bg-amber-100" };
    return { text: "Insuffisant", color: "text-red-700", bg: "bg-red-100" };
  };

  const mention = getMention(moyenneGenerale);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erreur</h2>
          <p className="text-slate-500">{error}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Retour
          </button>
        </div>
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
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <BookOpen size={28} strokeWidth={1.8} />
            </div>
            Relevé de notes
          </h1>
          {eleve && (
            <p className="text-sm text-slate-500 mt-1 ml-14">
              {eleve.nom} • {eleve.classe} • Matricule: {eleve.matricule}
            </p>
          )}
        </div>
        <button onClick={() => window.print()} className="p-2 bg-white border rounded-lg text-slate-500 hover:bg-slate-50 transition">
          <Printer size={18} />
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs">Moyenne générale</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{moyenneGenerale}/20</p>
          <p className={`text-xs mt-1 ${mention.color}`}>{mention.text}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Award size={16} />
            <span className="text-xs">Meilleure / Pire note</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{notesStats.meilleure.toFixed(1)} / {notesStats.pire.toFixed(1)}</p>
          <p className="text-xs text-slate-400 mt-1">sur {notesFiltrees.length} matières</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <BarChart3 size={16} />
            <span className="text-xs">Moyenne classe</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{notesStats.moyenne.toFixed(1)}/20</p>
          <p className="text-xs text-slate-400 mt-1">Taux de réussite: {notesFiltrees.filter(n => n.moyenne && n.moyenne >= 10).length}/{notesFiltrees.length}</p>
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {periodes.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriode(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedPeriode === p 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des notes */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-500 text-[11px] font-bold uppercase">
                <th className="px-4 py-3 text-left">Matière</th>
                <th className="px-4 py-3 text-center">Devoir</th>
                <th className="px-4 py-3 text-center">Composition</th>
                <th className="px-4 py-3 text-center">Moyenne</th>
                <th className="px-4 py-3 text-center">Coeff</th>
                <th className="px-4 py-3 text-left">Appréciation</th>
              </tr>
            </thead>
            <tbody>
              {notesFiltrees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Aucune note disponible pour cette période
                  </td>
                </tr>
              ) : (
                notesFiltrees.map((note) => (
                  <tr key={note.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{note.matiere?.nom || "—"}</td>
                    <td className="px-4 py-3 text-center">{note.eval1 !== null ? note.eval1.toFixed(2) : "—"}</td>
                    <td className="px-4 py-3 text-center">{note.eval2 !== null ? note.eval2.toFixed(2) : "—"}</td>
                    <td className="px-4 py-3 text-center font-bold">
                      {note.moyenne !== null ? (
                        <span className={note.moyenne >= 10 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                          {note.moyenne.toFixed(2)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">{note.matiere?.coefficient || 1}</td>
                    <td className="px-4 py-3">{note.appreciation || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pied de page */}
      <div className="text-center text-xs text-slate-400 pt-4">
        <p>Bulletin généré le {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="mt-1">G2D School - Plateforme de gestion scolaire</p>
      </div>
    </div>
  );
}