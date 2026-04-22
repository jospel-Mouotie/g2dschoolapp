// app/etudiants/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, ChevronLeft, FileText, Bell, Users, Plus, LayoutGrid, 
  Search, Edit, Trash2, X, Upload, Eye, UserPlus
} from "lucide-react";
import { useElevesStore, useNotesStore, Eleve } from "@/lib/stores";

// Helper pour obtenir une photo valide (URL ou base64)
function getPhotoUrl(eleve: any): string {
  if (eleve.img && (eleve.img.startsWith('http') || eleve.img.startsWith('data:image'))) return eleve.img;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom)}&background=random&color=fff&size=128&rounded=true&bold=true`;
}

// Modal d'ajout/modification
function EleveModal({ eleve, onSave, onClose }: any) {
  const [form, setForm] = useState({
    nom: eleve?.nom || "",
    classe: eleve?.classe || "6A",
    matricule: eleve?.matricule || "",
    img: eleve?.img || "",
    email: eleve?.email || "",
    telephone: eleve?.telephone || "",
    dateNaissance: eleve?.dateNaissance || "",
    lieuNaissance: eleve?.lieuNaissance || "",
    nationalite: eleve?.nationalite || "Camerounaise",
    sexe: eleve?.sexe || "M",
    adresse: eleve?.adresse || "",
    parentNom: eleve?.parentNom || "",
    parentTelephone: eleve?.parentTelephone || "",
    parentEmail: eleve?.parentEmail || "",
    parentProfession: eleve?.parentProfession || "",
  });
  const [previewPhoto, setPreviewPhoto] = useState(form.img);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
          <h3 className="text-xl font-bold">{eleve ? "Modifier l'élève" : "Ajouter un élève"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Nom complet <span className="text-red-500">*</span></label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Classe <span className="text-red-500">*</span></label>
              <select required value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} className="w-full border rounded-xl p-2 mt-1">
                <option>6A</option><option>6B</option><option>6C</option><option>5A</option><option>5B</option>
                <option>4A</option><option>3A</option><option>Seconde A</option><option>Première A</option><option>Terminale A</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium">Matricule</label><input value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} className="w-full border rounded-xl p-2 mt-1 bg-slate-50" placeholder="Généré automatiquement" /></div>
            <div><label className="block text-sm font-medium">Sexe</label>
              <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} className="w-full border rounded-xl p-2 mt-1">
                <option value="M">Masculin</option><option value="F">Féminin</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium">Date de naissance</label><input type="date" value={form.dateNaissance} onChange={e => setForm({...form, dateNaissance: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Lieu de naissance</label><input value={form.lieuNaissance} onChange={e => setForm({...form, lieuNaissance: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Nationalité</label><input value={form.nationalite} onChange={e => setForm({...form, nationalite: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Téléphone</label><input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium">Adresse</label><textarea value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} className="w-full border rounded-xl p-2 mt-1" rows={2} /></div>
            
            <div className="md:col-span-2"><div className="border-t pt-3 mt-2"><h4 className="font-semibold text-slate-700 mb-2">Informations des parents</h4></div></div>
            <div><label className="block text-sm font-medium">Nom du parent</label><input value={form.parentNom} onChange={e => setForm({...form, parentNom: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Téléphone parent</label><input value={form.parentTelephone} onChange={e => setForm({...form, parentTelephone: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Email parent</label><input type="email" value={form.parentEmail} onChange={e => setForm({...form, parentEmail: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
            <div><label className="block text-sm font-medium">Profession parent</label><input value={form.parentProfession} onChange={e => setForm({...form, parentProfession: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Photo de profil</label>
            <div className="flex gap-2 items-center mt-1">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photoUpload" />
              <button type="button" onClick={() => document.getElementById('photoUpload')?.click()} className="border rounded-xl p-2 flex items-center gap-2"><Upload size={16}/> Importer</button>
              <input value={form.img} onChange={e => setForm({...form, img: e.target.value})} className="flex-1 border rounded-xl p-2" placeholder="ou URL directe" />
            </div>
            {previewPhoto && <img src={previewPhoto} className="w-16 h-16 rounded-full object-cover mt-2" alt="aperçu" />}
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button>
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 py-2 rounded-xl font-semibold">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const router = useRouter();
  const [eleves, setEleves] = useElevesStore();
  const [notes, setNotes] = useNotesStore();
  const [search, setSearch] = useState("");
  const [selectedClasse, setSelectedClasse] = useState("Toutes");
  const [showModal, setShowModal] = useState(false);
  const [editingEleve, setEditingEleve] = useState<any>(null);

  // Classes disponibles (mise à jour dynamique)
  const classesDispo = useMemo(() => {
    const classes = new Set(eleves.map(e => e.classe));
    return ["Toutes", ...Array.from(classes).sort()];
  }, [eleves]);

  // Filtrage
  const filteredEleves = useMemo(() => {
    let filtered = eleves;
    if (search) {
      filtered = filtered.filter(e => 
        e.nom.toLowerCase().includes(search.toLowerCase()) || 
        e.matricule?.includes(search) ||
        e.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedClasse !== "Toutes") {
      filtered = filtered.filter(e => e.classe === selectedClasse);
    }
    return filtered;
  }, [eleves, search, selectedClasse]);

  // Sauvegarde (ajout ou modification)
  const saveEleve = (formData: any) => {
    if (editingEleve) {
      setEleves(eleves.map(e => e.id === editingEleve.id ? { ...editingEleve, ...formData } : e));
    } else {
      const newId = Math.max(...eleves.map(e => e.id), 0) + 1;
      const newEleve: Eleve = {
        id: newId,
        nom: formData.nom,
        classe: formData.classe,
        matricule: formData.matricule || `${new Date().getFullYear()}/${formData.classe}/${newId.toString().padStart(4, '0')}`,
        img: formData.img,
        statusColor: "bg-emerald-400",
        email: formData.email,
        telephone: formData.telephone,
        dateNaissance: formData.dateNaissance,
        lieuNaissance: formData.lieuNaissance,
        nationalite: formData.nationalite,
        sexe: formData.sexe,
        adresse: formData.adresse,
        parentNom: formData.parentNom,
        parentTelephone: formData.parentTelephone,
        parentEmail: formData.parentEmail,
        parentProfession: formData.parentProfession,
        dateInscription: new Date().toISOString().split('T')[0],
      };
      setEleves([...eleves, newEleve]);
    }
    setShowModal(false);
    setEditingEleve(null);
  };

  const deleteEleve = (id: number) => {
    if (confirm("Supprimer cet élève définitivement ?")) {
      setEleves(eleves.filter(e => e.id !== id));
      const updatedNotes = { ...notes };
      delete updatedNotes[id];
      setNotes(updatedNotes);
    }
  };

  const months = ["Sept", "Oct", "Nov", "Déc", "Janv", "Fév", "Mars", "Avr", "Mai", "Juin"];

  return (
    <div className="p-6 space-y-6 text-slate-600 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#3b4b94] flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <LayoutGrid size={24} className="text-[#3b4b94]" />
          </div>
          Gestion des Étudiants
        </h1>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-widest shadow-sm flex items-center gap-2">
            <Bell size={14} /> 35 Notifications
          </button>
          <button 
            onClick={() => router.push("/inscription")}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center gap-2"
          >
            <UserPlus size={14} strokeWidth={3} /> Nouvelle Inscription
          </button>
          <button 
            onClick={() => { setEditingEleve(null); setShowModal(true); }}
            className="bg-[#3b82f6] text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <Plus size={14} strokeWidth={3} /> Ajouter
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400">Total élèves</p>
          <p className="text-2xl font-bold text-slate-800">{eleves.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400">Classes</p>
          <p className="text-2xl font-bold text-slate-800">{classesDispo.length - 1}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400">Nouvelles inscriptions</p>
          <p className="text-2xl font-bold text-slate-800">+{eleves.filter(e => e.dateInscription === new Date().toISOString().split('T')[0]).length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400">Taux de réussite</p>
          <p className="text-2xl font-bold text-slate-800">92%</p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={18} /></div>
          <span className="text-sm font-bold text-slate-700">Classe</span>
          <select 
            value={selectedClasse} 
            onChange={e => setSelectedClasse(e.target.value)}
            className="text-sm text-slate-500 flex-1 bg-transparent border-none focus:ring-0 font-medium"
          >
            {classesDispo.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm md:col-span-2">
          <span className="text-sm font-bold text-slate-700 ml-2">Recherche</span>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Nom, matricule, email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-200" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* TABLEAU DES ÉLÈVES */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 py-3 w-16">Photo</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Classe</th>
                  <th className="px-4 py-3">Matricule</th>
                  <th className="px-4 py-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEleves.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/etudiants/${s.id}`)}>
                    <td className="px-4 py-3">
                      <img src={getPhotoUrl(s)} className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover" alt="" />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.nom}</td>
                    <td className="px-4 py-3 text-slate-600">{s.classe}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{s.matricule}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/etudiants/${s.id}`)} className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"><Eye size={16}/></button>
                        <button onClick={() => { setEditingEleve(s); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-amber-600 transition rounded-lg hover:bg-amber-50"><Edit size={16}/></button>
                        <button onClick={() => deleteEleve(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEleves.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">Aucun élève trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION DROITE */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Performance générale</h3>
              <button className="text-xs font-semibold text-blue-600 hover:underline">Détails</button>
            </div>
            <div className="relative h-32 w-full">
              <svg viewBox="0 0 400 150" className="w-full h-full">
                <path d="M0,110 L50,90 L100,105 L150,75 L200,85 L250,55 L300,65 L350,45 L400,50" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {[50,100,150,200,250,300,350].map((x, i) => (<circle key={i} cx={x} cy={[90,105,75,85,55,65,45][i]} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />))}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-4">
              {months.map((m, i) => <span key={i}>{m}</span>)}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-50 p-2 rounded-xl text-slate-400"><FileText size={18} /></div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Aperçu des notes</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📘</div>
                <div className="flex-1"><p className="text-xs font-bold">Mathématiques</p><p className="text-[10px] text-slate-400">Coeff 4</p></div>
                <span className="text-sm font-bold text-slate-700">16.5</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">⚛️</div>
                <div className="flex-1"><p className="text-xs font-bold">Physique-Chimie</p><p className="text-[10px] text-slate-400">Coeff 5</p></div>
                <span className="text-sm font-bold text-slate-700">14.2</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">🇬🇧</div>
                <div className="flex-1"><p className="text-xs font-bold">Anglais</p><p className="text-[10px] text-slate-400">Coeff 3</p></div>
                <span className="text-sm font-bold text-slate-700">17.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <EleveModal eleve={editingEleve} onSave={saveEleve} onClose={() => { setShowModal(false); setEditingEleve(null); }} />
      )}
    </div>
  );
}