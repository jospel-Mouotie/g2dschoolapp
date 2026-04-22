// app/planning/page.tsx - Version corrigée avec vérifications

"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, 
  ChevronLeft, ChevronRight, Download, Printer, Search,
  X, BookOpen, UserCheck, Home, Eye, Coffee
} from "lucide-react";
import { useCoursStore, useSallesStore, useEnseignantsStore, useEtablissementStore, useMatieresStore, useClassesStore, usePausesStore, Cours as StoreCours } from "@/lib/stores";

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

function isHeureDansPause(heure: string, pauses: any[]): boolean {
  if (!pauses.length) return false;
  for (const pause of pauses) {
    if (heure >= pause.heureDebut && heure < pause.heureFin) return true;
  }
  return false;
}

// Données par défaut converties au format du store
const defaultCoursStore: StoreCours[] = [
  { id: "1", matiere: "Maths", professeur: "M. Kanga", salle: "12", classe: "6A", jour: "Lundi", heure: "08:00-10:00", duree: 2, progress: 0, status: "En cours", students: 32, coefficient: 4, hoursPerWeek: 4, image: "", modules: [] },
  { id: "2", matiere: "Français", professeur: "Mme Ngo", salle: "8", classe: "6A", jour: "Lundi", heure: "10:00-12:00", duree: 2, progress: 0, status: "En cours", students: 32, coefficient: 3, hoursPerWeek: 3, image: "", modules: [] },
  { id: "3", matiere: "Anglais", professeur: "Mr Smith", salle: "Labo2", classe: "6A", jour: "Mardi", heure: "08:00-09:30", duree: 1.5, progress: 0, status: "En cours", students: 32, coefficient: 2, hoursPerWeek: 2, image: "", modules: [] },
  { id: "4", matiere: "Histoire", professeur: "M. Fofana", salle: "5", classe: "6A", jour: "Mercredi", heure: "10:00-12:00", duree: 2, progress: 0, status: "En cours", students: 32, coefficient: 3, hoursPerWeek: 3, image: "", modules: [] },
  { id: "5", matiere: "Physique", professeur: "Mme Djou", salle: "Labo1", classe: "6A", jour: "Jeudi", heure: "08:00-11:00", duree: 3, progress: 0, status: "En cours", students: 32, coefficient: 5, hoursPerWeek: 5, image: "", modules: [] },
  { id: "6", matiere: "Info", professeur: "M. Kamga", salle: "Info", classe: "6A", jour: "Vendredi", heure: "14:00-16:00", duree: 2, progress: 0, status: "En cours", students: 32, coefficient: 2, hoursPerWeek: 2, image: "", modules: [] },
  { id: "7", matiere: "Sport", professeur: "M. Eto'o", salle: "Terrain", classe: "6A", jour: "Samedi", heure: "08:00-10:00", duree: 2, progress: 0, status: "En cours", students: 32, coefficient: 2, hoursPerWeek: 2, image: "", modules: [] },
];

// Fonction pour convertir un cours du store en format planning avec vérification
function storeToPlanningCours(storeCours: StoreCours): PlanningCours | null {
  if (!storeCours || !storeCours.heure) {
    console.warn("Cours invalide ou sans heure:", storeCours);
    return null;
  }
  
  const [heureDebut, heureFin] = storeCours.heure.split("-");
  if (!heureDebut || !heureFin) {
    console.warn("Format d'heure invalide:", storeCours.heure);
    return null;
  }
  
  return {
    id: storeCours.id,
    matiere: storeCours.matiere || "Sans matière",
    professeur: storeCours.professeur || "Non attribué",
    salle: storeCours.salle || "Non définie",
    classe: storeCours.classe || "Non définie",
    jour: storeCours.jour || "Lundi",
    heureDebut: heureDebut,
    heureFin: heureFin,
    duree: storeCours.duree || calculerDuree(heureDebut, heureFin),
  };
}

// Fonction pour convertir un planning cours en format store
function planningToStoreCours(planningCours: PlanningCours): StoreCours {
  return {
    id: planningCours.id,
    matiere: planningCours.matiere,
    professeur: planningCours.professeur,
    salle: planningCours.salle,
    classe: planningCours.classe,
    jour: planningCours.jour,
    heure: `${planningCours.heureDebut}-${planningCours.heureFin}`,
    duree: planningCours.duree,
    progress: 0,
    status: "En cours",
    students: 0,
    coefficient: 1,
    hoursPerWeek: planningCours.duree,
    image: "",
    modules: [],
  };
}

