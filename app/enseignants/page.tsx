// app/enseignants/page.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, Search, Filter, Mail, Phone,
  Edit, Eye, Grid3x3, List, GraduationCap,
  Download, Printer, CheckCircle, X, BarChart3, BookOpen,
  Trash2, Plus, MoreHorizontal, BadgeCheck, MapPin, Upload,
  Menu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";

// Fonction utilitaire en dehors du composant pour éviter les problèmes de hooks
function parseJsonField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

function getPhotoUrl(enseignant: any): string {
  if (enseignant.photo && (enseignant.photo.startsWith('http') || enseignant.photo.startsWith('data:image'))) return enseignant.photo;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(enseignant.name)}&background=random&color=fff&size=128&rounded=true&bold=true`;
}

function SelectionModal({ title, items, selected, onSave, onClose }: any) {
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState<string[]>(selected);
  const filtered = items.filter((i: string) => i.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col p-4 sm:p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition"><X size={20}/></button>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {filtered.map((item: string) => (
            <label key={item} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input 
                type="checkbox" 
                checked={tempSelected.includes(item)} 
                onChange={() => {
                  if (tempSelected.includes(item)) {
                    setTempSelected(tempSelected.filter((i: string) => i !== item));
                  } else {
                    setTempSelected([...tempSelected, item]);
                  }
                }} 
                className="w-4 h-4" 
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 pt-3 border-t">
          <button onClick={() => onSave(tempSelected)} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-semibold text-sm">Valider</button>
          <button onClick={onClose} className="flex-1 border py-2 rounded-xl text-sm">Annuler</button>
        </div>
      </div>
    </div>
  );
}

function EnseignantModal({ enseignant, onSave, onClose, allMatieres, allClasses }: any) {
  const [form, setForm] = useState({
    name: enseignant?.name || "",
    email: enseignant?.email || "",
    phone: enseignant?.phone || "",
    status: enseignant?.status || "Titulaire",
    photo: enseignant?.photo || "",
  });
  
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>(() => {
    if (!enseignant?.matieres) return [];
    if (Array.isArray(enseignant.matieres)) return enseignant.matieres;
    try {
      return JSON.parse(enseignant.matieres);
    } catch {
      return [];
    }
  });
  
  const [selectedClasses, setSelectedClasses] = useState<string[]>(() => {
    if (!enseignant?.classes) return [];
    if (Array.isArray(enseignant.classes)) return enseignant.classes;
    try {
      return JSON.parse(enseignant.classes);
    } catch {
      return [];
    }
  });
  
  const [showMatiereModal, setShowMatiereModal] = useState(false);
  const [showClasseModal, setShowClasseModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(form.photo);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewPhoto(base64);
        setForm({ ...form, photo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      matieres: selectedMatieres,
      classes: selectedClasses,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full my-8 p-4 sm:p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold">{enseignant ? "Modifier" : "Ajouter"} un enseignant</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition"><X size={20}/></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom complet</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1">
                    <option>Titulaire</option><option>Contractuel</option><option>Contractuelle</option><option>Vacataire</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Photo de profil</label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photoUpload" />
                    <button type="button" onClick={() => document.getElementById('photoUpload')?.click()} className="border rounded-xl p-2.5 flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition">
                      <Upload size={16}/> Importer
                    </button>
                    <input value={form.photo} onChange={e => setForm({...form, photo: e.target.value})} className="flex-1 border rounded-xl p-2.5 text-sm" placeholder="ou URL directe" />
                  </div>
                  {previewPhoto && (
                    <div className="mt-2">
                      <img src={previewPhoto} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200" alt="aperçu" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Matières enseignées</label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-xl min-h-[42px] bg-slate-50 mt-1">
                    {selectedMatieres.map(m => <span key={m} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">{m}</span>)}
                    <button type="button" onClick={() => setShowMatiereModal(true)} className="text-indigo-600 text-xs flex items-center gap-1 hover:text-indigo-800">
                      <Plus size={12}/> Ajouter
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Classes concernées</label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-xl min-h-[42px] bg-slate-50 mt-1">
                    {selectedClasses.map(c => <span key={c} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">{c}</span>)}
                    <button type="button" onClick={() => setShowClasseModal(true)} className="text-indigo-600 text-xs flex items-center gap-1 hover:text-indigo-800">
                      <Plus size={12}/> Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition">
                Enregistrer
              </button>
              <button type="button" onClick={onClose} className="flex-1 border py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
      {showMatiereModal && <SelectionModal title="Matières" items={allMatieres} selected={selectedMatieres} onSave={(s: string[]) => { setSelectedMatieres(s); setShowMatiereModal(false); }} onClose={() => setShowMatiereModal(false)} />}
      {showClasseModal && <SelectionModal title="Classes" items={allClasses} selected={selectedClasses} onSave={(s: string[]) => { setSelectedClasses(s); setShowClasseModal(false); }} onClose={() => setShowClasseModal(false)} />}
    </>
  );
}

export default function EnseignantsPage() {
  const { isAdmin, isLoading: authLoading, token } = useAuth();
  const { fetchWithAuth } = useApi();
  const router = useRouter();
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [niveaux, setNiveaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState({ statut: "Tous", matiere: "", classe: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // Charger les données depuis l'API avec authentification
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const [enseignantsRes, classesRes, niveauxRes] = await Promise.all([
          fetchWithAuth('/api/enseignants'),
          fetchWithAuth('/api/classes'),
          fetchWithAuth('/api/niveaux'),
        ]);
        
        setEnseignants(Array.isArray(enseignantsRes) ? enseignantsRes : []);
        setClasses(Array.isArray(classesRes) ? classesRes : []);
        setNiveaux(Array.isArray(niveauxRes) ? niveauxRes : []);
        setError(null);
      } catch (error) {
        console.error('Erreur chargement:', error);
        setError("Erreur de chargement des données");
        setEnseignants([]);
        setClasses([]);
        setNiveaux([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, fetchWithAuth]);

  // Protection admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  // Extraire toutes les matières et classes uniques
  const allMatieres = useMemo(() => {
    if (!Array.isArray(enseignants)) return [];
    const matieresSet = new Set();
    enseignants.forEach((e: any) => {
      const matieres = parseJsonField(e.matieres);
      matieres.forEach((m: string) => matieresSet.add(m));
    });
    return Array.from(matieresSet).sort();
  }, [enseignants]);

  const allClasses = useMemo(() => {
    if (!Array.isArray(enseignants)) return [];
    const classesSet = new Set();
    enseignants.forEach((e: any) => {
      const classesList = parseJsonField(e.classes);
      classesList.forEach((c: string) => classesSet.add(c));
    });
    return Array.from(classesSet).sort();
  }, [enseignants]);

  const statuts = ["Tous", "Titulaire", "Contractuel", "Contractuelle", "Vacataire"];

  // Filtrer les enseignants
  const filtered = useMemo(() => {
    if (!Array.isArray(enseignants)) return [];
    return enseignants.filter((e: any) => {
      const matieresList = parseJsonField(e.matieres);
      const classesList = parseJsonField(e.classes);
      
      const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) ||
                          e.email?.toLowerCase().includes(search.toLowerCase()) ||
                          matieresList.some((m: string) => m.toLowerCase().includes(search.toLowerCase()));
      const matchStatut = filters.statut === "Tous" || e.status === filters.statut;
      const matchMatiere = !filters.matiere || matieresList.includes(filters.matiere);
      const matchClasse = !filters.classe || classesList.includes(filters.classe);
      return matchSearch && matchStatut && matchMatiere && matchClasse;
    });
  }, [enseignants, search, filters]);

  const stats = useMemo(() => {
    if (!Array.isArray(enseignants)) return { total: 0, titulaires: 0, vacataires: 0, taux: "0" };
    const total = enseignants.length;
    const titulaires = enseignants.filter((e: any) => e.status === "Titulaire").length;
    const vacataires = enseignants.filter((e: any) => e.status === "Vacataire").length;
    const taux = total ? (total / 548 * 100).toFixed(1) : "0";
    return { total, titulaires, vacataires, taux };
  }, [enseignants]);
const saveEnseignant = async (data: any) => {
  try {
    const payload = {
      ...data,
      matieres: JSON.stringify(data.matieres),
      classes: JSON.stringify(data.classes),
    };
    
    let response: any; // Ajout du type explicite
    
    if (editing) {
      response = await fetchWithAuth(`/api/enseignants/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setEnseignants(enseignants.map((e: any) => e.id === editing.id ? response : e));
    } else {
      response = await fetchWithAuth('/api/enseignants', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setEnseignants([...enseignants, response]);
    }
    setShowModal(false);
    setEditing(null);
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    alert('Erreur lors de la sauvegarde');
  }
};

  const deleteEnseignant = async (id: number) => {
    if (confirm("Supprimer définitivement ?")) {
      try {
        await fetchWithAuth(`/api/enseignants/${id}`, { method: 'DELETE' });
        setEnseignants(enseignants.filter((e: any) => e.id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetFilters = () => {
    setFilters({ statut: "Tous", matiere: "", classe: "" });
    setSearch("");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#fdfdff] min-h-screen font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-10 gap-4">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-xl sm:rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <GraduationCap size={24} strokeWidth={1.5} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Corps Enseignant</h1>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-wider">
              <span>Gestion RH</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Année 2025/2026</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => router.push("/enseignants/attribution")}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen size={14} /> Attribution des cours
          </button>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <UserPlus size={16} /> Nouveau Profil
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-10">
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Staff</p><h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{stats.total}</h4></div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-500"><Users size={20} className="sm:w-6 sm:h-6" /></div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Taux présence</p><h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">98.2%</h4></div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-500"><BadgeCheck size={20} className="sm:w-6 sm:h-6" /></div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div><p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Classes actives</p><h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{allClasses.length}</h4></div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-500"><BookOpen size={20} className="sm:w-6 sm:h-6" /></div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-2 rounded-xl sm:rounded-[1.5rem] border border-slate-100 shadow-sm mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, matière, email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 sm:py-4 bg-transparent rounded-xl text-sm font-medium focus:outline-none placeholder:text-slate-300" 
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-600 text-sm font-medium flex items-center gap-2 hover:bg-slate-100 transition"
            >
              <Filter size={16} /> Filtres
            </button>
            <div className="flex items-center p-1 bg-slate-50 rounded-xl border border-slate-100">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                <Grid3x3 size={18} />
              </button>
              <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* FILTRES DÉROULANTS */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select 
                value={filters.statut} 
                onChange={e => setFilters({...filters, statut: e.target.value})}
                className="px-3 py-2 border rounded-xl text-sm bg-white"
              >
                {statuts.map(s => <option key={s}>{s}</option>)}
              </select>
              <select 
                value={filters.matiere} 
                onChange={e => setFilters({...filters, matiere: e.target.value})}
                className="px-3 py-2 border rounded-xl text-sm bg-white"
              >
                <option value="">Toutes matières</option>
                {allMatieres.map((m: any) => <option key={m}>{m}</option>)}
              </select>
              <select 
                value={filters.classe} 
                onChange={e => setFilters({...filters, classe: e.target.value})}
                className="px-3 py-2 border rounded-xl text-sm bg-white"
              >
                <option value="">Toutes classes</option>
                {allClasses.map((c: any) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={resetFilters} className="mt-3 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* VUE GRILLE */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((ens: any) => {
            const photoUrl = getPhotoUrl(ens);
            const matieresList = parseJsonField(ens.matieres);
            return (
              <div key={ens.id} className="group bg-white rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] border border-slate-100 p-4 sm:p-6 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-4 sm:mb-5">
                  <div className="relative">
                    <img src={photoUrl} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all" alt={ens.name} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={18} className="sm:w-5 sm:h-5"/></button>
                </div>
                <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight uppercase tracking-tighter mb-1 line-clamp-1">{ens.name}</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 sm:mb-4">{ens.status}</p>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 text-slate-400 truncate">
                    <Mail size={11} className="sm:w-3 sm:h-3 flex-shrink-0"/><span className="text-[10px] sm:text-[11px] font-bold truncate">{ens.email}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                    <Phone size={11} className="sm:w-3 sm:h-3 flex-shrink-0"/><span className="text-[10px] sm:text-[11px] font-bold">{ens.phone}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4 sm:mb-6">
                  {matieresList.slice(0, 2).map((m: string) => <span key={m} className="bg-indigo-50 text-indigo-600 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md uppercase tracking-wider">{m}</span>)}
                  {matieresList.length > 2 && <span className="text-slate-300 text-[8px] sm:text-[9px] font-bold p-1">+{matieresList.length - 2}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/enseignants/${ens.id}`)} className="flex-1 py-2 sm:py-3 bg-slate-900 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                    Voir Profil
                  </button>
                  <button onClick={() => { setEditing(ens); setShowModal(true); }} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-lg sm:rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all">
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => deleteEnseignant(ens.id)} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-lg sm:rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto">
          <div className="min-w-[768px]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Enseignant</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Contact</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Matières</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Classes</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Statut</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((ens: any) => {
                  const photoUrl = getPhotoUrl(ens);
                  const matieresList = parseJsonField(ens.matieres);
                  const classesList = parseJsonField(ens.classes);
                  return (
                    <tr key={ens.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => router.push(`/enseignants/${ens.id}`)}>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img src={photoUrl} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover shadow-sm" />
                          <div className="truncate">
                            <p className="font-black text-slate-800 text-[11px] sm:text-xs uppercase tracking-tight truncate">{ens.name}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold truncate hidden sm:block">{ens.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-slate-500 truncate">{ens.phone}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex gap-1 flex-wrap">
                          {matieresList.slice(0, 2).map((m: string) => <span key={m} className="bg-indigo-50 text-indigo-600 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md uppercase whitespace-nowrap">{m}</span>)}
                          {matieresList.length > 2 && <span className="text-[8px] sm:text-[9px] text-slate-400">+{matieresList.length-2}</span>}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase truncate">
                          {classesList.slice(0, 2).join(", ")}{classesList.length > 2 && " +" + (classesList.length-2)}
                        </p>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className={`text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap ${ens.status === 'Titulaire' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          {ens.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button onClick={() => router.push(`/enseignants/${ens.id}`)} className="p-1 text-slate-400 hover:text-indigo-600"><Eye size={14} className="sm:w-4 sm:h-4"/></button>
                          <button onClick={() => { setEditing(ens); setShowModal(true); }} className="p-1 text-slate-400 hover:text-indigo-600"><Edit size={14} className="sm:w-4 sm:h-4"/></button>
                          <button onClick={() => deleteEnseignant(ens.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} className="sm:w-4 sm:h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-300 text-6xl mb-4">👨‍🏫</div>
          <p className="text-slate-500 font-medium">Aucun enseignant trouvé</p>
          <button onClick={resetFilters} className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800">
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {showModal && (
        <EnseignantModal
          enseignant={editing}
          onSave={saveEnseignant}
          onClose={() => { setShowModal(false); setEditing(null); }}
          allMatieres={allMatieres}
          allClasses={allClasses}
        />
      )}
    </div>
  );
}