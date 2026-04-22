// app/notes/page.tsx
"use client";
import { useState, useMemo, useRef } from "react";
import {
    FileText, Edit, Save, X, Download, Printer, Filter,
    TrendingUp, Award, BarChart3, Users,
    ChevronDown, CheckCircle, FileSpreadsheet, ChevronLeft, ChevronRight,
    ListChecks, Upload, FileSpreadsheet as ExcelIcon
} from "lucide-react";
import { useElevesStore, useNotesStore, useEnseignantsStore, useEtablissementStore, Eleve, Note } from "@/lib/stores";
import * as XLSX from "xlsx";

// Types
interface Matiere {
    id: string;
    nom: string;
    coefficient: number;
}

const matieres: Matiere[] = [
    { id: "maths", nom: "MATHÉMATIQUES", coefficient: 4 },
    { id: "francais", nom: "FRANÇAIS", coefficient: 3 },
    { id: "anglais", nom: "ANGLAIS", coefficient: 2 },
    { id: "histgeo", nom: "HISTOIRE-GÉOGRAPHIE", coefficient: 3 },
    { id: "physique", nom: "PHYSIQUE-CHIMIE", coefficient: 5 },
    { id: "info", nom: "INFORMATIQUE", coefficient: 2 },
    { id: "eps", nom: "EPS", coefficient: 2 },
    { id: "education", nom: "ÉDUCATION CIVIQUE", coefficient: 1 },
];

const periodes = ["1er TRIMESTRE", "2ème TRIMESTRE", "3ème TRIMESTRE", "EXAMEN FINAL"];
const ITEMS_PER_PAGE = 10;

function getAppreciation(note: number | null): string {
    if (note === null) return "Non évalué";
    if (note >= 16) return "Excellent";
    if (note >= 14) return "Très bien";
    if (note >= 12) return "Bien";
    if (note >= 10) return "Assez bien";
    if (note >= 8) return "Passable";
    return "Insuffisant";
}