const currentUser = { role: "admin", name: "M. Kanga", classe: "6A" };

function CoursModal({ cours, onSave, onClose, viewType, selectedClasse, selectedTeacher, salles, enseignants, matieres, classes }: any) {
  const [form, setForm] = useState({
    matiere: cours?.matiere || "",
    professeur: cours?.professeur || (viewType === "teacher" ? selectedTeacher : ""),
    salle: cours?.salle || "",
    classe: cours?.classe || (viewType === "classe" ? selectedClasse : ""),
    jour: cours?.jour || "Lundi",
    heureDebut: cours?.heureDebut || "08:00",
    heureFin: cours?.heureFin || "10:00",
  });

  const enseignantsFiltres = useMemo(() => {
    if (!form.matiere) return enseignants;
    return enseignants.filter((e: any) => e.matieres?.includes(form.matiere) || e.enseignements?.some((ens: any) => ens.matiere === form.matiere));
  }, [enseignants, form.matiere]);

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    const duree = calculerDuree(form.heureDebut, form.heureFin); 
    onSave({ ...form, id: cours?.id || "", duree }); 
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-bold">{cours ? "Modifier" : "Ajouter"} un cours</h3><button onClick={onClose}><X size={18}/></button></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="text-xs font-medium">Matière</label><select required value={form.matiere} onChange={e => setForm({...form, matiere: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm">{matieres.map((m: any) => <option key={m.id} value={m.nom}>{m.nom}</option>)}</select></div>
          <div><label className="text-xs font-medium">Professeur</label><select required value={form.professeur} onChange={e => setForm({...form, professeur: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm"><option value="">Choisir</option>{enseignantsFiltres.map((e: any) => <option key={e.id} value={e.name}>{e.name}</option>)}</select></div>
          <div><label className="text-xs font-medium">Salle</label><select required value={form.salle} onChange={e => setForm({...form, salle: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm"><option value="">Choisir</option>{salles.map((s: any) => <option key={s.id} value={s.nom}>{s.nom}</option>)}</select></div>
          <div><label className="text-xs font-medium">Classe</label><select required value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm"><option value="">Choisir</option>{classes.map((c: any) => <option key={c.id} value={c.nom}>{c.nom}</option>)}</select></div>
          <div><label className="text-xs font-medium">Jour</label><select value={form.jour} onChange={e => setForm({...form, jour: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm">{jours.map(j => <option key={j}>{j}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-medium">Début</label><input type="time" required value={form.heureDebut} onChange={e => setForm({...form, heureDebut: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm" /></div>
            <div><label className="text-xs font-medium">Fin</label><input type="time" required value={form.heureFin} onChange={e => setForm({...form, heureFin: e.target.value})} className="w-full border rounded-lg p-1.5 text-sm" /></div>
          </div>
          <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-semibold">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-1.5 rounded-lg text-sm">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ cours, onClose }: { cours: PlanningCours; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-bold">Détails</h3><button onClick={onClose}><X size={18}/></button></div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="font-medium">Matière :</span><span>{cours.matiere}</span></div>
          <div className="flex justify-between"><span className="font-medium">Professeur :</span><span>{cours.professeur}</span></div>
          <div className="flex justify-between"><span className="font-medium">Salle :</span><span>{cours.salle}</span></div>
          <div className="flex justify-between"><span className="font-medium">Classe :</span><span>{cours.classe}</span></div>
          <div className="flex justify-between"><span className="font-medium">Jour :</span><span>{cours.jour}</span></div>
          <div className="flex justify-between"><span className="font-medium">Horaire :</span><span>{formaterHeure(cours.heureDebut)} - {formaterHeure(cours.heureFin)}</span></div>
          <div className="flex justify-between"><span className="font-medium">Durée :</span><span>{cours.duree}h</span></div>
        </div>
        <div className="mt-4 flex justify-end"><button onClick={onClose} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Fermer</button></div>
      </div>
    </div>
  );
}

export default function PlanningPage() {
  const [storeCours, setStoreCours] = useCoursStore();
  const [salles] = useSallesStore();
  const [enseignants] = useEnseignantsStore();
  const [matieres] = useMatieresStore();
  const [classes] = useClassesStore();
  const [pauses] = usePausesStore();
  const [etablissement] = useEtablissementStore();
  const [viewType, setViewType] = useState<"classe" | "teacher">("classe");
  const [selectedClasse, setSelectedClasse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCours, setSelectedCours] = useState<PlanningCours | null>(null);
  const [editingCours, setEditingCours] = useState<PlanningCours | null>(null);
  const [search, setSearch] = useState("");

  // Convertir les cours du store en format planning (filtrer les null)
  const planningCours = useMemo(() => {
    if (!storeCours || storeCours.length === 0) return [];
    return storeCours
      .map(storeToPlanningCours)
      .filter((c): c is PlanningCours => c !== null);
  }, [storeCours]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClasse) setSelectedClasse(classes[0]?.nom || "");
    if (enseignants.length > 0 && !selectedTeacher) setSelectedTeacher(enseignants[0]?.name || "");
  }, [classes, enseignants]);

  useEffect(() => {
    if (storeCours.length === 0 && defaultCoursStore.length > 0) setStoreCours(defaultCoursStore);
  }, [storeCours, setStoreCours]);

  const classesDispo = useMemo(() => classes.map(c => c.nom).sort(), [classes]);
  const enseignantsList = useMemo(() => enseignants.map(e => e.name).sort(), [enseignants]);

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
    return Array.from(heures).sort();
  }, [planningCours, pauses]);

  const filteredCours = useMemo(() => {
    let filtered = planningCours;
    if (viewType === "classe" && selectedClasse) filtered = filtered.filter(c => c.classe === selectedClasse);
    else if (viewType === "teacher" && selectedTeacher) filtered = filtered.filter(c => c.professeur === selectedTeacher);
    if (search) filtered = filtered.filter(c => c.matiere.toLowerCase().includes(search.toLowerCase()) || c.professeur.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  }, [planningCours, viewType, selectedClasse, selectedTeacher, search]);

  const getCoursForHour = (jour: string, heure: string) => filteredCours.filter(c => c.jour === jour && heure >= c.heureDebut && heure < c.heureFin);

  const deleteCours = (id: string) => { 
    if (confirm("Supprimer ce cours ?")) setStoreCours(storeCours.filter(c => c.id !== id)); 
  };
  
  const saveCours = (newPlanningCours: PlanningCours) => { 
    const newStoreCours = planningToStoreCours(newPlanningCours);
    if (editingCours) {
      setStoreCours(storeCours.map(c => c.id === editingCours.id ? newStoreCours : c));
    } else {
      setStoreCours([...storeCours, { ...newStoreCours, id: Date.now().toString() }]);
    }
    setShowModal(false); 
    setEditingCours(null); 
  };

  const handlePrint = () => {
    const printContent = document.getElementById("planning-table")?.cloneNode(true) as HTMLElement;
    if (!printContent) return;
    const actionButtons = printContent.querySelectorAll(".print-hide");
    actionButtons.forEach(btn => btn.remove());
    const title = `${viewType === "classe" ? selectedClasse : selectedTeacher}`;
    const date = new Date().toLocaleDateString();
    const printWindow = window.open('', '_blank');
    const logoHtml = etablissement?.logo ? `<img src="${etablissement.logo}" style="height: 40px;" />` : `<div style="width:40px;height:40px;background:#1e3a8a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">G</div>`;
    printWindow?.document.write(`<!DOCTYPE html><html><head><title>Emploi du temps - ${title}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Times New Roman',serif;padding:15px;font-size:10px}
      .header{display:flex;justify-content:space-between;margin-bottom:15px;padding-bottom:8px;border-bottom:1px solid #000}
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
    </style></head><body>
      <div class="header"><div class="logo-area" style="display:flex;align-items:center;gap:8px">${logoHtml}<div class="school-info"><h1>${etablissement?.nom || "GROUPE SCOLAIRE DIGITAL"}</h1><p>${etablissement?.adresse || ""} | Tél: ${etablissement?.telephone || ""}</p><p>Année: ${etablissement?.anneeScolaire || "2024/2025"}</p></div></div><div class="title-section"><h2>EMPLOI DU TEMPS - ${title}</h2><p>Établi le ${date}</p></div></div>
      ${printContent.outerHTML}
      <div class="footer">${etablissement?.nom || "GROUPE SCOLAIRE DIGITAL"} - Tous droits réservés</div>
    </body></html>`);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleExport = () => {
    const headers = ["Jour", "Début", "Fin", "Matière", "Prof", "Salle", "Classe"];
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

  if (classes.length === 0) {
    return <div className="p-8 text-center"><p className="text-slate-500">Aucune classe. Créez-en dans Paramètres.</p><button onClick={() => window.location.href = "/parametres"} className="mt-4 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">Aller aux paramètres</button></div>;
  }

  return (
    <div className="p-3 space-y-4 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* EN-TÊTE COMPACT */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Calendar size={20} /> Emploi du temps</h1>
          <p className="text-[10px] text-slate-500">Planning hebdomadaire</p>
        </div>
        <div className="flex gap-1">
          <button onClick={handleExport} className="p-1.5 bg-white border rounded-lg text-slate-500"><Download size={14}/></button>
          <button onClick={handlePrint} className="p-1.5 bg-white border rounded-lg text-slate-500"><Printer size={14}/></button>
          <button onClick={() => { setEditingCours(null); setShowModal(true); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"><Plus size={12}/> Ajouter</button>
        </div>
      </div>

      {/* FILTRES COMPACTS */}
      <div className="bg-white rounded-xl border p-2">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => setViewType("classe")} className={`px-2 py-1 rounded-lg text-xs font-medium transition ${viewType === "classe" ? "bg-blue-600 text-white" : "bg-slate-100"}`}>Classe</button>
            <button onClick={() => setViewType("teacher")} className={`px-2 py-1 rounded-lg text-xs font-medium transition ${viewType === "teacher" ? "bg-blue-600 text-white" : "bg-slate-100"}`}>Enseignant</button>
          </div>
          <div className="flex gap-2 items-center">
            {viewType === "classe" ? (
              <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)} className="p-1 border rounded-lg text-xs bg-white">{classesDispo.map(c => <option key={c}>{c}</option>)}</select>
            ) : (
              <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="p-1 border rounded-lg text-xs bg-white">{enseignantsList.map(p => <option key={p}>{p}</option>)}</select>
            )}
            <div className="relative"><Search size={12} className="absolute left-2 top-1.5 text-slate-400" /><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 pr-2 py-1 border rounded-lg text-xs w-32" /></div>
          </div>
        </div>
      </div>

      {/* TABLEAU COMPACT - TIENT SUR A4 */}
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
              const estPause = isHeureDansPause(heure, pauses);
              return (
                <tr key={heure} className={`border-t ${estPause ? "bg-amber-50/30" : ""}`}>
                  <td className={`p-1.5 font-medium ${estPause ? "bg-amber-100/50" : "bg-slate-50/30"}`}>{formaterHeure(heure)}</td>
                  {jours.map(jour => {
                    const coursItems = getCoursForHour(jour, heure);
                    const pauseDeCetteHeure = pauses.find(p => heure >= p.heureDebut && heure < p.heureFin);
                    return (
                      <td key={jour} className="p-1 border-l align-top">
                        {estPause && pauseDeCetteHeure ? (
                          <div className="bg-amber-100 rounded p-1 text-center">
                            <Coffee size={10} className="mx-auto text-amber-600" />
                            <p className="text-[8px] font-medium">{pauseDeCetteHeure.description}</p>
                          </div>
                        ) : coursItems.length > 0 ? (
                          coursItems.map(c => (
                            <div key={c.id} className="bg-blue-50 rounded p-1 mb-1 cursor-pointer hover:bg-blue-100" onClick={() => { setSelectedCours(c); setShowDetailModal(true); }}>
                              <p className="font-bold text-[9px] truncate">{c.matiere}</p>
                              <p className="text-[7px] text-slate-500">{c.professeur}</p>
                              <p className="text-[7px] text-slate-400">{c.salle}</p>
                              <p className="text-[7px] text-slate-400">{formaterHeure(c.heureDebut)}-{formaterHeure(c.heureFin)}</p>
                              {(currentUser.role === "admin" || currentUser.role === "teacher") && (
                                <div className="flex gap-1 mt-1 print-hide" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => { setEditingCours(c); setShowModal(true); }} className="text-blue-500"><Edit size={8}/></button>
                                  <button onClick={() => deleteCours(c.id)} className="text-red-500"><Trash2 size={8}/></button>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (<div className="h-10 text-slate-300 text-center text-[8px]">—</div>)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <CoursModal cours={editingCours} onSave={saveCours} onClose={() => { setShowModal(false); setEditingCours(null); }} viewType={viewType} selectedClasse={selectedClasse} selectedTeacher={selectedTeacher} salles={salles} enseignants={enseignants} matieres={matieres} classes={classes} />}
      {showDetailModal && selectedCours && <DetailModal cours={selectedCours} onClose={() => setShowDetailModal(false)} />}
    </div>
  );
}