// app/etudiants/page.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, Search, Filter, Mail, Phone,
  Edit, Eye, Grid3x3, List, GraduationCap,
  Download, Printer, CheckCircle, X, BarChart3, BookOpen,
  Trash2, Plus, MoreHorizontal, BadgeCheck, MapPin, Upload,
  Menu, Calendar, Home, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";

// Fonction utilitaire
function getPhotoUrl(eleve: any): string {
  if (eleve.img && (eleve.img.startsWith('http') || eleve.img.startsWith('data:image'))) return eleve.img;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom || eleve.name)}&background=random&color=fff&size=128&rounded=true&bold=true`;
}

// Modal d'ajout/modification
function EleveModal({ eleve, onSave, onClose, classesList, loadingClasses }: any) {
  const [form, setForm] = useState({
    nom: eleve?.nom || "",
    email: eleve?.email || "",
    telephone: eleve?.telephone || "",
    classe: eleve?.classe || "",
    matricule: eleve?.matricule || "",
    img: eleve?.img || "",
    dateNaissance: eleve?.dateNaissance || "",
    lieuNaissance: eleve?.lieuNaissance || "",
    nationalite: eleve?.nationalite || "Camerounaise",
    sexe: eleve?.sexe || "Masculin",
    adresse: eleve?.adresse || "",
    parentNom: eleve?.parentNom || "",
    parentTelephone: eleve?.parentTelephone || "",
    parentEmail: eleve?.parentEmail || "",
    parentProfession: eleve?.parentProfession || "",
  });
  
  const [previewPhoto, setPreviewPhoto] = useState(form.img);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewPhoto(base64);
        setForm({ ...form, img: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(form);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full my-8 p-4 sm:p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold">{eleve ? "Modifier" : "Ajouter"} un élève</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom complet *</label>
                <input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Matricule *</label>
                <input required value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Classe *</label>
                <select 
                  required 
                  value={form.classe} 
                  onChange={e => setForm({...form, classe: e.target.value})}
                  className="w-full border rounded-xl p-2.5 text-sm mt-1"
                  disabled={loadingClasses}
                >
                  <option value="">Sélectionner une classe</option>
                  {classesList.map((classe: any) => (
                    <option key={classe.id} value={classe.nom}>{classe.nom}</option>
                  ))}
                </select>
                {loadingClasses && (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Chargement des classes...
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Date de naissance</label>
                <input type="date" value={form.dateNaissance} onChange={e => setForm({...form, dateNaissance: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Lieu de naissance</label>
                <input value={form.lieuNaissance} onChange={e => setForm({...form, lieuNaissance: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
              </div>
            </div>
            
            {/* Colonne droite */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Photo de profil</label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photoUpload" />
                  <button type="button" onClick={() => document.getElementById('photoUpload')?.click()} className="border rounded-xl p-2.5 flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition">
                    <Upload size={16}/> Importer
                  </button>
                  <input value={form.img} onChange={e => setForm({...form, img: e.target.value})} className="flex-1 border rounded-xl p-2.5 text-sm" placeholder="ou URL directe" />
                </div>
                {previewPhoto && (
                  <div className="mt-2">
                    <img src={previewPhoto} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200" alt="aperçu" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Nationalité</label>
                <input value={form.nationalite} onChange={e => setForm({...form, nationalite: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Sexe</label>
                <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1">
                  <option>Masculin</option><option>Féminin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Adresse</label>
                <textarea value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm mt-1" rows={2} />
              </div>
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold text-sm mb-3">Informations du parent</h4>
                <div className="space-y-3">
                  <input value={form.parentNom} onChange={e => setForm({...form, parentNom: e.target.value})} placeholder="Nom du parent" className="w-full border rounded-xl p-2.5 text-sm" />
                  <input value={form.parentTelephone} onChange={e => setForm({...form, parentTelephone: e.target.value})} placeholder="Téléphone parent" className="w-full border rounded-xl p-2.5 text-sm" />
                  <input value={form.parentEmail} onChange={e => setForm({...form, parentEmail: e.target.value})} placeholder="Email parent" className="w-full border rounded-xl p-2.5 text-sm" />
                  <input value={form.parentProfession} onChange={e => setForm({...form, parentProfession: e.target.value})} placeholder="Profession" className="w-full border rounded-xl p-2.5 text-sm" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50">
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EtudiantsPage() {
  const { isAdmin, isLoading: authLoading, token } = useAuth();
  const { fetchWithAuth } = useApi();
  const router = useRouter();
  const [eleves, setEleves] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const getAuthHeaders = () => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Charger les classes depuis l'API
  useEffect(() => {
    const fetchClasses = async () => {
      if (!token) {
        setLoadingClasses(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/classes', { headers });
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    
    fetchClasses();
  }, [token]);

  // Charger les élèves depuis l'API
  useEffect(() => {
    const fetchEleves = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await fetchWithAuth('/api/eleves');
        setEleves(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement élèves:', err);
        setError("Erreur de chargement des données");
        setEleves([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEleves();
  }, [token, fetchWithAuth]);

  // Protection admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  // Filtrer les élèves
  const filtered = useMemo(() => {
    if (!Array.isArray(eleves)) return [];
    return eleves.filter((e: any) => {
      const matchSearch = e.nom?.toLowerCase().includes(search.toLowerCase()) ||
                         e.matricule?.toLowerCase().includes(search.toLowerCase()) ||
                         e.classe?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [eleves, search]);

  const stats = useMemo(() => {
    if (!Array.isArray(eleves)) return { total: 0, classes: 0, taux: "0" };
    const total = eleves.length;
    const classesUniques = new Set(eleves.map((e: any) => e.classe));
    const taux = total ? (total / 500 * 100).toFixed(1) : "0";
    return { total, classes: classesUniques.size, taux };
  }, [eleves]);

  const saveEleve = async (data: any) => {
    try {
      let response: any;
      
      // Générer un matricule si vide
      if (!data.matricule) {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        data.matricule = `${year}/${data.classe}/${random}`;
      }
      
      if (editing) {
        response = await fetchWithAuth(`/api/eleves/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        setEleves(eleves.map((e: any) => e.id === editing.id ? response : e));
      } else {
        response = await fetchWithAuth('/api/eleves', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        setEleves([...eleves, response]);
      }
      setShowModal(false);
      setEditing(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const deleteEleve = async (id: number) => {
    if (confirm("Supprimer définitivement cet élève ?")) {
      try {
        await fetchWithAuth(`/api/eleves/${id}`, { method: 'DELETE' });
        setEleves(eleves.filter((e: any) => e.id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
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
    <div className="p-4 sm:p-6 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-10 gap-4">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-xl sm:rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <GraduationCap size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Élèves</h1>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-wider">
              <span>Gestion Scolarité</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Année 2025/2026</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <UserPlus size={16} /> Nouvel Élève
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-10">
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Élèves</p><h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{stats.total}</h4></div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-500"><Users size={20} /></div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Classes</p><h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{stats.classes}</h4></div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-500"><BookOpen size={20} /></div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div><p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Taux Occupation</p><h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{stats.taux}%</h4></div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-500"><BarChart3 size={20} /></div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-2 rounded-xl sm:rounded-[1.5rem] border border-slate-100 shadow-sm mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, matricule ou classe..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 sm:py-4 bg-transparent rounded-xl text-sm font-medium focus:outline-none placeholder:text-slate-300" 
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
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
      </div>

      {/* VUE GRILLE */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((eleve: any) => {
            const photoUrl = getPhotoUrl(eleve);
            return (
              <div key={eleve.id} className="group bg-white rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] border border-slate-100 p-4 sm:p-6 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-4 sm:mb-5">
                  <div className="relative">
                    <img src={photoUrl} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all" alt={eleve.nom} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={18} /></button>
                </div>
                <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight uppercase tracking-tighter mb-1 line-clamp-1">{eleve.nom}</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 sm:mb-4">{eleve.matricule}</p>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                    <BookOpen size={11} className="sm:w-3 sm:h-3 flex-shrink-0"/><span className="text-[10px] sm:text-[11px] font-bold">{eleve.classe}</span>
                  </div>
                  {eleve.email && (
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400 truncate">
                      <Mail size={11} className="sm:w-3 sm:h-3 flex-shrink-0"/><span className="text-[10px] sm:text-[11px] font-bold truncate">{eleve.email}</span>
                    </div>
                  )}
                  {eleve.telephone && (
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                      <Phone size={11} className="sm:w-3 sm:h-3 flex-shrink-0"/><span className="text-[10px] sm:text-[11px] font-bold">{eleve.telephone}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/etudiants/${eleve.id}`)} className="flex-1 py-2 sm:py-3 bg-slate-900 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                    Voir Profil
                  </button>
                  <button onClick={() => { setEditing(eleve); setShowModal(true); }} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-lg sm:rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => deleteEleve(eleve.id)} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-lg sm:rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
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
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Élève</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Matricule</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Classe</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Contact</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((eleve: any) => {
                  const photoUrl = getPhotoUrl(eleve);
                  return (
                    <tr key={eleve.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => router.push(`/etudiants/${eleve.id}`)}>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img src={photoUrl} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover shadow-sm" />
                          <p className="font-black text-slate-800 text-[11px] sm:text-xs uppercase tracking-tight truncate">{eleve.nom}</p>
                        </div>
                       </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-indigo-600 font-bold">{eleve.matricule}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-slate-500">{eleve.classe}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-slate-500">{eleve.telephone || "-"}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button onClick={() => router.push(`/etudiants/${eleve.id}`)} className="p-1 text-slate-400 hover:text-indigo-600"><Eye size={14} /></button>
                          <button onClick={() => { setEditing(eleve); setShowModal(true); }} className="p-1 text-slate-400 hover:text-indigo-600"><Edit size={14} /></button>
                          <button onClick={() => deleteEleve(eleve.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
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
          <div className="text-slate-300 text-6xl mb-4">👨‍🎓</div>
          <p className="text-slate-500 font-medium">Aucun élève trouvé</p>
          <button onClick={() => setSearch("")} className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800">
            Réinitialiser la recherche
          </button>
        </div>
      )}

      {showModal && (
        <EleveModal
          eleve={editing}
          onSave={saveEleve}
          onClose={() => { setShowModal(false); setEditing(null); }}
          classesList={classes}
          loadingClasses={loadingClasses}
        />
      )}
    </div>
  );
}