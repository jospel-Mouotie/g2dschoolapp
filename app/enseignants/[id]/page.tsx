"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Plus, X, Trash2, Briefcase, Clock, Users } from "lucide-react";
import { useEnseignantsStore, useCoursStore } from "@/lib/stores";

// Helper pour avatar (identique à la liste)
const TEACHER_PHOTOS = [
  "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop"
];

function getAvatarUrl(id: number, name: string, photoUrl?: string): string {
  if (photoUrl && photoUrl.startsWith('http')) return photoUrl;
  return TEACHER_PHOTOS[id % TEACHER_PHOTOS.length];
}

export default function EnseignantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [enseignants, setEnseignants] = useEnseignantsStore();
  const [cours] = useCoursStore();
  const [enseignant, setEnseignant] = useState<any>(null);
  const [showAttribution, setShowAttribution] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedClasse, setSelectedClasse] = useState("");

  useEffect(() => {
    const found = enseignants.find(e => e.id === parseInt(params.id as string));
    if (found) setEnseignant(found);
    else router.push("/enseignants");
  }, [params.id, enseignants]);

  if (!enseignant) return <div className="p-8 text-center">Chargement...</div>;

  const allMatieres = ["Maths", "Français", "Anglais", "Histoire", "Physique", "Informatique", "Philosophie"];
  const allClasses = ["6A", "5B", "4A", "3A", "2nde", "1ere", "Tle"];

  const attribuerCours = () => {
    if (!selectedMatiere || !selectedClasse) return;
    const newEnseignement = { matiere: selectedMatiere, classe: selectedClasse };
    const updated = {
      ...enseignant,
      enseignements: [...(enseignant.enseignements || []), newEnseignement],
      matieres: [...new Set([...enseignant.matieres, selectedMatiere])],
      classes: [...new Set([...enseignant.classes, selectedClasse])]
    };
    setEnseignants(enseignants.map(e => e.id === enseignant.id ? updated : e));
    setSelectedMatiere("");
    setSelectedClasse("");
    setShowAttribution(false);
  };

  const retirerEnseignement = (index: number) => {
    const updatedEnseignements = [...(enseignant.enseignements || [])];
    updatedEnseignements.splice(index, 1);
    const matieresUniques = new Set(updatedEnseignements.map(e => e.matiere));
    const classesUniques = new Set(updatedEnseignements.map(e => e.classe));
    const updated = {
      ...enseignant,
      enseignements: updatedEnseignements,
      matieres: Array.from(matieresUniques),
      classes: Array.from(classesUniques)
    };
    setEnseignants(enseignants.map(e => e.id === enseignant.id ? updated : e));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#fdfdff] min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition">
        <ArrowLeft size={20} /> Retour
      </button>

      {/* Carte principale profil */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-blue-600">
          <div className="absolute -bottom-12 left-8">
            <img src={getAvatarUrl(enseignant.id, enseignant.name, enseignant.photo)} className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg" alt="" />
          </div>
        </div>
        <div className="pt-16 px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">{enseignant.name}</h1>
              <p className="text-sm text-slate-500 mt-1">{enseignant.status}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">Modifier profil</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600"><Mail size={18} className="text-slate-400"/> {enseignant.email}</div>
              <div className="flex items-center gap-3 text-slate-600"><Phone size={18} className="text-slate-400"/> {enseignant.phone}</div>
              <div className="flex items-center gap-3 text-slate-600"><MapPin size={18} className="text-slate-400"/> Bureau {enseignant.bureau || 'Non spécifié'}</div>
              <div className="flex items-center gap-3 text-slate-600"><Clock size={18} className="text-slate-400"/> Horaires : {enseignant.horaires || 'Non spécifiés'}</div>
            </div>
            <div className="space-y-3">
              <div><h3 className="font-bold text-slate-700 flex items-center gap-2"><BookOpen size={18}/> Matières</h3><div className="flex flex-wrap gap-2 mt-2">{enseignant.matieres.map((m: string) => <span key={m} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">{m}</span>)}</div></div>
              <div><h3 className="font-bold text-slate-700 flex items-center gap-2"><Users size={18}/> Classes</h3><div className="flex flex-wrap gap-2 mt-2">{enseignant.classes.map((c: string) => <span key={c} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">{c}</span>)}</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Enseignements attribués */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase size={20}/> Enseignements attribués</h2>
          <button onClick={() => setShowAttribution(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Plus size={16}/> Attribuer</button>
        </div>
        {(!enseignant.enseignements || enseignant.enseignements.length === 0) ? (
          <p className="text-slate-400 text-center py-6">Aucun enseignement attribué. Cliquez sur "Attribuer" pour ajouter une matière à une classe.</p>
        ) : (
          <div className="space-y-2">
            {enseignant.enseignements.map((ens: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div><p className="font-medium text-slate-800">{ens.matiere}</p><p className="text-xs text-slate-500">Classe : {ens.classe}</p></div>
                <button onClick={() => retirerEnseignement(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded transition"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4 italic">Les horaires de ces cours seront définis dans la page Planning.</p>
      </div>

      {/* Modal attribution */}
      {showAttribution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Attribuer un enseignement</h3><button onClick={() => setShowAttribution(false)}><X size={20}/></button></div>
            <div className="space-y-4">
              <div><label>Matière</label><select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="w-full border rounded-xl p-2"><option value="">Choisir</option>{allMatieres.map(m => <option key={m}>{m}</option>)}</select></div>
              <div><label>Classe</label><select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)} className="w-full border rounded-xl p-2"><option value="">Choisir</option>{allClasses.map(c => <option key={c}>{c}</option>)}</select></div>
              <button onClick={attribuerCours} disabled={!selectedMatiere || !selectedClasse} className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">Attribuer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}