// app/enseignant/absences/page.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, Users, Search, Download,
  X, CheckCircle, XCircle, AlertCircle, UserX, BookOpen,
  TrendingUp, FileText, Loader2, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  parentEmail?: string;
  parentTelephone?: string;
}

interface Absence {
  id: number;
  eleveId: number;
  coursId: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  heuresAbsence: number;
  justifiee: boolean;
  motif: string;
  enseignantId: number;
  cours?: {
    matiere: string;
    salle: string;
  };
  eleve?: {
    nom: string;
    classe: string;
  };
}

function parseJsonField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

// Composant de statistiques
function StatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Clock size={16} />
          <span className="text-xs">Total heures</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{stats.totalHeures}h</p>
      </div>
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <UserX size={16} />
          <span className="text-xs">Total absences</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{stats.totalAbsences}</p>
      </div>
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-green-600 mb-1">
          <CheckCircle size={16} />
          <span className="text-xs">Justifiées</span>
        </div>
        <p className="text-2xl font-bold text-green-600">{stats.absencesJustifiees}</p>
      </div>
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-red-600 mb-1">
          <AlertCircle size={16} />
          <span className="text-xs">Non justifiées</span>
        </div>
        <p className="text-2xl font-bold text-red-600">{stats.absencesNonJustifiees}</p>
      </div>
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <TrendingUp size={16} />
          <span className="text-xs">Moyenne/élève</span>
        </div>
        <p className="text-2xl font-bold text-blue-600">{stats.moyenneParEleve.toFixed(1)}h</p>
      </div>
    </div>
  );
}

