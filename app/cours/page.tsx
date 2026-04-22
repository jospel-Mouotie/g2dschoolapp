// app/cours/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Clock, Users, TrendingUp, Search, Filter,
  Plus, ChevronRight, MoreVertical, MapPin, BarChart3,
  Grid3x3, List, X, Download, Printer, Eye, Edit, Trash2
} from "lucide-react";
import { useCoursStore } from "@/lib/stores";

// Calcule la progression réelle à partir des modules/chapitres
function calculerProgression(course: any): number {
  if (!course.modules || course.modules.length === 0) return 0;
  let totalChapitres = 0;
  let chapitresFaits = 0;
  for (const mod of course.modules) {
    if (mod.chapitres?.length) {
      totalChapitres += mod.chapitres.length;
      chapitresFaits += mod.chapitres.filter((ch: any) => ch.estFait).length;
    }
  }
  return totalChapitres === 0 ? 0 : Math.round((chapitresFaits / totalChapitres) * 100);
}

// Modal d'ajout/modification
function CoursModal({ cours, onSave, onClose }: any) {
  const [form, setForm] = useState({
    matiere: cours?.matiere || "",
    professeur: cours?.professeur || "",
    salle: cours?.salle || "",
    classe: cours?.classe || "6A",
    coefficient: cours?.coefficient || 1,
    status: cours?.status || "En cours",
    jour: cours?.jour || "Lundi",
    heure: cours?.heure || "8h-10h",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{cours ? "Modifier" : "Ajouter"} un cours</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Matière</label><input required value={form.matiere} onChange={e => setForm({...form, matiere: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
          <div><label>Enseignant</label><input required value={form.professeur} onChange={e => setForm({...form, professeur: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
          <div><label>Salle</label><input required value={form.salle} onChange={e => setForm({...form, salle: e.target.value})} className="w-full border rounded-xl p-2 mt-1" /></div>
          <div><label>Classe</label><select value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} className="w-full border rounded-xl p-2"><option>6A</option><option>5B</option><option>4A</option><option>3A</option><option>2nde</option><option>1ere</option><option>Tle</option></select></div>
          <div><label>Coefficient</label><input type="number" step="0.5" value={form.coefficient} onChange={e => setForm({...form, coefficient: parseFloat(e.target.value)})} className="w-full border rounded-xl p-2 mt-1" /></div>
          <div><label>Jour</label><select value={form.jour} onChange={e => setForm({...form, jour: e.target.value})} className="w-full border rounded-xl p-2"><option>Lundi</option><option>Mardi</option><option>Mercredi</option><option>Jeudi</option><option>Vendredi</option><option>Samedi</option></select></div>
          <div><label>Horaire</label><input required value={form.heure} onChange={e => setForm({...form, heure: e.target.value})} placeholder="8h-10h" className="w-full border rounded-xl p-2 mt-1" /></div>
          <div><label>Statut</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-xl p-2"><option>En cours</option><option>Avancé</option><option>En retard</option><option>Terminé</option></select></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button>
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 py-2 rounded-xl font-semibold">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const [cours, setCours] = useCoursStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");
  const [selectedEnseignant, setSelectedEnseignant] = useState("Tous");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editingCours, setEditingCours] = useState<any>(null);

  const classesOptions = useMemo(() => {
    const classesSet = new Set(cours.map(c => c.classe));
    return ["all", ...Array.from(classesSet).sort()];
  }, [cours]);

  const matieresOptions = useMemo(() => {
    const matieresSet = new Set(cours.map(c => c.matiere));
    return ["Toutes", ...Array.from(matieresSet).sort()];
  }, [cours]);

  const enseignantsOptions = useMemo(() => {
    const ensSet = new Set(cours.map(c => c.professeur));
    return ["Tous", ...Array.from(ensSet).sort()];
  }, [cours]);

  const statutsOptions = useMemo(() => {
    const statutsSet = new Set(cours.map(c => c.status));
    return ["Tous", ...Array.from(statutsSet).sort()];
  }, [cours]);

  const filteredCourses = useMemo(() => {
    return cours.filter(c => {
      const matchClass = selectedClass === "all" || c.classe === selectedClass;
      const matchMatiere = selectedMatiere === "Toutes" || c.matiere === selectedMatiere;
      const matchEnseignant = selectedEnseignant === "Tous" || c.professeur === selectedEnseignant;
      const matchStatut = selectedStatut === "Tous" || c.status === selectedStatut;
      const matchSearch = c.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.professeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.classe.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClass && matchMatiere && matchEnseignant && matchStatut && matchSearch;
    });
  }, [cours, selectedClass, selectedMatiere, selectedEnseignant, selectedStatut, searchTerm]);

  const stats = useMemo(() => {
    const filtered = selectedClass === "all" ? cours : cours.filter(c => c.classe === selectedClass);
    const totalCourses = filtered.length;
    const avgProgress = filtered.length ? Math.round(filtered.reduce((sum, c) => sum + calculerProgression(c), 0) / filtered.length) : 0;
    const totalHours = filtered.reduce((sum, c) => sum + (c.hoursPerWeek || 0), 0);
    return { totalCourses, avgProgress, totalHours };
  }, [cours, selectedClass]);

  const saveCours = (formData: any) => {
    const imageUrl = `https://source.unsplash.com/featured/100x100?${encodeURIComponent(formData.matiere)}`;
    if (editingCours) {
      setCours(cours.map(c => c.id === editingCours.id ? { ...editingCours, ...formData, image: editingCours.image } : c));
    } else {
      const newId = (Math.max(...cours.map(c => parseInt(c.id)), 0) + 1).toString();
      const newCours = {
        id: newId,
        matiere: formData.matiere,
        professeur: formData.professeur,
        salle: formData.salle,
        classe: formData.classe,
        jour: formData.jour,
        heure: formData.heure,
        duree: 2,
        progress: 0,
        status: formData.status,
        students: 0,
        coefficient: formData.coefficient,
        hoursPerWeek: formData.coefficient || 2,
        image: imageUrl,
        modules: []
      };
      setCours([...cours, newCours]);
    }
    setShowModal(false);
    setEditingCours(null);
  };

  const deleteCours = (id: string) => {
    if (confirm("Supprimer ce cours définitivement ?")) {
      setCours(cours.filter(c => c.id !== id));
    }
  };

  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedMatiere("Toutes");
    setSelectedEnseignant("Tous");
    setSelectedStatut("Tous");
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "En cours": return "bg-blue-100 text-blue-700";
      case "Avancé": return "bg-purple-100 text-purple-700";
      case "En retard": return "bg-red-100 text-red-700";
      case "Terminé": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const CourseCard = ({ course }: { course: any }) => {
    const progression = calculerProgression(course);
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
        <div className="relative h-28 bg-gradient-to-r from-blue-500 to-indigo-600">
          <img src={course.image} alt={course.matiere} className="w-full h-full object-cover opacity-30" />
          <div className="absolute top-3 right-3"><button className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full"><MoreVertical size={16} /></button></div>
          <div className="absolute bottom-3 left-4"><h3 className="text-white font-bold text-lg">{course.matiere}</h3><p className="text-white/80 text-xs">{course.professeur}</p></div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-2"><Clock size={14} /><span>{course.jour} {course.heure}</span></div>
            <div className="flex items-center gap-2"><Users size={14} /><span>{course.students || 0} él.</span></div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(course.status)}`}>{course.status}</span>
          </div>
          <div><div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Progression</span><span>{progression}%</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progression}%` }}></div></div></div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => router.push(`/cours/${course.id}`)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"><Eye size={14}/> Détails</button>
            <button onClick={() => { setEditingCours(course); setShowModal(true); }} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"><Edit size={14}/> Modifier</button>
            <button onClick={() => deleteCours(course.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-red-500 flex items-center justify-center gap-1"><Trash2 size={14}/> Supprimer</button>
          </div>
        </div>
      </div>
    );
  };

  const CourseRow = ({ course }: { course: any }) => {
    const progression = calculerProgression(course);
    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer" onClick={() => router.push(`/cours/${course.id}`)}>
        <td className="px-4 py-3"><img src={course.image} className="w-8 h-8 rounded-full object-cover" /></td>
        <td className="px-4 py-3 font-semibold truncate">{course.matiere}</td>
        <td className="px-4 py-3 truncate">{course.classe}</td>
        <td className="px-4 py-3 truncate">{course.professeur}</td>
        <td className="px-4 py-3 truncate">{course.salle}</td>
        <td className="px-4 py-3 truncate text-xs">{course.jour} {course.heure}</td>
        <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-xs whitespace-nowrap">{progression}%</span><div className="w-16 bg-slate-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${progression}%`}}></div></div></div></td>
        <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(course.status)}`}>{course.status}</span></td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <button onClick={() => { setEditingCours(course); setShowModal(true); }} className="p-1 hover:bg-slate-100 rounded text-blue-500"><Edit size={14}/></button>
            <button onClick={() => deleteCours(course.id)} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={14}/></button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 text-slate-700 p-6">
      {/* EN-TÊTE */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3"><div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-md text-white"><BookOpen size={24} /></div>Gestion des Cours</h1><p className="text-slate-500 text-sm mt-1">Programme, horaires, progression par classe</p></div>
        <button onClick={() => { setEditingCours(null); setShowModal(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 flex items-center gap-2"><Plus size={16} /> Nouveau Cours</button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border p-5"><p className="text-slate-400 text-xs">Cours actifs</p><p className="text-2xl font-bold">{stats.totalCourses}</p><p className="text-[11px] text-emerald-600">+2 cette semaine</p></div>
        <div className="bg-white rounded-2xl border p-5"><p className="text-slate-400 text-xs">Progression moyenne</p><p className="text-2xl font-bold">{stats.avgProgress}%</p><div className="w-full bg-slate-100 rounded-full h-1.5 mt-2"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: `${stats.avgProgress}%`}}></div></div></div>
        <div className="bg-white rounded-2xl border p-5"><p className="text-slate-400 text-xs">Heures / semaine</p><p className="text-2xl font-bold">{stats.totalHours}h</p><p className="text-[11px] text-blue-600">volume horaire total</p></div>
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-2xl border p-5 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]"><label className="block text-xs font-semibold text-slate-500 mb-1">Classe</label><select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">{classesOptions.map(c => <option key={c} value={c}>{c === "all" ? "Toutes les classes" : c}</option>)}</select></div>
          <div className="flex-1 min-w-[150px]"><label className="block text-xs font-semibold text-slate-500 mb-1">Matière</label><select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">{matieresOptions.map(m => <option key={m}>{m}</option>)}</select></div>
          <div className="flex-1 min-w-[150px]"><label className="block text-xs font-semibold text-slate-500 mb-1">Enseignant</label><select value={selectedEnseignant} onChange={e => setSelectedEnseignant(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">{enseignantsOptions.map(e => <option key={e}>{e}</option>)}</select></div>
          <div className="flex-1 min-w-[150px]"><label className="block text-xs font-semibold text-slate-500 mb-1">Statut</label><select value={selectedStatut} onChange={e => setSelectedStatut(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">{statutsOptions.map(s => <option key={s}>{s}</option>)}</select></div>
          <div className="flex-1 min-w-[200px]"><label className="block text-xs font-semibold text-slate-500 mb-1">Recherche</label><div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400"/><input type="text" placeholder="Cours, prof, classe..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm"/></div></div>
          <div className="flex gap-2"><button onClick={resetFilters} className="px-4 py-2 border rounded-xl text-sm flex items-center gap-1 hover:bg-slate-50"><X size={14}/> Réinitialiser</button><div className="border-l border-slate-200 mx-1"></div><button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}><Grid3x3 size={18}/></button><button onClick={() => setViewMode("table")} className={`p-2 rounded-lg ${viewMode === "table" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}><List size={18}/></button></div>
        </div>
      </div>

      {/* RÉSULTATS */}
      <div className="flex justify-between items-center"><p className="text-sm text-slate-500"><span className="font-bold">{filteredCourses.length}</span> cours trouvés</p><div className="flex gap-2"><button className="p-2 border rounded-lg hover:bg-slate-50"><Download size={16}/></button><button className="p-2 border rounded-lg hover:bg-slate-50"><Printer size={16}/></button></div></div>

      {/* VUE GRILLE */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{filteredCourses.map(course => <CourseCard key={course.id} course={course} />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-x-auto shadow-sm">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-16" />
              <col className="w-32" />
              <col className="w-20" />
              <col className="w-32" />
              <col className="w-20" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Photo</th>
                <th className="px-4 py-3 text-left">Cours</th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Enseignant</th>
                <th className="px-4 py-3 text-left">Salle</th>
                <th className="px-4 py-3 text-left">Horaire</th>
                <th className="px-4 py-3 text-left">Progrès</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => <CourseRow key={course.id} course={course} />)}
            </tbody>
          </table>
        </div>
      )}

      {filteredCourses.length === 0 && <div className="text-center py-12 bg-white rounded-2xl border"><p className="text-slate-400">Aucun cours ne correspond aux filtres sélectionnés.</p></div>}

      {/* MODAL */}
      {showModal && <CoursModal cours={editingCours} onSave={saveCours} onClose={() => { setShowModal(false); setEditingCours(null); }} />}
    </div>
  );
}