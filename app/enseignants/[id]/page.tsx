// app/enseignants/[id]/page.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Plus, X, Trash2, Briefcase, Clock, Users, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Fonction utilitaire pour parser les champs JSON
function parseJsonField(field: any): any[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

// Fonction pour obtenir l'URL de l'avatar avec initiales
function getAvatarUrl(id: number, name: string, photoUrl?: string): string {
  if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('data:image'))) {
    return photoUrl;
  }
  
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  const initials = getInitials(name);
  const bgColor = encodeURIComponent('#6366f1');
  return `https://ui-avatars.com/api/?name=${initials}&background=${bgColor}&color=fff&size=128&rounded=true&bold=true&length=2`;
}

export default function EnseignantDetailPage() {
  const { isAdmin, isLoading: authLoading, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [enseignant, setEnseignant] = useState<any>(null);
  const [matieresList, setMatieresList] = useState<string[]>([]);
  const [classesList, setClassesList] = useState<string[]>([]);
  const [allMatieres, setAllMatieres] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttribution, setShowAttribution] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedClasse, setSelectedClasse] = useState("");

  // Fonction pour obtenir les headers d'authentification
  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  // Charger les données de l'enseignant, les matières et les classes
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !isAdmin) return;
      
      try {
        const headers = getAuthHeaders();
        
        const [enseignantRes, matieresRes, classesRes] = await Promise.all([
          fetch(`/api/enseignants/${params.id}`, { headers }),
          fetch('/api/matieres', { headers }),
          fetch('/api/classes', { headers })
        ]);
        
        if (!enseignantRes.ok) {
          if (enseignantRes.status === 404) {
            setError("Enseignant non trouvé");
          } else {
            setError("Erreur lors du chargement");
          }
          return;
        }
        
        const enseignantData = await enseignantRes.json();
        const matieresData = matieresRes.ok ? await matieresRes.json() : [];
        const classesData = classesRes.ok ? await classesRes.json() : [];
        
        setEnseignant(enseignantData);
        setMatieresList(parseJsonField(enseignantData.matieres));
        setClassesList(parseJsonField(enseignantData.classes));
        setAllMatieres(Array.isArray(matieresData) ? matieresData : []);
        setAllClasses(Array.isArray(classesData) ? classesData : []);
        setError(null);
      } catch (error) {
        console.error('Erreur chargement:', error);
        setError("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    if (params.id && isAdmin && token) {
      fetchData();
    }
  }, [params.id, isAdmin, token, getAuthHeaders]);

  // Matières disponibles (non encore attribuées)
  const matieresDisponibles = useMemo(() => {
    const matiereNoms = allMatieres.map((m: any) => m.nom);
    return matiereNoms.filter((m: string) => !matieresList.includes(m));
  }, [allMatieres, matieresList]);

  // Classes disponibles (non encore attribuées)
  const classesDisponibles = useMemo(() => {
    const classeNoms = allClasses.map((c: any) => c.nom);
    return classeNoms.filter((c: string) => !classesList.includes(c));
  }, [allClasses, classesList]);

  // Attribuer une matière ou une classe
  const attribuer = async () => {
    if (!selectedMatiere && !selectedClasse) {
      alert("Veuillez sélectionner au moins une matière ou une classe");
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/enseignants/${enseignant.id}/attributions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          matiere: selectedMatiere, 
          classe: selectedClasse, 
          estPrincipal: false 
        }),
      });
      
      const updated = await response.json();
      
      if (response.ok) {
        setEnseignant(updated);
        setMatieresList(parseJsonField(updated.matieres));
        setClassesList(parseJsonField(updated.classes));
        setSelectedMatiere("");
        setSelectedClasse("");
        setShowAttribution(false);
      } else {
        alert(updated.error || "Erreur lors de l'attribution");
      }
    } catch (error) {
      console.error('Erreur attribution:', error);
      alert("Erreur lors de l'attribution");
    }
  };

  // Retirer une matière
  const retirerMatiere = async (matiere: string) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/enseignants/${enseignant.id}/attributions`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ matiere, classe: "" }),
      });
      
      const updated = await response.json();
      
      if (response.ok) {
        setEnseignant(updated);
        setMatieresList(parseJsonField(updated.matieres));
        setClassesList(parseJsonField(updated.classes));
      } else {
        alert(updated.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert("Erreur lors de la suppression");
    }
  };

  // Retirer une classe
  const retirerClasse = async (classe: string) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/enseignants/${enseignant.id}/attributions`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ matiere: "", classe }),
      });
      
      const updated = await response.json();
      
      if (response.ok) {
        setEnseignant(updated);
        setMatieresList(parseJsonField(updated.matieres));
        setClassesList(parseJsonField(updated.classes));
      } else {
        alert(updated.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert("Erreur lors de la suppression");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erreur</h2>
          <p className="text-slate-500">{error}</p>
          <button 
            onClick={() => router.push("/enseignants")} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!enseignant) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition">
        <ArrowLeft size={20} /> Retour
      </button>

      {/* Carte principale profil */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-blue-600">
          <div className="absolute -bottom-12 left-6">
            <img 
              src={getAvatarUrl(enseignant.id, enseignant.name, enseignant.photo)} 
              className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg" 
              alt="" 
            />
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">{enseignant.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{enseignant.status}</p>
            </div>
            <button 
              onClick={() => router.push(`/enseignants/${enseignant.id}/edit`)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-indigo-100 transition"
            >
              <Edit size={16}/> Modifier profil
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400"/> 
                <span className="text-sm">{enseignant.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={16} className="text-slate-400"/> 
                <span className="text-sm">{enseignant.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin size={16} className="text-slate-400"/> 
                <span className="text-sm">Bureau {enseignant.bureau || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock size={16} className="text-slate-400"/> 
                <span className="text-sm">Horaires : {enseignant.horaires || 'Non spécifiés'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                  <BookOpen size={16}/> Matières enseignées
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {matieresList.length > 0 ? (
                    matieresList.map((m: string) => (
                      <span key={m} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs">
                        {m}
                        <button onClick={() => retirerMatiere(m)} className="hover:text-red-500">
                          <X size={12}/>
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">Aucune matière assignée</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                  <Users size={16}/> Classes concernées
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {classesList.length > 0 ? (
                    classesList.map((c: string) => (
                      <span key={c} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
                        {c}
                        <button onClick={() => retirerClasse(c)} className="hover:text-red-500">
                          <X size={12}/>
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">Aucune classe assignée</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Attribution */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Briefcase size={18}/> Attributions
          </h2>
          <button 
            onClick={() => setShowAttribution(true)} 
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-indigo-700 transition"
          >
            <Plus size={14}/> Ajouter
          </button>
        </div>
        
        {matieresList.length === 0 && classesList.length === 0 ? (
          <p className="text-slate-400 text-center py-4 text-sm">
            Aucune matière ou classe attribuée. Cliquez sur "Ajouter" pour commencer.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <BookOpen size={14}/> Matières ({matieresList.length})
              </h3>
              <div className="space-y-1">
                {matieresList.map((m: string) => (
                  <div key={m} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm">{m}</span>
                    <button onClick={() => retirerMatiere(m)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <Users size={14}/> Classes ({classesList.length})
              </h3>
              <div className="space-y-1">
                {classesList.map((c: string) => (
                  <div key={c} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm">{c}</span>
                    <button onClick={() => retirerClasse(c)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal attribution */}
      {showAttribution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Ajouter une attribution</h3>
              <button onClick={() => setShowAttribution(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20}/>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Matière (optionnel)</label>
                <select 
                  value={selectedMatiere} 
                  onChange={e => setSelectedMatiere(e.target.value)}
                  className="w-full border rounded-xl p-2 bg-slate-50 text-sm"
                >
                  <option value="">Sélectionner une matière</option>
                  {matieresDisponibles.map(m => <option key={m}>{m}</option>)}
                </select>
                {matieresDisponibles.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Toutes les matières sont déjà attribuées</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Classe (optionnel)</label>
                <select 
                  value={selectedClasse} 
                  onChange={e => setSelectedClasse(e.target.value)}
                  className="w-full border rounded-xl p-2 bg-slate-50 text-sm"
                >
                  <option value="">Sélectionner une classe</option>
                  {classesDisponibles.map(c => <option key={c}>{c}</option>)}
                </select>
                {classesDisponibles.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Toutes les classes sont déjà attribuées</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={attribuer} 
                  disabled={!selectedMatiere && !selectedClasse}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-indigo-700 transition"
                >
                  Attribuer
                </button>
                <button 
                  onClick={() => setShowAttribution(false)}
                  className="flex-1 border py-2 rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Vous pouvez attribuer une matière, une classe, ou les deux
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}