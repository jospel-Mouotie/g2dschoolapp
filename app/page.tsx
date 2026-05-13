// app/page.tsx - Version améliorée
"use client";
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, TrendingDown, BarChart3, LineChart, Activity, Filter, UserCheck, UserX, School, Sparkles, AlertCircle } from "lucide-react";
import StudentsSection from "@/components/StudentsSection";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Couleurs pour les graphiques (conservées au cas où)
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const TOUTES_MATIERES = [
  "MATHÉMATIQUES", "FRANÇAIS", "ANGLAIS", "HISTOIRE-GÉOGRAPHIE",
  "PHYSIQUE-CHIMIE", "INFORMATIQUE", "EPS", "ÉDUCATION CIVIQUE"
];

function StatCard({ title, value, icon, color, trend }: { title: string; value: string; icon: React.ReactNode; color: string; trend?: string }) {
  return (
    <div className="relative bg-white/80 backdrop-blur-2xl rounded-[24px] border border-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
      <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${color} p-3.5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/50`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      {trend && (
        <div className="mt-5 flex items-center gap-1.5 text-sm font-medium">
          {trend.startsWith('+') ? (
            <TrendingUp size={16} className="text-emerald-500" />
          ) : (
            <TrendingDown size={16} className="text-rose-500" />
          )}
          <span className={trend.startsWith('+') ? "text-emerald-600" : "text-rose-600"}>{trend}</span>
          <span className="text-slate-400 font-normal ml-1">récemment</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isTeacher, isParent, token } = useAuth();
  const [eleves, setEleves] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [cours, setCours] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allNotes, setAllNotes] = useState<any>({});
  const [matieres, setMatieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClasse, setSelectedClasse] = useState<string>("Toutes");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const [elevesRes, enseignantsRes, coursRes, transactionsRes, notesRes, matieresRes] = await Promise.all([
          fetch('/api/eleves', { headers }).catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/enseignants', { headers }).catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/cours', { headers }).catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/transactions', { headers }).catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/notes', { headers }).catch(() => ({ ok: false, json: () => ({}) })),
          fetch('/api/matieres', { headers }).catch(() => ({ ok: false, json: () => [] })),
        ]);
        
        const [elevesData, enseignantsData, coursData, transactionsData, notesData, matieresData] = await Promise.all([
          elevesRes.ok ? elevesRes.json() : [],
          enseignantsRes.ok ? enseignantsRes.json() : [],
          coursRes.ok ? coursRes.json() : [],
          transactionsRes.ok ? transactionsRes.json() : [],
          notesRes.ok ? notesRes.json() : {},
          matieresRes.ok ? matieresRes.json() : []
        ]);
        
        setEleves(Array.isArray(elevesData) ? elevesData : []);
        setEnseignants(Array.isArray(enseignantsData) ? enseignantsData : []);
        setCours(Array.isArray(coursData) ? coursData : []);
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        setAllNotes(notesData);
        setMatieres(Array.isArray(matieresData) ? matieresData : []);
        
      } catch (err: any) {
        console.error('Erreur chargement données:', err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  const enseignantConnecte = useMemo(() => {
    if (!isTeacher || !user?.enseignantId) return null;
    if (!Array.isArray(enseignants)) return null;
    return enseignants.find((e: any) => e.id === user.enseignantId);
  }, [isTeacher, user, enseignants]);

  const classesAccessibles = useMemo(() => {
    if (isAdmin) return "all";
    if (isTeacher && enseignantConnecte) {
      try {
        const classesList = enseignantConnecte.classes
          ? (typeof enseignantConnecte.classes === 'string' ? JSON.parse(enseignantConnecte.classes) : enseignantConnecte.classes)
          : [];
        return classesList;
      } catch {
        return [];
      }
    }
    if (isParent && user?.eleveId && Array.isArray(eleves)) {
      const eleve = eleves.find((e: any) => e.id === user.eleveId);
      return eleve ? [eleve.classe] : [];
    }
    return [];
  }, [isAdmin, isTeacher, isParent, enseignantConnecte, eleves, user]);

  const classesDisponibles = useMemo(() => {
    if (isAdmin && Array.isArray(eleves)) {
      const allClasses = Array.from(new Set(eleves.map((e: any) => e.classe))).sort();
      return ["Toutes", ...allClasses];
    }
    if (isTeacher && Array.isArray(classesAccessibles) && classesAccessibles.length > 0) {
      return ["Toutes", ...classesAccessibles.sort()];
    }
    if (isParent && Array.isArray(classesAccessibles) && classesAccessibles.length > 0) {
      return classesAccessibles;
    }
    return [];
  }, [isAdmin, isTeacher, isParent, classesAccessibles, eleves]);

  const elevesFiltres = useMemo(() => {
    if (isTeacher && (!Array.isArray(classesAccessibles) || classesAccessibles.length === 0)) {
      return [];
    }
    
    let filtered = Array.isArray(eleves) ? eleves : [];
    
    if (selectedClasse !== "Toutes") {
      filtered = filtered.filter((e: any) => e.classe === selectedClasse);
    }
    
    if (isTeacher && Array.isArray(classesAccessibles) && classesAccessibles.length > 0 && selectedClasse === "Toutes") {
      filtered = filtered.filter((e: any) => classesAccessibles.includes(e.classe));
    }
    
    if (isParent && user?.eleveId) {
      filtered = filtered.filter((e: any) => e.id === user.eleveId);
    }
    
    return filtered;
  }, [eleves, selectedClasse, isTeacher, isParent, classesAccessibles, user]);

  const coursFiltres = useMemo(() => {
    if (isTeacher && (!Array.isArray(classesAccessibles) || classesAccessibles.length === 0)) {
      return [];
    }
    
    let filtered = Array.isArray(cours) ? cours : [];
    
    if (selectedClasse !== "Toutes") {
      filtered = filtered.filter((c: any) => c.classe === selectedClasse);
    }
    
    if (isTeacher && Array.isArray(classesAccessibles) && classesAccessibles.length > 0 && selectedClasse === "Toutes") {
      filtered = filtered.filter((c: any) => classesAccessibles.includes(c.classe));
    }
    
    return filtered;
  }, [cours, selectedClasse, isTeacher, classesAccessibles]);

  const statsGenerales = useMemo(() => {
    return {
      totalEleves: elevesFiltres.length,
      totalCours: coursFiltres.length,
      moyenneGenerale: 12.5,
      nbClasses: new Set(elevesFiltres.map((e: any) => e.classe)).size
    };
  }, [elevesFiltres, coursFiltres]);

  const statsDemographiques = useMemo(() => {
    const garcons = elevesFiltres.filter((e: any) => e.sexe === "M").length;
    const filles = elevesFiltres.filter((e: any) => e.sexe === "F").length;
    return { garcons, filles, total: elevesFiltres.length };
  }, [elevesFiltres]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="mt-4 text-indigo-600 font-semibold tracking-wide animate-pulse">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc]">
        <div className="bg-white border border-red-100 rounded-[32px] p-8 max-w-md text-center shadow-2xl shadow-red-500/10 animate-fade-in">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Oups, une erreur est survenue</h2>
          <p className="text-slate-500 mb-8 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 w-full"
          >
            Tenter à nouveau
          </button>
        </div>
      </div>
    );
  }

  // Composant Réutilisable pour le Header du Dashboard
  const DashboardHeader = ({ icon: Icon, title, subtitle, badge, badgeIcon: BadgeIcon, gradient }: any) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[32px] border border-white/60 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center gap-5 relative z-10">
        <div className={`bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-xl shadow-indigo-600/20`}>
          <Icon size={32} className="text-white" strokeWidth={2} />
        </div>
        <div>
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
              {BadgeIcon && <BadgeIcon size={14} />} {badge}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h1>
          <p className="text-slate-500 font-medium mt-1 text-lg">{subtitle}</p>
        </div>
      </div>
      
      {classesDisponibles.length > 1 && (
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors relative z-10">
          <Filter size={18} className="text-indigo-500" />
          <select 
            value={selectedClasse} 
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-4 appearance-none"
          >
            {classesDisponibles.map((classe: any) => (
              <option key={classe} value={classe}>
                {classe === "Toutes" ? "📊 Toutes les classes" : `📚 ${classe}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // Vue Parent
  if (isParent) {
    return (
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none"></div>
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto pb-12 relative z-10 animate-fade-in">
          
          <DashboardHeader 
            icon={Users} 
            title="Espace Parents" 
            subtitle={`Suivi scolarité de ${elevesFiltres[0]?.nom || "votre enfant"}`}
            badge="Portail Familial"
            badgeIcon={Sparkles}
            gradient="from-indigo-500 to-indigo-600"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Moyenne générale" value={`${statsGenerales.moyenneGenerale}/20`} icon={<TrendingUp size={24} strokeWidth={2.5} />} color="from-indigo-500 to-indigo-600" trend="+0.5" />
            <StatCard title="Absences signalées" value="0" icon={<Calendar size={24} strokeWidth={2.5} />} color="from-rose-500 to-red-600" />
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <BookOpen size={20} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Dossier Élève</h3>
            </div>
            
            {elevesFiltres[0] ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase mb-1">Nom complet</p>
                  <p className="text-lg font-bold text-slate-800">{elevesFiltres[0].nom}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase mb-1">Classe actuelle</p>
                  <p className="text-lg font-bold text-slate-800">{elevesFiltres[0].classe}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase mb-1">Matricule</p>
                  <p className="text-lg font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg inline-block">{elevesFiltres[0].matricule}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 font-medium">Aucune information trouvée pour cet élève.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vue Enseignant
  if (isTeacher) {
    if (!enseignantConnecte || classesAccessibles.length === 0) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-[32px] p-10 max-w-lg text-center shadow-xl shadow-amber-500/10">
            <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <School size={48} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Aucune classe assignée</h2>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed">
              Bienvenue <strong>{enseignantConnecte?.name || "Enseignant"}</strong>. Il semble que l'administration ne vous ait pas encore attribué de classes pour cette année scolaire.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 w-full"
            >
              Vérifier à nouveau
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none"></div>
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto pb-12 relative z-10 animate-fade-in">
          
          <DashboardHeader 
            icon={GraduationCap} 
            title="Espace Enseignant" 
            subtitle={`Bonjour, ${enseignantConnecte?.name || "Enseignant"}`}
            badge="Année Académique"
            badgeIcon={Sparkles}
            gradient="from-indigo-500 to-indigo-600"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Élèves" value={statsGenerales.totalEleves.toString()} icon={<Users size={20} strokeWidth={2.5} />} color="from-indigo-500 to-indigo-600" />
            <StatCard title="Mes Classes" value={statsGenerales.nbClasses.toString()} icon={<School size={20} strokeWidth={2.5} />} color="from-purple-500 to-pink-600" />
            <StatCard title="Moyenne Générale" value={`${statsGenerales.moyenneGenerale}/20`} icon={<TrendingUp size={20} strokeWidth={2.5} />} color="from-emerald-500 to-teal-600" trend="+0.2" />
            <StatCard title="Mes Cours" value={statsGenerales.totalCours.toString()} icon={<BookOpen size={20} strokeWidth={2.5} />} color="from-orange-500 to-red-600" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm lg:col-span-1">
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Users size={20} />
                </div>
                Répartition des Élèves
              </h3>
              
              <div className="flex flex-col gap-6">
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck size={24} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-slate-700 text-lg">Garçons</span>
                  </div>
                  <span className="text-3xl font-extrabold text-blue-600">{statsDemographiques.garcons}</span>
                </div>

                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <UserCheck size={24} className="text-pink-600" />
                    </div>
                    <span className="font-bold text-slate-700 text-lg">Filles</span>
                  </div>
                  <span className="text-3xl font-extrabold text-pink-600">{statsDemographiques.filles}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedClasse !== "Toutes" ? (
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 shadow-sm h-full">
                  <StudentsSection />
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-10 shadow-sm h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
                    <Filter size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Sélectionnez une classe</h3>
                  <p className="text-slate-500 font-medium max-w-md">Utilisez le filtre en haut à droite pour sélectionner une classe spécifique et afficher la liste détaillée de vos élèves.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue Admin
  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto pb-12 relative z-10 animate-fade-in">
        
        <DashboardHeader 
          icon={Activity} 
          title="Vue d'ensemble" 
          subtitle="Gérez l'établissement d'une main de maître."
          badge="Espace Administrateur"
          badgeIcon={Sparkles}
          gradient="from-indigo-600 to-blue-600"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Élèves" value={statsGenerales.totalEleves.toString()} icon={<Users size={20} strokeWidth={2.5} />} color="from-indigo-600 to-indigo-600" trend="+12%" />
          <StatCard title="Classes Actives" value={statsGenerales.nbClasses.toString()} icon={<School size={20} strokeWidth={2.5} />} color="from-purple-600 to-fuchsia-600" trend="+2%" />
          <StatCard title="Cours Dispensés" value={statsGenerales.totalCours.toString()} icon={<BookOpen size={20} strokeWidth={2.5} />} color="from-orange-500 to-rose-500" trend="+5%" />
          <StatCard title="Corps Enseignant" value={enseignants.length.toString()} icon={<GraduationCap size={20} strokeWidth={2.5} />} color="from-emerald-500 to-teal-500" trend="+1%" />
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 shadow-sm overflow-hidden">
          <StudentsSection />
        </div>
      </div>
    </div>
  );
}