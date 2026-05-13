// components/notes/ImportExcelModal.tsx
"use client";
import { useState } from "react";
import { X, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { Eleve } from "@/lib/stores";

interface ImportExcelModalProps {
  onClose: () => void;
  onImport: (notesMap: Map<string, { eval1: number | null; eval2: number | null }>) => void;
  elevesList: Eleve[];
  classe: string;
  matiereNom?: string;
  periode: string;
}

export default function ImportExcelModal({
  onClose,
  onImport,
  elevesList,
  classe,
  matiereNom,
  periode,
}: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setPreview(json.slice(0, 5));
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const downloadTemplate = () => {
    const template = elevesList.map((e: Eleve) => ({
      "Nom de l'élève": e.nom,
      "Évaluation 1": "",
      "Évaluation 2": ""
    }));
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Notes");
    XLSX.writeFile(wb, `modele_notes_${classe}_${matiereNom || "matiere"}_${periode}.xlsx`);
  };

  const processImport = () => {
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      
      const notesMap = new Map();
      json.forEach((row: any) => {
        const nomEleve = row["Nom de l'élève"] || row["nom"] || row["Nom"];
        if (nomEleve) {
          let eval1 = row["Évaluation 1"] || row["eval1"] || row["Éval.1"];
          let eval2 = row["Évaluation 2"] || row["eval2"] || row["Éval.2"];
          
          if (typeof eval1 === 'string') eval1 = parseFloat(eval1);
          if (typeof eval2 === 'string') eval2 = parseFloat(eval2);
          
          notesMap.set(nomEleve, {
            eval1: (typeof eval1 === 'number' && !isNaN(eval1)) ? eval1 : null,
            eval2: (typeof eval2 === 'number' && !isNaN(eval2)) ? eval2 : null
          });
        }
      });
      
      onImport(notesMap);
      setImporting(false);
      onClose();
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-green-600" />
            Importer des notes depuis Excel
          </h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-blue-700 mb-2">📋 Format attendu :</p>
            <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
              <li>Colonne "Nom de l'élève" (doit correspondre exactement aux noms)</li>
              <li>Colonne "Évaluation 1" (note sur 20)</li>
              <li>Colonne "Évaluation 2" (note sur 20)</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <button onClick={downloadTemplate} className="flex-1 border border-blue-500 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50">
              <FileSpreadsheet size={16}/> Télécharger le modèle
            </button>
            <label className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700">
              <Upload size={16}/> Choisir un fichier
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          
          {file && (
            <div className="border rounded-xl p-4">
              <p className="font-medium mb-2">📁 Fichier sélectionné : {file.name}</p>
              {preview.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        {Object.keys(preview[0]).map(key => (
                          <th key={key} className="p-2 border">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="p-2 border">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-400 mt-2">Aperçu des 5 premières lignes</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl">Annuler</button>
          <button onClick={processImport} disabled={!file || importing} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
            {importing ? "Import en cours..." : "Importer les notes"}
          </button>
        </div>
      </div>
    </div>
  );
}