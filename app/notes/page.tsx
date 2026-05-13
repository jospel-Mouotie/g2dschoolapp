// app/notes/page.tsx
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { FileText, Save, Edit, Download, Printer, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toutesLesMatieres, periodes, calculerMoyenne, getAppreciation } from "@/components/notes/utils";
import EnvoiModal from "@/components/notes/EnvoiModal";
import BulletinModal from "@/components/notes/BulletinModal";
import StatsCards from "@/components/notes/StatsCards";
import NotesFilters from "@/components/notes/NotesFilters";
import ImportExcelModal from "@/components/notes/ImportExcelModal";
import NotesTable from "@/components/notes/NotesTable";

// Fonction pour parser les champs JSON
function parseJsonField(field: any): any[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

export default function NotesPage() {
  const { user, isAdmin, isTeacher, token } = useAuth();
  
  const [eleves, setEleves] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [etablissement, setEtablissement] = useState<any>(null);
  const [cours, setCours] = useState<any[]>([]);
  const [allNotes, setAllNotes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [classe, setClasse] = useState("");
  const [matiereId, setMatiereId] = useState("");
  const [periode, setPeriode] = useState("1er TRIMESTRE");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEnvoiModal, setShowEnvoiModal] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<any>(null);
  const [bulletinEleve, setBulletinEleve] = useState<any>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        const [elevesRes, enseignantsRes, etablissementRes, coursRes] = await Promise.all([
          fetch('/api/eleves', { headers }),
          fetch('/api/enseignants', { headers }),
          fetch('/api/etablissement', { headers }),
          fetch('/api/cours', { headers })
        ]);
        
        const elevesData = await elevesRes.json();
        const enseignantsData = await enseignantsRes.json();
        const etablissementData = await etablissementRes.json();
        const coursData = await coursRes.json();
        
        setEleves(Array.isArray(elevesData) ? elevesData : []);
        setEnseignants(Array.isArray(enseignantsData) ? enseignantsData : []);
        setEtablissement(etablissementData);
        setCours(Array.isArray(coursData) ? coursData : []);
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, getAuthHeaders]);

  // Charger les notes existantes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!token || !classe || !matiereId || !periode) return;
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/notes?classe=${classe}&matiere=${matiereId}&periode=${periode}`, { headers });
        if (response.ok) {
          const data = await response.json();
          const key = `${classe}_${matiereId}_${periode}`;
          setAllNotes(prev => ({ ...prev, [key]: Array.isArray(data) ? data : [] }));
        } else {
          // Si l'API n'existe pas encore, initialiser avec un tableau vide
          const key = `${classe}_${matiereId}_${periode}`;
          setAllNotes(prev => ({ ...prev, [key]: [] }));
        }
      } catch (err) {
        console.error("Erreur chargement notes:", err);
        // Initialiser avec un tableau vide en cas d'erreur
        const key = `${classe}_${matiereId}_${periode}`;
        setAllNotes(prev => ({ ...prev, [key]: [] }));
      }
    };
    
    fetchNotes();
  }, [token, classe, matiereId, periode, getAuthHeaders]);

  // Récupérer l'enseignant connecté
  const enseignantConnecte = useMemo(() => {
    if (!isTeacher || !user?.enseignantId) return null;
    return enseignants.find(e => e.id === user.enseignantId);
  }, [isTeacher, user, enseignants]);

  // Classes autorisées
  const classesAutorisees = useMemo(() => {
    if (isAdmin) {
      const allClasses = Array.from(new Set(eleves.map(e => e.classe))).sort();
      return allClasses;
    }
    if (isTeacher && enseignantConnecte) {
      return parseJsonField(enseignantConnecte.classes);
    }
    return [];
  }, [isAdmin, isTeacher, enseignantConnecte, eleves]);

  // Matières autorisées
  const matieresAutorisees = useMemo(() => {
    if (isAdmin) return toutesLesMatieres;
    if (isTeacher && enseignantConnecte) {
      const matieresNames = parseJsonField(enseignantConnecte.matieres);
      return toutesLesMatieres.filter(m => matieresNames.includes(m.nom));
    }
    return [];
  }, [isAdmin, isTeacher, enseignantConnecte]);

  // Sélection par défaut
  useEffect(() => {
    if (classesAutorisees.length > 0 && !classe) setClasse(classesAutorisees[0]);
    if (matieresAutorisees.length > 0 && !matiereId) setMatiereId(matieresAutorisees[0].id);
  }, [classesAutorisees, matieresAutorisees, classe, matiereId]);

  // Filtrer les élèves par classe
  const elevesFiltres = useMemo(() => {
    if (!classe) return [];
    return eleves.filter(e => e.classe === classe);
  }, [eleves, classe]);

  const elevesRecherche = useMemo(() => {
    if (!elevesFiltres.length) return [];
    return elevesFiltres.filter((e) => 
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [elevesFiltres, searchTerm]);

  const notesKey = classe && matiereId ? `${classe}_${matiereId}_${periode}` : "";
  const currentNotes = useMemo(() => {
    if (!notesKey) return [];
    const notes = allNotes[notesKey];
    return Array.isArray(notes) ? notes : [];
  }, [allNotes, notesKey]);
  
  const currentMatiere = matieresAutorisees.find(m => m.id === matiereId);

  const getNoteData = (eleveId: number) => {
    const found = currentNotes.find((n: any) => n.eleveId === eleveId);
    return { eval1: found?.eval1 ?? null, eval2: found?.eval2 ?? null, moyenne: found?.moyenne ?? null };
  };

  const updateNotes = async (eleveId: number, eval1: number | null, eval2: number | null) => {
    const moyenne = calculerMoyenne(eval1, eval2);
    const appreciation = getAppreciation(moyenne);
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eleveId,
          matiereId,
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
      }
    } catch (error) {
      console.error("Erreur sauvegarde note:", error);
    }
  };

  const importNotes = async (notesMap: Map<string, { eval1: number | null, eval2: number | null }>) => {
    const notesToSave = [];
    for (const eleve of elevesFiltres) {
      const imported = notesMap.get(eleve.nom);
      if (imported && (imported.eval1 !== undefined || imported.eval2 !== undefined)) {
        const eval1 = imported.eval1 !== undefined ? imported.eval1 : null;
        const eval2 = imported.eval2 !== undefined ? imported.eval2 : null;
        const moyenne = calculerMoyenne(eval1, eval2);
        const appreciation = getAppreciation(moyenne);
        notesToSave.push({
          eleveId: eleve.id,
          matiereId,
          periode,
          eval1,
          eval2,
          moyenne,
          appreciation
        });
      }
    }
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/notes/batch', {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: notesToSave })
      });
      
      if (response.ok) {
        const savedNotes = await response.json();
        setAllNotes({ ...allNotes, [notesKey]: savedNotes });
      }
    } catch (error) {
      console.error("Erreur import notes:", error);
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

  const exportCSV = () => {
    const headers = ["Élève", "Éval.1", "Éval.2", "Moyenne", "Appréciation"];
    const rows = elevesFiltres.map((e) => {
      const n = getNoteData(e.id);
      return [e.nom, n.eval1 ?? "", n.eval2 ?? "", n.moyenne ?? "", getAppreciation(n.moyenne)];
    });
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `notes_${classe}_${matiereId}_${periode}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnvoyerMatiere = (eleve: any, note: any) => {
    setSelectedEleve(eleve);
    setSelectedNote(note);
    setShowEnvoiModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Message si l'enseignant n'a pas accès
  if (isTeacher && (!enseignantConnecte || classesAutorisees.length === 0 || matieresAutorisees.length === 0)) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Accès limité</h2>
          <p className="text-slate-500">
            Vous n'avez pas encore été assigné à des classes ou matières.
            Veuillez contacter l'administrateur pour configurer vos accès.
          </p>
          <button onClick={() => window.location.href = "/"} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen print:p-2 print:bg-white">

      {/* EN-TÊTE */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-indigo-600">
              <FileText size={24} className="sm:w-7 sm:h-7" strokeWidth={1.8} />
            </div>
            Gestion des Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12 sm:ml-14">
            {isAdmin ? "Saisie, suivi, analyse et communication" : "Saisie des notes de vos matières"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button onClick={() => setShowImportModal(true)} className="px-3 sm:px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-2 text-xs sm:text-sm font-medium">
              <FileSpreadsheet size={14} className="sm:w-4 sm:h-4" /> Importer Excel
            </button>
          )}
          <button onClick={exportCSV} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition">
            <Download size={16} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => window.print()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition">
            <Printer size={16} className="sm:w-4 sm:h-4" />
          </button>
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                editMode ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              }`}
            >
              {editMode ? <Save size={14} className="sm:w-4 sm:h-4" /> : <Edit size={14} className="sm:w-4 sm:h-4" />}
              {editMode ? "Enregistrer" : "Modifier"}
            </button>
          )}
        </div>
      </div>

      {/* FILTRES */}
      <NotesFilters
        matieresDisponibles={matieresAutorisees}
        matiere={matiereId}
        setMatiere={setMatiereId}
        periode={periode}
        setPeriode={setPeriode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        periodes={periodes}
        classesDisponibles={classesAutorisees}
        classe={classe}
        setClasse={setClasse}
        isAdmin={isAdmin}
      />

      {/* STATISTIQUES */}
      <StatsCards
        moyenne={stats.moyenne}
        tauxReussite={stats.tauxReussite}
        meilleure={stats.meilleure}
        pire={stats.pire}
        effectif={elevesFiltres.length}
        coefficient={currentMatiere?.coefficient}
      />

      {/* TABLEAU DES NOTES */}
      <NotesTable
        eleves={elevesRecherche}
        getNoteData={getNoteData}
        updateNotes={updateNotes}
        editMode={editMode}
        currentMatiere={currentMatiere}
        periode={periode}
        classe={classe}
        allNotes={allNotes}
        elevesList={elevesFiltres}
        enseignants={enseignants}
        etablissement={etablissement}
        cours={cours}
        stats={stats}
        onBulletinChange={setBulletinEleve}
        onEnvoiChange={handleEnvoyerMatiere}
      />

      {/* MODALS */}
      {bulletinEleve && (
        <BulletinModal 
          eleve={bulletinEleve} 
          allNotes={allNotes} 
          classe={classe} 
          periode={periode} 
          elevesList={elevesFiltres} 
          enseignants={enseignants} 
          etablissement={etablissement}
          cours={cours}
          stats={stats}
          onClose={() => setBulletinEleve(null)} 
        />
      )}
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
      {showImportModal && isAdmin && (
        <ImportExcelModal 
          onClose={() => setShowImportModal(false)} 
          onImport={importNotes} 
          elevesList={elevesFiltres} 
          classe={classe} 
          matiereNom={currentMatiere?.nom} 
          periode={periode} 
        />
      )}
    </div>
  );
}