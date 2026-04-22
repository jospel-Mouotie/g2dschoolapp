// app/enseignants/attribution/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X, Search, BookOpen, Users, Crown } from "lucide-react";
import { useEnseignantsStore, useMatieresStore, useClassesStore, useNiveauxStore } from "@/lib/stores";

export default function AttributionPage() {
  const router = useRouter();
  const [enseignants, setEnseignants] = useEnseignantsStore();
  const [matieres] = useMatieresStore();
  const [classes] = useClassesStore();
  const [niveaux] = useNiveauxStore();
  const [search, setSearch] = useState("");
  const [selectedEnseignant, setSelectedEnseignant] = useState<any>(null);
  const [showAttributionModal, setShowAttributionModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedClasse, setSelectedClasse] = useState("");
  const [estPrincipal, setEstPrincipal] = useState(false);

  // Enseignants filtrés
  const filteredEnseignants = useMemo(() => {
    return enseignants.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.matieres.some(m => m.toLowerCase().includes(search.toLowerCase()))
    );
  }, [enseignants, search]);

  // Vérifier si une classe a déjà un professeur principal
  const getPrincipalDeClasse = (classeNom: string) => {
    for (const ens of enseignants) {
      const enseignement = ens.enseignements?.find(e => e.classe === classeNom && e.estPrincipal);
      if (enseignement) return ens.name;
    }
    return null;
  };

  // Ajouter un enseignement
  const addEnseignement = () => {
    if (!selectedEnseignant || !selectedMatiere || !selectedClasse) return;
    
    const newEnseignement = { matiere: selectedMatiere, classe: selectedClasse, estPrincipal };
    
    // Vérifier si on essaie de mettre un deuxième professeur principal
    if (estPrincipal) {
      const principalExistant = getPrincipalDeClasse(selectedClasse);
      if (principalExistant && principalExistant !== selectedEnseignant.name) {
        alert(`La classe ${selectedClasse} a déjà ${principalExistant} comme professeur principal. Veuillez d'abord retirer cette attribution.`);
        return;
      }
    }
    
    // Vérifier si l'enseignement existe déjà
    const exists = selectedEnseignant.enseignements?.some(
      (e: any) => e.matiere === selectedMatiere && e.classe === selectedClasse
    );
    
    if (exists) {
      alert("Cet enseignement est déjà attribué à cet enseignant.");
      return;
    }
    
    const updated = {
      ...selectedEnseignant,
      enseignements: [...(selectedEnseignant.enseignements || []), newEnseignement],
      matieres: [...new Set([...selectedEnseignant.matieres, selectedMatiere])],
      classes: [...new Set([...selectedEnseignant.classes, selectedClasse])]
    };
    
    setEnseignants(enseignants.map(e => e.id === selectedEnseignant.id ? updated : e));
    setSelectedMatiere("");
    setSelectedClasse("");
    setEstPrincipal(false);
    setShowAttributionModal(false);
  };

  // Supprimer un enseignement
  const removeEnseignement = (enseignant: any, index: number) => {
    const updatedEnseignements = [...(enseignant.enseignements || [])];
    updatedEnseignements.splice(index, 1);
    
    const matieresUniques = new Set(updatedEnseignements.map((e: any) => e.matiere));
    const classesUniques = new Set(updatedEnseignements.map((e: any) => e.classe));
    
    const updated = {
      ...enseignant,
      enseignements: updatedEnseignements,
      matieres: Array.from(matieresUniques),
      classes: Array.from(classesUniques)
    };
    
    setEnseignants(enseignants.map(e => e.id === enseignant.id ? updated : e));
  };

  // Obtenir le niveau d'une classe
  const getNiveauForClasse = (classeNom: string) => {
    const classe = classes.find(c => c.nom === classeNom);
    const niveau = niveaux.find(n => n.id === classe?.niveauId);
    return niveau?.nom || "";
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* EN-TÊTE */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Attribution des cours
          </h1>
          <p className="text-sm text-slate-500 mt-1">Assigner des matières et classes aux enseignants</p>
        </div>
      </div>

      {/* RECHERCHE */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un enseignant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>

      {/* LISTE DES ENSEIGNANTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEnseignants.map(enseignant => {
          const enseignements = enseignant.enseignements || [];
          return (
            <div key={enseignant.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* En-tête enseignant */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={enseignant.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(enseignant.name)}&background=random`}
                      className="w-12 h-12 rounded-xl object-cover"
                      alt={enseignant.name}
                    />
                    <div>
                      <h3 className="font-bold text-slate-800">{enseignant.name}</h3>
                      <p className="text-xs text-slate-500">{enseignant.status} • {enseignant.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedEnseignant(enseignant); setShowAttributionModal(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <Plus size={16}/> Attribuer
                  </button>
                </div>
              </div>

              {/* Liste des enseignements */}
              <div className="p-5">
                {enseignements.length === 0 ? (
                  <p className="text-center text-slate-400 py-4">Aucun cours attribué</p>
                ) : (
                  <div className="space-y-2">
                    {enseignements.map((ens: any, idx: number) => {
                      const niveau = getNiveauForClasse(ens.classe);
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <BookOpen size={16} className="text-blue-500" />
                            <div>
                              <p className="font-medium text-slate-800">{ens.matiere}</p>
                              <p className="text-xs text-slate-500">
                                Classe : {ens.classe} {niveau && `(${niveau})`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {ens.estPrincipal && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Crown size={10}/> Principal
                              </span>
                            )}
                            <button
                              onClick={() => removeEnseignement(enseignant, idx)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL D'ATTRIBUTION */}
      {showAttributionModal && selectedEnseignant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Attribuer un cours</h3>
              <button onClick={() => setShowAttributionModal(false)}><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Matière</label>
                <select 
                  value={selectedMatiere} 
                  onChange={e => setSelectedMatiere(e.target.value)}
                  className="w-full border rounded-xl p-2 bg-slate-50"
                >
                  <option value="">Sélectionner une matière</option>
                  {matieres.map(m => <option key={m.id} value={m.nom}>{m.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Classe</label>
                <select 
                  value={selectedClasse} 
                  onChange={e => setSelectedClasse(e.target.value)}
                  className="w-full border rounded-xl p-2 bg-slate-50"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={estPrincipal} 
                    onChange={e => setEstPrincipal(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Professeur principal de cette classe</span>
                </label>
                {estPrincipal && getPrincipalDeClasse(selectedClasse) && getPrincipalDeClasse(selectedClasse) !== selectedEnseignant.name && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Cette classe a déjà {getPrincipalDeClasse(selectedClasse)} comme professeur principal.
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={addEnseignement}
                  disabled={!selectedMatiere || !selectedClasse}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  Attribuer
                </button>
                <button 
                  onClick={() => setShowAttributionModal(false)}
                  className="flex-1 border py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}