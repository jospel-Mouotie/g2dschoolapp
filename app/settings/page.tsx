// app/parametres/page.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, School, Wallet, Building, Save, Edit, Trash2,
  Plus, X, CheckCircle, AlertCircle, DoorOpen, BookOpen,
  Layers, Users, Globe, Phone, Mail, MapPin, Calendar, Upload,
  Coffee, Clock
} from "lucide-react";
import { useFraisStore, useMatieresStore, useNiveauxStore, useClassesStore, useEtablissementStore, usePausesStore } from "@/lib/stores";

// Données par défaut
const niveauxParDefaut: any[] = [
  { id: "1", niveau: "6ème", montant: 150000, description: "Frais de scolarité annuel" },
  { id: "2", niveau: "5ème", montant: 150000, description: "Frais de scolarité annuel" },
  { id: "3", niveau: "4ème", montant: 160000, description: "Frais de scolarité annuel" },
  { id: "4", niveau: "3ème", montant: 160000, description: "Frais de scolarité annuel" },
  { id: "5", niveau: "Seconde", montant: 170000, description: "Frais de scolarité annuel" },
  { id: "6", niveau: "Première", montant: 170000, description: "Frais de scolarité annuel" },
  { id: "7", niveau: "Terminale", montant: 180000, description: "Frais de scolarité annuel" },
];

const matieresParDefaut: any[] = [
  { id: "1", nom: "MATHÉMATIQUES", coefficient: 4, description: "Mathématiques générales" },
  { id: "2", nom: "FRANÇAIS", coefficient: 3, description: "Langue française" },
  { id: "3", nom: "ANGLAIS", coefficient: 2, description: "Langue anglaise" },
  { id: "4", nom: "HISTOIRE-GÉOGRAPHIE", coefficient: 3, description: "Histoire et Géographie" },
  { id: "5", nom: "PHYSIQUE-CHIMIE", coefficient: 5, description: "Sciences physiques" },
  { id: "6", nom: "INFORMATIQUE", coefficient: 2, description: "Informatique" },
  { id: "7", nom: "EPS", coefficient: 2, description: "Éducation physique" },
  { id: "8", nom: "ÉDUCATION CIVIQUE", coefficient: 1, description: "Éducation civique" },
];

// Modal pour les frais
function FraisModal({ frais, onSave, onClose }: any) {
  const [form, setForm] = useState({
    niveau: frais?.niveau || "",
    montant: frais?.montant || "",
    description: frais?.description || "",
  });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.niveau || !form.montant) return; onSave({ niveau: form.niveau, montant: parseInt(form.montant), description: form.description }); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{frais ? "Modifier" : "Ajouter"} les frais</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Niveau</label><input required value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})} className="w-full border rounded-xl p-2" placeholder="ex: 6ème" /></div>
          <div><label>Montant (FCFA)</label><input type="number" required value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-xl p-2" rows={2} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les matières
