"use client";
import { useState } from "react";
import { User, Mail, Smartphone, Globe, ExternalLink, Edit3, Trash2, Plus, X, Upload } from "lucide-react";
import { useElevesStore } from "@/lib/stores";

// Photos par défaut (Unsplash, personnes noires)
const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop"
];

function getAvatarUrl(eleve: any): string {
  if (eleve.photo && eleve.photo.startsWith('http')) return eleve.photo;
  if (eleve.photo && eleve.photo.startsWith('data:image')) return eleve.photo;
  // Si l'élève a un ID, on utilise une photo par défaut basée sur son ID
  return DEFAULT_PHOTOS[(eleve.id || 0) % DEFAULT_PHOTOS.length];
}

// Modal d'ajout/modification
function EleveModal({ eleve, onSave, onClose }: any) {
  const [form, setForm] = useState({
    nom: eleve?.nom || "",
    classe: eleve?.classe || "6ème A",
    matricule: eleve?.matricule || "",
    email: eleve?.email || "",
    telephone: eleve?.telephone || "",
    dateNaissance: eleve?.dateNaissance || "",
    photo: eleve?.photo || "",
  });
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
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{eleve ? "Modifier" : "Ajouter"} un élève</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Nom complet</label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Classe</label><input required value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Matricule</label><input required value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Téléphone</label><input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Date de naissance</label><input type="date" value={form.dateNaissance} onChange={e => setForm({...form, dateNaissance: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div>
            <label>Photo</label>
            <div className="flex gap-2 items-center mt-1">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photoUpload" />
              <button type="button" onClick={() => document.getElementById('photoUpload')?.click()} className="border rounded-xl p-2 flex items-center gap-2"><Upload size={16}/> Importer</button>
              <input value={form.photo} onChange={e => setForm({...form, photo: e.target.value})} className="flex-1 border rounded-xl p-2" placeholder="ou URL" />
            </div>
            {previewPhoto && <img src={previewPhoto} className="w-16 h-16 rounded-full object-cover mt-2" alt="aperçu" />}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentsSection() {
  const [eleves, setEleves] = useElevesStore();
  const [selectedEleve, setSelectedEleve] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const saveEleve = (data: any) => {
    if (editing) {
      setEleves(eleves.map(e => e.id === editing.id ? { ...editing, ...data } : e));
      if (selectedEleve?.id === editing.id) setSelectedEleve({ ...selectedEleve, ...data });
    } else {
      const newId = Math.max(...eleves.map(e => e.id), 0) + 1;
      const newEleve = {
        id: newId,
        nom: data.nom,
        classe: data.classe,
        matricule: data.matricule,
        email: data.email,
        telephone: data.telephone,
        dateNaissance: data.dateNaissance,
        photo: data.photo,
        statusColor: "bg-blue-400",
        moyenne: "0",
        noteColor: "text-blue-600",
        selected: false,
      };
      setEleves([...eleves, newEleve]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const deleteEleve = (id: number) => {
    if (confirm("Supprimer cet élève définitivement ?")) {
      setEleves(eleves.filter(e => e.id !== id));
      if (selectedEleve?.id === id) setSelectedEleve(null);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-slate-700">
      {/* Tableau */}
      <div className="xl:col-span-2 bg-white rounded-[2rem] shadow-sm border-2 border-slate-50 overflow-hidden">
        <div className="p-5 border-b-2 border-slate-50 flex justify-between items-center">
          <h3 className="font-black text-[#2d3a8d] text-sm uppercase tracking-widest">Base de données Élèves</h3>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 bg-[#3b82f6] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 transition-transform">
            <Plus size={14} strokeWidth={3} /> NOUVEL ÉLÈVE
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfdfe] text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4 w-10 text-center">#</th>
                <th className="px-6 py-4">Profil</th>
                <th className="px-6 py-4">Nom Complet</th>
                <th className="px-6 py-4">Classe</th>
                <th className="px-6 py-4">Matricule</th>
                <th className="px-6 py-4">État</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {eleves.map((s) => (
                <tr key={s.id} className={`${selectedEleve?.id === s.id ? 'bg-[#f1f6ff]' : ''} hover:bg-slate-50 transition-colors cursor-pointer`} onClick={() => setSelectedEleve(s)}>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" checked={selectedEleve?.id === s.id} readOnly className="rounded-md w-4 h-4 text-blue-600 border-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <img src={getAvatarUrl(s)} className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-200" alt={s.nom} />
                  </td>
                  <td className="px-6 py-4 font-black text-[#2d3a8d] text-[13px] uppercase tracking-tighter">{s.nom}</td>
                  <td className="px-6 py-4 text-slate-400 text-[11px] font-bold uppercase">{s.classe}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">{s.matricule}</td>
                  <td className="px-6 py-4">
                    <div className={`w-8 h-2 rounded-full ${s.statusColor || 'bg-blue-400'} shadow-inner`}></div>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-3">
                      <button onClick={() => { setEditing(s); setShowModal(true); }} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-300 hover:text-blue-500 shadow-sm transition-all"><Edit3 size={14} /></button>
                      <button onClick={() => deleteEleve(s.id)} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-300 hover:text-red-500 shadow-sm transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiche Profil */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm p-8 flex flex-col items-center relative overflow-hidden">
        <div className="w-full flex justify-between items-center mb-8">
          <h3 className="font-black text-[#2d3a8d] text-xs flex items-center gap-3 uppercase tracking-widest">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600 shadow-sm"><User size={16} /></div> 
            Détails Profil
          </h3>
        </div>

        {selectedEleve ? (
          <>
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl shadow-slate-200">
                <img src={getAvatarUrl(selectedEleve)} className="w-full h-full object-cover" alt={selectedEleve.nom} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-400 border-8 border-white rounded-full"></div>
            </div>
            <h4 className="font-black text-[#2d3a8d] text-2xl uppercase tracking-tighter mb-1">{selectedEleve.nom}</h4>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-8">Matricule: {selectedEleve.matricule}</p>

            <div className="w-full space-y-6 border-t-2 border-slate-50 pt-8">
              <div className="bg-[#f8fafc] p-4 rounded-3xl border border-slate-100">
                <p className="text-slate-300 font-black uppercase tracking-widest text-[8px] mb-3">Parcours Académique</p>
                <div className="flex justify-between items-center">
                  <span className="font-black text-[#2d3a8d] text-xs uppercase italic">Classe : {selectedEleve.classe}</span>
                  <span className="text-[10px] font-bold text-slate-400">Né le {selectedEleve.dateNaissance || '—'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-xs font-black text-slate-500 hover:bg-slate-50 p-2 rounded-2xl transition-colors cursor-pointer group">
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Smartphone size={16} /></div>
                  {selectedEleve.telephone || 'Non renseigné'}
                </div>
                <div className="flex items-center gap-4 text-xs font-black text-slate-500 hover:bg-slate-50 p-2 rounded-2xl transition-colors cursor-pointer group">
                  <div className="bg-purple-50 p-2.5 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all"><Mail size={16} /></div>
                  {selectedEleve.email || '—'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-400">Sélectionnez un élève dans la liste</div>
        )}
      </div>

      {showModal && (
        <EleveModal
          eleve={editing}
          onSave={saveEleve}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}