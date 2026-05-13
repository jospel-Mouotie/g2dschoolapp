// app/enseignant/appel/page.tsx
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, Users, Search, Save, Download, Upload,
  X, CheckCircle, XCircle, AlertCircle, UserCheck, UserX,
  FileSpreadsheet, BookOpen, MapPin, Loader2, FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  present: boolean;
  justifiee: boolean;
  motif: string;
  parentEmail?: string;
  parentTelephone?: string;
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

// Modal d'import Excel
function ImportExcelModal({ onClose, onImport, elevesList, classe }: any) {
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
    const template = elevesList.map((e: any) => ({ "Nom de l'élève": e.nom }));
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appel");
    XLSX.writeFile(wb, `modele_appel_${classe}.xlsx`);
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

      const presentsNames = new Set();
      json.forEach((row: any) => {
        const nomEleve = row["Nom de l'élève"] || row["nom"] || row["Nom"];
        if (nomEleve) {
          presentsNames.add(nomEleve.trim());
        }
      });

      onImport(presentsNames);
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
            Importer une liste de présents
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-blue-700 mb-2">📋 Format attendu :</p>
            <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
              <li>Colonne "Nom de l'élève" (doit correspondre exactement)</li>
              <li>Seulement les élèves PRÉSENTS doivent être dans la liste</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={downloadTemplate} className="flex-1 border border-blue-500 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50">
              <FileSpreadsheet size={16} /> Télécharger le modèle
            </button>
            <label className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700">
              <Upload size={16} /> Choisir un fichier
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {file && preview.length > 0 && (
            <div className="border rounded-xl p-4">
              <p className="font-medium mb-2">📁 Aperçu :</p>
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
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl">Annuler</button>
          <button onClick={processImport} disabled={!file || importing} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
            {importing ? "Import en cours..." : "Importer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppelPage() {
  const { user, isTeacher, token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingEleves, setLoadingEleves] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [classesDisponibles, setClassesDisponibles] = useState<string[]>([]);
  const [selectedClasse, setSelectedClasse] = useState("");
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [selectedCours, setSelectedCours] = useState<Cours | null>(null);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [heureSeance, setHeureSeance] = useState("");

  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Récupérer les classes de l'enseignant
  useEffect(() => {
    const fetchEnseignantData = async () => {
      if (!token || !isTeacher || !user?.enseignantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = getAuthHeaders();
        const enseignantRes = await fetch(`/api/enseignants/${user.enseignantId}`, { headers });

        if (!enseignantRes.ok) throw new Error("Erreur chargement enseignant");

        const enseignant = await enseignantRes.json();
        const classes = parseJsonField(enseignant.classes);

        console.log("Classes de l'enseignant:", classes);
        setClassesDisponibles(classes);

        if (classes.length > 0 && !selectedClasse) {
          setSelectedClasse(classes[0]);
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchEnseignantData();
  }, [token, isTeacher, user, getAuthHeaders]);

  // Récupérer les élèves de la classe sélectionnée
  useEffect(() => {
    const fetchEleves = async () => {
      if (!selectedClasse || !token) return;

      try {
        setLoadingEleves(true);
        const headers = getAuthHeaders();
        const elevesRes = await fetch('/api/eleves', { headers });

        if (!elevesRes.ok) throw new Error("Erreur chargement élèves");

        const allEleves = await elevesRes.json();
        const elevesByClass = allEleves.filter((e: any) => e.classe === selectedClasse);

        console.log(`Élèves de la classe ${selectedClasse}:`, elevesByClass.length);

        const elevesWithPresence = elevesByClass.map((e: any) => ({
          id: e.id,
          nom: e.nom,
          classe: e.classe,
          present: true,
          justifiee: false,
          motif: "",
          parentEmail: e.parentEmail,
          parentTelephone: e.parentTelephone
        }));

        setEleves(elevesWithPresence);
        setSelectAll(true);
      } catch (err) {
        console.error("Erreur chargement élèves:", err);
        setError("Erreur de chargement des élèves");
      } finally {
        setLoadingEleves(false);
      }
    };

    fetchEleves();
  }, [selectedClasse, token, getAuthHeaders]);

  // Récupérer les cours de la classe sélectionnée
  useEffect(() => {
    const fetchCours = async () => {
      if (!selectedClasse || !token) return;

      try {
        const headers = getAuthHeaders();
        const coursRes = await fetch('/api/cours', { headers });

        if (!coursRes.ok) {
          throw new Error(`Erreur HTTP: ${coursRes.status}`);
        }

        const allCours = await coursRes.json();
        console.log("Tous les cours reçus:", allCours.length);

        const filteredCours = allCours.filter((c: Cours) => c.classe === selectedClasse);

        console.log(`Cours filtrés pour ${selectedClasse}:`, filteredCours.length);

        setCoursList(filteredCours);
        setSelectedCours(null);
        setHeureSeance("");
      } catch (err) {
        console.error("Erreur détaillée chargement cours:", err);
        setError("Erreur de chargement des cours");
      }
    };

    fetchCours();
  }, [selectedClasse, token, getAuthHeaders]);

  useEffect(() => {
    if (selectedCours) {
      setHeureSeance(selectedCours.heure);
    }
  }, [selectedCours]);

  const handlePresentToggle = (eleveId: number) => {
    setEleves(eleves.map(e =>
      e.id === eleveId ? { ...e, present: !e.present, justifiee: false } : e
    ));
  };

  const handleJustifieeToggle = (eleveId: number) => {
    setEleves(eleves.map(e =>
      e.id === eleveId ? { ...e, justifiee: !e.justifiee } : e
    ));
  };

  const handleMotifChange = (eleveId: number, motif: string) => {
    setEleves(eleves.map(e =>
      e.id === eleveId ? { ...e, motif } : e
    ));
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setEleves(eleves.map(e => ({ ...e, present: newSelectAll })));
  };

  const handleImportExcel = (presentsNames: Set<string>) => {
    const updatedEleves = eleves.map(eleve => ({
      ...eleve,
      present: presentsNames.has(eleve.nom),
      justifiee: false,
      motif: ""
    }));
    setEleves(updatedEleves);
    setSuccess(`✅ Import réussi ! ${presentsNames.size} présent(s)`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleExportExcel = () => {
    const exportData = eleves.map(e => ({
      "Nom de l'élève": e.nom,
      "Présent": e.present ? "OUI" : "NON",
      "Motif": e.motif || ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appel");
    XLSX.writeFile(wb, `appel_${selectedClasse}_${date}.xlsx`);
  };

  const handleSaveAppel = async () => {
    if (!selectedCours) {
      setError("Veuillez sélectionner un cours");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);

    try {
      const headers = getAuthHeaders();
      const heureActuelle = heureSeance || selectedCours.heure;
      const [heureDebut, heureFin] = heureActuelle.split('-');
      const dureeCours = selectedCours.duree || 2;

      const response = await fetch('/api/appel', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          coursId: selectedCours.id,
          date,
          heure: heureActuelle,
          duree: dureeCours,
          eleves: eleves.map(e => ({
            id: e.id,
            nom: e.nom,
            present: e.present,
            justifiee: e.justifiee,
            motif: e.motif,
            heureDebut,
            heureFin,
            duree: dureeCours
          }))
        })
      });

      if (response.ok) {
        const absentsCount = eleves.filter(e => !e.present).length;
        setSuccess(`✅ Appel enregistré ! ${absentsCount} absent(s) - ${absentsCount * dureeCours} heure(s) d'absence`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de l'enregistrement");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion");
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const filteredEleves = useMemo(() => {
    if (!searchTerm) return eleves;
    return eleves.filter(e => e.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [eleves, searchTerm]);

  const totalAbsents = eleves.filter(e => !e.present).length;
  const totalJustifies = eleves.filter(e => !e.present && e.justifiee).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isTeacher) return null;

  if (classesDisponibles.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aucune classe assignée</h2>
          <p className="text-slate-500">Contactez l'administrateur.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <UserCheck size={28} strokeWidth={1.8} />
            </div>
            Faire l'appel
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Enregistrez les présences et absences</p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/enseignants/absences')}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-purple-700 transition"
          >
            <FileText size={16} /> Voir les absences
          </button>
          <button onClick={handleExportExcel} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-green-100">
            <Download size={16} /> Exporter
          </button>
          <button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-100">
            <Upload size={16} /> Importer
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Classe</label>
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              {classesDisponibles.map((classe) => (
                <option key={classe} value={classe}>{classe}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cours</label>
            <select
              value={selectedCours?.id || ""}
              onChange={(e) => {
                const cours = coursList.find(c => c.id === e.target.value);
                setSelectedCours(cours || null);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              disabled={coursList.length === 0}
            >
              <option value="">Sélectionner un cours</option>
              {coursList.map((cours) => (
                <option key={cours.id} value={cours.id}>
                  {cours.matiere} - {cours.jour} ({cours.heure})
                </option>
              ))}
            </select>
            {coursList.length === 0 && selectedClasse && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Aucun cours programmé pour {selectedClasse}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {selectedCours && eleves.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600" />
                <span className="font-medium">{selectedCours.matiere}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <span>{selectedCours.heure}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                <span>Salle {selectedCours.salle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <span>{eleves.length} élèves</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des élèves */}
      {selectedCours && eleves.length > 0 && (
        <>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex gap-2">
              <button onClick={handleSelectAll} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-200">
                {selectAll ? <XCircle size={14} /> : <CheckCircle size={14} />}
                {selectAll ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border">
              <p className="text-2xl font-bold text-slate-800">{eleves.length}</p>
              <p className="text-xs text-slate-500">Total élèves</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border">
              <p className="text-2xl font-bold text-green-600">{eleves.length - totalAbsents}</p>
              <p className="text-xs text-slate-500">Présents</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border">
              <p className="text-2xl font-bold text-red-600">{totalAbsents}</p>
              <p className="text-xs text-slate-500">Absents ({totalJustifies} justifiés)</p>
            </div>
          </div>

          {/* Tableau des élèves */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-slate-500 text-[11px] font-bold uppercase">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded" />
                    </th>
                    <th className="px-4 py-3 text-left">Élève</th>
                    <th className="px-4 py-3 text-center w-24">Statut</th>
                    <th className="px-4 py-3 text-center w-24">Justifié</th>
                    <th className="px-4 py-3 text-left">Motif</th>
                    <th className="px-4 py-3 text-center w-24">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEleves ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      </td>
                    </tr>
                  ) : (
                    filteredEleves.map((eleve) => (
                      <tr key={eleve.id} className="hover:bg-slate-50 border-b">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={eleve.present}
                            onChange={() => handlePresentToggle(eleve.id)}
                            className="w-4 h-4 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{eleve.nom}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${eleve.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {eleve.present ? <UserCheck size={12} /> : <UserX size={12} />}
                            {eleve.present ? "Présent" : "Absent"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!eleve.present && (
                            <button
                              onClick={() => handleJustifieeToggle(eleve.id)}
                              className={`text-xs px-2 py-1 rounded ${eleve.justifiee ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            >
                              {eleve.justifiee ? "Justifié" : "Non justifié"}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {!eleve.present && (
                            <input
                              type="text"
                              value={eleve.motif}
                              onChange={(e) => handleMotifChange(eleve.id, e.target.value)}
                              placeholder="Motif de l'absence"
                              className="w-full px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {eleve.parentEmail && (
                            <span className="text-xs text-slate-400 cursor-help" title={eleve.parentEmail}>
                              📧
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bouton d'enregistrement */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveAppel}
              disabled={saving || !selectedCours}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Enregistrement..." : "Enregistrer l'appel"}
            </button>
          </div>
        </>
      )}

      {/* Message si aucun cours */}
      {selectedClasse && coursList.length === 0 && !loading && eleves.length > 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Aucun cours programmé pour {selectedClasse}</p>
          <p className="text-xs text-slate-400 mt-1">Veuillez contacter l'administrateur pour créer des cours.</p>
        </div>
      )}

      {/* Message si aucun élève */}
      {selectedClasse && eleves.length === 0 && !loadingEleves && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Aucun élève inscrit dans cette classe</p>
        </div>
      )}

      {/* Message si aucune classe sélectionnée */}
      {!selectedClasse && classesDisponibles.length > 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Sélectionnez une classe pour commencer</p>
        </div>
      )}

      {/* Modal d'import */}
      {showImportModal && (
        <ImportExcelModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportExcel}
          elevesList={eleves}
          classe={selectedClasse}
        />
      )}
    </div>
  );
}