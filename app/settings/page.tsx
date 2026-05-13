// app/parametres/page.tsx - Version complète corrigée
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, School, Wallet, Building, Save, Edit, Trash2,
  Plus, X, CheckCircle, AlertCircle, DoorOpen, BookOpen,
  Layers, Users, Globe, Phone, Mail, MapPin, Calendar, Upload,
  Coffee, Clock, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Données par défaut pour le fallback
const niveauxParDefaut: any[] = [
  { id: "1", nom: "6ème", ordre: 1, description: "Cycle d'orientation" },
  { id: "2", nom: "5ème", ordre: 2, description: "Cycle d'orientation" },
  { id: "3", nom: "4ème", ordre: 3, description: "Cycle d'observation" },
  { id: "4", nom: "3ème", ordre: 4, description: "Cycle d'observation" },
  { id: "5", nom: "Seconde", ordre: 5, description: "Cycle déterminant" },
  { id: "6", nom: "Première", ordre: 6, description: "Cycle terminal" },
  { id: "7", nom: "Terminale", ordre: 7, description: "Cycle terminal" },
];

const matieresParDefaut: any[] = [
  { id: "maths", nom: "MATHÉMATIQUES", coefficient: 4, description: "Mathématiques générales" },
  { id: "francais", nom: "FRANÇAIS", coefficient: 3, description: "Langue française" },
  { id: "anglais", nom: "ANGLAIS", coefficient: 2, description: "Langue anglaise" },
  { id: "histgeo", nom: "HISTOIRE-GÉOGRAPHIE", coefficient: 3, description: "Histoire et Géographie" },
  { id: "physique", nom: "PHYSIQUE-CHIMIE", coefficient: 5, description: "Sciences physiques" },
  { id: "info", nom: "INFORMATIQUE", coefficient: 2, description: "Informatique" },
  { id: "eps", nom: "EPS", coefficient: 2, description: "Éducation physique" },
  { id: "education", nom: "ÉDUCATION CIVIQUE", coefficient: 1, description: "Éducation civique" },
];

const fraisParDefaut: any[] = [
  { id: "1", niveau: "6ème", montant: 150000, description: "Frais de scolarité annuel" },
  { id: "2", niveau: "5ème", montant: 150000, description: "Frais de scolarité annuel" },
  { id: "3", niveau: "4ème", montant: 160000, description: "Frais de scolarité annuel" },
  { id: "4", niveau: "3ème", montant: 160000, description: "Frais de scolarité annuel" },
  { id: "5", niveau: "Seconde", montant: 170000, description: "Frais de scolarité annuel" },
  { id: "6", niveau: "Première", montant: 170000, description: "Frais de scolarité annuel" },
  { id: "7", niveau: "Terminale", montant: 180000, description: "Frais de scolarité annuel" },
];

// Helper pour les headers avec token
function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Modal pour les frais
function FraisModal({ frais, onSave, onClose, loading }: any) {
  const [form, setForm] = useState({
    niveau: frais?.niveau || "",
    montant: frais?.montant || "",
    description: frais?.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.niveau || !form.montant) return;
    setIsSubmitting(true);
    await onSave({ niveau: form.niveau, montant: parseInt(form.montant), description: form.description });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{frais ? "Modifier" : "Ajouter"} les frais</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Niveau</label><input required value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} className="w-full border rounded-xl p-2" placeholder="ex: 6ème" /></div>
          <div><label className="block text-sm font-medium mb-1">Montant (FCFA)</label><input type="number" required value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} className="w-full border rounded-xl p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl p-2" rows={2} /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les matières
