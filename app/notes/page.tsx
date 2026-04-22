// app/notes/page.tsx (version complète avec import Excel)
"use client";
import { useState, useMemo } from "react";
import {
  FileText, Edit, Save, Download, Printer, Filter,
  TrendingUp, Award, BarChart3, Users,
  CheckCircle, FileSpreadsheet, MessageCircle, Mail,
  Send, X, Phone, ChevronDown, ChevronRight, Eye,
  Bell, Share2, Search, AlertCircle, Calendar,
  GraduationCap, BookOpen, UserCheck, Upload, FileSpreadsheet as ExcelIcon
} from "lucide-react";
import {
  useElevesStore, useNotesStore, useEnseignantsStore,
  useEtablissementStore, Eleve
} from "@/lib/stores";
import * as XLSX from "xlsx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
}

interface NoteComplete {
  eleveId: number;
  eval1: number | null;
  eval2: number | null;
  moyenne: number | null;
  appreciation?: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const matieres: Matiere[] = [
  { id: "maths",     nom: "MATHÉMATIQUES",     coefficient: 4 },
  { id: "francais",  nom: "FRANÇAIS",           coefficient: 3 },
  { id: "anglais",   nom: "ANGLAIS",            coefficient: 2 },
  { id: "histgeo",   nom: "HISTOIRE-GÉOGRAPHIE",coefficient: 3 },
  { id: "physique",  nom: "PHYSIQUE-CHIMIE",    coefficient: 5 },
  { id: "info",      nom: "INFORMATIQUE",       coefficient: 2 },
  { id: "eps",       nom: "EPS",                coefficient: 2 },
  { id: "education", nom: "ÉDUCATION CIVIQUE",  coefficient: 1 },
];

const periodes = [
  "1er TRIMESTRE", "2ème TRIMESTRE", "3ème TRIMESTRE", "EXAMEN FINAL"
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function calculerMoyenne(e1: number | null, e2: number | null): number | null {
  if (e1 !== null && e2 !== null) return (e1 + e2) / 2;
  if (e1 !== null) return e1;
  if (e2 !== null) return e2;
  return null;
}

function getAppreciation(note: number | null): string {
  if (note === null) return "Non évalué";
  if (note >= 16) return "Excellent";
  if (note >= 14) return "Très bien";
  if (note >= 12) return "Bien";
  if (note >= 10) return "Assez bien";
  if (note >= 8)  return "Passable";
  return "Insuffisant";
}

function getMentionColor(note: number | null): string {
  if (note === null) return "text-slate-400";
  if (note >= 16) return "text-emerald-600";
  if (note >= 14) return "text-emerald-500";
  if (note >= 12) return "text-blue-600";
  if (note >= 10) return "text-blue-500";
  if (note >= 8)  return "text-amber-600";
  return "text-red-500";
}

function getMentionBg(note: number | null): string {
  if (note === null) return "bg-slate-100 text-slate-500";
  if (note >= 16) return "bg-emerald-100 text-emerald-700";
  if (note >= 14) return "bg-emerald-50 text-emerald-700";
  if (note >= 12) return "bg-blue-100 text-blue-700";
  if (note >= 10) return "bg-blue-50 text-blue-700";
  if (note >= 8)  return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

function getElevePhoto(eleve: Eleve): string {
  if (eleve.photo?.startsWith("http") || eleve.photo?.startsWith("data:image")) return eleve.photo;
  if (eleve.img?.startsWith("http")   || eleve.img?.startsWith("data:image"))   return eleve.img;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom)}&background=random&color=fff&size=100&rounded=true`;
}

function getProfesseurPrincipal(classe: string, enseignants: any[]): string {
  for (const ens of enseignants) {
    const found = ens.enseignements?.find((e: any) => e.classe === classe && e.estPrincipal);
    if (found) return ens.name;
  }
  return "Non attribué";
}

function calculerMoyenneGeneraleEleve(
  eleveId: number,
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string
): number {
  let total = 0, coef = 0;
  for (const m of matieres) {
    const key = `${classe}_${m.id}_${periode}`;
    const note = (allNotes[key] || []).find((n) => n.eleveId === eleveId)?.moyenne ?? null;
    if (note !== null) { total += note * m.coefficient; coef += m.coefficient; }
  }
  return coef > 0 ? total / coef : 0;
}

function calculerRang(
  eleveId: number,
  elevesList: Eleve[],
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string
): number {
  const moyennes = elevesList.map((e) => ({
    id: e.id,
    moyenne: calculerMoyenneGeneraleEleve(e.id, allNotes, periode, classe),
  }));
  moyennes.sort((a, b) => b.moyenne - a.moyenne);
  return moyennes.findIndex((m) => m.id === eleveId) + 1;
}

function calculerMoyenneClasse(
  elevesList: Eleve[],
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string
): number {
  const moyennes = elevesList.map((e) =>
    calculerMoyenneGeneraleEleve(e.id, allNotes, periode, classe)
  );
  return moyennes.length ? moyennes.reduce((a, b) => a + b, 0) / moyennes.length : 0;
}

// ─── Construction du message à envoyer au parent ──────────────────────────────

function buildMessageParent(
  eleve: Eleve,
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string,
  elevesList: Eleve[],
  etablissement: any
): { whatsapp: string; emailSubject: string; emailBody: string } {
  const moy = calculerMoyenneGeneraleEleve(eleve.id, allNotes, periode, classe);
  const rang = calculerRang(eleve.id, elevesList, allNotes, periode, classe);
  const apprecGeneral = getAppreciation(moy > 0 ? moy : null);
  const nomEtab = etablissement?.nom || "L'établissement";
  const annee   = etablissement?.anneeScolaire || "2024/2025";

  let lignesNotes = "";
  for (const m of matieres) {
    const key  = `${classe}_${m.id}_${periode}`;
    const note = (allNotes[key] || []).find((n) => n.eleveId === eleve.id);
    const val  = note?.moyenne !== null && note?.moyenne !== undefined
      ? `${note.moyenne.toFixed(2)}/20 (${getAppreciation(note.moyenne)})`
      : "—";
    lignesNotes += `  • ${m.nom} (coeff. ${m.coefficient}) : ${val}\n`;
  }

  const apprec =
    moy >= 14 ? "🏆 Félicitations pour ces excellents résultats ! Continuez ainsi."
    : moy >= 12 ? "👍 Bons résultats. Encouragements pour maintenir cette dynamique."
    : moy >= 10 ? "📚 Résultats corrects. Des efforts supplémentaires sont souhaitables."
    : "⚠️ Résultats insuffisants. Une amélioration significative est requise.";

  const wa = `📊 *BULLETIN DE NOTES - ${periode}*\n\n`
    + `🏫 ${nomEtab} | 📅 ${annee}\n`
    + `👨‍🎓 *Élève :* ${eleve.nom}\n`
    + `📚 *Classe :* ${classe} | 👥 Effectif : ${elevesList.length}\n\n`
    + `*📈 RÉSULTATS GLOBAUX*\n`
    + `├─ Moyenne générale : *${moy > 0 ? moy.toFixed(2) : "—"}/20*\n`
    + `├─ Rang : *${rang}/${elevesList.length}*\n`
    + `└─ Appréciation : *${apprecGeneral}*\n\n`
    + `*📖 DÉTAIL PAR MATIÈRE*\n${lignesNotes}\n`
    + `*💬 APPRÉCIATION*\n${apprec}\n\n`
    + `_${nomEtab} – ${annee}_`;

  const emailSubject = `📊 Bulletin de notes - ${eleve.nom} - ${periode} - ${annee}`;
  const emailBody =
    `Cher(e) parent / tuteur de ${eleve.nom},\n\n`
    + `Veuillez trouver ci-dessous le relevé de notes de votre enfant pour le ${periode} `
    + `de l'année scolaire ${annee}.\n\n`
    + `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    + `🏫 Établissement : ${nomEtab}\n`
    + `📚 Classe : ${classe} | 👥 Effectif : ${elevesList.length} élèves\n`
    + `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    + `📈 RÉSULTATS GLOBAUX\n`
    + `─────────────────\n`
    + `Moyenne générale : ${moy > 0 ? moy.toFixed(2) : "—"}/20\n`
    + `Rang             : ${rang} sur ${elevesList.length}\n`
    + `Appréciation     : ${apprecGeneral}\n\n`
    + `📖 DÉTAIL PAR MATIÈRE\n`
    + `──────────────────\n`
    + lignesNotes + "\n"
    + `💬 APPRÉCIATION DU PROFESSEUR PRINCIPAL\n`
    + `─────────────────────────────────────\n`
    + `${apprec}\n\n`
    + `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    + `Cordialement,\nLa Direction de ${nomEtab}`;

  return { whatsapp: wa, emailSubject, emailBody };
}

// ─── Modal d'import Excel ─────────────────────────────────────────────────────

function ImportExcelModal({ onClose, onImport, elevesList, classe, matiereNom, periode }: any) {
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
    XLSX.writeFile(wb, `modele_notes_${classe}_${matiereNom}_${periode}.xlsx`);
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
            <ExcelIcon size={20} className="text-green-600" />
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
              <ExcelIcon size={16}/> Télécharger le modèle
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

// ─── Modal d'envoi (amélioré) ─────────────────────────────────────────────────

function EnvoiParentModal({
  eleve,
  allNotes,
  classe,
  periode,
  elevesList,
  etablissement,
  onClose,
}: {
  eleve: Eleve;
  allNotes: Record<string, NoteComplete[]>;
  classe: string;
  periode: string;
  elevesList: Eleve[];
  etablissement: any;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"whatsapp" | "email">("whatsapp");
  const [phone, setPhone]   = useState(eleve.parentTelephone || "");
  const [email, setEmail]   = useState(eleve.parentEmail     || "");
  const [sent,  setSent]    = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const msgs = useMemo(
    () => buildMessageParent(eleve, allNotes, periode, classe, elevesList, etablissement),
    [eleve, allNotes, periode, classe, elevesList, etablissement]
  );

  const handleWhatsApp = () => {
    const num   = phone.replace(/\s/g, "").replace(/^\+/, "");
    const url   = `https://wa.me/${num}?text=${encodeURIComponent(msgs.whatsapp)}`;
    window.open(url, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const handleEmail = () => {
    const url = `mailto:${email}?subject=${encodeURIComponent(msgs.emailSubject)}&body=${encodeURIComponent(msgs.emailBody)}`;
    window.open(url, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                <img src={getElevePhoto(eleve)} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <p className="font-bold text-xl leading-tight">{eleve.nom}</p>
                <p className="text-blue-200 text-sm flex items-center gap-2 mt-0.5">
                  <GraduationCap size={14} /> {classe} · {periode}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Infos parent */}
          <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 mb-5 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UserCheck size={14} /> Coordonnées du parent
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1">
                  <Phone size={12} /> Téléphone parent
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1">
                  <Mail size={12} /> Email parent
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@exemple.cm"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("whatsapp")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "whatsapp"
                  ? "bg-green-500 text-white shadow-md shadow-green-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "email"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Mail size={16} />
              Email
            </button>
          </div>

          {/* Aperçu du message */}
          <div className="relative">
            {tab === "whatsapp" ? (
              <div className="bg-[#ECE5DD] rounded-2xl p-4 min-h-[200px] max-h-[280px] overflow-y-auto">
                <div className="bg-white rounded-xl rounded-tl-none p-3 max-w-[95%] shadow-sm">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {msgs.whatsapp}
                  </pre>
                  <p className="text-[10px] text-slate-400 text-right mt-2 border-t pt-1">Aperçu du message</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[200px] max-h-[280px] overflow-y-auto">
                <div className="bg-white rounded-lg p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Mail size={12} /> Objet : {msgs.emailSubject}
                  </p>
                  <hr className="border-slate-200 mb-2" />
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {msgs.emailBody}
                  </pre>
                </div>
              </div>
            )}

            {/* Bouton copier */}
            <button
              onClick={() => copyToClipboard(tab === "whatsapp" ? msgs.whatsapp : msgs.emailBody)}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-medium transition shadow-sm"
            >
              {copySuccess ? "✅ Copié !" : "📋 Copier"}
            </button>
          </div>

          {/* Confirmation d'envoi */}
          {sent && (
            <div className="flex items-center gap-2 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm animate-in fade-in">
              <CheckCircle size={16} />
              Message prêt à être envoyé !
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
              Annuler
            </button>
            {tab === "whatsapp" ? (
              <button
                onClick={handleWhatsApp}
                disabled={!phone}
                className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-green-200"
              >
                <MessageCircle size={16} />
                Envoyer via WhatsApp
              </button>
            ) : (
              <button
                onClick={handleEmail}
                disabled={!email}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                <Mail size={16} />
                Envoyer par Email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bulletin Modal ───────────────────────────────────────────────────────────

function BulletinModal({
  eleve, allNotes, classe, periode, onClose, elevesList, enseignants, etablissement,
}: any) {
  // ... (conserver le même code que précédemment)
  // Pour éviter la répétition, je garde la version existante
  const matieresAvecNotes = useMemo(() => {
    return matieres.map((m) => {
      const key      = `${classe}_${m.id}_${periode}`;
      const notes    = allNotes[key] || [];
      const noteData = notes.find((n: NoteComplete) => n.eleveId === eleve.id);
      return { ...m, eval1: noteData?.eval1 ?? null, eval2: noteData?.eval2 ?? null, moyenne: noteData?.moyenne ?? null };
    });
  }, [eleve.id, classe, periode, allNotes]);

  const professeurPrincipal = getProfesseurPrincipal(classe, enseignants);

  const resultats = useMemo(() => {
    let totalPoints = 0, totalCoef = 0;
    matieresAvecNotes.forEach((m) => {
      if (m.moyenne !== null) { totalPoints += m.moyenne * m.coefficient; totalCoef += m.coefficient; }
    });
    const moyenneGenerale = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : "N/A";
    const rang = calculerRang(eleve.id, elevesList, allNotes, periode, classe);
    const moyenneClasse = calculerMoyenneClasse(elevesList, allNotes, periode, classe);

    let best = 0, worst = 20;
    for (const e of elevesList) {
      const moy = calculerMoyenneGeneraleEleve(e.id, allNotes, periode, classe);
      if (moy > best) best = moy;
      if (moy < worst && moy > 0) worst = moy;
    }
    return {
      moyenneGenerale, rang,
      moyenneClasse: moyenneClasse.toFixed(2),
      meilleureMoyenne: best.toFixed(2),
      pireMoyenne: worst.toFixed(2),
      effectif: elevesList.length,
    };
  }, [matieresAvecNotes, eleve.id, classe, periode, allNotes, elevesList]);

  const handlePrint = () => setTimeout(() => window.print(), 100);

  const matieresReussies = matieresAvecNotes.filter(m => m.moyenne !== null && m.moyenne >= 10).length;
  const tauxReussite = matieresAvecNotes.filter(m => m.moyenne !== null).length > 0
    ? Math.round((matieresReussies / matieresAvecNotes.filter(m => m.moyenne !== null).length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl print:shadow-none print:max-h-none print:overflow-visible">
        <div className="p-6 print:p-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          {/* EN-TÊTE OFFICIEL */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div className="text-left text-xs leading-tight">
                <p className="font-bold">REPUBLIQUE DU CAMEROUN</p>
                <p>Paix-Travail-Patrie</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold">MINISTERE DES ENSEIGNEMENTS SECONDAIRES</p>
                <p className="text-xs">DELEGATION REGIONALE DU {etablissement?.region || "CENTRE"}</p>
                <p className="text-xs">DELEGATION DEPARTEMENTALE DU {etablissement?.delegation || "MFOUNDI"}</p>
                <p className="text-sm font-bold mt-1">{etablissement?.nom || "LYCEE GANALS"}</p>
                <p className="text-xs">{etablissement?.adresse || "BP : 6500 Yaoundé"}</p>
                <p className="text-xs">TEL : {etablissement?.telephone || "65268234 / 695789136"}</p>
              </div>
              <div className="text-right text-xs">
                {etablissement?.logo ? (
                  <img src={etablissement.logo} className="w-16 h-16 object-contain" alt="Logo" />
                ) : (
                  <div className="w-16 h-16 border border-black flex items-center justify-center text-[10px]">LOGO</div>
                )}
              </div>
            </div>
            <div className="text-center mt-3">
              <h2 className="text-lg font-bold uppercase">BULLETIN DE NOTES DU {periode}</h2>
              <p className="text-xs text-slate-500 mt-1">Année scolaire {etablissement?.anneeScolaire || "2024/2025"}</p>
            </div>
          </div>

          {/* INFOS ÉLÈVE */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4 border border-black p-3">
            <div><span className="font-bold">Nom et Prénoms:</span> {eleve.nom.toUpperCase()}</div>
            <div><span className="font-bold">Classe:</span> {classe}</div>
            <div><span className="font-bold">Sexe:</span> {eleve.sexe === "M" ? "Masculin ☑ Féminin ☐" : "Masculin ☐ Féminin ☑"}</div>
            <div><span className="font-bold">Effectif:</span> {resultats.effectif}</div>
            <div><span className="font-bold">Né(e) le:</span> {eleve.dateNaissance || "—"}</div>
            <div><span className="font-bold">Année scolaire:</span> {etablissement?.anneeScolaire || "2024/2025"}</div>
            <div><span className="font-bold">Matricule:</span> {eleve.matricule || eleve.id.toString().padStart(6, "0")}</div>
            <div><span className="font-bold">Statut:</span> Nouveau ☑ Redoublant ☐</div>
            <div className="col-span-2"><span className="font-bold">Professeur principal:</span> {professeurPrincipal}</div>
          </div>

          {/* SYNTHÈSE VISUELLE */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
              <p className="text-[10px] text-blue-600 font-bold">MOYENNE</p>
              <p className="text-xl font-bold text-blue-700">{resultats.moyenneGenerale}/20</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-bold">RANG</p>
              <p className="text-xl font-bold text-emerald-700">{resultats.rang}e / {resultats.effectif}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-100">
              <p className="text-[10px] text-amber-600 font-bold">RÉUSSITE</p>
              <p className="text-xl font-bold text-amber-700">{tauxReussite}%</p>
            </div>
          </div>

          {/* TABLEAU */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-[10px] border border-black">
              <thead>
                <tr className="border-b border-black bg-gray-100">
                  <th className="border-r border-black p-1 text-left w-40">MATIÈRES</th>
                  <th className="border-r border-black p-1 text-center w-14">Coef</th>
                  <th className="border-r border-black p-1 text-center w-14">Éval.1</th>
                  <th className="border-r border-black p-1 text-center w-14">Éval.2</th>
                  <th className="border-r border-black p-1 text-center w-14">Moyenne</th>
                  <th className="border-r border-black p-1 text-center w-14">Total</th>
                  <th className="border-r border-black p-1 text-left">Appréciation</th>
                </tr>
              </thead>
              <tbody>
                {matieresAvecNotes.map((m, idx) => (
                  <tr key={m.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-r border-black p-1 font-medium">{m.nom}</td>
                    <td className="border-r border-black p-1 text-center">{m.coefficient}</td>
                    <td className="border-r border-black p-1 text-center font-mono">{m.eval1 !== null ? m.eval1.toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1 text-center font-mono">{m.eval2 !== null ? m.eval2.toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1 text-center font-bold font-mono">{m.moyenne !== null ? m.moyenne.toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1 text-center font-mono">{m.moyenne !== null ? (m.moyenne * m.coefficient).toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1">{getAppreciation(m.moyenne)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black bg-gray-100 font-bold">
                  <td className="border-r border-black p-1">TOTAL GÉNÉRAL</td>
                  <td className="border-r border-black p-1 text-center">{matieres.reduce((s, m) => s + m.coefficient, 0)}</td>
                  <td colSpan={4} className="border-r border-black p-1 text-center">—</td>
                  <td className="p-1">{resultats.moyenneGenerale}/20</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* COMPARAISON CLASSE */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-black p-2 text-center">
              <p className="font-bold text-[9px]">Moyenne de la classe</p>
              <p className="text-lg font-bold">{resultats.moyenneClasse}/20</p>
            </div>
            <div className="border border-black p-2 text-center">
              <p className="font-bold text-[9px]">Meilleure / Pire</p>
              <p className="text-base font-bold">{resultats.meilleureMoyenne} / {resultats.pireMoyenne}</p>
            </div>
          </div>

          {/* APPRÉCIATION */}
          <div className="border border-black p-3 mb-4">
            <p className="font-bold text-sm">Appréciation du Professeur principal</p>
            <p className="text-sm italic mt-1">
              {parseFloat(resultats.moyenneGenerale) >= 14
                ? "🏆 Excellent trimestre. Félicitations pour ce très bon travail !"
                : parseFloat(resultats.moyenneGenerale) >= 12
                ? "👍 Bon trimestre. Encouragements à maintenir cette dynamique."
                : parseFloat(resultats.moyenneGenerale) >= 10
                ? "📚 Trimestre correct. Des efforts supplémentaires sont nécessaires."
                : "⚠️ Résultats insuffisants. Un travail plus régulier est requis."}
            </p>
          </div>

          {/* SIGNATURES */}
          <div className="flex justify-between items-end mt-4 pt-2">
            <div className="text-center"><div className="border-b border-black w-32 mb-1"></div><p className="text-[10px]">Visu du parent</p></div>
            <div className="text-center"><div className="border-b border-black w-40 mb-1"></div><p className="text-[10px]">Observations et Visa du Chef d'Établissement</p></div>
          </div>
          <div className="text-center mt-4 pt-2 border-t border-black text-xs">
            <p>Yaoundé, le ____________________</p>
            <p className="font-bold mt-1">Le proviseur</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 print:hidden">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm hover:bg-slate-50">
            Fermer
          </button>
          <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 flex items-center gap-2">
            <Printer size={16} /> Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function NotesPage() {
  const [eleves]       = useElevesStore();
  const [enseignants]  = useEnseignantsStore();
  const [etablissement] = useEtablissementStore();
  const [allNotes, setAllNotes] = useNotesStore();

  const [classe,   setClasse]   = useState("6A");
  const [matiere,  setMatiere]  = useState("maths");
  const [periode,  setPeriode]  = useState("1er TRIMESTRE");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  const [bulletinEleve, setBulletinEleve] = useState<Eleve | null>(null);
  const [envoiEleve,    setEnvoiEleve]    = useState<Eleve | null>(null);

  const classesDisponibles = useMemo(
    () => Array.from(new Set(eleves.map((e) => e.classe))).sort(),
    [eleves]
  );
  
  const elevesFiltres = useMemo(
    () => eleves.filter((e) => e.classe === classe),
    [eleves, classe]
  );

  const elevesRecherche = useMemo(
    () => elevesFiltres.filter((e) => 
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [elevesFiltres, searchTerm]
  );
  const notesKey     = `${classe}_${matiere}_${periode}`;
  const currentNotes = useMemo(() => allNotes[notesKey] || [], [allNotes, notesKey]);

  const getNoteData = (eleveId: number) => {
    const found = currentNotes.find((n: NoteComplete) => n.eleveId === eleveId);
    return { eval1: found?.eval1 ?? null, eval2: found?.eval2 ?? null, moyenne: found?.moyenne ?? null };
  };

  const updateNotes = (eleveId: number, eval1: number | null, eval2: number | null) => {
    const moyenne = calculerMoyenne(eval1, eval2);
    const appreciation = getAppreciation(moyenne);
    const existing = currentNotes.find((n: NoteComplete) => n.eleveId === eleveId);
    const newNotes = existing
      ? currentNotes.map((n: NoteComplete) => n.eleveId === eleveId ? { ...n, eval1, eval2, moyenne, appreciation } : n)
      : [...currentNotes, { eleveId, eval1, eval2, moyenne, appreciation }];
    setAllNotes({ ...allNotes, [notesKey]: newNotes });
  };

  const importNotes = (notesMap: Map<string, { eval1: number | null, eval2: number | null }>) => {
    const updatedNotes = [...currentNotes];
    for (const eleve of elevesFiltres) {
      const imported = notesMap.get(eleve.nom);
      if (imported && (imported.eval1 !== undefined || imported.eval2 !== undefined)) {
        const eval1 = imported.eval1 !== undefined ? imported.eval1 : null;
        const eval2 = imported.eval2 !== undefined ? imported.eval2 : null;
        const moyenne = calculerMoyenne(eval1, eval2);
        const appreciation = getAppreciation(moyenne);
        const existingIndex = updatedNotes.findIndex(n => n.eleveId === eleve.id);
        if (existingIndex >= 0) {
          updatedNotes[existingIndex] = { ...updatedNotes[existingIndex], eval1, eval2, moyenne, appreciation };
        } else {
          updatedNotes.push({ eleveId: eleve.id, eval1, eval2, moyenne, appreciation });
        }
      }
    }
    setAllNotes({ ...allNotes, [notesKey]: updatedNotes });
  };

  const stats = useMemo(() => {
    const moyennes = currentNotes
      .filter((n: NoteComplete) => n.moyenne !== null)
      .map((n: NoteComplete) => n.moyenne as number);
    if (!moyennes.length) return { moyenne: 0, tauxReussite: 0, meilleure: 0, pire: 20, ecartType: 0 };
    const moyenne       = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
    const tauxReussite  = (moyennes.filter((v) => v >= 10).length / moyennes.length) * 100;
    const variance      = moyennes.map((v) => Math.pow(v - moyenne, 2)).reduce((a, b) => a + b, 0) / moyennes.length;
    return {
      moyenne: moyenne.toFixed(1),
      tauxReussite: tauxReussite.toFixed(0),
      meilleure: Math.max(...moyennes),
      pire: Math.min(...moyennes),
      ecartType: Math.sqrt(variance).toFixed(1),
    };
  }, [currentNotes]);

  const exportCSV = () => {
    const headers = ["Élève", "Éval.1", "Éval.2", "Moyenne", "Appréciation"];
    const rows = elevesFiltres.map((e) => {
      const n = getNoteData(e.id);
      return [e.nom, n.eval1 ?? "", n.eval2 ?? "", n.moyenne ?? "", getAppreciation(n.moyenne)];
    });
    const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `notes_${classe}_${matiere}_${periode}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const envoyerTousParents = () => {
    const first = elevesFiltres.find((e) => e.parentTelephone || e.parentEmail);
    if (first) setEnvoiEleve(first);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen print:p-2 print:bg-white">

      {/* ── EN-TÊTE ── */}
      <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <FileText size={28} strokeWidth={1.8} />
            </div>
            Gestion des Notes
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Saisie, suivi, analyse et communication aux parents</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Bouton Import Excel */}
          <button 
            onClick={() => setShowImportModal(true)} 
            className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-2 text-sm font-medium"
          >
            <ExcelIcon size={16} /> Importer Excel
          </button>
          <button onClick={exportCSV} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition" title="Exporter CSV">
            <Download size={18} />
          </button>
          <button onClick={() => window.print()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition" title="Imprimer">
            <Printer size={18} />
          </button>
          <button
            onClick={envoyerTousParents}
            className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-green-600 transition shadow-sm shadow-green-200"
            title="Envoyer les résultats à tous les parents"
          >
            <Bell size={16} />
            <span className="hidden md:inline">Notifier les parents</span>
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              editMode
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "bg-blue-600 text-white shadow-md shadow-blue-200"
            }`}
          >
            {editMode ? <Save size={16} /> : <Edit size={16} />}
            {editMode ? "Enregistrer" : "Modifier les notes"}
          </button>
        </div>
      </div>

      {/* ── FILTRES AVEC RECHERCHE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <GraduationCap size={12} /> Classe
            </label>
            <select value={classe} onChange={(e) => setClasse(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200">
              {classesDisponibles.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <BookOpen size={12} /> Matière
            </label>
            <select value={matiere} onChange={(e) => setMatiere(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200">
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom} (coeff. {m.coefficient})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Calendar size={12} /> Période
            </label>
            <select value={periode} onChange={(e) => setPeriode(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200">
              {periodes.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Search size={12} /> Rechercher
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nom, matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Filter size={12} />
            <span>{elevesRecherche.length} élève(s) · {periode}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Phone size={11} className="text-green-500" /> {elevesFiltres.filter(e => e.parentTelephone).length} contacts WhatsApp</span>
            <span className="flex items-center gap-1"><Mail size={11} className="text-blue-500" /> {elevesFiltres.filter(e => e.parentEmail).length} emails</span>
          </div>
        </div>
      </div>

      {/* ── STATISTIQUES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        {[
          { label: "Moyenne", value: `${stats.moyenne}/20`, sub: `Coeff ${matieres.find((m) => m.id === matiere)?.coefficient}`, icon: <TrendingUp className="text-blue-500" size={18} />, bg: "bg-blue-50" },
          { label: "Taux réussite", value: `${stats.tauxReussite}%`, sub: "Notes ≥ 10/20", icon: <Award className="text-emerald-500" size={18} />, bg: "bg-emerald-50" },
          { label: "Meilleure / Pire", value: `${stats.meilleure} / ${stats.pire}`, sub: `Écart-type ${stats.ecartType}`, icon: <BarChart3 className="text-purple-500" size={18} />, bg: "bg-purple-50" },
          { label: "Effectif", value: `${elevesFiltres.length}`, sub: "élèves de la classe", icon: <Users className="text-indigo-500" size={18} />, bg: "bg-indigo-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-medium">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.bg}`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── TABLEAU DES NOTES ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-bold text-slate-700 text-sm">
            Notes — {matieres.find((m) => m.id === matiere)?.nom} · {classe} · {periode}
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {currentNotes.length} note(s) saisie(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Élève</th>
                <th className="px-3 py-3 text-left">Photo</th>
                <th className="px-4 py-3 text-center">Éval.1 /20</th>
                <th className="px-4 py-3 text-center">Éval.2 /20</th>
                <th className="px-4 py-3 text-center">Moyenne</th>
                <th className="px-4 py-3 text-center">Appréciation</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {elevesRecherche.map((eleve: Eleve) => {
                const notes = getNoteData(eleve.id);
                const hasParentContact = eleve.parentTelephone || eleve.parentEmail;
                return (
                  <tr key={eleve.id} className="hover:bg-slate-50/60 transition group">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-700">{eleve.nom}</p>
                        {eleve.parentNom && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <UserCheck size={10} /> Parent : {eleve.parentNom}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <img src={getElevePhoto(eleve)} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editMode ? (
                        <input
                          type="number" step="0.5" min="0" max="20"
                          value={notes.eval1 ?? ""}
                          onChange={(e) => updateNotes(eleve.id, e.target.value ? parseFloat(e.target.value) : null, notes.eval2)}
                          className="w-20 p-1.5 border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">{notes.eval1 !== null ? notes.eval1.toFixed(2) : "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editMode ? (
                        <input
                          type="number" step="0.5" min="0" max="20"
                          value={notes.eval2 ?? ""}
                          onChange={(e) => updateNotes(eleve.id, notes.eval1, e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-20 p-1.5 border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">{notes.eval2 !== null ? notes.eval2.toFixed(2) : "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {notes.moyenne !== null ? (
                        <span className={`font-bold font-mono text-base ${getMentionColor(notes.moyenne)}`}>
                          {notes.moyenne.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getMentionBg(notes.moyenne)}`}>
                        {getAppreciation(notes.moyenne)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setBulletinEleve(eleve)}
                          title="Voir le bulletin"
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        >
                          <FileSpreadsheet size={15} />
                        </button>
                        <button
                          onClick={() => setEnvoiEleve(eleve)}
                          title="Envoyer au parent"
                          className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                            hasParentContact
                              ? "bg-green-50 text-green-600 hover:bg-green-100"
                              : "bg-slate-50 text-slate-400 cursor-not-allowed"
                          }`}
                          disabled={!hasParentContact}
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {elevesRecherche.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun élève trouvé</p>
            <p className="text-xs mt-1">Vérifiez les filtres ou la recherche</p>
          </div>
        )}
      </div>

      {/* ── GRAPHIQUES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:hidden">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
            <BarChart3 size={17} className="text-blue-500" /> Distribution des notes
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "0 – 4",  min: 0,  max: 5  },
              { label: "5 – 9",  min: 5,  max: 10 },
              { label: "10 – 11",min: 10, max: 12 },
              { label: "12 – 13",min: 12, max: 14 },
              { label: "14 – 15",min: 14, max: 16 },
              { label: "16 – 20",min: 16, max: 21 },
            ].map(({ label, min, max }) => {
              const count   = currentNotes.filter((n: NoteComplete) => n.moyenne !== null && (n.moyenne as number) >= min && (n.moyenne as number) < max).length;
              const percent = elevesFiltres.length ? Math.round((count / elevesFiltres.length) * 100) : 0;
              const barColor = min >= 14 ? "bg-emerald-500" : min >= 10 ? "bg-blue-500" : min >= 8 ? "bg-amber-400" : "bg-red-400";
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="font-medium">{label}</span>
                    <span>{count} élève(s) · {percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Award size={17} className="text-amber-500" /> Répartition par mention
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Excellent (≥16)", min: 16, max: 21, bg: "bg-emerald-50", text: "text-emerald-700" },
              { label: "Très bien (14–15.9)", min: 14, max: 16, bg: "bg-blue-50", text: "text-blue-700" },
              { label: "Assez bien (10–13.9)", min: 10, max: 14, bg: "bg-amber-50", text: "text-amber-700" },
              { label: "Insuffisant (<10)", min: 0, max: 10, bg: "bg-red-50", text: "text-red-700" },
            ].map(({ label, min, max, bg, text }) => {
              const count = currentNotes.filter((n: NoteComplete) => n.moyenne !== null && (n.moyenne as number) >= min && (n.moyenne as number) < max).length;
              return (
                <div key={label} className={`${bg} rounded-xl p-3 border`}>
                  <p className={`text-[10px] font-bold ${text} mb-1`}>{label}</p>
                  <p className={`text-2xl font-bold ${text}`}>{count}</p>
                </div>
              );
            })}
          </div>

          {/* Résumé communication */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <Share2 size={12} /> Communication parents
            </p>
            <div className="flex gap-3 text-xs text-slate-500 mb-3">
              <div className="flex items-center gap-1">
                <Phone size={11} className="text-green-500" />
                <span>{elevesFiltres.filter((e) => e.parentTelephone).length} téléphones</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail size={11} className="text-blue-500" />
                <span>{elevesFiltres.filter((e) => e.parentEmail).length} emails</span>
              </div>
            </div>
            <button
              onClick={envoyerTousParents}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Bell size={12} /> Notifier les parents ({elevesFiltres.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {bulletinEleve && (
        <BulletinModal
          eleve={bulletinEleve}
          allNotes={allNotes}
          classe={classe}
          periode={periode}
          elevesList={elevesFiltres}
          enseignants={enseignants}
          etablissement={etablissement}
          onClose={() => setBulletinEleve(null)}
        />
      )}

      {envoiEleve && (
        <EnvoiParentModal
          eleve={envoiEleve}
          allNotes={allNotes}
          classe={classe}
          periode={periode}
          elevesList={elevesFiltres}
          etablissement={etablissement}
          onClose={() => setEnvoiEleve(null)}
        />
      )}

      {showImportModal && (
        <ImportExcelModal
          onClose={() => setShowImportModal(false)}
          onImport={importNotes}
          elevesList={elevesFiltres}
          classe={classe}
          matiereNom={matieres.find(m => m.id === matiere)?.nom}
          periode={periode}
        />
      )}
    </div>
  );
}