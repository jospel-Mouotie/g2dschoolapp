// app/cours/page.tsx - Version corrigée pour les enseignants
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Clock, Users, Search, Plus, X, Grid3x3, List,
  Download, Printer, Eye, Edit, Trash2, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function parseJsonField(field: any): any[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

// Modal d'ajout/modification
function CoursModal({ cours, onSave, onClose, classesList, enseignantsList }: any) {
  const [form, setForm] = useState({
    matiere: cours?.matiere || "",
    professeurId: cours?.enseignantId || "",
    professeurNom: cours?.professeur || "",
    salle: cours?.salle || "",
    classeId: cours?.classeId || "",
    classeNom: cours?.classe || "",
    coefficient: cours?.coefficient || 1,
    status: cours?.status || "En cours",
    jour: cours?.jour || "Lundi",
    heure: cours?.heure || "08:00-10:00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredEnseignants, setFilteredEnseignants] = useState<any[]>([]);

  useEffect(() => {
    if (!form.matiere || !form.classeId) {
      setFilteredEnseignants([]);
      return;
    }

    const filtered = enseignantsList.filter((ens: any) => {
      const matieres = parseJsonField(ens.matieres);
      const classes = parseJsonField(ens.classes);
      const classeNom = classesList.find((c: any) => c.id === form.classeId)?.nom;
      return matieres.includes(form.matiere) && classes.includes(classeNom);
    });
    
    setFilteredEnseignants(filtered);
    
    if (filtered.length === 1 && !form.professeurId) {
      setForm(prev => ({
        ...prev,
        professeurId: filtered[0].id,
        professeurNom: filtered[0].name
      }));
    }
  }, [form.matiere, form.classeId, enseignantsList, classesList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(form);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{cours ? "Modifier" : "Ajouter"} un cours</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Matière</label>
            <select required value={form.matiere} onChange={e => setForm({...form, matiere: e.target.value, professeurId: "", professeurNom: ""})} className="w-full border rounded-xl p-2">
              <option value="">Sélectionner une matière</option>
              <option value="Maths">Mathématiques</option>
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
              <option value="Histoire">Histoire-Géographie</option>
              <option value="Physique">Physique-Chimie</option>
              <option value="Informatique">Informatique</option>
              <option value="EPS">EPS</option>
              <option value="Philosophie">Philosophie</option>
              <option value="SVT">SVT</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Classe</label>
            <select required value={form.classeId} onChange={e => {
              const classeId = e.target.value;
              const classeNom = classesList.find((c: any) => c.id === classeId)?.nom || "";
              setForm({...form, classeId, classeNom, professeurId: "", professeurNom: ""});
            }} className="w-full border rounded-xl p-2">
              <option value="">Sélectionner une classe</option>
              {classesList.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Enseignant</label>
            <select required value={form.professeurId} onChange={e => {
              const ens = enseignantsList.find((ens: any) => ens.id === parseInt(e.target.value));
              setForm({...form, professeurId: e.target.value, professeurNom: ens?.name || ""});
            }} className="w-full border rounded-xl p-2">
              <option value="">Sélectionner un enseignant</option>
              {filteredEnseignants.map((ens: any) => (
                <option key={ens.id} value={ens.id}>{ens.name}</option>
              ))}
            </select>
            {form.matiere && form.classeId && filteredEnseignants.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Aucun enseignant ne dispense cette matière dans cette classe</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Salle</label>
            <input required value={form.salle} onChange={e => setForm({...form, salle: e.target.value})} placeholder="Ex: Salle 101" className="w-full border rounded-xl p-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Coefficient</label>
            <input type="number" step="0.5" min="0.5" max="10" value={form.coefficient} onChange={e => setForm({...form, coefficient: parseFloat(e.target.value)})} className="w-full border rounded-xl p-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Jour</label>
            <select value={form.jour} onChange={e => setForm({...form, jour: e.target.value})} className="w-full border rounded-xl p-2">
              <option>Lundi</option><option>Mardi</option><option>Mercredi</option>
              <option>Jeudi</option><option>Vendredi</option><option>Samedi</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Heure</label>
            <input required value={form.heure} onChange={e => setForm({...form, heure: e.target.value})} placeholder="08:00-10:00" className="w-full border rounded-xl p-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-xl p-2">
              <option>En cours</option><option>Avancé</option><option>En retard</option><option>Terminé</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50 hover:bg-indigo-700 transition">
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { isAdmin, token, user } = useAuth();
  const router = useRouter();
  const [cours, setCours] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [enseignantConnecte, setEnseignantConnecte] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");
  const [selectedEnseignant, setSelectedEnseignant] = useState("Tous");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editingCours, setEditingCours] = useState<any>(null);

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
        const [coursRes, classesRes, enseignantsRes] = await Promise.all([
          fetch('/api/cours', { headers }),
          fetch('/api/classes', { headers }),
          fetch('/api/enseignants', { headers })
        ]);
        
        const coursData = await coursRes.json();
        const classesData = await classesRes.json();
        const enseignantsData = await enseignantsRes.json();
        
        setCours(Array.isArray(coursData) ? coursData : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setEnseignants(Array.isArray(enseignantsData) ? enseignantsData : []);
        
        // Trouver l'enseignant connecté
        if (!isAdmin && user?.enseignantId) {
          const enseignant = enseignantsData.find((e: any) => e.id === user.enseignantId);
          setEnseignantConnecte(enseignant);
          console.log("Enseignant connecté:", enseignant);
          console.log("Ses classes:", parseJsonField(enseignant?.classes));
          console.log("Ses matières:", parseJsonField(enseignant?.matieres));
        }
        
        setError(null);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, getAuthHeaders, isAdmin, user]);

  // Pour les enseignants, créer des cours virtuels à partir de leurs assignations
  const displayCourses = useMemo(() => {
    if (isAdmin) {
      return cours;
    }
    
    // Pour les enseignants, si des cours existent dans la base, les utiliser
    if (cours.length > 0) {
      return cours;
    }
    
    // Sinon, créer des cours virtuels à partir des assignations
    if (enseignantConnecte) {
      const classesAssignees = parseJsonField(enseignantConnecte.classes);
      const matieresAssignees = parseJsonField(enseignantConnecte.matieres);
      
      const virtualCourses: any[] = [];
      
      for (const classe of classesAssignees) {
        for (const matiere of matieresAssignees) {
          virtualCourses.push({
            id: `virtual_${classe}_${matiere}`,
            matiere: matiere,
            professeur: enseignantConnecte.name,
            salle: "À définir",
            classe: classe,
            jour: "Lundi",
            heure: "08:00-10:00",
            status: "En cours",
            coefficient: 1,
            progress: 0,
            isVirtual: true
          });
        }
      }
      
      console.log("Cours virtuels créés:", virtualCourses);
      return virtualCourses;
    }
    
    return [];
  }, [cours, isAdmin, enseignantConnecte]);

  // Liste des matières uniques pour le filtre
  const matieresList = useMemo(() => {
    const matieres = new Set(displayCourses.map(c => c.matiere));
    return ["Toutes", ...Array.from(matieres).sort()];
  }, [displayCourses]);

  // Liste des enseignants uniques pour le filtre (admin uniquement)
  const enseignantsList = useMemo(() => {
    const ens = new Set(displayCourses.map(c => c.professeur));
    return ["Tous", ...Array.from(ens).sort()];
  }, [displayCourses]);

  // Liste des statuts pour le filtre
  const statutsList = useMemo(() => {
    const statuts = new Set(displayCourses.map(c => c.status));
    return ["Tous", ...Array.from(statuts).sort()];
  }, [displayCourses]);

  const filteredCourses = useMemo(() => {
    let filtered = [...displayCourses];
    
    if (selectedClass !== "all") {
      filtered = filtered.filter(c => c.classe === selectedClass);
    }
    if (selectedMatiere !== "Toutes") {
      filtered = filtered.filter(c => c.matiere === selectedMatiere);
    }
    if (selectedEnseignant !== "Tous") {
      filtered = filtered.filter(c => c.professeur === selectedEnseignant);
    }
    if (selectedStatut !== "Tous") {
      filtered = filtered.filter(c => c.status === selectedStatut);
    }
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.professeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.classe.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [displayCourses, selectedClass, selectedMatiere, selectedEnseignant, selectedStatut, searchTerm]);

  const stats = useMemo(() => {
    const totalCourses = filteredCourses.length;
    const avgProgress = filteredCourses.length ? Math.round(filteredCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / filteredCourses.length) : 0;
    return { totalCourses, avgProgress };
  }, [filteredCourses]);

  const saveCours = async (formData: any) => {
    if (!isAdmin) {
      alert("Seul l'administrateur peut ajouter ou modifier des cours");
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      
      if (editingCours) {
        const response = await fetch('/api/cours', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            id: editingCours.id, 
            matiere: formData.matiere,
            enseignantId: parseInt(formData.professeurId),
            salle: formData.salle,
            classe: formData.classeNom,
            coefficient: formData.coefficient,
            status: formData.status,
            jour: formData.jour,
            heure: formData.heure
          })
        });
        if (response.ok) {
          const updated = await response.json();
          setCours(cours.map(c => c.id === editingCours.id ? updated : c));
          alert("Cours modifié avec succès");
        } else {
          alert("Erreur lors de la modification");
        }
      } else {
        const response = await fetch('/api/cours', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            matiere: formData.matiere,
            professeur: formData.professeurNom,
            enseignantId: parseInt(formData.professeurId),
            salle: formData.salle,
            classe: formData.classeNom,
            coefficient: formData.coefficient,
            status: formData.status,
            jour: formData.jour,
            heure: formData.heure,
            duree: 2
          })
        });
        if (response.ok) {
          const created = await response.json();
          setCours([...cours, created]);
          alert("Cours ajouté avec succès");
        } else {
          alert("Erreur lors de l'ajout");
        }
      }
      setShowModal(false);
      setEditingCours(null);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const deleteCours = async (id: string) => {
    if (!isAdmin) return;
    if (confirm("Supprimer ce cours définitivement ?")) {
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/cours?id=${id}`, { method: 'DELETE', headers });
        if (response.ok) {
          setCours(cours.filter(c => c.id !== id));
          alert("Cours supprimé avec succès");
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedMatiere("Toutes");
    setSelectedEnseignant("Tous");
    setSelectedStatut("Tous");
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "En cours": return "bg-blue-100 text-blue-700";
      case "Terminé": return "bg-green-100 text-green-700";
      case "Avancé": return "bg-purple-100 text-purple-700";
      case "En retard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Message pour les enseignants sans assignations
  if (!isAdmin && (!enseignantConnecte || (parseJsonField(enseignantConnecte?.classes).length === 0))) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <BookOpen size={24} className="text-indigo-600" />
              Gestion des Cours
            </h1>
            <p className="text-slate-500 text-sm mt-1">Vos cours et progression</p>
          </div>
        </div>
        <div className="text-center py-12 bg-white rounded-2xl border">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Aucune classe ou matière ne vous a été assignée</p>
          <p className="text-sm text-slate-400 mt-1">Veuillez contacter l'administrateur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[#f8fafc] min-h-screen">
      {/* Header avec bouton d'ajout */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen size={24} className="text-indigo-600" />
            Gestion des Cours
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin ? "Programme, horaires, progression par classe" : "Vos cours et progression"}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingCours(null); setShowModal(true); }} 
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
          >
            <Plus size={16} /> Nouveau Cours
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-slate-400 text-xs">Total cours</p>
          <p className="text-2xl font-bold">{stats.totalCourses}</p>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-slate-400 text-xs">Progression moyenne</p>
          <p className="text-2xl font-bold">{stats.avgProgress}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats.avgProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Classe</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
              <option value="all">Toutes les classes</option>
              {classes.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
            </select>
          </div>
          
          {isAdmin && (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Matière</label>
                <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
                  {matieresList.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Enseignant</label>
                <select value={selectedEnseignant} onChange={e => setSelectedEnseignant(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
                  {enseignantsList.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </>
          )}
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Statut</label>
            <select value={selectedStatut} onChange={e => setSelectedStatut(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
              {statutsList.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Recherche</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
              <input type="text" placeholder="Cours, prof, classe..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm"/>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={resetFilters} className="px-4 py-2 border rounded-xl text-sm flex items-center gap-1 hover:bg-slate-50">
              <X size={14}/> Réinitialiser
            </button>
            <div className="border-l border-slate-200 mx-1"></div>
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-slate-400"}`}>
              <Grid3x3 size={18}/>
            </button>
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg ${viewMode === "table" ? "bg-indigo-100 text-indigo-600" : "text-slate-400"}`}>
              <List size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          <span className="font-bold">{filteredCourses.length}</span> cours trouvés
        </p>
      </div>

      {/* Liste des cours */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border p-4 hover:shadow-md transition cursor-pointer" onClick={() => {
              if (!course.isVirtual) {
                router.push(`/cours/${course.id}`);
              } else {
                alert("Ce cours virtuel sera disponible bientôt. Veuillez contacter l'administrateur pour créer les cours.");
              }
            }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{course.matiere}</h3>
                  <p className="text-sm text-slate-500">{course.professeur}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(course.status)}`}>{course.status}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>📚 {course.classe}</p>
                <p>📍 {course.salle}</p>
                <p>⏰ {course.jour} {course.heure}</p>
              </div>
              {!course.isVirtual && (
                <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                  <button onClick={() => router.push(`/cours/${course.id}`)} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                    Voir détails
                  </button>
                  {isAdmin && (
                    <button onClick={() => deleteCours(course.id)} className="p-2 border rounded-xl text-red-500 hover:bg-red-50">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              )}
              {course.isVirtual && (
                <div className="mt-4 text-center text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  ⚠️ Cours non encore configuré
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-500 text-xs font-bold">
                <th className="px-4 py-3 text-left">Cours</th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Enseignant</th>
                <th className="px-4 py-3 text-left">Salle</th>
                <th className="px-4 py-3 text-left">Horaire</th>
                <th className="px-4 py-3 text-left">Statut</th>
                {isAdmin && <th className="px-4 py-3 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => {
                  if (!course.isVirtual) {
                    router.push(`/cours/${course.id}`);
                  }
                }}>
                  <td className="px-4 py-3 font-semibold">{course.matiere}</td>
                  <td className="px-4 py-3">{course.classe}</td>
                  <td className="px-4 py-3">{course.professeur}</td>
                  <td className="px-4 py-3">{course.salle}</td>
                  <td className="px-4 py-3">{course.jour} {course.heure}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </td>
                  {isAdmin && !course.isVirtual && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => deleteCours(course.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <p className="text-slate-400">Aucun cours ne correspond aux filtres sélectionnés.</p>
          <button onClick={resetFilters} className="mt-4 text-blue-600 text-sm">Réinitialiser les filtres</button>
        </div>
      )}

      {showModal && isAdmin && (
        <CoursModal 
          cours={editingCours} 
          onSave={saveCours} 
          onClose={() => { setShowModal(false); setEditingCours(null); }} 
          classesList={classes}
          enseignantsList={enseignants}
        />
      )}
    </div>
  );
}