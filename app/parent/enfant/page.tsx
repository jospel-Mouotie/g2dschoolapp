// app/parent/enfant/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, BookOpen, Calendar, Clock, FileText, Bell,
  TrendingUp, Award, BarChart3, Users, MessageSquare,
  Eye, Download, Printer, CheckCircle, XCircle,
  AlertCircle, Loader2, Home, ChevronRight, Mail, Phone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  matricule: string;
  email?: string;
  telephone?: string;
  photo?: string;
  img?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  parentNom?: string;
  parentTelephone?: string;
  parentEmail?: string;
}

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

export default function ParentEnfantPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
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
    if (!isLoading && (!user || user.role !== 'parent')) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchParentData = async () => {
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
        
        // Récupérer les notes de l'élève
        const notesRes = await fetch(`/api/notes?eleveId=${user.eleveId}`, { headers });
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(Array.isArray(notesData) ? notesData : []);
        }
        
        // Récupérer les absences de l'élève
        const absencesRes = await fetch(`/api/absences?eleveId=${user.eleveId}`, { headers });
        if (absencesRes.ok) {
          const absencesData = await absencesRes.json();
          setAbsences(Array.isArray(absencesData) ? absencesData : []);
        }
        
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchParentData();
  }, [token, user, getAuthHeaders]);

  // Filtrer les notes par période
  const notesFiltrees = notes.filter(n => n.periode === selectedPeriode);
  
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
  
  // Calculer les statistiques des notes
  const notesStats = (() => {
    const moyennes = notesFiltrees.filter(n => n.moyenne !== null).map(n => n.moyenne as number);
    if (moyennes.length === 0) return { meilleure: 0, pire: 0, moyenne: 0 };
    return {
      meilleure: Math.max(...moyennes),
      pire: Math.min(...moyennes),
      moyenne: moyennes.reduce((a, b) => a + b, 0) / moyennes.length
    };
  })();
  
  // Calculer les statistiques des absences
  const totalHeuresAbsence = absences.reduce((sum, a) => sum + (a.heuresAbsence || a.duree || 2), 0);
  const absencesJustifiees = absences.filter(a => a.justifiee).length;
  const absencesNonJustifiees = absences.length - absencesJustifiees;

  // Obtenir l'URL de la photo
  const getPhotoUrl = () => {
    if (eleve?.img && (eleve.img.startsWith('http') || eleve.img.startsWith('data:image'))) {
      return eleve.img;
    }
    if (eleve?.photo && (eleve.photo.startsWith('http') || eleve.photo.startsWith('data:image'))) {
      return eleve.photo;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve?.nom || 'Élève')}&background=6366f1&color=fff&size=150&rounded=true&bold=true`;
  };

  // Obtenir la mention
  const getMention = (moyenne: number | null) => {
    if (moyenne === null) return { text: "Non évalué", color: "text-slate-400", bg: "bg-slate-100" };
    if (moyenne >= 16) return { text: "Très Bien", color: "text-purple-700", bg: "bg-purple-100" };
    if (moyenne >= 14) return { text: "Bien", color: "text-blue-700", bg: "bg-blue-100" };
    if (moyenne >= 12) return { text: "Assez Bien", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (moyenne >= 10) return { text: "Passable", color: "text-amber-700", bg: "bg-amber-100" };
    return { text: "Insuffisant", color: "text-red-700", bg: "bg-red-100" };
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'parent') {
    return null;
  }

  const mention = getMention(parseFloat(moyenneGenerale as string));

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <User size={28} strokeWidth={1.8} />
            </div>
            Mon enfant
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">
            Suivez la scolarité de votre enfant
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="p-2 bg-white border rounded-lg text-slate-500 hover:bg-slate-50 transition">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Carte de l'élève */}
      {eleve && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="absolute -bottom-12 left-6">
              <img 
                src={getPhotoUrl()} 
                alt={eleve.nom} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          </div>
          <div className="pt-14 px-6 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{eleve.nom}</h2>
                <p className="text-sm text-slate-500">{eleve.classe} • Matricule: {eleve.matricule}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                  {eleve.email && (
                    <div className="flex items-center gap-1">
                      <Mail size={12} /> {eleve.email}
                    </div>
                  )}
                  {eleve.telephone && (
                    <div className="flex items-center gap-1">
                      <Phone size={12} /> {eleve.telephone}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/parent/notes/${eleve.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                  Voir toutes les notes
                </button>
                <button 
                  onClick={() => router.push(`/parent/absences/${eleve.id}`)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
                >
                  Voir les absences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Clock size={16} />
            <span className="text-xs">Heures d'absence</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{totalHeuresAbsence}h</p>
          <p className="text-xs text-slate-400 mt-1">{absences.length} absence(s)</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle size={16} />
            <span className="text-xs">Absences justifiées</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{absencesJustifiees}</p>
          <p className="text-xs text-slate-400 mt-1">Non justifiées: {absencesNonJustifiees}</p>
        </div>
      </div>

      {/* Sélecteur de période pour les notes */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPeriode("1er TRIMESTRE")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedPeriode === "1er TRIMESTRE" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            1er Trimestre
          </button>
          <button
            onClick={() => setSelectedPeriode("2nd TRIMESTRE")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedPeriode === "2nd TRIMESTRE" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            2nd Trimestre
          </button>
          <button
            onClick={() => setSelectedPeriode("3ème TRIMESTRE")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedPeriode === "3ème TRIMESTRE" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            3ème Trimestre
          </button>
        </div>
      </div>

      {/* Dernières notes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen size={18} /> Notes - {selectedPeriode}
          </h3>
        </div>
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
                        <span className={note.moyenne >= 10 ? "text-green-600" : "text-red-600"}>
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

      {/* Dernières absences */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock size={18} /> Dernières absences
          </h3>
        </div>
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
              {absences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Aucune absence enregistrée
                  </td>
                </tr>
              ) : (
                absences.slice(0, 5).map((absence) => (
                  <tr key={absence.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">{absence.heureDebut} - {absence.heureFin}</td>
                    <td className="px-4 py-3">{absence.cours?.matiere || "—"}</td>
                    <td className="px-4 py-3 text-center">{absence.heuresAbsence || absence.duree}h</td>
                    <td className="px-4 py-3 text-center">
                      {absence.justifiee ? 
                        <span className="text-green-600 text-xs">Justifiée</span> : 
                        <span className="text-red-600 text-xs">Non justifiée</span>
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