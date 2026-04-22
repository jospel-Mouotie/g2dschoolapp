// app/etudiants/page.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { 
  ChevronRight, ChevronLeft, FileText, Bell, Users, Plus, LayoutGrid, 
  Search, Edit, Trash2, X, Upload 
} from "lucide-react";
import { useElevesStore, useNotesStore } from "@/lib/stores";

// Helper pour obtenir une photo valide (URL ou base64)
function getPhotoUrl(eleve: any): string {
  if (eleve.img && (eleve.img.startsWith('http') || eleve.img.startsWith('data:image'))) return eleve.img;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom)}&background=random&color=fff&size=128&rounded=true&bold=true`;
}

// Modal d'ajout/modification
function EleveModal({ eleve, onSave, onClose }: any) {
  const [form, setForm] = useState({
    nom: eleve?.nom || "",
    classe: eleve?.classe || "6ème A",
    matricule: eleve?.matricule || "",
    img: eleve?.img || "",
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{eleve ? "Modifier l'élève" : "Ajouter un élève"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium">Nom complet</label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
          <div><label className="block text-sm font-medium">Classe</label><input required value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
          <div><label className="block text-sm font-medium">Matricule</label><input required value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
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
        e.matricule.includes(search)
      );
    }
    if (selectedClasse !== "Toutes") {
      filtered = filtered.filter(e => e.classe === selectedClasse);
    }
    return filtered;
  }, [eleves, search, selectedClasse]);

  // Sauvegarde (ajout ou modification) avec persistance garantie
// ... (début du fichier)

const saveEleve = (formData: any) => {
  if (editingEleve) {
    setEleves(eleves.map(e => e.id === editingEleve.id ? { ...editingEleve, ...formData } : e));
  } else {
    const newId = Math.max(...eleves.map(e => e.id), 0) + 1;
    const newEleve: Eleve = {
      id: newId,
      nom: formData.nom,
      classe: formData.classe,
      matricule: formData.matricule,
      img: formData.img,
      statusColor: "bg-blue-400",
      // Champs optionnels
      email: formData.email,
      telephone: formData.telephone,
      dateNaissance: formData.dateNaissance,
    };
    setEleves([...eleves, newEleve]);
  }
  setShowModal(false);
  setEditingEleve(null);
};


  const deleteEleve = (id: number) => {
    if (confirm("Supprimer cet élève définitivement ?")) {
      setEleves(eleves.filter(e => e.id !== id));
      setNotes(notes.filter(n => n.eleveId !== id));
    }
  };

  const months = ["Cours 1", "Janv 1", "Mars", "Mars 2", "Cler", "Sept", "Août 7", "Guil 1", "Sept 2", "Set 1"];

  return (
    <div className="p-6 space-y-6 text-slate-600 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#3b4b94] flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <LayoutGrid size={24} className="text-[#3b4b94]" />
          </div>
          Gestion des Étudiants
        </h1>
        <div className="flex gap-4">
          <button className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
            35 Notifications
          </button>
          <button 
            onClick={() => { setEditingEleve(null); setShowModal(true); }}
            className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <Plus size={14} strokeWidth={3} /> Nouvel Élève
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex items-center gap-4 shadow-sm">
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
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex items-center gap-4 shadow-sm">
          <span className="text-sm font-bold text-slate-700 ml-2">Recherche</span>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Nom, matricule..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border rounded-xl text-sm" 
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex items-center gap-4 shadow-sm">
          <span className="text-sm font-bold text-slate-700 ml-2">Effectif</span>
          <span className="text-sm text-slate-500 flex-1 italic">{filteredEleves.length} élèves</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* TABLEAU DES ÉLÈVES */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left">
              <thead className="bg-[#fcfdfe] border-b-2 border-slate-50">
                <tr className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-6 w-20">Photo</th>
                  <th className="px-6 py-6 w-36">Prénom</th>
                  <th className="px-6 py-6 w-32">Classe</th>
                  <th className="px-6 py-6 w-36">Matricule</th>
                  <th className="px-6 py-6 w-20">État</th>
                  <th className="px-6 py-6 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {filteredEleves.map((s) => (
                  <tr key={s.id} className={`${s.active ? 'bg-[#f1f6ff]' : ''} hover:bg-slate-50 transition-colors`}>
                    <td className="px-6 py-4">
                      <img src={getPhotoUrl(s)} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" alt="" />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-base truncate">{s.nom}</td>
                    <td className="px-6 py-4 text-slate-700 text-base font-semibold truncate">{s.classe}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-mono truncate">{s.matricule}</td>
                    <td className="px-6 py-4">
                      <div className={`w-8 h-3 rounded-full ${s.statusColor || 'bg-blue-400'} shadow-inner`}></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditingEleve(s); setShowModal(true); }} className="text-slate-500 hover:text-blue-600 transition"><Edit size={18}/></button>
                        <button onClick={() => deleteEleve(s.id)} className="text-slate-500 hover:text-red-600 transition"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION DROITE (graphique + gestion des notes) - identique à l'original */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[12px] font-black text-[#3b4b94] uppercase tracking-widest">Mathématiques</h3>
              <button className="text-[10px] font-black text-blue-600 hover:underline">PUBLIER LES NOTES</button>
            </div>
            <div className="relative h-32 w-full">
              <svg viewBox="0 0 400 150" className="w-full h-full drop-shadow-[0_10px_10px_rgba(59,130,246,0.1)]">
                <path d="M0,110 L50,90 L100,105 L150,75 L200,85 L250,55 L300,65 L350,45 L400,50" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {[50,100,150,200,250,300,350].map((x, i) => (<circle key={i} cx={x} cy={[90,105,75,85,55,65,45][i]} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />))}
              </svg>
            </div>
            <div className="flex justify-between text-[8px] text-slate-300 font-black mt-4 uppercase">
              {months.slice(0, 8).map((m, i) => <span key={i}>{m}</span>)}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b-2 border-slate-50 flex items-center gap-3">
              <div className="bg-slate-50 p-2 rounded-xl text-slate-400"><FileText size={18} /></div>
              <h3 className="text-[13px] font-black text-[#3b4b94] uppercase tracking-widest">Gestion des notes</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">
                <span className="w-1/3">Matière</span>
                <span className="w-1/3">Appréciation</span>
                <span className="w-1/3 text-right">Moyenne</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">📘</div>
                <div className="flex-1"><p className="text-[11px] font-black text-[#3b4b94]">Mathématiques</p><p className="text-[10px] text-slate-400 font-bold tracking-tighter">Coefficient 4</p></div>
                <div className="flex-1 text-left"><p className="text-[11px] font-medium text-slate-600">Bon travail</p></div>
                <span className="text-[12px] font-black text-slate-600">16.50</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg">⚛️</div>
                <div className="flex-1"><p className="text-[11px] font-black text-[#3b4b94]">Physique-Chimie</p><p className="text-[10px] text-slate-400 font-bold tracking-tighter">Coefficient 5</p></div>
                <div className="flex-1 text-left"><p className="text-[11px] font-medium text-slate-600">À améliorer</p></div>
                <span className="text-[12px] font-black text-slate-600">12.75</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">🇬🇧</div>
                <div className="flex-1"><p className="text-[11px] font-black text-[#3b4b94]">Anglais</p><p className="text-[10px] text-slate-400 font-bold tracking-tighter">Coefficient 2</p></div>
                <div className="flex-1 text-left"><p className="text-[11px] font-medium text-slate-600">Excellent</p></div>
                <span className="text-[12px] font-black text-slate-600">18.20</span>
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