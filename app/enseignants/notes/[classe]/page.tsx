// app/enseignants/notes/[classe]/page.tsx
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  Search, 
  Send, 
  FileText, 
  TrendingUp,
  Award,
  BarChart3,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toutesLesMatieres, periodes, calculerMoyenne, getAppreciation, getElevePhoto, getMentionColor, getMentionBg } from "@/components/notes/utils";
import EnvoiModal from "@/components/notes/EnvoiModal";

// Fonction pour parser les champs JSON
function parseJsonField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

// Composant StatsCard local
function StatsCard({ title, value, sub, icon, bgColor }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-400 font-medium">{title}</span>
        <div className={`p-1.5 rounded-lg ${bgColor}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

export default function EnseignantNotesPage() {
  const params = useParams();
  const router = useRouter();
  const classe = decodeURIComponent(params.classe as string);
  const { user, isTeacher, isLoading: authLoading, token } = useAuth();
  
  const [eleves, setEleves] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [etablissement, setEtablissement] = useState<any>(null);
  const [allNotes, setAllNotes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [matiere, setMatiere] = useState("");
  const [periode, setPeriode] = useState("1er TRIMESTRE");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnvoiModal, setShowEnvoiModal] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<any>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [enseignantConnecte, setEnseignantConnecte] = useState<any>(null);
  const [matieresAutorisees, setMatieresAutorisees] = useState<string[]>([]);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Charger l'enseignant connecté
  useEffect(() => {
    const fetchEnseignant = async () => {
      if (!token || !user?.enseignantId) return;
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/enseignants/${user.enseignantId}`, { headers });
        
        if (!response.ok) {
          throw new Error('Erreur chargement enseignant');
        }
        
        const data = await response.json();
        setEnseignantConnecte(data);
        
        const matieres = parseJsonField(data.matieres);
        setMatieresAutorisees(matieres);
        
        // Sélectionner la première matière par défaut
        if (matieres.length > 0 && !matiere) {
          const premiereMatiere = toutesLesMatieres.find(m => m.nom === matieres[0]);
          if (premiereMatiere) {
            setMatiere(premiereMatiere.id);
          }
        }
      } catch (err) {
        console.error("Erreur chargement enseignant:", err);
        setError("Erreur de chargement des données de l'enseignant");
      }
    };
    
    fetchEnseignant();
  }, [token, user, getAuthHeaders, matiere]);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        const [elevesRes, enseignantsRes, etablissementRes] = await Promise.all([
          fetch('/api/eleves', { headers }),
          fetch('/api/enseignants', { headers }),
          fetch('/api/etablissement', { headers })
        ]);
        
        const elevesData = await elevesRes.json();
        const enseignantsData = await enseignantsRes.json();
        const etablissementData = await etablissementRes.json();
        
        setEleves(Array.isArray(elevesData) ? elevesData : []);
        setEnseignants(Array.isArray(enseignantsData) ? enseignantsData : []);
        setEtablissement(etablissementData);
      } catch (err) {
        console.error("Erreur chargement données:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, getAuthHeaders]);

  // Charger les notes existantes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!token || !classe || !matiere || !periode) return;
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/notes?classe=${classe}&matiere=${matiere}&periode=${periode}`, { headers });
        if (response.ok) {
          const data = await response.json();
          const key = `${classe}_${matiere}_${periode}`;
          setAllNotes(prev => ({ ...prev, [key]: Array.isArray(data) ? data : [] }));
        } else {
          const key = `${classe}_${matiere}_${periode}`;
          setAllNotes(prev => ({ ...prev, [key]: [] }));
        }
      } catch (err) {
        console.error("Erreur chargement notes:", err);
        const key = `${classe}_${matiere}_${periode}`;
        setAllNotes(prev => ({ ...prev, [key]: [] }));
      }
    };
    
    fetchNotes();
  }, [token, classe, matiere, periode, getAuthHeaders]);

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && !isTeacher) {
      router.push('/');
    }
  }, [authLoading, isTeacher, router]);

  // Filtrer les élèves par classe
  const elevesFiltres = useMemo(() => {
    return eleves.filter(e => e.classe === classe);
  }, [eleves, classe]);

  const elevesRecherche = useMemo(() => {
    return elevesFiltres.filter(e => 
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [elevesFiltres, searchTerm]);

  const notesKey = classe && matiere ? `${classe}_${matiere}_${periode}` : "";
  const currentNotes = useMemo(() => {
    if (!notesKey) return [];
    const notes = allNotes[notesKey];
    return Array.isArray(notes) ? notes : [];
  }, [allNotes, notesKey]);

  const currentMatiere = toutesLesMatieres.find(m => m.id === matiere);

  const getNoteData = (eleveId: number) => {
    const found = currentNotes.find((n: any) => n.eleveId === eleveId);
    return { eval1: found?.eval1 ?? null, eval2: found?.eval2 ?? null, moyenne: found?.moyenne ?? null };
  };

  const updateNotes = async (eleveId: number, eval1: number | null, eval2: number | null) => {
    if (!editMode) return;
    
    const moyenne = calculerMoyenne(eval1, eval2);
    const appreciation = getAppreciation(moyenne);
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eleveId,
          matiereId: matiere,
          periode,
          eval1,
          eval2,
          moyenne,
          appreciation
        })
      });
      
      if (response.ok) {
        const savedNote = await response.json();
        const existingIndex = currentNotes.findIndex(n => n.eleveId === eleveId);
        let newNotes;
        if (existingIndex >= 0) {
          newNotes = [...currentNotes];
          newNotes[existingIndex] = savedNote;
        } else {
          newNotes = [...currentNotes, savedNote];
        }
        setAllNotes({ ...allNotes, [notesKey]: newNotes });
        
        setSuccess("Note enregistrée");
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (error) {
      console.error("Erreur sauvegarde note:", error);
      setError("Erreur lors de la sauvegarde");
      setTimeout(() => setError(null), 3000);
    }
  };

  const stats = useMemo(() => {
    const moyennes = (Array.isArray(currentNotes) ? currentNotes : [])
      .filter((n: any) => n.moyenne !== null)
      .map((n: any) => n.moyenne as number);
      
    if (!moyennes.length) return { moyenne: "0", tauxReussite: "0", meilleure: "0", pire: "20" };
    const moyenne = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
    const tauxReussite = (moyennes.filter(v => v >= 10).length / moyennes.length) * 100;
    return {
      moyenne: moyenne.toFixed(1),
      tauxReussite: tauxReussite.toFixed(0),
      meilleure: Math.max(...moyennes).toString(),
      pire: Math.min(...moyennes).toString(),
    };
  }, [currentNotes]);

  const handleEnvoyerMatiere = (eleve: any) => {
    setSelectedEleve(eleve);
    setSelectedNote(getNoteData(eleve.id));
    setShowEnvoiModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isTeacher) {
    return null;
  }

  // Vérifier si l'enseignant a des matières assignées
  if (matieresAutorisees.length === 0 && !loading) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aucune matière assignée</h2>
          <p className="text-slate-500">
            Vous n'êtes pas assigné à des matières pour cette classe.
          </p>
          <button onClick={() => router.push('/enseignants/classes')} className="mt-4 flex items-center gap-2 text-blue-600 mx-auto">
            <ArrowLeft size={16} /> Retour à mes classes
          </button>
        </div>
      </div>
    );
  }

  // Vérifier si la classe a des élèves
  if (elevesFiltres.length === 0 && !loading) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">👨‍🎓</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aucun élève dans cette classe</h2>
          <p className="text-slate-500">
            La classe {classe} n'a pas encore d'élèves inscrits.
          </p>
          <button onClick={() => router.push('/enseignants/classes')} className="mt-4 flex items-center gap-2 text-blue-600 mx-auto">
            <ArrowLeft size={16} /> Retour à mes classes
          </button>
        </div>
      </div>
    );
  }

  const matieresDisponibles = toutesLesMatieres.filter(m => matieresAutorisees.includes(m.nom));

  return (
    <div className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Bouton retour */}
      <button onClick={() => router.push('/enseignants/classes')} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition mb-2">
        <ArrowLeft size={18} /> Retour à mes classes
      </button>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <FileText size={24} />
            </div>
            Saisie des notes - {classe}
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-12">
            Gérez les notes - {elevesFiltres.length} élève(s)
          </p>
        </div>
        
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-2 px-3 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-2 px-3 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {success}
          </div>
        )}
        
        <button 
          onClick={() => setEditMode(!editMode)} 
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${editMode ? "bg-emerald-600 text-white shadow-md" : "bg-blue-600 text-white shadow-md"}`}
        >
          {editMode ? <Save size={14} /> : <Edit size={14} />}
          {editMode ? "Enregistrer" : "Modifier les notes"}
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Matière</label>
            <select 
              value={matiere} 
              onChange={(e) => setMatiere(e.target.value)} 
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              {matieresDisponibles.map((m) => (
                <option key={m.id} value={m.id}>{m.nom} (coeff. {m.coefficient})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Période</label>
            <select 
              value={periode} 
              onChange={(e) => setPeriode(e.target.value)} 
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              {periodes.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Moyenne" value={`${stats.moyenne}/20`} sub={`Coeff ${currentMatiere?.coefficient || "-"}`} icon={<TrendingUp size={16} />} bgColor="bg-blue-50" />
        <StatsCard title="Taux réussite" value={`${stats.tauxReussite}%`} sub="Notes ≥ 10/20" icon={<Award size={16} />} bgColor="bg-emerald-50" />
        <StatsCard title="Meilleure / Pire" value={`${stats.meilleure} / ${stats.pire}`} sub="Notes" icon={<BarChart3 size={16} />} bgColor="bg-purple-50" />
        <StatsCard title="Effectif" value={`${elevesFiltres.length}`} sub="élèves" icon={<Users size={16} />} bgColor="bg-indigo-50" />
      </div>

      {/* Tableau des notes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Élève</th>
                <th className="px-3 py-3 text-left">Photo</th>
                <th className="px-4 py-3 text-center">Éval.1</th>
                <th className="px-4 py-3 text-center">Éval.2</th>
                <th className="px-4 py-3 text-center">Moy.</th>
                <th className="px-4 py-3 text-center">Appréc.</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {elevesRecherche.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Aucun élève trouvé
                  </td>
                </tr>
              ) : (
                elevesRecherche.map((eleve: any) => {
                  const notes = getNoteData(eleve.id);
                  const hasContact = eleve.parentEmail || eleve.parentTelephone;
                  return (
                    <tr key={eleve.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {eleve.nom}
                        {eleve.parentNom && <span className="hidden sm:inline text-[10px] text-slate-400 ml-1">({eleve.parentNom})</span>}
                       </td>
                      <td className="px-3 py-3">
                        <img src={getElevePhoto(eleve)} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                       </td>
                      <td className="px-4 py-3 text-center">
                        {editMode ? (
                          <input 
                            type="number" 
                            step="0.5" 
                            min="0" 
                            max="20" 
                            value={notes.eval1 ?? ""} 
                            onChange={(e) => updateNotes(eleve.id, e.target.value ? parseFloat(e.target.value) : null, notes.eval2)} 
                            className="w-20 p-1.5 border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        ) : (
                          <span className="font-mono">{notes.eval1 !== null ? notes.eval1.toFixed(2) : "—"}</span>
                        )}
                       </td>
                      <td className="px-4 py-3 text-center">
                        {editMode ? (
                          <input 
                            type="number" 
                            step="0.5" 
                            min="0" 
                            max="20" 
                            value={notes.eval2 ?? ""} 
                            onChange={(e) => updateNotes(eleve.id, notes.eval1, e.target.value ? parseFloat(e.target.value) : null)} 
                            className="w-20 p-1.5 border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        ) : (
                          <span className="font-mono">{notes.eval2 !== null ? notes.eval2.toFixed(2) : "—"}</span>
                        )}
                       </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {notes.moyenne !== null ? (
                          <span className={getMentionColor(notes.moyenne)}>{notes.moyenne.toFixed(2)}</span>
                        ) : "—"}
                       </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getMentionBg(notes.moyenne)}`}>
                          {getAppreciation(notes.moyenne)}
                        </span>
                       </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1.5">
                          <button 
                            onClick={() => handleEnvoyerMatiere(eleve)} 
                            title="Envoyer la note" 
                            className={`p-1.5 rounded-lg transition ${hasContact ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`} 
                            disabled={!hasContact}
                          >
                            <Send size={15} />
                          </button>
                        </div>
                       </td>
                     </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'envoi */}
      {showEnvoiModal && selectedEleve && currentMatiere && (
        <EnvoiModal
          eleve={selectedEleve}
          allNotes={allNotes}
          classe={classe}
          periode={periode}
          elevesList={elevesFiltres}
          etablissement={etablissement}
          enseignants={enseignants}
          matiereCourante={selectedNote ? currentMatiere : undefined}
          noteMatiere={selectedNote || undefined}
          onClose={() => { setShowEnvoiModal(false); setSelectedEleve(null); setSelectedNote(null); }}
        />
      )}
    </div>
  );
}