function getElevePhoto(eleve: Eleve): string {
    if (eleve.photo && (eleve.photo.startsWith('http') || eleve.photo.startsWith('data:image'))) return eleve.photo;
    if (eleve.img && (eleve.img.startsWith('http') || eleve.img.startsWith('data:image'))) return eleve.img;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom)}&background=random&color=fff&size=100&rounded=true`;
}

function getProfesseurPrincipal(classe: string, enseignants: any[]): string {
    for (const ens of enseignants) {
        const enseignement = ens.enseignements?.find((e: any) => e.classe === classe && e.estPrincipal);
        if (enseignement) return ens.name;
    }
    return "Non attribué";
}

function calculerRang(eleveId: number, elevesList: Eleve[], allNotes: Record<string, Note[]>, periode: string, classe: string): number {
    const moyennes: { id: number; moyenne: number }[] = [];
    for (const e of elevesList) {
        let totalPoints = 0;
        let totalCoef = 0;
        for (const m of matieres) {
            const key = `${classe}_${m.id}_${periode}`;
            const notes = allNotes[key] || [];
            const note = notes.find((n: Note) => n.eleveId === e.id);
            if (note && note.valeur !== null) {
                totalPoints += note.valeur * m.coefficient;
                totalCoef += m.coefficient;
            }
        }
        const moyenne = totalCoef > 0 ? totalPoints / totalCoef : 0;
        moyennes.push({ id: e.id, moyenne });
    }
    moyennes.sort((a, b) => b.moyenne - a.moyenne);
    return moyennes.findIndex(m => m.id === eleveId) + 1;
}

function calculerMoyenneClasse(elevesList: Eleve[], allNotes: Record<string, Note[]>, periode: string, classe: string): number {
    let totalMoyennes = 0;
    let count = 0;
    for (const e of elevesList) {
        let totalPoints = 0;
        let totalCoef = 0;
        for (const m of matieres) {
            const key = `${classe}_${m.id}_${periode}`;
            const notes = allNotes[key] || [];
            const note = notes.find((n: Note) => n.eleveId === e.id);
            if (note && note.valeur !== null) {
                totalPoints += note.valeur * m.coefficient;
                totalCoef += m.coefficient;
            }
        }
        const moyenne = totalCoef > 0 ? totalPoints / totalCoef : 0;
        totalMoyennes += moyenne;
        count++;
    }
    return count > 0 ? totalMoyennes / count : 0;
}

// Bulletin Modal
function BulletinModal({ eleve, allNotes, classe, periode, onClose, elevesList, enseignants, etablissement }: any) {
    const matieresAvecNotes = useMemo(() => {
        return matieres.map(m => {
            const key = `${classe}_${m.id}_${periode}`;
            const notes = allNotes[key] || [];
            const noteData = notes.find((n: Note) => n.eleveId === eleve.id);
            return { 
                ...m, 
                moyenne: noteData?.valeur ?? null 
            };
        });
    }, [eleve.id, classe, periode, allNotes]);

    const professeurPrincipal = getProfesseurPrincipal(classe, enseignants);

    const resultats = useMemo(() => {
        let totalPoints = 0;
        let totalCoef = 0;
        matieresAvecNotes.forEach(m => { if (m.moyenne !== null) { totalPoints += m.moyenne * m.coefficient; totalCoef += m.coefficient; } });
        const moyenneGenerale = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : "N/A";
        const rang = calculerRang(eleve.id, elevesList, allNotes, periode, classe);
        const moyenneClasse = calculerMoyenneClasse(elevesList, allNotes, periode, classe);
        let meilleureMoyenne = 0, pireMoyenne = 20;
        for (const e of elevesList) {
            let total = 0, coef = 0;
            for (const m of matieres) {
                const key = `${classe}_${m.id}_${periode}`;
                const notes = allNotes[key] || [];
                const note = notes.find((n: Note) => n.eleveId === e.id);
                if (note && note.valeur !== null) { 
                    total += note.valeur * m.coefficient; 
                    coef += m.coefficient; 
                }
            }
            const moy = coef > 0 ? total / coef : 0;
            if (moy > meilleureMoyenne) meilleureMoyenne = moy;
            if (moy < pireMoyenne && moy > 0) pireMoyenne = moy;
        }
        return { moyenneGenerale, rang, moyenneClasse: moyenneClasse.toFixed(2), meilleureMoyenne: meilleureMoyenne.toFixed(2), pireMoyenne: pireMoyenne.toFixed(2), effectif: elevesList.length };
    }, [matieresAvecNotes, eleve.id, classe, periode, allNotes, elevesList]);

    const handlePrint = () => setTimeout(() => window.print(), 100);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl print:shadow-none print:max-h-none print:overflow-visible">
                <div className="p-6 print:p-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <div className="text-center border-b-2 border-black pb-4 mb-4">
                        <div className="flex justify-between items-start">
                            <div className="text-left text-xs leading-tight"><p className="font-bold">REPUBLIQUE DU CAMEROUN</p><p>Paix-Travail-Patrie</p></div>
                            <div className="text-center">
                                <p className="text-xs font-bold">MINISTERE DES ENSEIGNEMENTS SECONDAIRES</p>
                                <p className="text-xs">DELEGATION REGIONALE DU {etablissement?.region || "CENTRE"}</p>
                                <p className="text-xs">DELEGATION DEPARTEMENTALE DU {etablissement?.delegation || "MFOUNDI"}</p>
                                <p className="text-sm font-bold mt-1">{etablissement?.nom || "LYCEE GANALS"}</p>
                                <p className="text-xs">{etablissement?.adresse || "BP : 6500 Yaoundé"}</p>
                                <p className="text-xs">TEL : {etablissement?.telephone || "65268234 / 695789136"}</p>
                            </div>
                            <div className="text-right text-xs">
                                {etablissement?.logo ? <img src={etablissement.logo} className="w-16 h-16 object-contain" alt="Logo" /> : <div className="w-16 h-16 border border-black flex items-center justify-center text-[10px]">LOGO</div>}
                            </div>
                        </div>
                        <div className="text-center mt-3"><h2 className="text-lg font-bold uppercase">BULLETIN DE NOTES DU {periode}</h2><p className="text-xs text-slate-500 mt-1">Année scolaire {etablissement?.anneeScolaire || "2024/2025"}</p></div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4 border border-black p-3">
                        <div><span className="font-bold">Nom et Prénoms:</span> {eleve.nom.toUpperCase()}</div>
                        <div><span className="font-bold">Classe:</span> {classe}</div>
                        <div><span className="font-bold">Sexe:</span> {eleve.sexe === "M" ? "Masculin ☑ Féminin ☐" : "Masculin ☐ Féminin ☑"}</div>
                        <div><span className="font-bold">Effectif:</span> {resultats.effectif}</div>
                        <div><span className="font-bold">Né(e) le:</span> {eleve.dateNaissance || "—"}</div>
                        <div><span className="font-bold">Année scolaire:</span> {etablissement?.anneeScolaire || "2024/2025"}</div>
                        <div><span className="font-bold">Matricule:</span> {eleve.matricule || eleve.id.toString().padStart(6, '0')}</div>
                        <div><span className="font-bold">Statut:</span> Nouveau ☑ Redoublant ☐</div>
                        <div className="col-span-2"><span className="font-bold">Professeur principal:</span> {professeurPrincipal}</div>
                    </div>

                    <div className="overflow-x-auto mb-4">
                        <table className="w-full text-[10px] border border-black">
                            <thead><tr className="border-b border-black bg-gray-100"><th className="border-r border-black p-1 text-left w-40">MATIÈRES</th><th className="border-r border-black p-1 text-center w-14">Coef</th><th className="border-r border-black p-1 text-center w-14">Note</th><th className="border-r border-black p-1 text-center w-14">Total</th><th className="border-r border-black p-1 text-left">Appréciation</th></tr></thead>
                            <tbody>
                                {matieresAvecNotes.map((m, idx) => (
                                    <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="border-r border-black p-1 font-medium">{m.nom}</td>
                                        <td className="border-r border-black p-1 text-center">{m.coefficient}</td>
                                        <td className="border-r border-black p-1 text-center font-bold font-mono">{m.moyenne !== null ? m.moyenne.toFixed(2) : "—"}</td>
                                        <td className="border-r border-black p-1 text-center font-mono">{m.moyenne !== null ? (m.moyenne * m.coefficient).toFixed(2) : "—"}</td>
                                        <td className="border-r border-black p-1">{getAppreciation(m.moyenne)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot><tr className="border-t border-black bg-gray-100 font-bold"><td className="border-r border-black p-1">TOTAL GÉNÉRAL</td><td className="border-r border-black p-1 text-center">{matieres.reduce((sum, m) => sum + m.coefficient, 0)}</td><td colSpan={3} className="border-r border-black p-1 text-center">—</td><td className="p-1">{resultats.moyenneGenerale}/20</td></tr></tfoot>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border border-black p-2 text-center"><p className="font-bold">Moyenne générale</p><p className="text-xl font-bold">{resultats.moyenneGenerale}/20</p><p>Rang : {resultats.rang}e / {resultats.effectif}</p></div>
                        <div className="border border-black p-2 text-center"><p className="font-bold">Moyenne de la classe</p><p className="text-xl">{resultats.moyenneClasse}/20</p><p className="text-xs">Plus forte : {resultats.meilleureMoyenne} | Plus faible : {resultats.pireMoyenne}</p></div>
                    </div>

                    <div className="border border-black p-3 mb-4"><p className="font-bold text-sm">Appréciation du Professeur principal</p><p className="text-sm italic mt-1">{parseFloat(resultats.moyenneGenerale) >= 14 ? "Excellent trimestre. Félicitations !" : parseFloat(resultats.moyenneGenerale) >= 12 ? "Bon trimestre. Encouragements !" : parseFloat(resultats.moyenneGenerale) >= 10 ? "Trimestre correct. Des efforts supplémentaires sont nécessaires." : "Résultats insuffisants. Un travail plus régulier est requis."}</p></div>

                    <div className="flex justify-between items-end mt-4 pt-2"><div className="text-center"><div className="border-b border-black w-32 mb-1"></div><p className="text-[10px]">Visu du parent</p></div><div className="text-center"><div className="border-b border-black w-40 mb-1"></div><p className="text-[10px]">Observations et Visa du Chef d'Établissement</p></div></div>
                    <div className="text-center mt-4 pt-2 border-t border-black text-xs"><p>Yaoundé, le ____________________</p><p className="font-bold mt-1">Le proviseur</p></div>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t border-slate-200 print:hidden"><button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm hover:bg-slate-50">Fermer</button><button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 flex items-center gap-2"><Printer size={16} /> Imprimer</button></div>
            </div>
        </div>
    );
}

// Modal pour afficher tous les élèves
function AllStudentsModal({ eleves, onClose, getNoteData }: { eleves: Eleve[], onClose: () => void, getNoteData: (id: number) => { moyenne: number | null } }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold">Liste complète des élèves ({eleves.length})</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50">
                            <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b">
                                <th className="p-3 text-left">Élève</th>
                                <th className="p-3 text-left">Photo</th>
                                <th className="p-3 text-center">Note</th>
                                <th className="p-3 text-center">Appréciation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eleves.map((eleve: Eleve) => {
                                const notes = getNoteData(eleve.id);
                                return (
                                    <tr key={eleve.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-semibold">{eleve.nom}</td>
                                        <td className="p-3"><img src={getElevePhoto(eleve)} className="w-8 h-8 rounded-full object-cover" /></td>
                                        <td className="p-3 text-center font-bold">{notes.moyenne !== null ? notes.moyenne.toFixed(2) : "—"}</td>
                                        <td className="p-3 text-center">{getAppreciation(notes.moyenne)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Fermer</button>
                </div>
            </div>
        </div>
    );
}

// Modal pour l'import Excel
function ImportExcelModal({ onClose, onImport, elevesList, classe, matiere, periode }: any) {
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
            "Note": ""
        }));
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Notes");
        XLSX.writeFile(wb, `modele_notes_${classe}_${matiere}_${periode}.xlsx`);
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
                    let noteValue = row["Note"] || row["note"] || row["Moyenne"];
                    if (typeof noteValue === 'string') {
                        noteValue = parseFloat(noteValue);
                    }
                    if (typeof noteValue === 'number' && !isNaN(noteValue) && noteValue >= 0 && noteValue <= 20) {
                        notesMap.set(nomEleve, { valeur: noteValue });
                    }
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
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold">Importer des notes depuis Excel</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-sm text-blue-700 mb-2">📋 Format attendu :</p>
                        <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
                            <li>Colonne "Nom de l'élève" (doit correspondre exactement aux noms dans le système)</li>
                            <li>Colonne "Note" (note sur 20)</li>
                        </ul>
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={downloadTemplate} className="flex-1 border border-blue-500 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50">
                            <ExcelIcon size={16}/> Télécharger le modèle
                        </button>
                        <label className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700">
                            <Upload size={16}/> Choisir un fichier
                            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                    
                    {file && (
                        <div className="border rounded-xl p-4">
                            <p className="font-medium mb-2">Fichier sélectionné : {file.name}</p>
                            {preview.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-50">
                                            <tr>{Object.keys(preview[0]).map(key => <th key={key} className="p-2 border">{key}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {preview.map((row, idx) => (
                                                <tr key={idx}>{Object.values(row).map((val: any, i) => <td key={i} className="p-2 border">{val}</td>)}</tr>
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

// PAGE PRINCIPALE
export default function NotesPage() {
    const [eleves] = useElevesStore();
    const [enseignants] = useEnseignantsStore();
    const [etablissement] = useEtablissementStore();
    const [allNotes, setAllNotes] = useNotesStore();
    const [classe, setClasse] = useState("6A");
    const [matiere, setMatiere] = useState("maths");
    const [periode, setPeriode] = useState("1er TRIMESTRE");
    const [editMode, setEditMode] = useState(false);
    const [bulletinEleve, setBulletinEleve] = useState<Eleve | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllStudents, setShowAllStudents] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const classesDisponibles = useMemo(() => Array.from(new Set(eleves.map(e => e.classe))).sort(), [eleves]);
    const elevesFiltres = useMemo(() => eleves.filter(e => e.classe === classe), [eleves, classe]);
    const notesKey = `${classe}_${matiere}_${periode}`;
    const currentNotes = useMemo(() => allNotes[notesKey] || [], [allNotes, notesKey]);

    const totalPages = Math.ceil(elevesFiltres.length / ITEMS_PER_PAGE);
    const paginatedEleves = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return elevesFiltres.slice(start, start + ITEMS_PER_PAGE);
    }, [elevesFiltres, currentPage]);

    const getNoteData = (eleveId: number) => {
        const found = currentNotes.find((n: Note) => n.eleveId === eleveId);
        return { moyenne: found?.valeur ?? null };
    };

    const updateNotes = (eleveId: number, valeur: number | null) => {
        const existing = currentNotes.find((n: Note) => n.eleveId === eleveId);
        let newNotes;
        if (existing) {
            newNotes = currentNotes.map((n: Note) => 
                n.eleveId === eleveId ? { ...n, valeur, appreciation: getAppreciation(valeur) } : n
            );
        } else {
            newNotes = [...currentNotes, { eleveId, valeur, appreciation: getAppreciation(valeur) }];
        }
        setAllNotes({ ...allNotes, [notesKey]: newNotes });
    };

    const importNotes = (notesMap: Map<string, { valeur: number }>) => {
        const updatedNotes = [...currentNotes];
        for (const eleve of elevesFiltres) {
            const imported = notesMap.get(eleve.nom);
            if (imported && imported.valeur !== undefined) {
                const valeur = typeof imported.valeur === 'string' ? parseFloat(imported.valeur) : imported.valeur;
                if (!isNaN(valeur) && valeur >= 0 && valeur <= 20) {
                    const existingIndex = updatedNotes.findIndex(n => n.eleveId === eleve.id);
                    if (existingIndex >= 0) {
                        updatedNotes[existingIndex] = { ...updatedNotes[existingIndex], valeur, appreciation: getAppreciation(valeur) };
                    } else {
                        updatedNotes.push({ eleveId: eleve.id, valeur, appreciation: getAppreciation(valeur) });
                    }
                }
            }
        }
        setAllNotes({ ...allNotes, [notesKey]: updatedNotes });
    };

    const stats = useMemo(() => {
        const valeurs = currentNotes.filter((n: Note) => n.valeur !== null).map((n: Note) => n.valeur as number);
        if (valeurs.length === 0) return { moyenne: 0, tauxReussite: 0, meilleure: 0, pire: 20, ecartType: 0 };
        const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
        const tauxReussite = (valeurs.filter(v => v >= 10).length / valeurs.length) * 100;
        const meilleure = Math.max(...valeurs);
        const pire = Math.min(...valeurs);
        const variance = valeurs.map(v => Math.pow(v - moyenne, 2)).reduce((a, b) => a + b, 0) / valeurs.length;
        const ecartType = Math.sqrt(variance);
        return { moyenne: moyenne.toFixed(1), tauxReussite: tauxReussite.toFixed(0), meilleure, pire, ecartType: ecartType.toFixed(1) };
    }, [currentNotes]);

    const distribution = useMemo(() => {
        const bins = [0, 5, 10, 12, 14, 16, 18, 20];
        const counts = bins.map(() => 0);
        currentNotes.forEach((n: Note) => { 
            if (n.valeur !== null) { 
                for (let i = 0; i < bins.length - 1; i++) { 
                    if (n.valeur >= bins[i] && n.valeur < bins[i + 1]) { 
                        counts[i]++; 
                        break; 
                    } else if (n.valeur >= bins[bins.length - 1]) counts[bins.length - 1]++; 
                } 
            } 
        });
        return { bins, counts };
    }, [currentNotes]);

    const exportCSV = () => {
        const headers = ["Élève", "Note", "Appréciation"];
        const rows = elevesFiltres.map(e => { const notes = getNoteData(e.id); return [e.nom, notes.moyenne ?? "", getAppreciation(notes.moyenne)]; });
        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `notes_${classe}_${matiere}_${periode}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen print:p-2 print:bg-white">
            {/* EN-TÊTE */}
            <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3"><div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600"><FileText size={28} strokeWidth={1.8} /></div>Gestion des Notes</h1><p className="text-sm text-slate-500 mt-1 ml-14">Saisie, suivi et analyse des performances</p></div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={() => setShowImportModal(true)} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 flex items-center gap-2"><Upload size={18}/> Importer Excel</button>
                    <button onClick={exportCSV} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"><Download size={18} /></button>
                    <button onClick={() => window.print()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"><Printer size={18} /></button>
                    <button onClick={() => setEditMode(!editMode)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${editMode ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-blue-600 text-white shadow-md shadow-blue-200'}`}>{editMode ? <Save size={16} /> : <Edit size={16} />}{editMode ? "Enregistrer" : "Modifier les notes"}</button>
                </div>
            </div>

            {/* FILTRES */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classe</label><select value={classe} onChange={e => setClasse(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">{classesDisponibles.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matière</label><select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">{matieres.map(m => <option key={m.id} value={m.id}>{m.nom} (coeff. {m.coefficient})</option>)}</select></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Période</label><select value={periode} onChange={e => setPeriode(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">{periodes.map(p => <option key={p}>{p}</option>)}</select></div>
                    <div className="flex items-end"><button className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-2"><Filter size={16} /> Appliquer</button></div>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 print:hidden">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"><div className="flex justify-between"><span className="text-slate-400 text-xs">Moyenne</span><TrendingUp className="text-blue-500" size={18} /></div><p className="text-2xl font-bold mt-1">{stats.moyenne}/20</p><p className="text-[10px] text-slate-400">Coefficient {matieres.find(m => m.id === matiere)?.coefficient}</p></div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"><div className="flex justify-between"><span className="text-slate-400 text-xs">Taux réussite</span><Award className="text-emerald-500" size={18} /></div><p className="text-2xl font-bold mt-1">{stats.tauxReussite}%</p><p className="text-[10px] text-slate-400">Notes ≥ 10/20</p></div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"><div className="flex justify-between"><span className="text-slate-400 text-xs">Meilleure / Pire</span><BarChart3 className="text-purple-500" size={18} /></div><p className="text-2xl font-bold mt-1">{stats.meilleure} / {stats.pire}</p><p className="text-[10px] text-slate-400">Écart-type {stats.ecartType}</p></div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"><div className="flex justify-between"><span className="text-slate-400 text-xs">Effectif</span><Users className="text-indigo-500" size={18} /></div><p className="text-2xl font-bold mt-1">{elevesFiltres.length}</p><p className="text-[10px] text-slate-400">élèves évalués</p></div>
            </div>

            {/* TABLEAU AVEC PAGINATION */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm table-fixed">
                        <colgroup><col className="w-1/4" /><col className="w-1/5" /><col className="w-1/5" /><col className="w-1/5" /></colgroup>
                        <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider"><th className="px-4 py-3 text-left">Élève</th><th className="px-4 py-3 text-left">Photo</th><th className="px-4 py-3 text-center">Note /20</th><th className="px-4 py-3 text-center">Appréciation</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedEleves.map((eleve: Eleve) => {
                                const notes = getNoteData(eleve.id);
                                return (
                                    <tr key={eleve.id} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 font-semibold text-slate-700 truncate">{eleve.nom}</td>
                                        <td className="px-4 py-3"><img src={getElevePhoto(eleve)} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" /></td>
                                        <td className="px-4 py-3 text-center">
                                            {editMode ? 
                                                <input type="number" step="0.5" min="0" max="20" value={notes.moyenne ?? ""} onChange={e => updateNotes(eleve.id, parseFloat(e.target.value))} className="w-20 p-1.5 border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-blue-200" /> : 
                                                <span className="font-mono font-bold">{notes.moyenne !== null ? notes.moyenne.toFixed(2) : "—"}</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">{getAppreciation(notes.moyenne)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* PAGINATION ET BOUTONS */}
                {elevesFiltres.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-between items-center p-4 border-t bg-slate-50/30">
                        <div className="text-sm text-slate-500">
                            Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, elevesFiltres.length)} sur {elevesFiltres.length} élèves
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={18} /></button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = currentPage;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    if (pageNum > 0 && pageNum <= totalPages) {
                                        return (
                                            <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={18} /></button>
                            <button onClick={() => setShowAllStudents(true)} className="ml-4 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-2">
                                <ListChecks size={16} /> Voir tous les élèves
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4"><BarChart3 size={18} /> Distribution des notes</h3><div className="space-y-2">{distribution.bins.slice(0, -1).map((bin, idx) => { const count = distribution.counts[idx]; const percent = elevesFiltres.length ? (count / elevesFiltres.length * 100).toFixed(0) : 0; return (<div key={idx}><div className="flex justify-between text-xs text-slate-500 mb-0.5"><span>{bin}-{distribution.bins[idx + 1]}</span><span>{count} élève(s) ({percent}%)</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div></div></div>); })}</div></div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4"><Award size={18} /> Répartition par mention</h3><div className="grid grid-cols-2 gap-3"><div className="bg-emerald-50 p-3 rounded-xl"><p className="text-[10px] text-emerald-600 font-bold">Excellent (≥16)</p><p className="text-2xl font-bold text-emerald-700">{currentNotes.filter((n: Note) => n.valeur && n.valeur >= 16).length}</p></div><div className="bg-blue-50 p-3 rounded-xl"><p className="text-[10px] text-blue-600 font-bold">Bien (14-15.9)</p><p className="text-2xl font-bold text-blue-700">{currentNotes.filter((n: Note) => n.valeur && n.valeur >= 14 && n.valeur < 16).length}</p></div><div className="bg-amber-50 p-3 rounded-xl"><p className="text-[10px] text-amber-600 font-bold">Assez bien (12-13.9)</p><p className="text-2xl font-bold text-amber-700">{currentNotes.filter((n: Note) => n.valeur && n.valeur >= 12 && n.valeur < 14).length}</p></div><div className="bg-red-50 p-3 rounded-xl"><p className="text-[10px] text-red-600 font-bold">Insuffisant (&lt;10)</p><p className="text-2xl font-bold text-red-700">{currentNotes.filter((n: Note) => n.valeur && n.valeur < 10).length}</p></div></div></div>
            </div>

            {/* MODALS */}
            {bulletinEleve && <BulletinModal eleve={bulletinEleve} allNotes={allNotes} classe={classe} periode={periode} elevesList={elevesFiltres} enseignants={enseignants} etablissement={etablissement} onClose={() => setBulletinEleve(null)} />}
            {showAllStudents && <AllStudentsModal eleves={elevesFiltres} onClose={() => setShowAllStudents(false)} getNoteData={getNoteData} />}
            {showImportModal && <ImportExcelModal onClose={() => setShowImportModal(false)} onImport={importNotes} elevesList={elevesFiltres} classe={classe} matiere={matieres.find(m => m.id === matiere)?.nom} periode={periode} />}
        </div>
    );
}