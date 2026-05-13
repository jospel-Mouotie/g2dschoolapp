// app/planning/page.tsx - Version finale corrigée
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, 
  ChevronLeft, ChevronRight, Download, Printer, Search,
  X, BookOpen, UserCheck, Home, Eye, Coffee, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PlanningCours {
  id: string;
  matiere: string;
  professeur: string;
  salle: string;
  classe: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
}

interface Cours {
  id: string;
  matiere: string;
  professeur: string;
  salle: string;
  classe: string;
  jour: string;
  heure: string;
  duree: number;
  status: string;
  coefficient: number;
  students: number;
  progress: number;
  enseignantId?: number;
}

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function calculerDuree(debut: string, fin: string): number {
  const [h1, m1] = debut.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  return (h2 - h1) + (m2 - m1) / 60;
}

function formaterHeure(heure: string): string {
  if (!heure) return "";
  const [h, m] = heure.split(":");
  return `${parseInt(h)}h${m !== "00" ? m : ""}`;
}

function parseJsonField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

// CoursModal
function CoursModal({ cours, onSave, onClose, viewType, selectedClasse, selectedTeacher, salles, enseignants, matieres, classes, token }: any) {
  const [form, setForm] = useState({
    matiere: cours?.matiere || "",
    professeur: cours?.professeur || (viewType === "teacher" ? selectedTeacher : ""),
    professeurId: cours?.enseignantId || "",
    salle: cours?.salle || "",
    classe: cours?.classe || (viewType === "classe" ? selectedClasse : ""),
    jour: cours?.jour || "Lundi",
    heureDebut: cours?.heureDebut || "08:00",
    heureFin: cours?.heureFin || "10:00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enseignantsFiltres, setEnseignantsFiltres] = useState<any[]>([]);

  useEffect(() => {
    if (!form.matiere || !form.classe) {
      setEnseignantsFiltres([]);
      return;
    }

    const filtered = enseignants.filter((ens: any) => {
      const matieresList = parseJsonField(ens.matieres);
      const classesList = parseJsonField(ens.classes);
      return matieresList.includes(form.matiere) && classesList.includes(form.classe);
    });
    
    setEnseignantsFiltres(filtered);
    
    if (filtered.length === 1 && !form.professeur) {
      setForm(prev => ({ ...prev, professeur: filtered[0].name, professeurId: filtered[0].id }));
    }
  }, [form.matiere, form.classe, enseignants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const duree = calculerDuree(form.heureDebut, form.heureFin);
    const enseignant = enseignants.find((e: any) => e.name === form.professeur);
    
    const coursData = {
      matiere: form.matiere,
      professeur: form.professeur,
      enseignantId: enseignant?.id || null,
      salle: form.salle,
      classe: form.classe,
      jour: form.jour,
      heure: `${form.heureDebut}-${form.heureFin}`,
      duree: duree,
      coefficient: 1,
      status: "En cours"
    };
    
    await onSave({ ...coursData, id: cours?.id || "" });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">{cours ? "Modifier" : "Ajouter"} un cours</h3>
          <button onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Classe</label>
            {viewType === "classe" ? (
              <div className="w-full border rounded-lg p-1.5 text-sm bg-slate-100 text-slate-700">
                {form.classe}
              </div>
            ) : (
              <select 
                required 
                value={form.classe} 
                onChange={e => setForm({...form, classe: e.target.value, professeur: ""})} 
                className="w-full border rounded-lg p-1.5 text-sm"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((c: any) => <option key={c.id} value={c.nom}>{c.nom}</option>)}
              </select>
            )}
          </div>
          
          <div>
            <label className="text-xs font-medium">Matière</label>
            <select 
              required 
              value={form.matiere} 
              onChange={e => setForm({...form, matiere: e.target.value, professeur: ""})} 
              className="w-full border rounded-lg p-1.5 text-sm"
            >
              <option value="">Sélectionner une matière</option>
              {matieres.map((m: any) => <option key={m.id} value={m.nom}>{m.nom}</option>)}
            </select>
          </div>
          
          <div>
            <label className="text-xs font-medium">Professeur</label>
            {enseignantsFiltres.length === 1 ? (
              <div className="w-full border rounded-lg p-1.5 text-sm bg-green-50 text-green-700">
                {enseignantsFiltres[0].name}
              </div>
            ) : enseignantsFiltres.length > 1 ? (
              <select 
                required 
                value={form.professeur} 
                onChange={e => setForm({...form, professeur: e.target.value})} 
                className="w-full border rounded-lg p-1.5 text-sm"
              >
                <option value="">Choisir un professeur</option>
                {enseignantsFiltres.map((e: any) => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            ) : form.matiere && form.classe ? (
              <div className="w-full border rounded-lg p-1.5 text-sm bg-red-50 text-red-500">
                Aucun enseignant ne donne cette matière dans cette classe
              </div>
            ) : (
              <div className="w-full border rounded-lg p-1.5 text-sm bg-slate-100 text-slate-500">
                Sélectionnez d'abord une matière et une classe
              </div>
            )}
          </div>
          
         
          
          <div>
            <label className="text-xs font-medium">Jour</label>
            <select value={form.jour} onChange={e => setForm({...form, jour: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm">
              {jours.map(j => <option key={j}>{j}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">Début</label>
              <input type="time" required value={form.heureDebut} onChange={e => setForm({...form, heureDebut: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Fin</label>
              <input type="time" required value={form.heureFin} onChange={e => setForm({...form, heureFin: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm" />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || (form.matiere && form.classe && enseignantsFiltres.length === 0)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold ${
                (form.matiere && form.classe && enseignantsFiltres.length === 0) 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border py-1.5 rounded-lg text-sm hover:bg-slate-50">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ cours, onClose }: { cours: PlanningCours; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">Détails du cours</h3>
          <button onClick={onClose}><X size={18}/></button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="font-medium">Matière :</span><span>{cours.matiere}</span></div>
          <div className="flex justify-between"><span className="font-medium">Professeur :</span><span>{cours.professeur}</span></div>
          <div className="flex justify-between"><span className="font-medium">Salle :</span><span>{cours.salle}</span></div>
          <div className="flex justify-between"><span className="font-medium">Classe :</span><span>{cours.classe}</span></div>
          <div className="flex justify-between"><span className="font-medium">Jour :</span><span>{cours.jour}</span></div>
          <div className="flex justify-between"><span className="font-medium">Horaire :</span><span>{formaterHeure(cours.heureDebut)} - {formaterHeure(cours.heureFin)}</span></div>
          <div className="flex justify-between"><span className="font-medium">Durée :</span><span>{cours.duree}h</span></div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function PlanningPage() {
  const { user, isAdmin, isTeacher, token } = useAuth();
  const router = useRouter();
  
  const [cours, setCours] = useState<Cours[]>([]);
  const [salles, setSalles] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [matieres, setMatieres] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [pauses, setPauses] = useState<any[]>([]);
  const [etablissement, setEtablissement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [viewType, setViewType] = useState<"classe" | "teacher">("classe");
  const [selectedClasse, setSelectedClasse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCours, setSelectedCours] = useState<PlanningCours | null>(null);
  const [editingCours, setEditingCours] = useState<PlanningCours | null>(null);
  const [search, setSearch] = useState("");
  const [userClasses, setUserClasses] = useState<string[]>([]);
  const [userEnseignant, setUserEnseignant] = useState<any>(null);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Charger toutes les données
  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        
        // Récupérer l'enseignant connecté d'abord
        if (isTeacher && user?.enseignantId) {
          const enseignantRes = await fetch(`/api/enseignants/${user.enseignantId}`, { headers });
          if (enseignantRes.ok) {
            const enseignantData = await enseignantRes.json();
            setUserEnseignant(enseignantData);
            const classesList = parseJsonField(enseignantData.classes);
            setUserClasses(classesList);
          }
        }
        
        // Récupérer tous les cours
        const coursRes = await fetch('/api/cours', { headers });
        const coursData = coursRes.ok ? await coursRes.json() : [];
        setCours(coursData);
        
        // Récupérer les autres données
        const [sallesRes, enseignantsRes, matieresRes, classesRes, pausesRes, etabRes] = await Promise.all([
          fetch('/api/salles', { headers }).catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/enseignants', { headers }),
          fetch('/api/matieres', { headers }),
          fetch('/api/classes', { headers }),
          fetch('/api/pauses', { headers }).catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/etablissement', { headers }).catch(() => ({ ok: false, json: () => null }))
        ]);
        
        setSalles(sallesRes.ok ? await sallesRes.json() : []);
        setEnseignants(enseignantsRes.ok ? await enseignantsRes.json() : []);
        setMatieres(matieresRes.ok ? await matieresRes.json() : []);
        setClasses(classesRes.ok ? await classesRes.json() : []);
        setPauses(pausesRes.ok ? await pausesRes.json() : []);
        setEtablissement(etabRes.ok ? await etabRes.json() : null);
        
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [token, getAuthHeaders, isTeacher, user]);

  // Convertir les cours en format planning
  const planningCours = useMemo(() => {
    if (!cours || cours.length === 0) return [];
    
    return cours
      .filter(c => c && c.heure)
      .map(c => {
        const [heureDebut, heureFin] = c.heure.split("-");
        if (!heureDebut || !heureFin) return null;
        return {
          id: c.id,
          matiere: c.matiere || "Sans matière",
          professeur: c.professeur || "Non attribué",
          salle: c.salle || "Non définie",
          classe: c.classe || "Non définie",
          jour: c.jour || "Lundi",
          heureDebut: heureDebut,
          heureFin: heureFin,
          duree: c.duree || calculerDuree(heureDebut, heureFin),
        };
      })
      .filter((c): c is PlanningCours => c !== null);
  }, [cours]);

  // Classes disponibles pour l'affichage
  const classesDisponibles = useMemo(() => {
    if (isAdmin) {
      return classes.map(c => c.nom).sort();
    }
    if (isTeacher) {
      return userClasses.sort();
    }
    return [];
  }, [isAdmin, isTeacher, classes, userClasses]);

  // Enseignants list
  const enseignantsList = useMemo(() => enseignants.map(e => e.name).sort(), [enseignants]);

  // Initialiser selectedClasse
  useEffect(() => {
    if (classesDisponibles.length > 0 && !selectedClasse) {
      setSelectedClasse(classesDisponibles[0]);
    }
    if (enseignantsList.length > 0 && !selectedTeacher) {
      setSelectedTeacher(enseignantsList[0]);
    }
  }, [classesDisponibles, enseignantsList, selectedClasse, selectedTeacher]);

  // Toutes les heures pour l'affichage
  const toutesHeures = useMemo(() => {
    const heures = new Set<string>();
    planningCours.forEach(c => { 
      if (c.heureDebut) heures.add(c.heureDebut); 
      if (c.heureFin) heures.add(c.heureFin); 
    });
    pauses.forEach(p => { 
      if (p.heureDebut) heures.add(p.heureDebut); 
      if (p.heureFin) heures.add(p.heureFin); 
    });
    if (heures.size === 0) {
      ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].forEach(h => heures.add(h));
    }
    return Array.from(heures).sort((a, b) => {
      const [h1, m1] = a.split(":").map(Number);
      const [h2, m2] = b.split(":").map(Number);
      return (h1 * 60 + (m1 || 0)) - (h2 * 60 + (m2 || 0));
    });
  }, [planningCours, pauses]);

  // Filtrer les cours selon la vue et les droits
  const filteredCours = useMemo(() => {
    let filtered = planningCours;
    
    // Pour l'enseignant : ne montrer que les cours des classes qui lui sont assignées
    if (isTeacher && userClasses.length > 0) {
      filtered = filtered.filter(c => {
        const classeCours = (c.classe || "").trim().toLowerCase();
        return userClasses.some(classe => 
          classe.toLowerCase().trim() === classeCours
        );
      });
    }
    
    // Filtrer par classe sélectionnée
    if (viewType === "classe" && selectedClasse && selectedClasse !== "Toutes") {
      filtered = filtered.filter(c => {
        const classeCours = (c.classe || "").trim().toLowerCase();
        const classeSelected = selectedClasse.toLowerCase().trim();
        return classeCours === classeSelected;
      });
    }
    
    // Filtrer par enseignant
    if (viewType === "teacher" && selectedTeacher) {
      filtered = filtered.filter(c => c.professeur === selectedTeacher);
    }
    
    // Filtrer par recherche
    if (search) {
      filtered = filtered.filter(c => 
        c.matiere.toLowerCase().includes(search.toLowerCase()) || 
        c.professeur.toLowerCase().includes(search.toLowerCase()) ||
        c.classe.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered;
  }, [planningCours, viewType, selectedClasse, selectedTeacher, search, isTeacher, userClasses]);

  const getCoursForHour = (jour: string, heure: string) => {
    return filteredCours.filter(c => {
      if (c.jour !== jour) return false;
      
      const [hHeure, mHeure] = heure.split(":").map(Number);
      const heureMinutes = (hHeure || 0) * 60 + (mHeure || 0);
      
      const [hDebut, mDebut] = c.heureDebut.split(":").map(Number);
      const debutMinutes = (hDebut || 0) * 60 + (mDebut || 0);
      
      const [hFin, mFin] = c.heureFin.split(":").map(Number);
      const finMinutes = (hFin || 0) * 60 + (mFin || 0);
      
      return heureMinutes >= debutMinutes && heureMinutes < finMinutes;
    });
  };

  const isHeureDansPause = (heure: string): boolean => {
    for (const pause of pauses) {
      if (heure >= pause.heureDebut && heure < pause.heureFin) return true;
    }
    return false;
  };

  const getPauseAtHour = (heure: string) => {
    return pauses.find(p => heure >= p.heureDebut && heure < p.heureFin);
  };

  const saveCours = async (coursData: any) => {
    try {
      const headers = getAuthHeaders();
      let response;
      
      if (editingCours) {
        response = await fetch('/api/cours', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ id: editingCours.id, ...coursData })
        });
      } else {
        response = await fetch('/api/cours', {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...coursData, id: Date.now().toString() })
        });
      }
      
      if (response.ok) {
        const updatedCours = await response.json();
        if (editingCours) {
          setCours(cours.map(c => c.id === editingCours.id ? updatedCours : c));
        } else {
          setCours([...cours, updatedCours]);
        }
        setShowModal(false);
        setEditingCours(null);
        alert(editingCours ? "Cours modifié avec succès" : "Cours ajouté avec succès");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Impossible d'enregistrer le cours"}`);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur de connexion au serveur");
    }
  };

  const deleteCours = async (id: string) => {
    if (!isAdmin) {
      alert("Vous n'avez pas les droits pour supprimer des cours");
      return;
    }
    if (confirm("Supprimer ce cours définitivement ?")) {
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/cours?id=${id}`, { method: 'DELETE', headers });
        if (response.ok) {
          setCours(cours.filter(c => c.id !== id));
          alert("Cours supprimé avec succès");
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur de connexion au serveur");
      }
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("planning-table")?.cloneNode(true) as HTMLElement;
    if (!printContent) return;
    
    const actionButtons = printContent.querySelectorAll(".print-hide");
    actionButtons.forEach(btn => btn.remove());
    
    const title = viewType === "classe" ? selectedClasse : selectedTeacher;
    const date = new Date().toLocaleDateString('fr-FR');
    const logoHtml = etablissement?.logo ? 
      `<img src="${etablissement.logo}" style="height: 40px;" />` : 
      `<div style="width:40px;height:40px;background:#1e3a8a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">G</div>`;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <title>Emploi du temps - ${title}</title>
        <meta charset="UTF-8">
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Times New Roman',serif;padding:15px;font-size:10px}
          .header{display:flex;justify-content:space-between;margin-bottom:15px;padding-bottom:8px;border-bottom:1px solid #000}
          .logo-area{display:flex;align-items:center;gap:8px}
          .school-info h1{font-size:14px;margin:0}
          .school-info p{font-size:8px;margin:2px 0}
          .title-section{text-align:right}
          .title-section h2{font-size:12px}
          table{width:100%;border-collapse:collapse;font-size:8px}
          th,td{border:1px solid #999;padding:4px;text-align:left;vertical-align:top}
          th{background:#f1f5f9;font-weight:bold}
          .cours-card{background:#eff6ff;border-radius:4px;padding:3px}
          .cours-title{font-weight:bold;font-size:8px}
          .cours-detail{font-size:7px;color:#475569}
          .pause-card{background:#fef3c7;border-radius:4px;padding:3px;text-align:center}
          .pause-title{font-weight:bold;color:#b45309;font-size:8px}
          .empty-cell{text-align:center;color:#94a3b8}
          .footer{margin-top:15px;text-align:center;font-size:7px;border-top:1px solid #ccc;padding-top:8px}
          @media print{body{padding:0;margin:0}}
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            ${logoHtml}
            <div class="school-info">
              <h1>${etablissement?.nom || "GROUPE SCOLAIRE DIGITAL"}</h1>
              <p>${etablissement?.adresse || ""} | Tél: ${etablissement?.telephone || ""}</p>
              <p>Année: ${etablissement?.anneeScolaire || "2024/2025"}</p>
            </div>
          </div>
          <div class="title-section">
            <h2>EMPLOI DU TEMPS - ${title}</h2>
            <p>Établi le ${date}</p>
          </div>
        </div>
        ${printContent.outerHTML}
        <div class="footer">
          ${etablissement?.nom || "GROUPE SCOLAIRE DIGITAL"} - Tous droits réservés
        </div>
      </body>
    </html>`);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleExport = () => {
    const headers = ["Jour", "Début", "Fin", "Matière", "Professeur", "Salle", "Classe"];
    const rows = filteredCours.map(c => [c.jour, c.heureDebut, c.heureFin, c.matiere, c.professeur, c.salle, c.classe]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emploi_${viewType === "classe" ? selectedClasse : selectedTeacher}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Enseignant sans classes assignées
  if (isTeacher && userClasses.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aucune classe assignée</h2>
          <p className="text-slate-500">Vous n'êtes assigné à aucune classe. Contactez l'administrateur.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Emploi du temps
          </h1>
          <p className="text-[10px] text-slate-500">
            {isTeacher ? "Mes classes : " + userClasses.join(", ") : "Planning hebdomadaire"}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={handleExport} className="p-1.5 bg-white border rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Exporter CSV">
            <Download size={14}/>
          </button>
          <button onClick={handlePrint} className="p-1.5 bg-white border rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Imprimer">
            <Printer size={14}/>
          </button>
          {isAdmin && (
            <button onClick={() => { setEditingCours(null); setShowModal(true); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-blue-700 transition">
              <Plus size={12}/> Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-2 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1">
            <button 
              onClick={() => setViewType("classe")} 
              className={`px-2 py-1 rounded-lg text-xs font-medium transition ${viewType === "classe" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
            >
              Par classe
            </button>
            <button 
              onClick={() => setViewType("teacher")} 
              className={`px-2 py-1 rounded-lg text-xs font-medium transition ${viewType === "teacher" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
            >
              Par enseignant
            </button>
          </div>
          <div className="flex gap-2 items-center">
            {viewType === "classe" ? (
              <select 
                value={selectedClasse} 
                onChange={e => setSelectedClasse(e.target.value)} 
                className="p-1 border rounded-lg text-xs bg-white"
              >
                {classesDisponibles.map(c => <option key={c}>{c}</option>)}
              </select>
            ) : (
              <select 
                value={selectedTeacher} 
                onChange={e => setSelectedTeacher(e.target.value)} 
                className="p-1 border rounded-lg text-xs bg-white"
              >
                {enseignantsList.map(p => <option key={p}>{p}</option>)}
              </select>
            )}
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-7 pr-2 py-1 border rounded-lg text-xs w-32" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau planning */}
      <div id="planning-table" className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-1.5 text-left font-bold w-16">Horaire</th>
              {jours.map(jour => <th key={jour} className="p-1.5 text-left font-bold">{jour.slice(0,3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {toutesHeures.map(heure => {
              const estPause = isHeureDansPause(heure);
              const pause = getPauseAtHour(heure);
              return (
                <tr key={heure} className={`border-t ${estPause ? "bg-amber-50/30" : ""}`}>
                  <td className={`p-1.5 font-medium ${estPause ? "bg-amber-100/50" : "bg-slate-50/30"}`}>
                    {formaterHeure(heure)}
                  </td>
                  {jours.map(jour => {
                    const coursItems = getCoursForHour(jour, heure);
                    return (
                      <td key={jour} className="p-1 border-l align-top">
                        {estPause && pause ? (
                          <div className="bg-amber-100 rounded p-1 text-center">
                            <Coffee size={10} className="mx-auto text-amber-600" />
                            <p className="text-[8px] font-medium">{pause.description}</p>
                          </div>
                        ) : coursItems.length > 0 ? (
                          coursItems.map(c => (
                            <div 
                              key={c.id} 
                              className="bg-blue-50 rounded p-1 mb-1 cursor-pointer hover:bg-blue-100 transition"
                              onClick={() => { setSelectedCours(c); setShowDetailModal(true); }}
                            >
                              <p className="font-bold text-[9px] truncate">{c.matiere}</p>
                              <p className="text-[7px] text-slate-500">{c.professeur}</p>
                              <p className="text-[7px] text-slate-400">{c.salle}</p>
                              <p className="text-[7px] text-slate-400">{formaterHeure(c.heureDebut)}-{formaterHeure(c.heureFin)}</p>
                              {isAdmin && (
                                <div className="flex gap-1 mt-1 print-hide" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    onClick={() => { setEditingCours(c); setShowModal(true); }} 
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <Edit size={8}/>
                                  </button>
                                  <button 
                                    onClick={() => deleteCours(c.id)} 
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 size={8}/>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="h-10 text-slate-300 text-center text-[8px]">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showModal && (
        <CoursModal 
          cours={editingCours} 
          onSave={saveCours} 
          onClose={() => { setShowModal(false); setEditingCours(null); }} 
          viewType={viewType} 
          selectedClasse={selectedClasse} 
          selectedTeacher={selectedTeacher} 
          salles={salles} 
          enseignants={enseignants} 
          matieres={matieres} 
          classes={classes}
          token={token}
        />
      )}
      {showDetailModal && selectedCours && (
        <DetailModal cours={selectedCours} onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
}