export default function AbsencesPage() {
  const { user, isTeacher, token } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classesDisponibles, setClassesDisponibles] = useState<string[]>([]);
  const [selectedClasse, setSelectedClasse] = useState("");
  const [selectedEleve, setSelectedEleve] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Charger les classes de l'enseignant
  useEffect(() => {
    const fetchEnseignantData = async () => {
      if (!token || !isTeacher || !user?.enseignantId) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        const enseignantRes = await fetch(`/api/enseignants/${user.enseignantId}`, { headers });
        const enseignant = await enseignantRes.json();
        const classes = parseJsonField(enseignant.classes);
        setClassesDisponibles(classes);
        if (classes.length > 0) {
          setSelectedClasse(classes[0]);
        }
      } catch (err) {
        console.error("Erreur chargement enseignant:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnseignantData();
  }, [token, isTeacher, user, getAuthHeaders]);

  // Charger les élèves de la classe sélectionnée
  useEffect(() => {
    const fetchEleves = async () => {
      if (!token || !selectedClasse) return;
      
      try {
        const headers = getAuthHeaders();
        const elevesRes = await fetch('/api/eleves', { headers });
        const allEleves = await elevesRes.json();
        const filteredEleves = allEleves.filter((e: any) => e.classe === selectedClasse);
        setEleves(filteredEleves);
      } catch (err) {
        console.error("Erreur chargement élèves:", err);
      }
    };
    
    fetchEleves();
  }, [selectedClasse, token, getAuthHeaders]);

  // Charger les absences depuis l'API absences
  useEffect(() => {
    const fetchAbsences = async () => {
      if (!token || !selectedClasse) return;
      
      try {
        const headers = getAuthHeaders();
        // Récupérer les absences pour cette classe
        const absencesRes = await fetch(`/api/absences?classe=${encodeURIComponent(selectedClasse)}`, { headers });
        
        if (!absencesRes.ok) {
          throw new Error(`Erreur HTTP: ${absencesRes.status}`);
        }
        
        const data = await absencesRes.json();
        console.log("📋 Absences reçues de l'API:", data.length);
        
        // S'assurer que les données sont formatées correctement
        const formattedAbsences = Array.isArray(data) ? data.map((a: any) => ({
          ...a,
          cours: a.cours || { matiere: "Cours", salle: "-" },
          eleve: a.eleve || { nom: "Inconnu", classe: selectedClasse }
        })) : [];
        
        setAbsences(formattedAbsences);
      } catch (err) {
        console.error("Erreur chargement absences:", err);
        setAbsences([]);
      }
    };
    
    fetchAbsences();
  }, [selectedClasse, token, getAuthHeaders]);

  // Filtrer les absences
  const filteredAbsences = useMemo(() => {
    let filtered = absences;
    if (selectedEleve) {
      filtered = filtered.filter(a => a.eleveId === selectedEleve);
    }
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.eleve?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cours?.matiere?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.motif?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [absences, selectedEleve, searchTerm]);

  // Grouper les absences par élève
  const absencesParEleve = useMemo(() => {
    const grouped: { [key: number]: { eleve: Eleve, totalHeures: number, absences: Absence[] } } = {};
    
    filteredAbsences.forEach(absence => {
      const eleve = eleves.find(e => e.id === absence.eleveId);
      if (!eleve) return;
      
      if (!grouped[absence.eleveId]) {
        grouped[absence.eleveId] = {
          eleve,
          totalHeures: 0,
          absences: []
        };
      }
      grouped[absence.eleveId].totalHeures += absence.heuresAbsence || absence.duree || 2;
      grouped[absence.eleveId].absences.push(absence);
    });
    
    return Object.values(grouped).sort((a, b) => b.totalHeures - a.totalHeures);
  }, [filteredAbsences, eleves]);

  // Calculer les stats
  const stats = useMemo(() => {
    const totalHeures = filteredAbsences.reduce((sum, a) => sum + (a.heuresAbsence || a.duree || 2), 0);
    const totalAbsences = filteredAbsences.length;
    const absencesJustifiees = filteredAbsences.filter(a => a.justifiee).length;
    const absencesNonJustifiees = totalAbsences - absencesJustifiees;
    const moyenneParEleve = eleves.length ? totalHeures / eleves.length : 0;
    
    return {
      totalHeures,
      totalAbsences,
      absencesJustifiees,
      absencesNonJustifiees,
      moyenneParEleve
    };
  }, [filteredAbsences, eleves]);

  // Exporter Excel
  const handleExportExcel = () => {
    const exportData = absencesParEleve.flatMap(item => 
      item.absences.map(absence => ({
        "Élève": item.eleve.nom,
        "Date": new Date(absence.date).toLocaleDateString('fr-FR'),
        "Heure": `${absence.heureDebut} - ${absence.heureFin}`,
        "Durée": `${absence.heuresAbsence || absence.duree}h`,
        "Matière": absence.cours?.matiere || "-",
        "Justifiée": absence.justifiee ? "OUI" : "NON",
        "Motif": absence.motif || "-"
      }))
    );
    
    if (exportData.length === 0) {
      alert("Aucune absence à exporter");
      return;
    }
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absences");
    XLSX.writeFile(wb, `absences_${selectedClasse}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isTeacher) return null;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Bouton retour */}
      <button onClick={() => router.push('/enseignant/appel')} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition mb-2">
        <ArrowLeft size={18} /> Retour à l'appel
      </button>

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <UserX size={28} strokeWidth={1.8} />
            </div>
            Suivi des absences
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Gestion des heures d'absence par élève</p>
        </div>
        <button onClick={handleExportExcel} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-green-100">
          <FileText size={16} /> Exporter Excel
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Classe</label>
            <select 
              value={selectedClasse} 
              onChange={(e) => setSelectedClasse(e.target.value)} 
              className="w-full p-2 bg-slate-50 border rounded-xl text-sm"
            >
              {classesDisponibles.map(classe => <option key={classe} value={classe}>{classe}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Élève</label>
            <select 
              value={selectedEleve || ""} 
              onChange={(e) => setSelectedEleve(e.target.value ? parseInt(e.target.value) : null)} 
              className="w-full p-2 bg-slate-50 border rounded-xl text-sm"
            >
              <option value="">Tous les élèves</option>
              {eleves.map(eleve => <option key={eleve.id} value={eleve.id}>{eleve.nom}</option>)}
            </select>
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Recherche</label>
            <Search size={16} className="absolute left-3 top-9 text-slate-400" />
            <input 
              type="text" 
              placeholder="Élève, matière..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm" 
            />
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <StatsCards stats={stats} />

      {/* Message si aucune absence */}
      {filteredAbsences.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <CheckCircle size={48} className="mx-auto text-green-300 mb-3" />
          <p className="text-slate-400">Aucune absence enregistrée pour cette classe</p>
          <p className="text-xs text-slate-400 mt-1">Les absences apparaîtront après avoir fait l'appel</p>
          <button 
            onClick={() => router.push('/enseignant/appel')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
          >
            Faire l'appel
          </button>
        </div>
      )}

      {/* Tableau récapitulatif par élève */}
      {filteredAbsences.length > 0 && (
        <>
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-semibold flex items-center gap-2">
                <Users size={18} /> Récapitulatif des heures d'absence par élève
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-slate-500 text-[11px] font-bold uppercase">
                    <th className="px-4 py-3 text-left">Élève</th>
                    <th className="px-4 py-3 text-center">Total heures</th>
                    <th className="px-4 py-3 text-center">Nb absences</th>
                    <th className="px-4 py-3 text-center">Justifiées</th>
                    <th className="px-4 py-3 text-center">Non justifiées</th>
                    <th className="px-4 py-3 text-center">Moyenne/cours</th>
                  </tr>
                </thead>
                <tbody>
                  {absencesParEleve.map((item) => {
                    const justifiees = item.absences.filter(a => a.justifiee).length;
                    const nonJustifiees = item.absences.length - justifiees;
                    const moyenneParCours = item.absences.length ? (item.totalHeures / item.absences.length).toFixed(1) : 0;
                    return (
                      <tr key={item.eleve.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedEleve(selectedEleve === item.eleve.id ? null : item.eleve.id)}>
                        <td className="px-4 py-3 font-medium">{item.eleve.nom}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">{item.totalHeures}h</td>
                        <td className="px-4 py-3 text-center">{item.absences.length}</td>
                        <td className="px-4 py-3 text-center text-green-600">{justifiees}</td>
                        <td className="px-4 py-3 text-center text-red-600">{nonJustifiees}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{moyenneParCours}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Détail des absences */}
          {selectedEleve && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock size={18} /> Détail des absences
                </h3>
                <button onClick={() => setSelectedEleve(null)} className="text-xs text-red-500">Fermer</button>
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
                    {absencesParEleve.find(i => i.eleve.id === selectedEleve)?.absences.map((absence, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3">{absence.heureDebut} - {absence.heureFin}</td>
                        <td className="px-4 py-3">{absence.cours?.matiere || "-"}</td>
                        <td className="px-4 py-3 text-center">{absence.heuresAbsence || absence.duree}h</td>
                        <td className="px-4 py-3 text-center">
                          {absence.justifiee ? <CheckCircle size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-red-500 mx-auto" />}
                        </td>
                        <td className="px-4 py-3">{absence.motif || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}