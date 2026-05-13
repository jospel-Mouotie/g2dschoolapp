// components/notes/NotesTable.tsx
"use client";
import { useState } from "react";
import { Send, FileSpreadsheet } from "lucide-react";
import { getElevePhoto, getMentionColor, getMentionBg, getAppreciation } from "./utils";
import { Eleve } from "@/lib/stores";
import EnvoiModal from "./EnvoiModal";
import BulletinModal from "./BulletinModal";

interface NotesTableProps {
  eleves: Eleve[];
  getNoteData: (id: number) => { eval1: number | null; eval2: number | null; moyenne: number | null };
  updateNotes: (id: number, eval1: number | null, eval2: number | null) => void;
  editMode: boolean;
  currentMatiere: any;
  periode: string;
  classe: string;
  allNotes: any;
  elevesList: Eleve[];
  enseignants: any[];
  etablissement: any;
  cours: any[];
  stats: any;
  onBulletinChange: (eleve: Eleve) => void;
  onEnvoiChange: (eleve: Eleve, note: any) => void;
}

export default function NotesTable({
  eleves,
  getNoteData,
  updateNotes,
  editMode,
  currentMatiere,
  periode,
  classe,
  allNotes,
  elevesList,
  enseignants,
  etablissement,
  cours,
  stats,
  onBulletinChange,
  onEnvoiChange
}: NotesTableProps) {
  const [showEnvoiModal, setShowEnvoiModal] = useState(false);
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const handleEnvoyerMatiere = (eleve: Eleve) => {
    const note = getNoteData(eleve.id);
    setSelectedEleve(eleve);
    setSelectedNote(note);
    setShowEnvoiModal(true);
  };

  const handleBulletin = (eleve: Eleve) => {
    setSelectedEleve(eleve);
    setShowBulletinModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Élève</th>
                <th className="px-1 sm:px-3 py-2 sm:py-3 text-left">Photo</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Éval.1</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Éval.2</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Moy.</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Appréc.</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eleves.map((eleve) => {
                const notes = getNoteData(eleve.id);
                const hasContact = eleve.parentEmail || eleve.parentTelephone;
                return (
                  <tr key={eleve.id} className="hover:bg-slate-50/60 transition text-xs sm:text-sm">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-slate-700">
                      {eleve.nom}
                      {eleve.parentNom && <span className="hidden sm:inline text-[10px] text-slate-400 ml-1">({eleve.parentNom})</span>}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3">
                      <img src={getElevePhoto(eleve)} alt="" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {editMode ? (
                        <input type="number" step="0.5" min="0" max="20" value={notes.eval1 ?? ""} onChange={(e) => updateNotes(eleve.id, e.target.value ? parseFloat(e.target.value) : null, notes.eval2)} className="w-14 sm:w-20 p-1 sm:p-1.5 border border-slate-200 rounded-lg text-center text-xs sm:text-sm" />
                      ) : (
                        <span className="font-mono text-xs sm:text-sm">{notes.eval1 !== null ? notes.eval1.toFixed(2) : "—"}</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {editMode ? (
                        <input type="number" step="0.5" min="0" max="20" value={notes.eval2 ?? ""} onChange={(e) => updateNotes(eleve.id, notes.eval1, e.target.value ? parseFloat(e.target.value) : null)} className="w-14 sm:w-20 p-1 sm:p-1.5 border border-slate-200 rounded-lg text-center text-xs sm:text-sm" />
                      ) : (
                        <span className="font-mono text-xs sm:text-sm">{notes.eval2 !== null ? notes.eval2.toFixed(2) : "—"}</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">
                      {notes.moyenne !== null ? (
                        <span className={`text-xs sm:text-base ${getMentionColor(notes.moyenne)}`}>
                          {notes.moyenne.toFixed(2)}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <span className={`text-[9px] sm:text-[11px] font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${getMentionBg(notes.moyenne)}`}>
                        {getAppreciation(notes.moyenne)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        <button onClick={() => handleBulletin(eleve)} title="Bulletin complet" className="p-1 sm:p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                          <FileSpreadsheet size={13} className="sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => handleEnvoyerMatiere(eleve)} title="Envoyer la note" className={`p-1 sm:p-1.5 rounded-lg transition ${hasContact ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`} disabled={!hasContact}>
                          <Send size={13} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showEnvoiModal && selectedEleve && currentMatiere && (
        <EnvoiModal
          eleve={selectedEleve}
          allNotes={allNotes}
          classe={classe}
          periode={periode}
          elevesList={elevesList}
          etablissement={etablissement}
          enseignants={enseignants}
          matiereCourante={selectedNote ? currentMatiere : undefined}
          noteMatiere={selectedNote || undefined}
          onClose={() => { setShowEnvoiModal(false); setSelectedEleve(null); setSelectedNote(null); }}
        />
      )}

      {showBulletinModal && selectedEleve && (
        <BulletinModal
          eleve={selectedEleve}
          allNotes={allNotes}
          classe={classe}
          periode={periode}
          elevesList={elevesList}
          enseignants={enseignants}
          etablissement={etablissement}
          cours={cours}
          stats={stats}
          onClose={() => { setShowBulletinModal(false); setSelectedEleve(null); }}
        />
      )}
    </>
  );
}