// app/cours/[id]/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Plus, Edit, Trash2, X, CheckCircle, Circle, 
  Clock, BookOpen, Users, MapPin, FolderOpen, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Chapitre {
  id: number;
  titre: string;
  description: string | null;
  duree: number;
  estFait: boolean;
  moduleId: number;
}

interface Module {
  id: number;
  titre: string;
  description: string | null;
  coursId: string;
  chapitres: Chapitre[];
}

interface Course {
  id: string;
  matiere: string;
  professeur: string;
  classe: string;
  salle: string;
  jour: string;
  heure: string;
  students: number;
  image: string;
  status: string;
  coefficient: number;
}

// Modal pour module
function ModuleModal({ module, onSave, onClose, isLoading }: any) {
  const [form, setForm] = useState({
    titre: module?.titre || "",
    description: module?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      alert("Le titre est requis");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{module ? "Modifier le module" : "Ajouter un module"}</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required 
            placeholder="Titre" 
            value={form.titre} 
            onChange={e=>setForm({...form, titre:e.target.value})} 
            className="w-full border rounded-xl p-2" 
          />
          <textarea 
            placeholder="Description" 
            rows={2} 
            value={form.description} 
            onChange={e=>setForm({...form, description:e.target.value})} 
            className="w-full border rounded-xl p-2" 
          />
          <div className="flex gap-3">
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2 rounded-xl disabled:opacity-50">
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour chapitre
function ChapitreModal({ chapitre, onSave, onClose, isLoading }: any) {
  const [form, setForm] = useState({
    titre: chapitre?.titre || "",
    description: chapitre?.description || "",
    duree: chapitre?.duree || 60,
    estFait: chapitre?.estFait || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      alert("Le titre est requis");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{chapitre ? "Modifier le chapitre" : "Ajouter un chapitre"}</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required 
            placeholder="Titre" 
            value={form.titre} 
            onChange={e=>setForm({...form, titre:e.target.value})} 
            className="w-full border rounded-xl p-2" 
          />
          <textarea 
            placeholder="Description" 
            rows={2} 
            value={form.description} 
            onChange={e=>setForm({...form, description:e.target.value})} 
            className="w-full border rounded-xl p-2" 
          />
          <input 
            type="number" 
            placeholder="Durée (minutes)" 
            value={form.duree} 
            onChange={e=>setForm({...form, duree: parseInt(e.target.value) || 0})} 
            className="w-full border rounded-xl p-2" 
          />
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={form.estFait} 
              onChange={e=>setForm({...form, estFait:e.target.checked})} 
            /> 
            Déjà complété
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2 rounded-xl disabled:opacity-50">
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAdmin, isTeacher } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showChapitreModal, setShowChapitreModal] = useState(false);
  const [editingChapitre, setEditingChapitre] = useState<Chapitre | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Charger les détails du cours
  useEffect(() => {
    const fetchCourse = async () => {
      if (!token || !params.id) return;
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/cours/${params.id}`, { headers });
        if (!response.ok) throw new Error('Erreur chargement cours');
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error("Erreur chargement cours:", err);
        setError("Erreur de chargement du cours");
      }
    };
    
    fetchCourse();
  }, [token, params.id, getAuthHeaders]);

  // Charger les modules et chapitres
  useEffect(() => {
    const fetchModules = async () => {
      if (!token || !params.id) return;
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/modules?coursId=${params.id}`, { headers });
        if (!response.ok) throw new Error('Erreur chargement modules');
        const data = await response.json();
        setModules(data);
      } catch (err) {
        console.error("Erreur chargement modules:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModules();
  }, [token, params.id, getAuthHeaders]);

  const progressionModule = (mod: Module) => {
    if (!mod.chapitres?.length) return 0;
    const faits = mod.chapitres.filter(c => c.estFait).length;
    return Math.round((faits / mod.chapitres.length) * 100);
  };
  
  const progressionGlobale = () => {
    if (!modules.length) return 0;
    const total = modules.reduce((acc, m) => acc + progressionModule(m), 0);
    return Math.round(total / modules.length);
  };

  const ajouterModule = async (data: any) => {
    setIsSubmitting(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          titre: data.titre,
          description: data.description || null,
          coursId: params.id
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setModules([...modules, { ...result, chapitres: [] }]);
        setShowModuleModal(false);
      } else {
        alert(result.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Erreur ajout module:", error);
      alert("Erreur lors de l'ajout du module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const supprimerModule = async (id: number) => {
    if (!confirm("Supprimer ce module et tous ses chapitres ?")) return;
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/modules?id=${id}`, { method: 'DELETE', headers });
      
      if (response.ok) {
        setModules(modules.filter(m => m.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression module:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const ajouterChapitre = async (data: any) => {
    if (!currentModuleId) {
      alert("Erreur: Aucun module sélectionné");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/chapitres', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          titre: data.titre,
          description: data.description || "",
          duree: parseInt(data.duree) || 60,
          estFait: data.estFait || false,
          moduleId: currentModuleId
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const nouveauxModules = modules.map(m => 
          m.id === currentModuleId 
            ? { ...m, chapitres: [...(m.chapitres || []), result] }
            : m
        );
        setModules(nouveauxModules);
        setShowChapitreModal(false);
        setCurrentModuleId(null);
      } else {
        alert(result.error || "Erreur lors de l'ajout du chapitre");
      }
    } catch (error) {
      console.error("Erreur ajout chapitre:", error);
      alert("Erreur lors de l'ajout du chapitre");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChapitre = async (moduleId: number, chapitreId: number, estFait: boolean) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/chapitres', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id: chapitreId, estFait: !estFait })
      });
      
      if (response.ok) {
        const updatedChapitre = await response.json();
        const nouveauxModules = modules.map(m => {
          if (m.id === moduleId) {
            const nouveauxChapitres = (m.chapitres || []).map(ch => 
              ch.id === chapitreId ? { ...ch, estFait: updatedChapitre.estFait } : ch
            );
            return { ...m, chapitres: nouveauxChapitres };
          }
          return m;
        });
        setModules(nouveauxModules);
      }
    } catch (error) {
      console.error("Erreur toggle chapitre:", error);
    }
  };

  const supprimerChapitre = async (moduleId: number, chapitreId: number) => {
    if (!confirm("Supprimer ce chapitre ?")) return;
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/chapitres?id=${chapitreId}`, { method: 'DELETE', headers });
      
      if (response.ok) {
        const nouveauxModules = modules.map(m => {
          if (m.id === moduleId) {
            return { ...m, chapitres: (m.chapitres || []).filter(ch => ch.id !== chapitreId) };
          }
          return m;
        });
        setModules(nouveauxModules);
      }
    } catch (error) {
      console.error("Erreur suppression chapitre:", error);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || "Cours non trouvé"}</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600">Retour</button>
      </div>
    );
  }

  const canEdit = isAdmin || isTeacher;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition">
        <ArrowLeft size={20} /> Retour
      </button>
      
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
          <img src={course.image} className="w-full h-full object-cover opacity-20" alt={course.matiere} />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-3xl font-bold text-white">{course.matiere}</h1>
            <p className="text-white/80">{course.professeur} • {course.classe}</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock size={18} />
            <div><p className="text-xs text-slate-400">Horaire</p><p className="font-medium">{course.jour} {course.heure}</p></div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={18} />
            <div><p className="text-xs text-slate-400">Salle</p><p className="font-medium">{course.salle}</p></div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users size={18} />
            <div><p className="text-xs text-slate-400">Élèves</p><p className="font-medium">{course.students || 0}</p></div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <BookOpen size={18} />
            <div><p className="text-xs text-slate-400">Progression</p><p className="font-medium">{progressionGlobale()}%</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderOpen size={20} /> Modules et chapitres
          </h2>
          {canEdit && (
            <button onClick={() => { setEditingModule(null); setShowModuleModal(true); }} 
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus size={16}/> Module
            </button>
          )}
        </div>
        
        {modules.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aucun module. {canEdit && "Ajoutez-en un !"}
          </div>
        ) : (
          modules.map((mod) => (
            <div key={mod.id} className="border rounded-2xl p-4 mb-4 bg-slate-50/30">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    {mod.titre} 
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
                      {progressionModule(mod)}%
                    </span>
                  </h3>
                  {mod.description && <p className="text-sm text-slate-500 mt-1">{mod.description}</p>}
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => supprimerModule(mod.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="ml-4 mt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">Chapitres</h4>
                  {canEdit && (
                    <button onClick={() => { 
                      console.log("Module sélectionné ID:", mod.id);
                      setCurrentModuleId(mod.id); 
                      setEditingChapitre(null); 
                      setShowChapitreModal(true); 
                    }} 
                      className="text-xs text-blue-600 hover:text-blue-800">
                      + Ajouter
                    </button>
                  )}
                </div>
                
                {(!mod.chapitres || mod.chapitres.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Aucun chapitre</p>
                ) : (
                  mod.chapitres.map((ch, i) => (
                    <div key={ch.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border mt-2 group">
                      <button onClick={() => toggleChapitre(mod.id, ch.id, ch.estFait)} className="flex-shrink-0">
                        {ch.estFait ? 
                          <CheckCircle size={20} className="text-emerald-500"/> : 
                          <Circle size={20} className="text-slate-300"/>
                        }
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{i+1}. {ch.titre}</p>
                        {ch.description && <p className="text-xs text-slate-400">{ch.description}</p>}
                        {ch.duree && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock size={10}/> {ch.duree} min
                          </p>
                        )}
                      </div>
                      {canEdit && (
                        <button onClick={() => supprimerChapitre(mod.id, ch.id)} className="text-red-500 p-1 opacity-0 group-hover:opacity-100 transition">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Progression globale</span>
            <span className="font-bold text-blue-600">{progressionGlobale()}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${progressionGlobale()}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {modules.length} module(s) • {modules.reduce((acc,m) => acc + (m.chapitres?.length || 0), 0)} chapitre(s)
          </p>
        </div>
      </div>

      {showModuleModal && (
        <ModuleModal 
          module={editingModule} 
          onSave={ajouterModule} 
          onClose={() => { setShowModuleModal(false); setEditingModule(null); }} 
          isLoading={isSubmitting}
        />
      )}
      
      {showChapitreModal && (
        <ChapitreModal 
          chapitre={editingChapitre} 
          onSave={ajouterChapitre} 
          onClose={() => { setShowChapitreModal(false); setEditingChapitre(null); setCurrentModuleId(null); }} 
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}