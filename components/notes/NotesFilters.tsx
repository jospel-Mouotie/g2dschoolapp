// components/notes/NotesFilters.tsx
"use client";
import { Search } from "lucide-react";

interface NotesFiltersProps {
  matieresDisponibles: any[];
  matiere: string;
  setMatiere: (value: string) => void;
  periode: string;
  setPeriode: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  periodes: string[];
  classesDisponibles?: string[];
  classe?: string;
  setClasse?: (value: string) => void;
  isAdmin?: boolean;
}

export default function NotesFilters({
  matieresDisponibles,
  matiere,
  setMatiere,
  periode,
  setPeriode,
  searchTerm,
  setSearchTerm,
  periodes,
  classesDisponibles = [],
  classe = "",
  setClasse,
  isAdmin = false,
}: NotesFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm print:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && setClasse && classesDisponibles.length > 0 && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Classe</label>
            <select 
              value={classe} 
              onChange={(e) => setClasse(e.target.value)} 
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              {classesDisponibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Matière</label>
          <select 
            value={matiere} 
            onChange={(e) => setMatiere(e.target.value)} 
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            disabled={matieresDisponibles.length === 0}
          >
            {matieresDisponibles.map((m) => (
              <option key={m.id} value={m.id}>{m.nom} (coeff. {m.coefficient})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Période</label>
          <select value={periode} onChange={(e) => setPeriode(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
            {periodes.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}