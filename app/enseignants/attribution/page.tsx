// app/enseignants/attribution/page.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Users, Save, X, Search, Plus, Trash2,
  CheckCircle, AlertCircle, Loader2, UserCheck, GraduationCap,
  FileText, ChevronRight, Clock, Filter, Edit
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Enseignant {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  matieres: string;
  classes: string;
  photo?: string;
}

interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
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

function stringifyArray(arr: string[]): string {
  return JSON.stringify(arr);
}

// Modal d'attribution
function AttributionModal({ enseignant, onSave, onClose, isSubmitting, token }: any) {
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedClasse, setSelectedClasse] = useState("");
  const [matieresList, setMatieresList] = useState<Matiere[]>([]);
  const [classesList, setClassesList] = useState<string[]>([]);
  const [assignedMatieres, setAssignedMatieres] = useState<string[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMatiere, setSearchMatiere] = useState("");
  const [searchClasse, setSearchClasse] = useState("");
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
      try {
        setLoading(true);
        const headers = getAuthHeaders();
        
        const matieresRes = await fetch('/api/matieres', { headers });
        const matieresData = await matieresRes.json();
        setMatieresList(Array.isArray(matieresData) ? matieresData : []);
        
        const classesRes = await fetch('/api/classes', { headers });
        const classesData = await classesRes.json();
        setClassesList(Array.isArray(classesData) ? classesData.map((c: any) => c.nom) : []);
        
        if (enseignant) {
          setAssignedMatieres(parseJsonField(enseignant.matieres));
          setAssignedClasses(parseJsonField(enseignant.classes));
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [enseignant, token, getAuthHeaders]);

  const addMatiere = () => {
    if (selectedMatiere && !assignedMatieres.includes(selectedMatiere)) {
      setAssignedMatieres([...assignedMatieres, selectedMatiere]);
      setSelectedMatiere("");
      setSearchMatiere("");
    }
  };

  const removeMatiere = (matiere: string) => {
    setAssignedMatieres(assignedMatieres.filter(m => m !== matiere));
  };

  const addClasse = () => {
    if (selectedClasse && !assignedClasses.includes(selectedClasse)) {
      setAssignedClasses([...assignedClasses, selectedClasse]);
      setSelectedClasse("");
      setSearchClasse("");
    }
  };

  const removeClasse = (classe: string) => {
    setAssignedClasses(assignedClasses.filter(c => c !== classe));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      matieres: assignedMatieres,
      classes: assignedClasses
    });
  };

  const filteredMatieres = matieresList.filter(m => 
    m.nom.toLowerCase().includes(searchMatiere.toLowerCase()) &&
    !assignedMatieres.includes(m.nom)
  );

  const filteredClasses = classesList.filter(c => 
    c.toLowerCase().includes(searchClasse.toLowerCase()) &&
    !assignedClasses.includes(c)
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-slate-500 mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <GraduationCap size={24} className="text-blue-600" />
              Attribuer à {enseignant?.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{enseignant?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X size={20}/>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Matières */}
          <div className="border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-blue-600" />
              <h4 className="font-semibold">Matières enseignées</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {assignedMatieres.length}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {assignedMatieres.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Aucune matière assignée</p>
              ) : (
                assignedMatieres.map((matiere) => (
                  <span key={matiere} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {matiere}
                    <button type="button" onClick={() => removeMatiere(matiere)} className="hover:text-red-500">
                      <X size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une matière..."
                  value={searchMatiere}
                  onChange={(e) => setSearchMatiere(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <select
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Sélectionner une matière</option>
                {filteredMatieres.map((m) => (
                  <option key={m.id} value={m.nom}>{m.nom} (Coeff {m.coefficient})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addMatiere}
                disabled={!selectedMatiere}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Classes */}
          <div className="border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-green-600" />
              <h4 className="font-semibold">Classes concernées</h4>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {assignedClasses.length}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {assignedClasses.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Aucune classe assignée</p>
              ) : (
                assignedClasses.map((classe) => (
                  <span key={classe} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {classe}
                    <button type="button" onClick={() => removeClasse(classe)} className="hover:text-red-500">
                      <X size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une classe..."
                  value={searchClasse}
                  onChange={(e) => setSearchClasse(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <select
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Sélectionner une classe</option>
                {filteredClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addClasse}
                disabled={!selectedClasse}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-green-700 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSubmitting ? "Enregistrement..." : "Enregistrer les attributions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AttributionPage() {
  const { token, isAdmin } = useAuth();
  const router = useRouter();
  
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Charger les enseignants
  useEffect(() => {
    const fetchEnseignants = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/enseignants', { headers });
        
        if (!response.ok) {
          throw new Error('Erreur chargement des enseignants');
        }
        
        const data = await response.json();
        setEnseignants(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnseignants();
  }, [token, getAuthHeaders]);

  const filteredEnseignants = useMemo(() => {
    if (!searchTerm) return enseignants;
    return enseignants.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enseignants, searchTerm]);

  // Sauvegarde des attributions via la méthode PUT
 // app/enseignants/attribution/page.tsx - Version corrigée de handleSaveAttribution

const handleSaveAttribution = async (data: { matieres: string[]; classes: string[] }) => {
  if (!selectedEnseignant) return;
  
  setIsSubmitting(true);
  
  try {
    const headers = getAuthHeaders();
    const enseignantId = selectedEnseignant.id;
    
    // Construction du payload
    const payload = {
      matieres: data.matieres,
      classes: data.classes
    };
    
    console.log("📤 Envoi des données:", JSON.stringify(payload, null, 2));
    
    const response = await fetch(`/api/enseignants/${enseignantId}/attributions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log("📥 Réponse reçue:", result);
    
    if (!response.ok) {
      throw new Error(result.error || `Erreur HTTP ${response.status}`);
    }
    
    // Mettre à jour l'affichage local
    setEnseignants(prev => prev.map(e => 
      e.id === selectedEnseignant.id ? result : e
    ));
    
    setSuccess(`✅ Attributions mises à jour pour ${selectedEnseignant.name}`);
    setTimeout(() => setSuccess(null), 3000);
    setShowModal(false);
    setSelectedEnseignant(null);
    
  } catch (err) {
    console.error("❌ Erreur détaillée:", err);
    setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    setTimeout(() => setError(null), 3000);
  } finally {
    setIsSubmitting(false);
  }
};
  const getMatieresList = (enseignant: Enseignant): string[] => {
    return parseJsonField(enseignant.matieres);
  };

  const getClassesList = (enseignant: Enseignant): string[] => {
    return parseJsonField(enseignant.classes);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Accès restreint</h2>
          <p className="text-slate-500">Vous n'avez pas les droits pour accéder à cette page.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* EN-TÊTE */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
            <UserCheck size={28} strokeWidth={1.8} />
          </div>
          Attribution des cours
        </h1>
        <p className="text-sm text-slate-500 mt-1 ml-14">
          Assignez les matières et classes à chaque enseignant
        </p>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* RECHERCHE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un enseignant par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
      </div>

      {/* LISTE DES ENSEIGNANTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEnseignants.map((enseignant) => {
          const matieresList = getMatieresList(enseignant);
          const classesList = getClassesList(enseignant);
          
          return (
            <div key={enseignant.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {enseignant.photo ? (
                      <img src={enseignant.photo} alt={enseignant.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {enseignant.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800">{enseignant.name}</h3>
                      <p className="text-sm text-slate-500">{enseignant.email}</p>
                      <span className="text-xs text-slate-400">{enseignant.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEnseignant(enseignant);
                      setShowModal(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-blue-700 transition"
                  >
                    <Edit size={14} /> Attribuer
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <BookOpen size={12} /> Matières
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matieresList.length > 0 ? (
                        matieresList.map((m) => (
                          <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{m}</span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Aucune matière assignée</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users size={12} /> Classes
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {classesList.length > 0 ? (
                        classesList.map((c) => (
                          <span key={c} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{c}</span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Aucune classe assignée</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MESSAGE AUCUN RÉSULTAT */}
      {filteredEnseignants.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Aucun enseignant trouvé</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="mt-2 text-blue-600 text-sm hover:underline">
              Effacer la recherche
            </button>
          )}
        </div>
      )}

      {/* MODAL D'ATTRIBUTION */}
      {showModal && selectedEnseignant && (
        <AttributionModal
          enseignant={selectedEnseignant}
          onSave={handleSaveAttribution}
          onClose={() => {
            setShowModal(false);
            setSelectedEnseignant(null);
          }}
          isSubmitting={isSubmitting}
          token={token}
        />
      )}
    </div>
  );
}