function MatiereModal({ matiere, onSave, onClose }: any) {
  const [form, setForm] = useState({ nom: matiere?.nom || "", coefficient: matiere?.coefficient || "", description: matiere?.description || "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.coefficient) return;
    setIsSubmitting(true);
    await onSave({ nom: form.nom.toUpperCase(), coefficient: parseFloat(form.coefficient), description: form.description });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{matiere ? "Modifier" : "Ajouter"} une matière</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nom</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-xl p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Coefficient</label><input type="number" step="0.5" required value={form.coefficient} onChange={e => setForm({ ...form, coefficient: e.target.value })} className="w-full border rounded-xl p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl p-2" rows={2} /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les niveaux
function NiveauModal({ niveau, onSave, onClose }: any) {
  const [form, setForm] = useState({ nom: niveau?.nom || "", description: niveau?.description || "", ordre: niveau?.ordre || 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom) return;
    setIsSubmitting(true);
    await onSave({ nom: form.nom, description: form.description, ordre: parseInt(form.ordre) || 0 });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{niveau ? "Modifier" : "Ajouter"} un niveau</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nom du niveau</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-xl p-2" placeholder="ex: 6ème" /></div>
          <div><label className="block text-sm font-medium mb-1">Ordre d'affichage</label><input type="number" value={form.ordre} onChange={e => setForm({ ...form, ordre: e.target.value })} className="w-full border rounded-xl p-2" placeholder="1, 2, 3..." /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl p-2" rows={2} /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les classes
function ClasseModal({ classe, niveaux, onSave, onClose }: any) {
  const [form, setForm] = useState({ nom: classe?.nom || "", niveauId: classe?.niveauId || (niveaux[0]?.id || ""), effectif: classe?.effectif || "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.niveauId) return;
    setIsSubmitting(true);
    await onSave({ nom: form.nom, niveauId: form.niveauId, effectif: parseInt(form.effectif) || 0 });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{classe ? "Modifier" : "Ajouter"} une classe</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nom de la classe</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-xl p-2" placeholder="ex: 6A" /></div>
          <div><label className="block text-sm font-medium mb-1">Niveau</label><select value={form.niveauId} onChange={e => setForm({ ...form, niveauId: e.target.value })} className="w-full border rounded-xl p-2">{niveaux.map((n: any) => <option key={n.id} value={n.id}>{n.nom}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Effectif</label><input type="number" value={form.effectif} onChange={e => setForm({ ...form, effectif: e.target.value })} className="w-full border rounded-xl p-2" /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour l'établissement
function EtablissementModal({ etablissement, onSave, onClose }: any) {
  const [form, setForm] = useState({
    nom: etablissement?.nom || "",
    logo: etablissement?.logo || "",
    adresse: etablissement?.adresse || "",
    telephone: etablissement?.telephone || "",
    email: etablissement?.email || "",
    anneeScolaire: etablissement?.anneeScolaire || "",
    devise: etablissement?.devise || "FCFA",
    region: etablissement?.region || "",
    delegation: etablissement?.delegation || "",
    departement: etablissement?.departement || ""
  });
  const [previewLogo, setPreviewLogo] = useState(form.logo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewLogo(base64);
        setForm({ ...form, logo: base64 });
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Informations de l'établissement</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Nom de l'établissement</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-xl p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Logo</label><div className="flex gap-2 items-center"><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logoUpload" /><button type="button" onClick={() => document.getElementById('logoUpload')?.click()} className="border rounded-xl p-2 flex items-center gap-2"><Upload size={16} /> Importer</button><input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} className="flex-1 border rounded-xl p-2" placeholder="ou URL" /></div>{previewLogo && <img src={previewLogo} className="w-16 h-16 object-contain mt-2 border rounded" alt="logo" />}</div>
            <div><label className="block text-sm font-medium mb-1">Adresse</label><input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} className="w-full border rounded-xl p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Téléphone</label><input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full border rounded-xl p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded-xl p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Année scolaire</label><input value={form.anneeScolaire} onChange={e => setForm({ ...form, anneeScolaire: e.target.value })} className="w-full border rounded-xl p-2" placeholder="2024/2025" /></div>
            <div><label className="block text-sm font-medium mb-1">Devise</label><input value={form.devise} onChange={e => setForm({ ...form, devise: e.target.value })} className="w-full border rounded-xl p-2" placeholder="FCFA" /></div>
            <div><label className="block text-sm font-medium mb-1">Région</label><input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="w-full border rounded-xl p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Délégation</label><input value={form.delegation} onChange={e => setForm({ ...form, delegation: e.target.value })} className="w-full border rounded-xl p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Département</label><input value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })} className="w-full border rounded-xl p-2" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour les pauses
function PauseModal({ pause, onSave, onClose }: any) {
  const [form, setForm] = useState({ heureDebut: pause?.heureDebut || "12:00", heureFin: pause?.heureFin || "14:00", description: pause?.description || "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.heureDebut || !form.heureFin) return;
    setIsSubmitting(true);
    await onSave({ heureDebut: form.heureDebut, heureFin: form.heureFin, description: form.description });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{pause ? "Modifier" : "Ajouter"} une pause</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">Heure début</label><input type="time" required value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value })} className="w-full border rounded-xl p-2" /></div><div><label className="block text-sm font-medium mb-1">Heure fin</label><input type="time" required value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })} className="w-full border rounded-xl p-2" /></div></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl p-2" placeholder="ex: Pause déjeuner" /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ParametresPage() {
  const { isAdmin, token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"etablissement" | "niveaux" | "classes" | "frais" | "matieres" | "pauses">("etablissement");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // États des données
  const [etablissement, setEtablissement] = useState<any>(null);
  const [niveaux, setNiveaux] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [fraisList, setFraisList] = useState<any[]>([]);
  const [matieresList, setMatieresList] = useState<any[]>([]);
  const [pauses, setPauses] = useState<any[]>([]);

  // Redirection si non admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      router.push('/');
    }
  }, [isAdmin, router, loading]);

  // Chargement des données
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = getAuthHeaders(token);
        
        console.log("Token présent:", !!token);
        
        const [etabRes, niveauxRes, classesRes, fraisRes, matieresRes, pausesRes] = await Promise.all([
          fetch('/api/etablissement', { headers }),
          fetch('/api/niveaux', { headers }),
          fetch('/api/classes', { headers }),
          fetch('/api/frais', { headers }),
          fetch('/api/matieres', { headers }),
          fetch('/api/pauses', { headers })
        ]);

        if (etabRes.ok) setEtablissement(await etabRes.json());
        if (niveauxRes.ok) setNiveaux(await niveauxRes.json());
        if (classesRes.ok) setClasses(await classesRes.json());
        if (fraisRes.ok) setFraisList(await fraisRes.json());
        if (matieresRes.ok) setMatieresList(await matieresRes.json());
        if (pausesRes.ok) setPauses(await pausesRes.json());

      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Erreur de connexion au serveur");
        setNiveaux(niveauxParDefaut);
        setMatieresList(matieresParDefaut);
        setFraisList(fraisParDefaut);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  const classesParNiveau = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    niveaux.forEach((niveau: any) => {
      grouped[niveau.id] = classes.filter((c: any) => c.niveauId === niveau.id);
    });
    return grouped;
  }, [niveaux, classes]);

  const totalAttendu = fraisList.reduce((sum: number, f: any) => sum + (f.montant || 0), 0);
  const totalCoefficients = matieresList.reduce((sum: number, m: any) => sum + (m.coefficient || 0), 0);

  // Fonctions CRUD avec token
  const saveFrais = async (data: any) => {
    try {
      const url = editing ? '/api/frais' : '/api/frais';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newData = await response.json();
        if (editing) {
          setFraisList(fraisList.map(f => f.id === editing.id ? newData : f));
        } else {
          setFraisList([...fraisList, newData]);
        }
        setShowModal(false);
        setEditing(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Erreur lors de l'enregistrement"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const deleteFrais = async (id: string) => {
    if (confirm("Supprimer ce niveau de frais ?")) {
      try {
        const response = await fetch(`/api/frais?id=${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders(token)
        });
        if (response.ok) {
          setFraisList(fraisList.filter(f => f.id !== id));
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const saveMatiere = async (data: any) => {
    try {
      const url = editing ? '/api/matieres' : '/api/matieres';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newData = await response.json();
        if (editing) {
          setMatieresList(matieresList.map(m => m.id === editing.id ? newData : m));
        } else {
          setMatieresList([...matieresList, newData]);
        }
        setShowModal(false);
        setEditing(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Erreur lors de l'enregistrement"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const deleteMatiere = async (id: string) => {
    if (confirm("Supprimer cette matière ?")) {
      try {
        const response = await fetch(`/api/matieres?id=${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders(token)
        });
        if (response.ok) {
          setMatieresList(matieresList.filter(m => m.id !== id));
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const saveNiveau = async (data: any) => {
    try {
      const url = editing ? '/api/niveaux' : '/api/niveaux';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newData = await response.json();
        if (editing) {
          setNiveaux(niveaux.map(n => n.id === editing.id ? newData : n));
        } else {
          setNiveaux([...niveaux, newData]);
        }
        setShowModal(false);
        setEditing(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Erreur lors de l'enregistrement"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const deleteNiveau = async (id: string) => {
    if (confirm("Supprimer ce niveau ? (les classes associées seront également supprimées)")) {
      try {
        const response = await fetch(`/api/niveaux?id=${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders(token)
        });
        if (response.ok) {
          setNiveaux(niveaux.filter(n => n.id !== id));
          setClasses(classes.filter(c => c.niveauId !== id));
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const saveClasse = async (data: any) => {
    try {
      const url = editing ? '/api/classes' : '/api/classes';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newData = await response.json();
        if (editing) {
          setClasses(classes.map(c => c.id === editing.id ? newData : c));
        } else {
          setClasses([...classes, newData]);
        }
        setShowModal(false);
        setEditing(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Erreur lors de l'enregistrement"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const deleteClasse = async (id: string) => {
    if (confirm("Supprimer cette classe ?")) {
      try {
        const response = await fetch(`/api/classes?id=${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders(token)
        });
        if (response.ok) {
          setClasses(classes.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const savePause = async (data: any) => {
    try {
      const url = editing ? '/api/pauses' : '/api/pauses';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newData = await response.json();
        if (editing) {
          setPauses(pauses.map(p => p.id === editing.id ? newData : p));
        } else {
          setPauses([...pauses, newData]);
        }
        setShowModal(false);
        setEditing(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Erreur lors de l'enregistrement"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const deletePause = async (id: string) => {
    if (confirm("Supprimer cette pause ?")) {
      try {
        const response = await fetch(`/api/pauses?id=${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders(token)
        });
        if (response.ok) {
          setPauses(pauses.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const saveEtablissement = async (data: any) => {
    try {
      const response = await fetch('/api/etablissement', {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newData = await response.json();
        setEtablissement(newData);
        setShowModal(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Erreur lors de l'enregistrement"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const renderModal = () => {
    if (activeTab === "frais") return <FraisModal frais={editing} onSave={saveFrais} onClose={() => setShowModal(false)} />;
    if (activeTab === "matieres") return <MatiereModal matiere={editing} onSave={saveMatiere} onClose={() => setShowModal(false)} />;
    if (activeTab === "niveaux") return <NiveauModal niveau={editing} onSave={saveNiveau} onClose={() => setShowModal(false)} />;
    if (activeTab === "classes") return <ClasseModal classe={editing} niveaux={niveaux} onSave={saveClasse} onClose={() => setShowModal(false)} />;
    if (activeTab === "etablissement") return <EtablissementModal etablissement={editing || etablissement} onSave={saveEtablissement} onClose={() => setShowModal(false)} />;
    if (activeTab === "pauses") return <PauseModal pause={editing} onSave={savePause} onClose={() => setShowModal(false)} />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-xl">Réessayer</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3"><div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600"><Settings size={28} strokeWidth={1.8} /></div>Paramètres</h1><p className="text-sm text-slate-500 mt-1 ml-14">Configuration de l'application</p></div>
        {saved && <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl"><CheckCircle size={18} /> Modifications enregistrées</div>}
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><School size={20}/></div>
              <div><h2 className="font-bold text-slate-800">Informations de l'établissement</h2><p className="text-xs text-slate-500">Personnalisez les informations qui apparaîtront sur les bulletins</p></div>
            </div>
            <button onClick={() => { setEditing(etablissement || {}); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
              <Edit size={16}/> {etablissement ? "Modifier" : "Ajouter"}
            </button>
          </div>
          {etablissement ? (
            <div className="p-6">
              <div className="flex items-start gap-6">
                {etablissement.logo && <div className="w-24 h-24 border rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center"><img src={etablissement.logo} alt="Logo" className="max-w-full max-h-full object-contain" /></div>}
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">{etablissement.nom || "Nom non défini"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600"><MapPin size={14}/> {etablissement.adresse || "Adresse non renseignée"}</div>
                    <div className="flex items-center gap-2 text-slate-600"><Phone size={14}/> {etablissement.telephone || "Téléphone non renseigné"}</div>
                    <div className="flex items-center gap-2 text-slate-600"><Mail size={14}/> {etablissement.email || "Email non renseigné"}</div>
                    <div className="flex items-center gap-2 text-slate-600"><Calendar size={14}/> Année scolaire: {etablissement.anneeScolaire || "Non renseignée"}</div>
                    {etablissement.region && <div className="flex items-center gap-2 text-slate-600"><Globe size={14}/> Région: {etablissement.region}</div>}
                    {etablissement.delegation && <div className="flex items-center gap-2 text-slate-600"><Building size={14}/> Délégation: {etablissement.delegation}</div>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune information d'établissement</h3>
              <p className="text-slate-500 mb-4">Cliquez sur le bouton "Ajouter" pour configurer votre établissement</p>
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 mx-auto"><Plus size={16}/> Configurer l'établissement</button>
            </div>
          )}
        </div>
      )}

      {/* SECTION NIVEAUX */}
      {activeTab === "niveaux" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
            <div><h2 className="font-bold text-slate-800">Niveaux d'enseignement</h2><p className="text-xs text-slate-500">6ème, 5ème, 4ème, etc.</p></div>
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Ajouter un niveau</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup><col className="w-32" /><col className="w-20" /><col className="w-48" /><col className="w-24" /></colgroup>
              <thead className="bg-slate-50"><tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider"><th className="p-4 text-left">Niveau</th><th className="p-4 text-center">Ordre</th><th className="p-4 text-left">Description</th><th className="p-4 text-center">Actions</th></tr></thead>
              <tbody className="divide-y">
                {niveaux.sort((a: any, b: any) => a.ordre - b.ordre).map((n: any) => (
                  <tr key={n.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium">{n.nom}</td>
                    <td className="p-4 text-center">{n.ordre}</td>
                    <td className="p-4 text-slate-500">{n.description || "—"}</td>
                    <td className="p-4 text-center"><div className="flex justify-center gap-2"><button onClick={() => { setEditing(n); setShowModal(true); }} className="p-1 text-slate-400 hover:text-blue-500"><Edit size={16} /></button><button onClick={() => deleteNiveau(n.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
{/* SECTION CLASSES */}
{activeTab === "classes" && (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    {/* Header de la section */}
    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="font-bold text-xl text-slate-800">Gestion des Classes</h2>
        <p className="text-sm text-slate-500 mt-1">Configurez les divisions (6A, 5B, etc.) par niveau scolaire.</p>
      </div>
      <button 
        onClick={() => { setEditing(null); setShowModal(true); }} 
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
      >
        <Plus size={18} /> Ajouter une classe
      </button>
    </div>

    {/* Table des classes */}
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
          {niveaux.map((niveau) => (
            classesParNiveau[niveau.id]?.map((classe) => (
              <tr key={classe.id} className="group hover:bg-emerald-50/30 transition-colors">
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
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditing(classe); setShowModal(true); }} 
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => deleteClasse(classe.id)} 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ))}

          {/* État vide corrigé */}
          {(!classesParNiveau || Object.keys(classesParNiveau).length === 0) && (
            <tr>
              <td colSpan={4} className="p-12 text-center text-slate-400 italic bg-slate-50/20">
                Aucune classe enregistrée pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

      {/* SECTION FRAIS */}
      {activeTab === "frais" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><h2 className="font-bold text-xl text-slate-800">Frais de Scolarité</h2><p className="text-sm text-slate-500 mt-1">Définissez les montants annuels par niveau d'étude.</p></div>
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"><Plus size={18} /> Ajouter un niveau</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4 w-1/4">Niveau</th><th className="px-6 py-4 w-1/4">Montant</th><th className="px-6 py-4 w-1/3">Description</th><th className="px-6 py-4 text-right w-1/6">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {fraisList.map((f: any) => (
                  <tr key={f.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4"><span className="font-bold text-slate-700">{f.niveau || "—"}</span></td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">{f.montant?.toLocaleString()} FCFA</span></td>
                    <td className="px-6 py-4 text-slate-500 text-sm italic">{f.description || "Aucune description"}</td>
                    <td className="px-6 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => { setEditing(f); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button><button onClick={() => deleteFrais(f.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200"><tr><td className="px-6 py-5 font-bold text-slate-800">Total cumulé</td><td className="px-6 py-5"><span className="text-lg font-black text-blue-600">{totalAttendu.toLocaleString()} FCFA</span></td><td colSpan={2} className="px-6 py-5 text-slate-400 text-xs italic text-right">Estimation basée sur les tarifs par niveau</td></tr></tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION MATIÈRES */}
      {activeTab === "matieres" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><h2 className="font-bold text-xl text-slate-800">Matières & Coefficients</h2><p className="text-sm text-slate-500 mt-1">Gérez le programme scolaire et le poids de chaque discipline.</p></div>
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"><Plus size={18} /> Ajouter une matière</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4 w-1/3">Discipline</th><th className="px-6 py-4 text-center w-1/6">Coef.</th><th className="px-6 py-4 w-1/3">Description</th><th className="px-6 py-4 text-right w-1/6">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {matieresList.map((m: any) => {
                  const initiales = m.nom ? m.nom.substring(0, 2).toUpperCase() : "??";
                  return (
                    <tr key={m.id} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{initiales}</div><span className="font-bold text-slate-700">{m.nom || "—"}</span></div></td>
                      <td className="px-6 py-4 text-center"><span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-black border border-blue-100 shadow-sm">{m.coefficient || "0"}</span></td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{m.description || "—"}</td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => { setEditing(m); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button><button onClick={() => deleteMatiere(m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200"><tr><td className="px-6 py-5 font-bold text-slate-800">Total des pondérations</td><td className="px-6 py-5 text-center"><span className="text-xl font-black text-emerald-600">{totalCoefficients}</span></td><td colSpan={2} className="px-6 py-5 text-slate-400 text-xs italic text-right">Utilisé pour le calcul des moyennes générales</td></tr></tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION PAUSES */}
      {activeTab === "pauses" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4"><div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600"><Coffee size={24} /></div><div><h2 className="font-bold text-xl text-slate-800">Heures de Pause</h2><p className="text-sm text-slate-500 mt-1">Configurez les temps de récréation et de déjeuner.</p></div></div>
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"><Plus size={18} /> Ajouter une pause</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4">Plage Horaire</th><th className="px-6 py-4">Durée</th><th className="px-6 py-4">Description</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {pauses.map((p: any) => (
                  <tr key={p.id} className="group hover:bg-amber-50/20 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{p.heureDebut}</span><span className="text-slate-400">→</span><span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{p.heureFin}</span></div></td>
                    <td className="px-6 py-4"><div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100"><Clock size={14} /> Pause prévue</div></td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.description || <span className="text-slate-300 italic">Sans titre</span>}</td>
                    <td className="px-6 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => { setEditing(p); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button><button onClick={() => deletePause(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}
                {pauses.length === 0 && (<tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">Aucune pause configurée.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && renderModal()}
    </div>
  );
}