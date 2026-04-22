// components/StudentsSection.tsx
"use client";
import { useState } from "react";
import { User, Mail, Smartphone, Edit3, Trash2, Plus, X, Upload, Eye } from "lucide-react";
import { useElevesStore } from "@/lib/stores";

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop"
];

function getAvatarUrl(eleve: any) {
  if (eleve.photo?.startsWith('http') || eleve.photo?.startsWith('data:image')) return eleve.photo;
  if (eleve.img?.startsWith('http') || eleve.img?.startsWith('data:image')) return eleve.img;
  return DEFAULT_PHOTOS[(eleve.id || 0) % DEFAULT_PHOTOS.length];
}

export default function StudentsSection() {
  const [eleves, setEleves] = useElevesStore();
  const [selectedEleve, setSelectedEleve] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const deleteEleve = (id: number) => {
    if (confirm("Supprimer cet élève ?")) {
      setEleves(eleves.filter(e => e.id !== id));
      if (selectedEleve?.id === id) setSelectedEleve(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      
      {/* Liste des élèves */}
      <div className="flex-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-[#2d3a8d] text-xs md:text-sm uppercase tracking-wider">
            Base de données Élèves ({eleves.length})
          </h3>
          <button 
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-md hover:bg-blue-700 transition-all"
          >
            <Plus size={14} /> Nouvel élève
          </button>
        </div>

        {/* Version mobile : cartes */}
        <div className="block md:hidden divide-y divide-slate-100">
          {eleves.map((eleve) => (
            <div 
              key={eleve.id}
              className={`p-4 cursor-pointer transition-colors ${selectedEleve?.id === eleve.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              onClick={() => setSelectedEleve(eleve)}
            >
              <div className="flex items-center gap-3">
                <img src={getAvatarUrl(eleve)} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{eleve.nom}</p>
                  <p className="text-xs text-slate-500">{eleve.classe}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{eleve.matricule}</p>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setEditing(eleve); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-500">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => deleteEleve(eleve.id)} className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Version desktop : tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[500px] text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 w-12">#</th>
                <th className="px-5 py-3">Profil</th>
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Classe</th>
                <th className="px-5 py-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {eleves.map((eleve) => (
                <tr 
                  key={eleve.id} 
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${selectedEleve?.id === eleve.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedEleve(eleve)}
                >
                  <td className="px-5 py-3">
                    <div className={`w-4 h-4 rounded border ${selectedEleve?.id === eleve.id ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`} />
                  </td>
                  <td className="px-5 py-3">
                    <img src={getAvatarUrl(eleve)} className="w-9 h-9 rounded-lg object-cover" alt="" />
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{eleve.nom}</td>
                  <td className="px-5 py-3 text-slate-500 text-sm">{eleve.classe}</td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditing(eleve); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-500 transition">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => deleteEleve(eleve.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {eleves.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">Aucun élève inscrit</p>
            <button onClick={() => setShowModal(true)} className="mt-3 text-blue-600 text-sm">+ Ajouter un élève</button>
          </div>
        )}
      </div>

      {/* Fiche Profil */}
      <div className="w-full lg:w-80 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
        {selectedEleve ? (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                  <img src={getAvatarUrl(selectedEleve)} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-3 border-white rounded-full"></div>
              </div>
              <h4 className="font-bold text-slate-800 text-lg">{selectedEleve.nom}</h4>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{selectedEleve.matricule}</p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Classe</p>
                <p className="font-semibold text-slate-800 text-sm">{selectedEleve.classe}</p>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500"><Smartphone size={16} /></div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400">Téléphone</p>
                  <p className="text-sm text-slate-700">{selectedEleve.telephone || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
                <div className="bg-purple-50 p-2 rounded-lg text-purple-500"><Mail size={16} /></div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400">Email</p>
                  <p className="text-sm text-slate-700 truncate">{selectedEleve.email || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <User size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">Sélectionnez un élève</p>
            <p className="text-slate-300 text-xs mt-1">pour voir ses détails</p>
          </div>
        )}
      </div>
    </div>
  );
}