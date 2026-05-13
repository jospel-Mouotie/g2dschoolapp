// components/notes/EnvoiGroupeModal.tsx
"use client";
import { useState } from "react";
import { X, SendHorizontal, Users as UsersIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Eleve, Etablissement } from "@/lib/stores";
import { toutesLesMatieres } from "./utils";

// Définir le type Note localement
interface NoteComplete {
  id: number;
  eleveId: number;
  matiereId: string;
  periode: string;
  eval1: number | null;
  eval2: number | null;
  moyenne: number | null;
  appreciation: string | null;
}

interface EnvoiGroupeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eleves: Eleve[];
  allNotes: Record<string, NoteComplete[]>;
  classe: string;
  periode: string;
  etablissement: Etablissement | null;
  onSend: (destinataires: string[]) => Promise<void>;
}

export default function EnvoiGroupeModal({
  isOpen,
  onClose,
  eleves,
  allNotes,
  classe,
  periode,
  etablissement,
  onSend,
}: EnvoiGroupeModalProps) {
  const [selectedEleves, setSelectedEleves] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sélectionner tous les élèves
  const selectAll = () => {
    if (selectedEleves.length === eleves.length) {
      setSelectedEleves([]);
    } else {
      setSelectedEleves(eleves.map(e => e.id));
    }
  };

  // Sélectionner un élève
  const toggleEleve = (eleveId: number) => {
    if (selectedEleves.includes(eleveId)) {
      setSelectedEleves(selectedEleves.filter(id => id !== eleveId));
    } else {
      setSelectedEleves([...selectedEleves, eleveId]);
    }
  };

  // Envoyer les bulletins
  const handleSend = async () => {
    if (selectedEleves.length === 0) {
      setError("Veuillez sélectionner au moins un élève");
      return;
    }

    setSending(true);
    setError(null);
    
    try {
      // Récupérer les emails des parents des élèves sélectionnés
      const destinataires = selectedEleves
        .map(eleveId => {
          const eleve = eleves.find(e => e.id === eleveId);
          return eleve?.parentEmail;
        })
        .filter((email): email is string => !!email);
      
      if (destinataires.length === 0) {
        setError("Aucun parent n'a d'email renseigné");
        setSending(false);
        return;
      }
      
      await onSend(destinataires);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setSelectedEleves([]);
      }, 2000);
    } catch (err) {
      setError("Erreur lors de l'envoi des bulletins");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Calculer la moyenne générale d'un élève - fonction locale
  const getMoyenneGenerale = (eleveId: number): number | null => {
    let totalPoints = 0;
    let totalCoef = 0;
    
    for (const matiere of toutesLesMatieres) {
      const key = `${classe}_${matiere.id}_${periode}`;
      const notes = allNotes[key] || [];
      const noteData = notes.find((n: NoteComplete) => n.eleveId === eleveId);
      
      if (noteData && noteData.moyenne !== null) {
        totalPoints += noteData.moyenne * matiere.coefficient;
        totalCoef += matiere.coefficient;
      }
    }
    
    return totalCoef > 0 ? totalPoints / totalCoef : null;
  };

  // Obtenir la mention
  const getMention = (moyenne: number | null) => {
    if (moyenne === null) return "Non évalué";
    if (moyenne >= 16) return "Très Bien";
    if (moyenne >= 14) return "Bien";
    if (moyenne >= 12) return "Assez Bien";
    if (moyenne >= 10) return "Passable";
    return "Insuffisant";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <UsersIcon size={20} className="text-blue-600" />
            Envoi groupé de bulletins
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              Sélectionnez les élèves dont vous souhaitez envoyer le bulletin par email.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Les bulletins seront envoyés aux adresses email des parents.
            </p>
          </div>

          <div className="mb-3">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedEleves.length === eleves.length ? "Désélectionner tout" : "Tout sélectionner"}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eleves.map((eleve) => {
              const hasEmail = !!eleve.parentEmail;
              const isSelected = selectedEleves.includes(eleve.id);
              const moyenne = getMoyenneGenerale(eleve.id);
              const mention = getMention(moyenne);
              
              return (
                <div
                  key={eleve.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-slate-50 border-slate-200"
                  } ${!hasEmail ? "opacity-50" : ""}`}
                  onClick={() => hasEmail && toggleEleve(eleve.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => hasEmail && toggleEleve(eleve.id)}
                    disabled={!hasEmail}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{eleve.nom}</p>
                    <p className="text-xs text-slate-500">{eleve.classe}</p>
                    {moyenne !== null && (
                      <p className="text-xs text-slate-400">Moyenne: {moyenne.toFixed(2)}/20 - {mention}</p>
                    )}
                  </div>
                  {hasEmail ? (
                    <span className="text-xs text-green-600">📧 {eleve.parentEmail}</span>
                  ) : (
                    <span className="text-xs text-red-400">⚠️ Pas d'email</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-50 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mx-4 mb-2 p-3 bg-green-50 rounded-xl flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle size={16} />
            Bulletins envoyés avec succès !
          </div>
        )}

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={sending || selectedEleves.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendHorizontal size={16} />
            )}
            {sending ? "Envoi en cours..." : `Envoyer (${selectedEleves.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}