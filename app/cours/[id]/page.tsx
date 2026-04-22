"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Plus, Edit, Trash2, X, CheckCircle, Circle, 
  Clock, BookOpen, Users, MapPin, FolderOpen
} from "lucide-react";
import { useCoursStore } from "@/lib/stores";
import type { Module, Chapitre } from "@/lib/stores";

// Modal pour module
function ModuleModal({ module, onSave, onClose }: any) {
  const [form, setForm] = useState({
    titre: module?.titre || "",
    description: module?.description || "",
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">{module ? "Modifier le module" : "Ajouter un module"}</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={(e)=>{e.preventDefault(); onSave(form);}} className="space-y-4">
          <input required placeholder="Titre" value={form.titre} onChange={e=>setForm({...form, titre:e.target.value})} className="w-full border rounded-xl p-2" />
          <textarea placeholder="Description" rows={2} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full border rounded-xl p-2" />
          <div className="flex gap-3"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

// Modal pour chapitre (associé à un module)
function ChapitreModal({ chapitre, onSave, onClose }: any) {
  const [form, setForm] = useState({
    titre: chapitre?.titre || "",
    description: chapitre?.description || "",
    duree: chapitre?.duree || 60,
    estFait: chapitre?.estFait || false,
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">{chapitre ? "Modifier le chapitre" : "Ajouter un chapitre"}</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={(e)=>{e.preventDefault(); onSave(form);}} className="space-y-4">
          <input required placeholder="Titre" value={form.titre} onChange={e=>setForm({...form, titre:e.target.value})} className="w-full border rounded-xl p-2" />
          <textarea placeholder="Description" rows={2} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full border rounded-xl p-2" />
          <input type="number" placeholder="Durée (minutes)" value={form.duree} onChange={e=>setForm({...form, duree: parseInt(e.target.value)})} className="w-full border rounded-xl p-2" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.estFait} onChange={e=>setForm({...form, estFait:e.target.checked})} /> Déjà complété</label>
          <div className="flex gap-3"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl">Enregistrer</button><button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button></div>
        </form>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cours, setCours] = useCoursStore();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showChapitreModal, setShowChapitreModal] = useState(false);
  const [editingChapitre, setEditingChapitre] = useState<Chapitre | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);

  useEffect(() => {
    const found = cours.find(c => c.id === params.id);
    if (found) {
      setCourse(found);
      setModules(found.modules || []);
    } else router.push("/cours");
  }, [params.id, cours]);

  const progressionModule = (mod: Module) => {
    if (!mod.chapitres?.length) return 0;
    const faits = mod.chapitres.filter(c => c.estFait).length;
    return Math.round((faits / mod.chapitres.length) * 100);
  };
  const progressionGlobale = () => {
    if (!modules.length) return 0;
    const total = modules.reduce((acc, m) => acc + progressionModule(m), 0);
    return Math.round(total / modules.length);
  };

  const sauvegarderModules = (nouveaux: Module[]) => {
    const nouvelleProgression = progressionGlobale();
    const misAJour = cours.map(c => c.id === course.id ? { ...c, modules: nouveaux, progress: nouvelleProgression } : c);
    setCours(misAJour);
    setModules(nouveaux);
  };

  const ajouterModule = (data: any) => {
    const nouveau: Module = { id: Date.now().toString(), titre: data.titre, description: data.description, chapitres: [] };
    sauvegarderModules([...modules, nouveau]);
    setShowModuleModal(false);
  };
  const modifierModule = (data: any) => {
    if (!editingModule) return;
    const nouveaux = modules.map(m => m.id === editingModule.id ? { ...m, titre: data.titre, description: data.description } : m);
    sauvegarderModules(nouveaux);
    setShowModuleModal(false);
    setEditingModule(null);
  };
  const supprimerModule = (id: string) => {
    if (confirm("Supprimer ce module et tous ses chapitres ?")) sauvegarderModules(modules.filter(m => m.id !== id));
  };

  const ajouterChapitre = (data: any) => {
    const nouveau: Chapitre = { id: Date.now().toString(), titre: data.titre, description: data.description, duree: data.duree, estFait: data.estFait };
    const nouveaux = modules.map(m => m.id === currentModuleId ? { ...m, chapitres: [...(m.chapitres || []), nouveau] } : m);
    sauvegarderModules(nouveaux);
    setShowChapitreModal(false);
    setCurrentModuleId(null);
  };
  const modifierChapitre = (data: any) => {
    if (!editingChapitre || !currentModuleId) return;
    const nouveaux = modules.map(m => {
      if (m.id === currentModuleId) {
        const nouveauxChapitres = (m.chapitres || []).map(ch => ch.id === editingChapitre.id ? { ...ch, ...data } : ch);
        return { ...m, chapitres: nouveauxChapitres };
      }
      return m;
    });
    sauvegarderModules(nouveaux);
    setShowChapitreModal(false);
    setEditingChapitre(null);
    setCurrentModuleId(null);
  };
  const supprimerChapitre = (moduleId: string, chapitreId: string) => {
    if (confirm("Supprimer ce chapitre ?")) {
      const nouveaux = modules.map(m => m.id === moduleId ? { ...m, chapitres: (m.chapitres || []).filter(ch => ch.id !== chapitreId) } : m);
      sauvegarderModules(nouveaux);
    }
  };
  const toggleChapitre = (moduleId: string, chapitreId: string) => {
    const nouveaux = modules.map(m => {
      if (m.id === moduleId) {
        const nouveauxChapitres = (m.chapitres || []).map(ch => ch.id === chapitreId ? { ...ch, estFait: !ch.estFait } : ch);
        return { ...m, chapitres: nouveauxChapitres };
      }
      return m;
    });
    sauvegarderModules(nouveaux);
  };

  if (!course) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600"><ArrowLeft size={20} /> Retour</button>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
          <img src={course.image} className="w-full h-full object-cover opacity-20" />
          <div className="absolute bottom-4 left-6"><h1 className="text-3xl font-bold text-white">{course.matiere}</h1><p className="text-white/80">{course.professeur} • {course.classe}</p></div>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b">
          <div><Clock size={18} /><p className="text-xs">Horaire</p><p className="font-medium">{course.jour} {course.heure}</p></div>
          <div><MapPin size={18} /><p className="text-xs">Salle</p><p className="font-medium">{course.salle}</p></div>
          <div><Users size={18} /><p className="text-xs">Élèves</p><p className="font-medium">{course.students}</p></div>
          <div><BookOpen size={18} /><p className="text-xs">Progression</p><p className="font-medium">{progressionGlobale()}%</p></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><FolderOpen size={20} /> Modules et chapitres</h2>
          <button onClick={() => { setEditingModule(null); setShowModuleModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Plus size={16}/> Module</button>
        </div>
        {modules.length === 0 ? <div className="text-center py-8 text-slate-400">Aucun module. Ajoutez-en un !</div> : modules.map((mod, idx) => (
          <div key={mod.id} className="border rounded-2xl p-4 mb-4 bg-slate-50/30">
            <div className="flex justify-between items-start">
              <div><h3 className="text-lg font-bold">{mod.titre} <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">{progressionModule(mod)}%</span></h3>{mod.description && <p className="text-sm text-slate-500">{mod.description}</p>}</div>
              <div className="flex gap-1"><button onClick={() => { setEditingModule(mod); setShowModuleModal(true); }}><Edit size={16}/></button><button onClick={() => supprimerModule(mod.id)} className="text-red-500"><Trash2 size={16}/></button></div>
            </div>
            <div className="ml-4 mt-3">
              <div className="flex justify-between items-center"><h4 className="text-sm font-semibold">Chapitres</h4><button onClick={() => { setCurrentModuleId(mod.id); setEditingChapitre(null); setShowChapitreModal(true); }} className="text-xs text-blue-600">+ Ajouter</button></div>
              {(!mod.chapitres || mod.chapitres.length === 0) ? <p className="text-xs text-slate-400 italic">Aucun chapitre</p> : mod.chapitres.map((ch, i) => (
                <div key={ch.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border mt-2 group">
                  <button onClick={() => toggleChapitre(mod.id, ch.id)}>{ch.estFait ? <CheckCircle size={20} className="text-emerald-500"/> : <Circle size={20} className="text-slate-300"/>}</button>
                  <div className="flex-1"><p className="text-sm font-medium">{i+1}. {ch.titre}</p>{ch.description && <p className="text-xs text-slate-400">{ch.description}</p>}{ch.duree && <p className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {ch.duree} min</p>}</div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => { setCurrentModuleId(mod.id); setEditingChapitre(ch); setShowChapitreModal(true); }}><Edit size={14}/></button><button onClick={() => supprimerChapitre(mod.id, ch.id)} className="text-red-500"><Trash2 size={14}/></button></div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-6 pt-4 border-t"><div className="flex justify-between text-sm mb-1"><span>Progression globale</span><span className="font-bold">{progressionGlobale()}%</span></div><div className="w-full bg-slate-100 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{ width: `${progressionGlobale()}%` }}></div></div><p className="text-xs text-slate-400 mt-2">{modules.length} module(s) • {modules.reduce((acc,m)=>acc+(m.chapitres?.length||0),0)} chapitre(s)</p></div>
      </div>

      {showModuleModal && <ModuleModal module={editingModule} onSave={editingModule ? modifierModule : ajouterModule} onClose={()=>{setShowModuleModal(false); setEditingModule(null);}} />}
      {showChapitreModal && <ChapitreModal chapitre={editingChapitre} onSave={editingChapitre ? modifierChapitre : ajouterChapitre} onClose={()=>{setShowChapitreModal(false); setEditingChapitre(null); setCurrentModuleId(null);}} />}
    </div>
  );
}