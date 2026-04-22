"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, Search, Filter, Mail, Phone,
  Edit, Eye, Grid3x3, List, GraduationCap,
  Download, Printer, CheckCircle, X, BarChart3, BookOpen,
  Trash2, Plus, MoreHorizontal, BadgeCheck, MapPin, Upload
} from "lucide-react";
import { useEnseignantsStore, useClassesStore, useNiveauxStore } from "@/lib/stores";

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
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose}><X size={20}/></button>
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
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 pt-3 border-t">
          <button onClick={() => onSave(tempSelected)} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-semibold">Valider</button>
          <button onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
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
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>(enseignant?.matieres || []);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(enseignant?.classes || []);
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{enseignant ? "Modifier" : "Ajouter"} un enseignant</h3>
            <button onClick={onClose}><X size={20}/></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label>Nom complet</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-xl p-2" /></div>
                <div><label>Email</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl p-2" /></div>
                <div><label>Téléphone</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-xl p-2" /></div>
                <div><label>Statut</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-xl p-2"><option>Titulaire</option><option>Contractuel</option><option>Contractuelle</option><option>Vacataire</option></select></div>
              </div>
              <div className="space-y-4">
                <div>
                  <label>Photo de profil</label>
                  <div className="flex gap-2 items-center mt-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photoUpload" />
                    <button type="button" onClick={() => document.getElementById('photoUpload')?.click()} className="border rounded-xl p-2 flex items-center gap-2"><Upload size={16}/> Importer</button>
                    <input value={form.photo} onChange={e => setForm({...form, photo: e.target.value})} className="flex-1 border rounded-xl p-2" placeholder="ou URL directe" />
                  </div>
                  {previewPhoto && <img src={previewPhoto} className="w-16 h-16 rounded-full object-cover mt-2" alt="aperçu" />}
                </div>
                <div>
                  <label>Matières enseignées</label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-xl min-h-[42px] bg-slate-50 mt-1">
                    {selectedMatieres.map(m => <span key={m} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{m}</span>)}
                    <button type="button" onClick={() => setShowMatiereModal(true)} className="text-indigo-600 text-xs flex items-center gap-1"><Plus size={12}/> Ajouter</button>
                  </div>
                </div>
                <div>
                  <label>Classes concernées</label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-xl min-h-[42px] bg-slate-50 mt-1">
                    {selectedClasses.map(c => <span key={c} className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{c}</span>)}
                    <button type="button" onClick={() => setShowClasseModal(true)} className="text-indigo-600 text-xs flex items-center gap-1"><Plus size={12}/> Ajouter</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button>
              <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
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
  const router = useRouter();
  const [enseignants, setEnseignants] = useEnseignantsStore();
  const [classes] = useClassesStore();
  const [niveaux] = useNiveauxStore();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState({ statut: "Tous", matiere: "", classe: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const allMatieres = useMemo(() => Array.from(new Set(enseignants.flatMap(e => e.matieres))).sort(), [enseignants]);
  const allClasses = useMemo(() => Array.from(new Set(enseignants.flatMap(e => e.classes))).sort(), [enseignants]);
  const statuts = ["Tous", "Titulaire", "Contractuel", "Contractuelle", "Vacataire"];

  const filtered = useMemo(() => {
    return enseignants.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                          e.email.toLowerCase().includes(search.toLowerCase()) ||
                          e.matieres.some(m => m.toLowerCase().includes(search.toLowerCase()));
      const matchStatut = filters.statut === "Tous" || e.status === filters.statut;
      const matchMatiere = !filters.matiere || e.matieres.includes(filters.matiere);
      const matchClasse = !filters.classe || e.classes.includes(filters.classe);
      return matchSearch && matchStatut && matchMatiere && matchClasse;
    });
  }, [enseignants, search, filters]);

  const stats = useMemo(() => {
    const total = enseignants.length;
    const titulaires = enseignants.filter(e => e.status === "Titulaire").length;
    const vacataires = enseignants.filter(e => e.status === "Vacataire").length;
    const taux = total ? (total / 548 * 100).toFixed(1) : "0";
    return { total, titulaires, vacataires, taux };
  }, [enseignants]);

  const saveEnseignant = (data: any) => {
    if (editing) {
      setEnseignants(enseignants.map(e => e.id === editing.id ? { ...editing, ...data } : e));
    } else {
      const newId = Math.max(...enseignants.map(e => e.id), 0) + 1;
      setEnseignants([...enseignants, { id: newId, ...data, enseignements: [] }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const deleteEnseignant = (id: number) => {
    if (confirm("Supprimer définitivement ?")) {
      setEnseignants(enseignants.filter(e => e.id !== id));
    }
  };

  const resetFilters = () => {
    setFilters({ statut: "Tous", matiere: "", classe: "" });
    setSearch("");
  };

  return (
    <div className="p-8 bg-[#fdfdff] min-h-screen font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <GraduationCap size={30} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Corps Enseignant</h1>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
              <span>Gestion RH</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Année 2025/2026</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => router.push("/enseignants/attribution")}
            className="flex-1 md:flex-none px-4 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen size={16} /> Attribution des cours
          </button>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <UserPlus size={18} /> Nouveau Profil
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Staff</p><h4 className="text-2xl font-black text-slate-800 tracking-tight">{stats.total}</h4></div>
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-500"><Users size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Taux de présence</p><h4 className="text-2xl font-black text-slate-800 tracking-tight">98.2%</h4></div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-500"><BadgeCheck size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Classes actives</p><h4 className="text-2xl font-black text-slate-800 tracking-tight">{allClasses.length}</h4></div>
          <div className="p-4 rounded-2xl bg-orange-50 text-orange-500"><BookOpen size={24} /></div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm mb-8 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input type="text" placeholder="Rechercher par nom, matière, email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-transparent rounded-2xl text-sm font-medium focus:outline-none placeholder:text-slate-300" />
        </div>
        <div className="flex items-center p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
          <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}><Grid3x3 size={20} /></button>
          <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-xl transition-all ${viewMode === "table" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}><List size={20} /></button>
        </div>
      </div>

      {/* VUE GRILLE */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(ens => {
            const photoUrl = getPhotoUrl(ens);
            return (
              <div key={ens.id} className="group bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-5">
                  <div className="relative">
                    <img src={photoUrl} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all" alt={ens.name} />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={20}/></button>
                </div>
                <h3 className="font-black text-slate-800 text-base leading-tight uppercase tracking-tighter mb-1">{ens.name}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">{ens.status}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-400"><Mail size={12}/><span className="text-[11px] font-bold truncate">{ens.email}</span></div>
                  <div className="flex items-center gap-3 text-slate-400"><Phone size={12}/><span className="text-[11px] font-bold">{ens.phone}</span></div>
                </div>
                <div className="flex flex-wrap gap-1 mb-6">
                  {ens.matieres.slice(0, 2).map(m => <span key={m} className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">{m}</span>)}
                  {ens.matieres.length > 2 && <span className="text-slate-300 text-[9px] font-bold p-1">+{ens.matieres.length - 2}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/enseignants/${ens.id}`)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">Voir Profil</button>
                  <button onClick={() => { setEditing(ens); setShowModal(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all"><Edit size={16} /></button>
                  <button onClick={() => deleteEnseignant(ens.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VUE TABLEAU */
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[280px]" />
                <col className="w-[120px]" />
                <col className="w-[140px]" />
                <col className="w-[120px]" />
                <col className="w-[100px]" />
                <col className="w-[100px]" />
              </colgroup>
              <thead className="bg-slate-50/50">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-4 py-4 text-left">Enseignant</th>
                  <th className="px-4 py-4 text-left">Contact</th>
                  <th className="px-4 py-4 text-left">Matières</th>
                  <th className="px-4 py-4 text-left">Classes</th>
                  <th className="px-4 py-4 text-left">Statut</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(ens => {
                  const photoUrl = getPhotoUrl(ens);
                  return (
                    <tr key={ens.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => router.push(`/enseignants/${ens.id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={photoUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                          <div className="truncate">
                            <p className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">{ens.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">{ens.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 truncate">{ens.phone}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {ens.matieres.slice(0, 2).map(m => <span key={m} className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase whitespace-nowrap">{m}</span>)}
                          {ens.matieres.length > 2 && <span className="text-[9px] text-slate-400">+{ens.matieres.length-2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase truncate">
                          {ens.classes.slice(0, 2).join(", ")}{ens.classes.length > 2 && " +" + (ens.classes.length-2)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap ${ens.status === 'Titulaire' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          {ens.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-2">
                          <button onClick={() => router.push(`/enseignants/${ens.id}`)} className="p-1 text-slate-400 hover:text-indigo-600"><Eye size={16}/></button>
                          <button onClick={() => { setEditing(ens); setShowModal(true); }} className="p-1 text-slate-400 hover:text-indigo-600"><Edit size={16}/></button>
                          <button onClick={() => deleteEnseignant(ens.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
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