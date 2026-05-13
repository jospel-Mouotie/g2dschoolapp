// app/enseignants/classes/page.tsx
"use client";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Users, ArrowRight, GraduationCap, FileText } from "lucide-react";
import { useApi } from "@/hooks/useApi";

// Fonction utilitaire pour parser les champs JSON
function parseJsonField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

export default function EnseignantClassesPage() {
  const router = useRouter();
  const { user, isTeacher, isLoading, token } = useAuth();
  const { fetchWithAuth } = useApi();
  
  const [enseignant, setEnseignant] = useState<any>(null);
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirection si non enseignant
  useEffect(() => {
    if (!isLoading && !isTeacher) {
      router.push('/');
    }
  }, [isLoading, isTeacher, router]);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !isTeacher) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer tous les enseignants
        const enseignantsData = await fetchWithAuth('/api/enseignants');
        console.log("Enseignants reçus:", enseignantsData);
        
        // Trouver l'enseignant correspondant à l'utilisateur connecté
        const enseignantTrouve = enseignantsData.find((e: any) => e.id === user?.enseignantId);
        console.log("Enseignant trouvé:", enseignantTrouve);
        
        if (enseignantTrouve) {
          setEnseignant(enseignantTrouve);
        }
        
        // Récupérer les élèves
        const elevesData = await fetchWithAuth('/api/eleves');
        setEleves(elevesData || []);
        
      } catch (err: any) {
        console.error("Erreur chargement:", err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    
    if (token && isTeacher) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token, isTeacher, user, fetchWithAuth]);

  // Classes assignées à l'enseignant - depuis le champ classes JSON
  const classesAssignees = useMemo(() => {
    if (!enseignant) return [];
    
    // Utiliser le champ classes JSON
    const classesList = parseJsonField(enseignant.classes);
    console.log("Classes assignées (depuis champ JSON):", classesList);
    return classesList;
  }, [enseignant]);

  // Matières par classe - depuis le champ matieres JSON
  const matieresParClasse = useMemo(() => {
    const map: Record<string, string[]> = {};
    if (!enseignant) return map;
    
    const matieresList = parseJsonField(enseignant.matieres);
    
    // Chaque matière est assignée à chaque classe
    for (const classe of classesAssignees) {
      map[classe] = [...matieresList];
    }
    
    return map;
  }, [enseignant, classesAssignees]);

  // Effectif par classe
  const effectifParClasse = useMemo(() => {
    const map: Record<string, number> = {};
    for (const eleve of eleves) {
      map[eleve.classe] = (map[eleve.classe] || 0) + 1;
    }
    return map;
  }, [eleves]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-slate-600">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!isTeacher) {
    return null;
  }

  if (!enseignant) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Profil enseignant non trouvé</h2>
          <p className="text-slate-500">Votre profil enseignant n'a pas été trouvé.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  if (classesAssignees.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aucune classe assignée</h2>
          <p className="text-slate-500">Vous n'êtes pas encore assigné à des classes.</p>
          <p className="text-slate-400 text-sm mt-2">Veuillez contacter l'administrateur.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <GraduationCap size={24} className="text-blue-600" />
          </div>
          Mes classes
        </h1>
        <p className="text-sm text-slate-500 mt-1 ml-12">
          Bienvenue {enseignant.name}, sélectionnez une classe pour gérer les notes
        </p>
        <p className="text-xs text-slate-400 mt-1 ml-12">
          Classes assignées : {classesAssignees.join(", ")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classesAssignees.map((classeNom) => {
          const matieres = matieresParClasse[classeNom] || [];
          const effectif = effectifParClasse[classeNom] || 0;
          return (
            <div
              key={classeNom}
              onClick={() => router.push(`/enseignants/notes/${encodeURIComponent(classeNom)}`)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{classeNom}</h3>
                    <p className="text-blue-100 text-sm mt-1">Classe</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-2 group-hover:scale-110 transition">
                    <BookOpen size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={16} />
                    <span>Effectif</span>
                  </div>
                  <span className="font-bold text-slate-800">{effectif} élèves</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <FileText size={16} />
                    <span>Matières</span>
                  </div>
                  <span className="font-bold text-slate-800">{matieres.length} matière(s)</span>
                </div>
                {matieres.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                    {matieres.map((mat) => (
                      <span key={mat} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {mat}
                      </span>
                    ))}
                  </div>
                )}
                <button className="mt-2 w-full py-2 bg-slate-50 text-blue-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2 group-hover:bg-blue-50 transition">
                  Saisir les notes
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}