function MatiereModal({ matiere, onSave, onClose }: any) {
  const [form, setForm] = useState({ nom: matiere?.nom || "", coefficient: matiere?.coefficient || "", description: matiere?.description || "" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.nom || !form.coefficient) return; onSave({ nom: form.nom.toUpperCase(), coefficient: parseFloat(form.coefficient), description: form.description }); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{matiere ? "Modifier" : "Ajouter"} une matière</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Nom</label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Coefficient</label><input type="number" step="0.5" required value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-xl p-2" rows={2} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les niveaux
function NiveauModal({ niveau, onSave, onClose }: any) {
  const [form, setForm] = useState({ nom: niveau?.nom || "", description: niveau?.description || "", ordre: niveau?.ordre || 0 });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.nom) return; onSave({ nom: form.nom, description: form.description, ordre: parseInt(form.ordre) || 0 }); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{niveau ? "Modifier" : "Ajouter"} un niveau</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Nom du niveau</label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2" placeholder="ex: 6ème" /></div>
          <div><label>Ordre d'affichage</label><input type="number" value={form.ordre} onChange={e => setForm({...form, ordre: e.target.value})} className="w-full border rounded-xl p-2" placeholder="1, 2, 3..." /></div>
          <div><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-xl p-2" rows={2} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les classes
function ClasseModal({ classe, niveaux, onSave, onClose }: any) {
  const [form, setForm] = useState({ nom: classe?.nom || "", niveauId: classe?.niveauId || (niveaux[0]?.id || ""), effectif: classe?.effectif || "" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.nom || !form.niveauId) return; onSave({ nom: form.nom, niveauId: form.niveauId, effectif: parseInt(form.effectif) || 0 }); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{classe ? "Modifier" : "Ajouter"} une classe</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Nom de la classe</label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2" placeholder="ex: 6A" /></div>
          <div><label>Niveau</label><select value={form.niveauId} onChange={e => setForm({...form, niveauId: e.target.value})} className="w-full border rounded-xl p-2">{niveaux.map((n: any) => <option key={n.id} value={n.id}>{n.nom}</option>)}</select></div>
          <div><label>Effectif</label><input type="number" value={form.effectif} onChange={e => setForm({...form, effectif: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

// Modal pour l'établissement
function EtablissementModal({ etablissement, onSave, onClose }: any) {
  const [form, setForm] = useState({ nom: etablissement?.nom || "", logo: etablissement?.logo || "", adresse: etablissement?.adresse || "", telephone: etablissement?.telephone || "", email: etablissement?.email || "", anneeScolaire: etablissement?.anneeScolaire || "", region: etablissement?.region || "", delegation: etablissement?.delegation || "" });
  const [previewLogo, setPreviewLogo] = useState(form.logo);
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { const base64 = reader.result as string; setPreviewLogo(base64); setForm({ ...form, logo: base64 }); }; reader.readAsDataURL(file); } };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Informations de l'établissement</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Nom de l'établissement</label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2" /></div>
            <div><label>Logo</label><div className="flex gap-2 items-center"><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logoUpload" /><button type="button" onClick={() => document.getElementById('logoUpload')?.click()} className="border rounded-xl p-2 flex items-center gap-2"><Upload size={16}/> Importer</button><input value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} className="flex-1 border rounded-xl p-2" placeholder="ou URL" /></div>{previewLogo && <img src={previewLogo} className="w-16 h-16 object-contain mt-2 border rounded" alt="logo" />}</div>
            <div><label>Adresse</label><input value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} className="w-full border rounded-xl p-2" /></div>
            <div><label>Téléphone</label><input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} className="w-full border rounded-xl p-2" /></div>
            <div><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl p-2" /></div>
            <div><label>Année scolaire</label><input value={form.anneeScolaire} onChange={e => setForm({...form, anneeScolaire: e.target.value})} className="w-full border rounded-xl p-2" placeholder="2024/2025" /></div>
            <div><label>Région</label><input value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="w-full border rounded-xl p-2" placeholder="CENTRE" /></div>
            <div><label>Délégation</label><input value={form.delegation} onChange={e => setForm({...form, delegation: e.target.value})} className="w-full border rounded-xl p-2" placeholder="MFOUNDI" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les pauses
function PauseModal({ pause, onSave, onClose }: any) {
  const [form, setForm] = useState({ heureDebut: pause?.heureDebut || "12:00", heureFin: pause?.heureFin || "14:00", description: pause?.description || "" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.heureDebut || !form.heureFin) return; onSave({ heureDebut: form.heureDebut, heureFin: form.heureFin, description: form.description }); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{pause ? "Modifier" : "Ajouter"} une pause</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><div><label>Heure début</label><input type="time" required value={form.heureDebut} onChange={e => setForm({...form, heureDebut: e.target.value})} className="w-full border rounded-xl p-2" /></div><div><label>Heure fin</label><input type="time" required value={form.heureFin} onChange={e => setForm({...form, heureFin: e.target.value})} className="w-full border rounded-xl p-2" /></div></div>
          <div><label>Description</label><input required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-xl p-2" placeholder="ex: Pause déjeuner" /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

export default function ParametresPage() {
  const router = useRouter();
  const [fraisList, setFraisList] = useFraisStore();
  const [matieresList, setMatieresList] = useMatieresStore();
  const [niveaux, setNiveaux] = useNiveauxStore();
  const [classes, setClasses] = useClassesStore();
  const [etablissement, setEtablissement] = useEtablissementStore();
  const [pauses, setPauses] = usePausesStore();
  
  const [activeTab, setActiveTab] = useState<"etablissement" | "niveaux" | "classes" | "frais" | "matieres" | "pauses">("etablissement");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (fraisList.length === 0) setFraisList(niveauxParDefaut);
    if (matieresList.length === 0) setMatieresList(matieresParDefaut);
  }, []);

  const saveFrais = (data: any) => {
    if (editing) setFraisList(fraisList.map((f: any) => f.id === editing.id ? { ...editing, ...data } : f));
    else { const newId = (Math.max(...fraisList.map((f: any) => parseInt(f.id)), 0) + 1).toString(); setFraisList([...fraisList, { id: newId, ...data }]); }
    setShowModal(false); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const deleteFrais = (id: string) => { if (confirm("Supprimer ce niveau ?")) setFraisList(fraisList.filter((f: any) => f.id !== id)); };
  const saveMatiere = (data: any) => {
    if (editing) setMatieresList(matieresList.map((m: any) => m.id === editing.id ? { ...editing, ...data } : m));
    else { const newId = (Math.max(...matieresList.map((m: any) => parseInt(m.id)), 0) + 1).toString(); setMatieresList([...matieresList, { id: newId, ...data }]); }
    setShowModal(false); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const deleteMatiere = (id: string) => { if (confirm("Supprimer cette matière ?")) setMatieresList(matieresList.filter((m: any) => m.id !== id)); };
  const saveNiveau = (data: any) => {
    if (editing) setNiveaux(niveaux.map((n: any) => n.id === editing.id ? { ...editing, ...data } : n));
    else { const newId = (Math.max(...niveaux.map((n: any) => parseInt(n.id)), 0) + 1).toString(); setNiveaux([...niveaux, { id: newId, ...data }]); }
    setShowModal(false); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const deleteNiveau = (id: string) => { if (confirm("Supprimer ce niveau ? (les classes associées seront également supprimées)")) { setNiveaux(niveaux.filter((n: any) => n.id !== id)); setClasses(classes.filter((c: any) => c.niveauId !== id)); } };
  const saveClasse = (data: any) => {
    if (editing) setClasses(classes.map((c: any) => c.id === editing.id ? { ...editing, ...data } : c));
    else { const newId = (Math.max(...classes.map((c: any) => parseInt(c.id)), 0) + 1).toString(); setClasses([...classes, { id: newId, ...data }]); }
    setShowModal(false); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const deleteClasse = (id: string) => { if (confirm("Supprimer cette classe ?")) setClasses(classes.filter((c: any) => c.id !== id)); };
  const savePause = (data: any) => {
    if (editing) setPauses(pauses.map((p: any) => p.id === editing.id ? { ...editing, ...data } : p));
    else { const newId = (Math.max(...pauses.map((p: any) => parseInt(p.id)), 0) + 1).toString(); setPauses([...pauses, { id: newId, ...data }]); }
    setShowModal(false); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const deletePause = (id: string) => { if (confirm("Supprimer cette pause ?")) setPauses(pauses.filter((p: any) => p.id !== id)); };

  const totalAttendu = fraisList.reduce((sum: number, f: any) => sum + (f.montant || 0), 0);
  const totalCoefficients = matieresList.reduce((sum: number, m: any) => sum + (m.coefficient || 0), 0);
  const classesParNiveau = useMemo(() => { const grouped: Record<string, any[]> = {}; niveaux.forEach((niveau: any) => { grouped[niveau.id] = classes.filter((c: any) => c.niveauId === niveau.id); }); return grouped; }, [niveaux, classes]);

  const renderModal = () => {
    if (activeTab === "frais") return <FraisModal frais={editing} onSave={saveFrais} onClose={() => setShowModal(false)} />;
    if (activeTab === "matieres") return <MatiereModal matiere={editing} onSave={saveMatiere} onClose={() => setShowModal(false)} />;
    if (activeTab === "niveaux") return <NiveauModal niveau={editing} onSave={saveNiveau} onClose={() => setShowModal(false)} />;
    if (activeTab === "classes") return <ClasseModal classe={editing} niveaux={niveaux} onSave={saveClasse} onClose={() => setShowModal(false)} />;
    if (activeTab === "etablissement") return <EtablissementModal etablissement={editing || etablissement} onSave={(data: any) => { setEtablissement(data); setShowModal(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }} onClose={() => setShowModal(false)} />;
    if (activeTab === "pauses") return <PauseModal pause={editing} onSave={savePause} onClose={() => setShowModal(false)} />;
    return null;
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3"><div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600"><Settings size={28} strokeWidth={1.8} /></div>Paramètres</h1><p className="text-sm text-slate-500 mt-1 ml-14">Configuration de l'application</p></div>
        {saved && <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl"><CheckCircle size={18}/> Modifications enregistrées</div>}
      </div>

      <div className="flex gap-2 border-b border-slate-200 flex-wrap">
        <button onClick={() => { setActiveTab("etablissement"); setEditing(null); }} className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all ${activeTab === "etablissement" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}><Globe size={16} className="inline mr-2" /> Établissement</button>
        <button onClick={() => { setActiveTab("niveaux"); setEditing(null); }} className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all ${activeTab === "niveaux" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}><Layers size={16} className="inline mr-2" /> Niveaux</button>
        <button onClick={() => { setActiveTab("classes"); setEditing(null); }} className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all ${activeTab === "classes" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}><School size={16} className="inline mr-2" /> Classes</button>
        <button onClick={() => { setActiveTab("frais"); setEditing(null); }} className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all ${activeTab === "frais" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}><Wallet size={16} className="inline mr-2" /> Frais</button>
        <button onClick={() => { setActiveTab("matieres"); setEditing(null); }} className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all ${activeTab === "matieres" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}><BookOpen size={16} className="inline mr-2" /> Matières</button>
        <button onClick={() => { setActiveTab("pauses"); setEditing(null); }} className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all ${activeTab === "pauses" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}><Coffee size={16} className="inline mr-2" /> Pauses</button>
      </div>

      {/* SECTION ÉTABLISSEMENT */}
      {activeTab === "etablissement" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
            <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-xl text-blue-600"><School size={20}/></div><div><h2 className="font-bold text-slate-800">Informations de l'établissement</h2><p className="text-xs text-slate-500">Personnalisez les informations qui apparaîtront sur les bulletins</p></div></div>
            <button onClick={() => { setEditing(etablissement); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><Edit size={16}/> Modifier</button>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-6">
              {etablissement.logo && <div className="w-24 h-24 border rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center"><img src={etablissement.logo} alt="Logo" className="max-w-full max-h-full object-contain" /></div>}
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-800">{etablissement.nom}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><MapPin size={14}/> {etablissement.adresse}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Phone size={14}/> {etablissement.telephone}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Mail size={14}/> {etablissement.email}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Calendar size={14}/> Année scolaire: {etablissement.anneeScolaire}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Globe size={14}/> Région: {etablissement.region}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Building size={14}/> Délégation: {etablissement.delegation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION NIVEAUX */}
      {activeTab === "niveaux" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center"><div><h2 className="font-bold text-slate-800">Niveaux d'enseignement</h2><p className="text-xs text-slate-500">6ème, 5ème, 4ème, etc.</p></div><button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><Plus size={16}/> Ajouter un niveau</button></div>
          <div className="overflow-x-auto"><table className="w-full text-sm table-fixed"><colgroup><col className="w-32" /><col className="w-20" /><col className="w-48" /><col className="w-24" /></colgroup><thead className="bg-slate-50"><tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider"><th className="p-4 text-left">Niveau</th><th className="p-4 text-center">Ordre</th><th className="p-4 text-left">Description</th><th className="p-4 text-center">Actions</th></tr></thead><tbody className="divide-y">{niveaux.sort((a: any, b: any) => a.ordre - b.ordre).map((n: any) => (<tr key={n.id} className="hover:bg-slate-50 transition"><td className="p-4 font-medium">{n.nom}</td><td className="p-4 text-center">{n.ordre}</td><td className="p-4 text-slate-500">{n.description || "—"}</td><td className="p-4 text-center"><div className="flex justify-center gap-2"><button onClick={() => { setEditing(n); setShowModal(true); }} className="p-1 text-slate-400 hover:text-blue-500"><Edit size={16}/></button><button onClick={() => deleteNiveau(n.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button></div></td></tr>))}</tbody></table></div>
        </div>
      )}

     {/* SECTION CLASSES */}
{activeTab === "classes" && (
  <div className="space-y-4 animate-in fade-in duration-500">
    
    {/* Carte Principale */}
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header de la section */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-800 tracking-tight">Gestion des Classes</h2>
          <p className="text-sm text-slate-500 mt-1">Configurez les divisions (6A, 5B, etc.) par niveau scolaire.</p>
        </div>
        
        <button 
          onClick={() => { setEditing(null); setShowModal(true); }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-200 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter une classe
        </button>
      </div>

      {/* Conteneur de Table avec Scroll horizontal fluide */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Classe</th>
              <th className="px-6 py-4">Niveau</th>
              <th className="px-6 py-4 text-center">Effectif</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-50">
            {niveaux.map((niveau: any) => (
              classesParNiveau[niveau.id]?.map((classe: any) => (
                <tr 
                  key={classe.id} 
                  className="group hover:bg-emerald-50/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg group-hover:bg-white transition-colors">
                      {classe.nom}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-slate-600 font-medium">{niveau.nom}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-full text-xs font-bold ${classe.effectif ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      {classe.effectif || "0"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => { setEditing(classe); setShowModal(true); }} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      
                      <button 
                        onClick={() => deleteClasse(classe.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ))}
            
            {/* État vide si aucune classe */}
            {Object.keys(classesParNiveau).length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                  Aucune classe enregistrée pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

      {/* SECTION FRAIS */}
{activeTab === "frais" && (
  <div className="space-y-4 animate-in fade-in duration-500">
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-800 tracking-tight">Frais de Scolarité</h2>
          <p className="text-sm text-slate-500 mt-1">Définissez les montants annuels par niveau d'étude.</p>
        </div>
        <button 
          onClick={() => { setEditing(null); setShowModal(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-200 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter un niveau
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4 w-1/4">Niveau</th>
              <th className="px-6 py-4 w-1/4">Montant</th>
              <th className="px-6 py-4 w-1/3">Description</th>
              <th className="px-6 py-4 text-right w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {fraisList.map((f: any) => (
              <tr key={f.id} className="group hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-700">{f.niveau || "—"}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                    {f.montant?.toLocaleString()} FCFA
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm italic">
                  {f.description || "Aucune description"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setEditing(f); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => deleteFrais(f.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/80 border-t border-slate-200">
            <tr>
              <td className="px-6 py-5 font-bold text-slate-800 text-base">Total cumulé</td>
              <td className="px-6 py-5">
                <span className="text-lg font-black text-blue-600">
                  {totalAttendu.toLocaleString()} <span className="text-xs font-bold">FCFA</span>
                </span>
              </td>
              <td colSpan={2} className="px-6 py-5 text-slate-400 text-xs italic">Estimation basée sur les tarifs par niveau</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
)}

{/* SECTION MATIÈRES */}
{activeTab === "matieres" && (
  <div className="space-y-4 animate-in fade-in duration-500">
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-800 tracking-tight">Matières & Coefficients</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez le programme scolaire et le poids de chaque discipline.</p>
        </div>
        <button 
          onClick={() => { setEditing(null); setShowModal(true); }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-200 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter une matière
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4 w-1/3">Discipline</th>
              <th className="px-6 py-4 text-center w-1/6">Coef.</th>
              <th className="px-6 py-4 w-1/3">Catégorie/Description</th>
              <th className="px-6 py-4 text-right w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {matieresList.map((m: any) => {
              // Récupérer les initiales du nom de la matière (2 premières lettres)
              const initiales = m.nom ? m.nom.substring(0, 2).toUpperCase() : "??";
              return (
                <tr key={m.id} className="group hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {initiales}
                      </div>
                      <span className="font-bold text-slate-700">{m.nom || "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-black border border-blue-100 shadow-sm">
                      {m.coefficient || "0"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {m.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(m); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18}/></button>
                      <button onClick={() => deleteMatiere(m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                   </td>
                 </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50/80 border-t border-slate-200">
            <tr>
              <td className="px-6 py-5 font-bold text-slate-800">Total des pondérations</td>
              <td className="px-6 py-5 text-center">
                <span className="text-xl font-black text-emerald-600 underline decoration-emerald-200 underline-offset-4">
                  {totalCoefficients}
                </span>
              </td>
              <td colSpan={2} className="px-6 py-5 text-slate-400 text-xs italic text-right">Utilisé pour le calcul des moyennes générales</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
)}

    {/* SECTION PAUSES */}
{activeTab === "pauses" && (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header avec dégradé chaleureux */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 shadow-inner">
            <Coffee size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-800 tracking-tight">Heures de Pause</h2>
            <p className="text-sm text-slate-500 mt-1">Configurez les temps de récréation et de déjeuner.</p>
          </div>
        </div>
        
        <button 
          onClick={() => { setEditing(null); setShowModal(true); }} 
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-200 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter une pause
        </button>
      </div>

      {/* Conteneur de Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Plage Horaire</th>
              <th className="px-6 py-4">Durée</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-50">
            {pauses.map((p: any) => (
              <tr key={p.id} className="group hover:bg-amber-50/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {p.heureDebut}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {p.heureFin}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                     <Clock size={14} />
                     Pause prévue
                   </div>
                </td>
                
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {p.description || <span className="text-slate-300 italic">Sans titre</span>}
                </td>
                
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => { setEditing(p); setShowModal(true); }} 
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => deletePause(p.id)} 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {pauses.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                  Aucune pause configurée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

      {showModal && renderModal()}
    </div>
  );
}