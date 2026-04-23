// app/notes/page.tsx
"use client";
import { useState, useMemo } from "react";
import {
  FileText, Edit, Save, Download, Printer, Filter,
  TrendingUp, Award, BarChart3, Users,
  CheckCircle, FileSpreadsheet, MessageCircle, Mail,
  Send, X, Phone, ChevronDown, ChevronRight, Eye,
  Bell, Share2, Search, AlertCircle, Calendar,
  GraduationCap, BookOpen, UserCheck, Upload, FileSpreadsheet as ExcelIcon,
  SendHorizontal, Users as UsersIcon
} from "lucide-react";
import {
  useElevesStore, useNotesStore, useEnseignantsStore,
  useEtablissementStore, useCoursStore, Eleve, Etablissement
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

// ─── Construction du message pour une matière spécifique ──────────────────────

function buildMessageMatiere(
  eleve: Eleve,
  note: { eval1: number | null; eval2: number | null; moyenne: number | null },
  matiereNom: string,
  coefficient: number,
  periode: string,
  classe: string,
  etablissement: Etablissement
): { whatsapp: string; emailSubject: string; emailBody: string } {
  const appreciation = getAppreciation(note.moyenne);
  const nomEtab = etablissement?.nom || "Établissement Scolaire";
  const annee = etablissement?.anneeScolaire || "2024/2025";
  const adresse = etablissement?.adresse || "";
  const telephone = etablissement?.telephone || "";
  const emailEtab = etablissement?.email || "";
  const logoUrl = etablissement?.logo || "";

  const wa = `📊 *NOTE - ${matiereNom.toUpperCase()}*\n\n`
    + `🏫 *${nomEtab}*\n`
    + `📅 Année scolaire : ${annee}\n`
    + `📍 ${adresse}\n`
    + `📞 ${telephone}\n\n`
    + `👨‍🎓 *Élève :* ${eleve.nom}\n`
    + `📚 *Classe :* ${classe}\n`
    + `📖 *Matière :* ${matiereNom} (coeff. ${coefficient})\n\n`
    + `*📝 RÉSULTATS*\n`
    + `├─ Évaluation 1 : ${note.eval1 !== null ? note.eval1.toFixed(2) + '/20' : 'Non évalué'}\n`
    + `├─ Évaluation 2 : ${note.eval2 !== null ? note.eval2.toFixed(2) + '/20' : 'Non évalué'}\n`
    + `└─ *Moyenne : ${note.moyenne !== null ? note.moyenne.toFixed(2) + '/20' : 'Non évalué'}*\n\n`
    + `*🏆 Appréciation :* ${appreciation}\n\n`
    + `---\n`
    + `_${nomEtab} - ${annee}_\n`
    + `📧 ${emailEtab}`;

  const emailSubject = `📊 Note de ${matiereNom} - ${eleve.nom} - ${periode} - ${annee}`;
  
  const emailBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { max-width: 80px; margin-bottom: 10px; }
    .school-name { color: white; font-size: 24px; font-weight: bold; margin: 0; }
    .school-info { color: #e0e7ff; font-size: 12px; margin-top: 5px; }
    .content { background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; }
    .student-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6; }
    .results { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .result-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .result-label { font-weight: bold; color: #4b5563; }
    .result-value { font-weight: bold; }
    .appreciation { background: #dbeafe; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center; }
    .footer { text-align: center; font-size: 11px; color: #6b7280; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    .good { color: #10b981; }
    .low { color: #ef4444; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
      <h1 class="school-name">${nomEtab}</h1>
      <p class="school-info">${adresse} | 📞 ${telephone} | 📧 ${emailEtab}</p>
    </div>
    <div class="content">
      <h2 style="color: #1e3a8a; margin-top: 0;">📊 Bulletin de notes - ${periode}</h2>
      <p style="color: #6b7280;">Année scolaire ${annee}</p>
      
      <div class="student-info">
        <h3 style="margin: 0 0 10px 0; color: #1e3a8a;">👨‍🎓 Informations de l'élève</h3>
        <p><strong>Nom :</strong> ${eleve.nom}</p>
        <p><strong>Classe :</strong> ${classe}</p>
        <p><strong>Matière :</strong> ${matiereNom} (coefficient ${coefficient})</p>
      </div>
      
      <div class="results">
        <h3 style="margin: 0 0 15px 0; color: #1e3a8a;">📝 Résultats</h3>
        <div class="result-item">
          <span class="result-label">📌 Évaluation 1 :</span>
          <span class="result-value">${note.eval1 !== null ? note.eval1.toFixed(2) + '/20' : 'Non évalué'}</span>
        </div>
        <div class="result-item">
          <span class="result-label">📌 Évaluation 2 :</span>
          <span class="result-value">${note.eval2 !== null ? note.eval2.toFixed(2) + '/20' : 'Non évalué'}</span>
        </div>
        <div class="result-item" style="border-bottom: none; font-size: 1.1em;">
          <span class="result-label">⭐ Moyenne :</span>
          <span class="result-value ${note.moyenne !== null ? (note.moyenne >= 10 ? 'good' : 'low') : ''}">
            ${note.moyenne !== null ? note.moyenne.toFixed(2) + '/20' : 'Non évalué'}
          </span>
        </div>
      </div>
      
      <div class="appreciation">
        <strong>🏆 Appréciation :</strong> ${appreciation}
      </div>
      
      <div class="footer">
        <p>${nomEtab} - Excellence & Innovation</p>
        <p>${adresse} | 📞 ${telephone} | 📧 ${emailEtab}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { whatsapp: wa, emailSubject, emailBody };
}

// ─── Construction du message pour le bulletin complet ────────────────────────

function buildMessageBulletin(
  eleve: Eleve,
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string,
  elevesList: Eleve[],
  etablissement: Etablissement,
  enseignants: any[]
): { whatsapp: string; emailSubject: string; emailBody: string } {
  const moy = calculerMoyenneGeneraleEleve(eleve.id, allNotes, periode, classe);
  const rang = calculerRang(eleve.id, elevesList, allNotes, periode, classe);
  const apprecGeneral = getAppreciation(moy > 0 ? moy : null);
  const nomEtab = etablissement?.nom || "Établissement Scolaire";
  const annee = etablissement?.anneeScolaire || "2024/2025";
  const adresse = etablissement?.adresse || "";
  const telephone = etablissement?.telephone || "";
  const emailEtab = etablissement?.email || "";
  const region = etablissement?.region || "";
  const delegation = etablissement?.delegation || "";
  const logoUrl = etablissement?.logo || "";
  const professeurPrincipal = getProfesseurPrincipal(classe, enseignants);

  let lignesNotes = "";
  for (const m of matieres) {
    const key = `${classe}_${m.id}_${periode}`;
    const note = (allNotes[key] || []).find((n) => n.eleveId === eleve.id);
    const val = note?.moyenne !== null && note?.moyenne !== undefined
      ? `${note.moyenne.toFixed(2)}/20 (${getAppreciation(note.moyenne)})`
      : "—";
    lignesNotes += `  • ${m.nom} (coeff. ${m.coefficient}) : ${val}\n`;
  }

  const apprec = moy >= 14 
    ? "🏆 Félicitations pour ces excellents résultats ! Continuez ainsi."
    : moy >= 12 
    ? "👍 Bons résultats. Encouragements pour maintenir cette dynamique."
    : moy >= 10 
    ? "📚 Résultats corrects. Des efforts supplémentaires sont souhaitables."
    : "⚠️ Résultats insuffisants. Une amélioration significative est requise.";

  const wa = `📊 *BULLETIN DE NOTES - ${periode}*\n\n`
    + `🏫 *${nomEtab}*\n`
    + `📅 Année scolaire : ${annee}\n`
    + `📍 ${adresse}\n`
    + `📞 ${telephone}\n\n`
    + `👨‍🎓 *Élève :* ${eleve.nom}\n`
    + `📚 *Classe :* ${classe} | 👥 Effectif : ${elevesList.length}\n`
    + `👨‍🏫 *Professeur principal :* ${professeurPrincipal}\n\n`
    + `*📈 RÉSULTATS GLOBAUX*\n`
    + `├─ Moyenne générale : *${moy > 0 ? moy.toFixed(2) : "—"}/20*\n`
    + `├─ Rang : *${rang}/${elevesList.length}*\n`
    + `└─ Appréciation : *${apprecGeneral}*\n\n`
    + `*📖 DÉTAIL PAR MATIÈRE*\n${lignesNotes}\n`
    + `*💬 APPRÉCIATION*\n${apprec}\n\n`
    + `---\n`
    + `_${nomEtab} - ${annee}_\n`
    + `📧 ${emailEtab}`;

  const emailSubject = `📊 Bulletin de notes - ${eleve.nom} - ${periode} - ${annee}`;
  
  let matieresHtml = "";
  for (const m of matieres) {
    const key = `${classe}_${m.id}_${periode}`;
    const note = (allNotes[key] || []).find((n) => n.eleveId === eleve.id);
    const eval1 = note?.eval1 !== null ? note?.eval1.toFixed(2) : "—";
    const eval2 = note?.eval2 !== null ? note?.eval2.toFixed(2) : "—";
    const moyenne = note?.moyenne !== null ? note?.moyenne.toFixed(2) : "—";
    const appreciation = getAppreciation(note?.moyenne ?? null);
    const noteClass = (note?.moyenne ?? 0) >= 10 ? 'good' : (note?.moyenne ?? 0) >= 8 ? 'average' : 'low';
    
    matieresHtml += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.nom}</td>
        <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${m.coefficient}</td>
        <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${eval1}</td>
        <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${eval2}</td>
        <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;" class="${noteClass}"><strong>${moyenne}</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${appreciation}</td>
      </tr>
    `;
  }

  const emailBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { max-width: 80px; margin-bottom: 10px; }
    .school-name { color: white; font-size: 24px; font-weight: bold; margin: 0; }
    .school-info { color: #e0e7ff; font-size: 12px; margin-top: 5px; }
    .content { background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; }
    .student-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6; }
    .summary { display: flex; gap: 15px; margin-bottom: 20px; }
    .summary-card { flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center; }
    .summary-card h4 { margin: 0 0 5px 0; color: #6b7280; font-size: 12px; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #1e3a8a; }
    .results-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    .results-table th { background: #1e3a8a; color: white; padding: 10px; text-align: left; font-size: 12px; }
    .results-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .appreciation { background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center; }
    .footer { text-align: center; font-size: 11px; color: #6b7280; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    .good { color: #10b981; }
    .average { color: #f59e0b; }
    .low { color: #ef4444; }
    .signatures { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #e5e7eb; }
    .signature { text-align: center; }
    .signature-line { width: 150px; border-top: 1px solid #333; margin-top: 30px; }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto;">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
      <h1 class="school-name">${nomEtab}</h1>
      <p class="school-info">${adresse} | 📞 ${telephone} | 📧 ${emailEtab}</p>
      <p class="school-info">${region} - ${delegation}</p>
    </div>
    <div class="content">
      <h2 style="color: #1e3a8a; margin-top: 0; text-align: center;">📊 BULLETIN DE NOTES - ${periode}</h2>
      <p style="text-align: center; color: #6b7280;">Année scolaire ${annee}</p>
      
      <div class="student-info">
        <h3 style="margin: 0 0 10px 0; color: #1e3a8a;">👨‍🎓 INFORMATIONS DE L'ÉLÈVE</h3>
        <p><strong>Nom et prénoms :</strong> ${eleve.nom.toUpperCase()}</p>
        <p><strong>Classe :</strong> ${classe} | <strong>Effectif :</strong> ${elevesList.length} élèves</p>
        <p><strong>Matricule :</strong> ${eleve.matricule || eleve.id.toString().padStart(6, '0')}</p>
        <p><strong>Date de naissance :</strong> ${eleve.dateNaissance || "—"}</p>
        <p><strong>Professeur principal :</strong> ${professeurPrincipal}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card">
          <h4>📈 MOYENNE GÉNÉRALE</h4>
          <div class="value ${moy >= 10 ? 'good' : 'low'}">${moy > 0 ? moy.toFixed(2) : "—"}/20</div>
        </div>
        <div class="summary-card">
          <h4>🏆 RANG</h4>
          <div class="value">${rang}e / ${elevesList.length}</div>
        </div>
        <div class="summary-card">
          <h4>⭐ APPRÉCIATION</h4>
          <div class="value" style="font-size: 14px;">${apprecGeneral}</div>
        </div>
      </div>
      
      <h3 style="color: #1e3a8a;">📖 DÉTAIL PAR MATIÈRE</h3>
      <table class="results-table">
        <thead>
          <tr>
            <th>MATIÈRES</th>
            <th>Coef</th>
            <th>Éval.1</th>
            <th>Éval.2</th>
            <th>Moyenne</th>
            <th>Appréciation</th>
          </tr>
        </thead>
        <tbody>
          ${matieresHtml}
        </tbody>
        <tfoot>
          <tr style="background: #f3f4f6;">
            <td colspan="4" style="padding: 10px; text-align: right;"><strong>TOTAL GÉNÉRAL</strong></td>
            <td style="padding: 10px; text-align: center;"><strong>${moy > 0 ? moy.toFixed(2) : "—"}/20</strong></td>
            <td style="padding: 10px;"></td>
          </tr>
        </tfoot>
      </table>
      
      <div class="appreciation">
        <strong>💬 APPRÉCIATION DU PROFESSEUR PRINCIPAL</strong><br>
        ${apprec}
      </div>
      
      <div class="signatures">
        <div class="signature">
          <div class="signature-line"></div>
          <p style="font-size: 10px; margin-top: 5px;">Visu du parent</p>
        </div>
        <div class="signature">
          <div class="signature-line"></div>
          <p style="font-size: 10px; margin-top: 5px;">Visa du Chef d'Établissement</p>
        </div>
      </div>
      
      <div class="footer">
        <p>${nomEtab} - Excellence & Innovation</p>
        <p>${adresse} | 📞 ${telephone} | 📧 ${emailEtab}</p>
        <p>© ${new Date().getFullYear()} ${nomEtab} - Tous droits réservés</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { whatsapp: wa, emailSubject, emailBody };
}

// ─── Modal d'envoi (unifié) ───────────────────────────────────────────────────

function EnvoiModal({
  eleve,
  allNotes,
  classe,
  periode,
  elevesList,
  etablissement,
  enseignants,
  matiereCourante,
  noteMatiere,
  onClose,
}: {
  eleve: Eleve;
  allNotes: Record<string, NoteComplete[]>;
  classe: string;
  periode: string;
  elevesList: Eleve[];
  etablissement: Etablissement;
  enseignants: any[];
  matiereCourante?: { nom: string; coefficient: number };
  noteMatiere?: { eval1: number | null; eval2: number | null; moyenne: number | null };
  onClose: () => void;
}) {
  const [typeEnvoi, setTypeEnvoi] = useState<"matiere" | "bulletin">("matiere");
  const [phone, setPhone] = useState(eleve.parentTelephone || "");
  const [email, setEmail] = useState(eleve.parentEmail || "");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const msgMatiere = useMemo(() => {
    if (!matiereCourante || !noteMatiere) return null;
    return buildMessageMatiere(
      eleve, noteMatiere, matiereCourante.nom, matiereCourante.coefficient,
      periode, classe, etablissement
    );
  }, [eleve, noteMatiere, matiereCourante, periode, classe, etablissement]);

  const msgBulletin = useMemo(() => {
    return buildMessageBulletin(
      eleve, allNotes, periode, classe, elevesList, etablissement, enseignants
    );
  }, [eleve, allNotes, periode, classe, elevesList, etablissement, enseignants]);

  const currentMsg = typeEnvoi === "matiere" ? msgMatiere : msgBulletin;

  const handleWhatsApp = () => {
    if (!phone) {
      setErrorMsg("Veuillez saisir le numéro de téléphone du parent");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (!currentMsg) {
      setErrorMsg("Aucun message à envoyer");
      return;
    }

    let numero = phone.replace(/\s/g, '').replace(/^0+/, '');
    if (!numero.startsWith('237') && !numero.startsWith('+237')) {
      numero = '237' + numero;
    }
    if (!numero.startsWith('+')) {
      numero = '+' + numero;
    }

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(currentMsg.whatsapp)}`;
    window.open(url, '_blank');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSend = async () => {
    if (!email) {
      setErrorMsg("Veuillez saisir l'email du parent");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (!currentMsg) {
      setErrorMsg("Aucun message à envoyer");
      return;
    }

    setSending(true);
    setErrorMsg("");

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: currentMsg.emailSubject,
          html: currentMsg.emailBody,
          text: currentMsg.emailBody.replace(/<[^>]*>/g, '')
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setErrorMsg(data.error || "Erreur lors de l'envoi");
        setTimeout(() => setErrorMsg(""), 5000);
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Erreur de connexion");
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
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
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type d'envoi</p>
            <div className="flex gap-2">
              <button
                onClick={() => setTypeEnvoi("matiere")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  typeEnvoi === "matiere"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <BookOpen size={16} />
                Note de {matiereCourante?.nom || "la matière"}
              </button>
              <button
                onClick={() => setTypeEnvoi("bulletin")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  typeEnvoi === "bulletin"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FileSpreadsheet size={16} />
                Bulletin complet
              </button>
            </div>
          </div>

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

          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aperçu du message</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[200px] overflow-y-auto">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans">
                {currentMsg?.emailBody ? (
                  <>
                    {currentMsg.emailBody.substring(0, 500)}
                    {currentMsg.emailBody.length > 500 && "..."}
                  </>
                ) : "Aucun message à afficher"}
              </pre>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-700 text-sm">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm">
              <CheckCircle size={16} />
              Message envoyé avec succès !
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
              Annuler
            </button>
            <button
              onClick={handleWhatsApp}
              disabled={!phone || sending}
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-green-200"
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>
            <button
              onClick={handleSend}
              disabled={!email || sending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              {sending ? "Envoi..." : "Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal d'envoi groupé ─────────────────────────────────────────────────────

function EnvoiGroupeModal({
  eleves,
  allNotes,
  classe,
  periode,
  etablissement,
  enseignants,
  matiereCourante,
  onClose,
}: {
  eleves: Eleve[];
  allNotes: Record<string, NoteComplete[]>;
  classe: string;
  periode: string;
  etablissement: Etablissement;
  enseignants: any[];
  matiereCourante?: { nom: string; coefficient: number };
  onClose: () => void;
}) {
  const [typeEnvoi, setTypeEnvoi] = useState<"matiere" | "bulletin">("matiere");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ success: number; total: number }>({ success: 0, total: 0 });

  const elevesAvecContact = eleves.filter(e => e.parentEmail);
  const matiereNom = matiereCourante?.nom || "";

  const handleSendAll = async () => {
    setSending(true);
    let successCount = 0;

    for (let i = 0; i < elevesAvecContact.length; i++) {
      const eleve = elevesAvecContact[i];
      setCurrentIndex(i + 1);
      setProgress(Math.round(((i + 1) / elevesAvecContact.length) * 100));

      let message;
      if (typeEnvoi === "matiere") {
        const key = `${classe}_${matieres.find(m => m.nom === matiereNom)?.id || "maths"}_${periode}`;
        const notes = allNotes[key] || [];
        const noteData = notes.find((n: NoteComplete) => n.eleveId === eleve.id);
        message = buildMessageMatiere(
          eleve,
          { eval1: noteData?.eval1 ?? null, eval2: noteData?.eval2 ?? null, moyenne: noteData?.moyenne ?? null },
          matiereNom, matiereCourante?.coefficient || 1,
          periode, classe, etablissement
        );
      } else {
        message = buildMessageBulletin(eleve, allNotes, periode, classe, eleves, etablissement, enseignants);
      }

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: eleve.parentEmail,
            subject: message.emailSubject,
            html: message.emailBody,
            text: message.emailBody.replace(/<[^>]*>/g, '')
          })
        });
        const data = await response.json();
        if (data.success) successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erreur pour ${eleve.nom}:`, error);
      }
    }

    setResults({ success: successCount, total: elevesAvecContact.length });
    setSending(false);
  };

  if (elevesAvecContact.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Aucun email disponible</h3>
            <p className="text-slate-500 mb-4">Aucun parent n'a d'email renseigné dans cette classe.</p>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <UsersIcon size={20} className="text-blue-600" />
            Envoi groupé
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <div className="mb-4 p-3 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700">Récapitulatif :</p>
          <p className="text-sm text-slate-600">📚 Classe : {classe}</p>
          <p className="text-sm text-slate-600">📅 Période : {periode}</p>
          <p className="text-sm text-slate-600">👥 Parents contactés : {elevesAvecContact.length}</p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type d'envoi</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTypeEnvoi("matiere")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                typeEnvoi === "matiere"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Note de {matiereNom}
            </button>
            <button
              onClick={() => setTypeEnvoi("bulletin")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                typeEnvoi === "bulletin"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Bulletin complet
            </button>
          </div>
        </div>

        {sending && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Envoi en cours... ({currentIndex}/{elevesAvecContact.length})</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {results.total > 0 && !sending && (
          <div className={`mb-4 p-3 rounded-xl ${results.success === results.total ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            ✅ Envoi terminé : {results.success}/{results.total} emails envoyés avec succès
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSendAll}
            disabled={sending}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendHorizontal size={16} />
            )}
            {sending ? "Envoi en cours..." : `Envoyer à ${elevesAvecContact.length} parents`}
          </button>
          <button onClick={onClose} className="flex-1 border py-2.5 rounded-xl hover:bg-slate-50 transition">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Bulletin Modal (version professionnelle format A4) ───────────────────────

function BulletinModal({
  eleve, allNotes, classe, periode, onClose, elevesList, enseignants, etablissement, cours
}: any) {
  const matieresAvecNotes = useMemo(() => {
    return matieres.map((m) => {
      const key = `${classe}_${m.id}_${periode}`;
      const notes = allNotes[key] || [];
      const noteData = notes.find((n: NoteComplete) => n.eleveId === eleve.id);
      
      // Trouver le professeur de cette matière
      const professeur = cours?.find((c: any) => 
        c.classe === classe && c.matiere.toUpperCase() === m.nom
      )?.professeur || "";
// Calculer le rang dans la matière
// Calculer le rang dans la matière
// Calculer le rang dans la matière
const toutesNotesMatiere = elevesList.map((e: Eleve) => {
  const noteMatiere = (allNotes[key] || []).find((n: NoteComplete) => n.eleveId === e.id);
  return { eleveId: e.id, moyenne: noteMatiere?.moyenne ?? 0 };
}).sort((a: { eleveId: number; moyenne: number }, b: { eleveId: number; moyenne: number }) => b.moyenne - a.moyenne);

const rangMatiere = toutesNotesMatiere.findIndex((n: { eleveId: number; moyenne: number }) => n.eleveId === eleve.id) + 1;
      
      return { 
        ...m, 
        eval1: noteData?.eval1 ?? null, 
        eval2: noteData?.eval2 ?? null, 
        moyenne: noteData?.moyenne ?? null,
        professeur,
        rangMatiere: rangMatiere > 0 && noteData?.moyenne !== null ? rangMatiere : null
      };
    });
  }, [eleve.id, classe, periode, allNotes, elevesList, cours]);

  const professeurPrincipal = getProfesseurPrincipal(classe, enseignants);
  const annee = etablissement?.anneeScolaire || "2024/2025";
  const nomEtab = etablissement?.nom || "LYCEE DE DEIDO";
  const adresse = etablissement?.adresse || "BP : 6500 Douala";
  const telephone = etablissement?.telephone || "65268234 / 695789136";
  const region = etablissement?.region || "LITORAL";
  const delegation = etablissement?.delegation || "DOUALA 5 EME";
  const logoUrl = etablissement?.logo || "";

  // Calcul des totaux et moyenne générale
  const { totalCoef, totalPoints, moyenneGenerale, rang } = useMemo(() => {
    let totalPointsCalc = 0;
    let totalCoefCalc = 0;
    matieresAvecNotes.forEach((m: any) => {
      if (m.moyenne !== null && m.moyenne > 0) {
        totalPointsCalc += m.moyenne * m.coefficient;
        totalCoefCalc += m.coefficient;
      }
    });
    const moyGen = totalCoefCalc > 0 ? (totalPointsCalc / totalCoefCalc) : 0;
    const rangCalc = calculerRang(eleve.id, elevesList, allNotes, periode, classe);
    return { totalCoef: totalCoefCalc, totalPoints: totalPointsCalc, moyenneGenerale: moyGen, rang: rangCalc };
  }, [matieresAvecNotes, eleve.id, classe, periode, allNotes, elevesList]);

  // Calcul des moyennes de classe, meilleure et pire
  const { moyenneClasse, meilleureMoyenne, meilleurEleveNom, pireMoyenne, pireEleveNom } = useMemo(() => {
    let totalMoyennes = 0;
    let meilleure = 0, pire = 20;
    let meilleurNom = "", pireNom = "";
    
    for (const e of elevesList) {
      let total = 0, coef = 0;
      for (const m of matieres) {
        const key = `${classe}_${m.id}_${periode}`;
        const note = (allNotes[key] || []).find((n: NoteComplete) => n.eleveId === e.id);
        if (note && note.moyenne !== null && note.moyenne > 0) {
          total += note.moyenne * m.coefficient;
          coef += m.coefficient;
        }
      }
      const moy = coef > 0 ? total / coef : 0;
      totalMoyennes += moy;
      if (moy > meilleure) {
        meilleure = moy;
        meilleurNom = e.nom;
      }
      if (moy < pire && moy > 0) {
        pire = moy;
        pireNom = e.nom;
      }
    }
    const moyClasse = elevesList.length > 0 ? totalMoyennes / elevesList.length : 0;
    return { 
      moyenneClasse: moyClasse, 
      meilleureMoyenne: meilleure, 
      meilleurEleveNom: meilleurNom,
      pireMoyenne: pire,
      pireEleveNom: pireNom
    };
  }, [elevesList, classe, periode, allNotes]);

  // Déterminer les appréciations
  const appreciationGenerale = useMemo(() => {
    if (moyenneGenerale >= 16) return "Excellent";
    if (moyenneGenerale >= 14) return "Très bien";
    if (moyenneGenerale >= 12) return "Bien";
    if (moyenneGenerale >= 10) return "Assez bien";
    if (moyenneGenerale >= 8) return "Passable";
    return "Insuffisant";
  }, [moyenneGenerale]);

  const handlePrint = () => setTimeout(() => window.print(), 100);

  // Déterminer les cases à cocher
  const isFelicitations = moyenneGenerale >= 15;
  const isEncouragement = moyenneGenerale >= 12 && moyenneGenerale < 15;
  const isSatisfaisant = moyenneGenerale >= 10 && moyenneGenerale < 12;
  const isPeutMieuxFaire = moyenneGenerale >= 8 && moyenneGenerale < 10;
  const isInsuffisant = moyenneGenerale < 8;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl shadow-2xl print:shadow-none print:max-w-none" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        <div className="p-6 print:p-4">
          
          {/* ==================== EN-TÊTE OFFICIEL ==================== */}
          <div className="text-center border-b-2 border-black pb-2 mb-3">
            <div className="flex justify-between items-start">
              <div className="text-left text-[10px] leading-tight w-1/4">
                <p className="font-bold">REPUBLIQUE DU CAMEROUN</p>
                <p>Paix - Travail - Patrie</p>
              </div>
              <div className="text-center w-2/4">
                <p className="text-[9px] font-bold">MINISTERE DES ENSEIGNEMENTS SECONDAIRES</p>
                <p className="text-[8px]">DELEGATION REGIONALE DU {region}</p>
                <p className="text-[8px]">DELEGATION DEPARTEMENTALE DU {delegation}</p>
                <p className="text-xs font-bold mt-1">{nomEtab}</p>
                <p className="text-[8px]">{adresse}</p>
                <p className="text-[8px]">📞 {telephone}</p>
              </div>
              <div className="text-right w-1/4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain ml-auto" />
                ) : (
                  <div className="w-14 h-14 border border-black flex items-center justify-center text-[8px] ml-auto">LOGO</div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-sm font-bold uppercase">BULLETIN DE NOTES</h2>
              <p className="text-[10px] font-semibold mt-0.5">{periode}</p>
              <p className="text-[9px]">Année scolaire {annee}</p>
            </div>
          </div>

          {/* ==================== IDENTITÉ DE L'ÉLÈVE ==================== */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 text-[10px] mb-3 border border-black p-2">
            <div><span className="font-bold">Prénoms:</span> {eleve.nom?.split(' ')[1] || eleve.nom || ""}</div>
            <div><span className="font-bold">Nom:</span> {eleve.nom?.split(' ')[0] || eleve.nom || ""}</div>
            <div><span className="font-bold">Né(e) le:</span> {eleve.dateNaissance || "—"}</div>
            <div><span className="font-bold">à:</span> {eleve.lieuNaissance || "—"}</div>
            <div><span className="font-bold">Classe:</span> {classe}</div>
            <div><span className="font-bold">Matricule:</span> {eleve.matricule || eleve.id.toString().padStart(6, '0')}</div>
            <div><span className="font-bold">Nbre d'élèves:</span> {elevesList.length}</div>
            <div><span className="font-bold">Redouble:</span> {eleve.redoublant ? "Oui" : "Non"}</div>
          </div>

          {/* ==================== TABLEAU DES NOTES ==================== */}
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-[9px] border border-black">
              <thead>
                <tr className="border-b border-black bg-gray-100">
                  <th className="border-r border-black p-1 text-left w-28">DISCIPLINES</th>
                  <th className="border-r border-black p-1 text-center w-10">Devoir</th>
                  <th className="border-r border-black p-1 text-center w-10">Comp</th>
                  <th className="border-r border-black p-1 text-center w-10">Moy/20</th>
                  <th className="border-r border-black p-1 text-center w-8">Coef</th>
                  <th className="border-r border-black p-1 text-center w-12">Moy x</th>
                  <th className="border-r border-black p-1 text-center w-8">T.H</th>
                  <th className="border-r border-black p-1 text-center w-8">Rang</th>
                  <th className="border-r border-black p-1 text-left w-28">Appréciations</th>
                  <th className="border-r border-black p-1 text-left w-24">Professeur</th>
                </tr>
              </thead>
              <tbody>
                {matieresAvecNotes.map((m: any, idx: number) => (
                  <tr key={m.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-r border-black p-1 font-medium">{m.nom}</td>
                    <td className="border-r border-black p-1 text-center">{m.eval1 !== null ? m.eval1.toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1 text-center">{m.eval2 !== null ? m.eval2.toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1 text-center font-bold">
                      {m.moyenne !== null ? m.moyenne.toFixed(2) : "—"}
                    </td>
                    <td className="border-r border-black p-1 text-center">{m.coefficient}</td>
                    <td className="border-r border-black p-1 text-center">
                      {m.moyenne !== null ? (m.moyenne * m.coefficient).toFixed(2) : "—"}
                    </td>
                    <td className="border-r border-black p-1 text-center">TH</td>
                    <td className="border-r border-black p-1 text-center font-bold">
                      {m.rangMatiere ? `${m.rangMatiere}` : "—"}
                    </td>
                    <td className="border-r border-black p-1">{getAppreciation(m.moyenne)}</td>
                    <td className="border-r border-black p-1 text-[8px]">{m.professeur || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td className="border-r border-black p-1 text-right pr-2" colSpan={4}>TOTAL:</td>
                  <td className="border-r border-black p-1 text-center">{totalCoef}</td>
                  <td className="border-r border-black p-1 text-center">{totalPoints.toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-center" colSpan={2}></td>
                  <td className="border-r border-black p-1 text-center" colSpan={2}></td>
                </tr>
        
                <tr>
                  <td className="border-r border-black p-1 text-right pr-2" colSpan={4}>Moyenne / Rang:</td>
                  <td className="border-r border-black p-1 text-center" colSpan={2}>{moyenneGenerale.toFixed(2)} /20</td>
                  <td className="border-r border-black p-1 text-center">Rang</td>
                  <td className="border-r border-black p-1 text-center font-bold">{rang}</td>
                  <td className="border-r border-black p-1" colSpan={2}></td>
                </tr>
                
              </tfoot>
            </table>
          </div>

          {/* ==================== STATISTIQUES CLASSE ==================== */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-[9px]">
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Moyenne de la classe:</span> {moyenneClasse.toFixed(2)}/20
            </div>
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Meilleure moyenne:</span> {meilleurEleveNom} ({meilleureMoyenne.toFixed(2)}/20)
            </div>
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Plus faible moyenne:</span> {pireEleveNom} ({pireMoyenne.toFixed(2)}/20)
            </div>
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Retards / Absences:</span> ___ / ___
            </div>
          </div>

          {/* ==================== TABLEAU DES MENTIONS ==================== */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Satisfaisant</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isSatisfaisant ? 'bg-black' : ''}`}></div>
                <span className="ml-2 text-[8px]">doit continuer</span>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Félicitations</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isFelicitations ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Encouragement</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isEncouragement ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Peut mieux faire</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isPeutMieuxFaire ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Insuffisant</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isInsuffisant ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Avertissement</p>
              <div className="flex justify-center items-center h-6">
                <div className="w-4 h-4 border border-black"></div>
              </div>
            </div>
          </div>

          {/* ==================== OBSERVATIONS ==================== */}
          <div className="border border-black p-2 mb-3">
            <p className="text-[9px] font-bold uppercase mb-1">Observations du conseil des professeurs</p>
            <p className="text-[9px] italic">
              {appreciationGenerale === "Excellent" && "L'élève a fait preuve d'un excellent travail tout au long du trimestre. Félicitations !"}
              {appreciationGenerale === "Très bien" && "Très bon travail. L'élève doit maintenir cette dynamique positive."}
              {appreciationGenerale === "Bien" && "Bon travail dans l'ensemble. Des efforts supplémentaires dans certaines matières seraient bénéfiques."}
              {appreciationGenerale === "Assez bien" && "Résultats satisfaisants mais perfectibles. Un travail plus régulier est recommandé."}
              {appreciationGenerale === "Passable" && "Résultats fragiles. Une meilleure implication est nécessaire."}
              {appreciationGenerale === "Insuffisant" && "Résultats préoccupants. Un soutien renforcé est indispensable."}
            </p>
          </div>

          {/* ==================== SIGNATURES ==================== */}
          <div className="flex justify-between items-end mt-2">
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mb-1"></div>
              <p className="text-[8px]">Le professeur principal</p>
              <p className="text-[9px] font-medium mt-1">{professeurPrincipal}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mb-1"></div>
              <p className="text-[8px]">Le Chef d'Établissement</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mb-1"></div>
              <p className="text-[8px]">Visu du Parent / Tuteur</p>
            </div>
          </div>
          
          <div className="text-center mt-2 text-[7px] text-slate-400">
            <p>{nomEtab} - {annee}</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 print:hidden bg-white sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm hover:bg-slate-50 transition">
            Fermer
          </button>
          <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-2">
            <Printer size={16} /> Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Import Excel Modal ───────────────────────────────────────────────────────

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

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function NotesPage() {
  const [eleves] = useElevesStore();
  const [enseignants] = useEnseignantsStore();
  const [etablissement] = useEtablissementStore();
  const [cours] = useCoursStore();
  const [allNotes, setAllNotes] = useNotesStore();

  const [classe, setClasse] = useState("6A");
  const [matiere, setMatiere] = useState("maths");
  const [periode, setPeriode] = useState("1er TRIMESTRE");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEnvoiModal, setShowEnvoiModal] = useState(false);
  const [showEnvoiGroupeModal, setShowEnvoiGroupeModal] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [bulletinEleve, setBulletinEleve] = useState<Eleve | null>(null);
  const [selectedNote, setSelectedNote] = useState<{ eval1: number | null; eval2: number | null; moyenne: number | null } | null>(null);

  const classesDisponibles = useMemo(() => Array.from(new Set(eleves.map((e) => e.classe))).sort(), [eleves]);
  const elevesFiltres = useMemo(() => eleves.filter((e) => e.classe === classe), [eleves, classe]);
  const elevesRecherche = useMemo(() => elevesFiltres.filter((e) => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [elevesFiltres, searchTerm]);

  const notesKey = `${classe}_${matiere}_${periode}`;
  const currentNotes = useMemo(() => allNotes[notesKey] || [], [allNotes, notesKey]);
  const currentMatiere = matieres.find(m => m.id === matiere);

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
    const moyennes = currentNotes.filter((n: NoteComplete) => n.moyenne !== null).map((n: NoteComplete) => n.moyenne as number);
    if (!moyennes.length) return { moyenne: 0, tauxReussite: 0, meilleure: 0, pire: 20, ecartType: 0 };
    const moyenne = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
    const tauxReussite = (moyennes.filter((v) => v >= 10).length / moyennes.length) * 100;
    const variance = moyennes.map((v) => Math.pow(v - moyenne, 2)).reduce((a, b) => a + b, 0) / moyennes.length;
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
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `notes_${classe}_${matiere}_${periode}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnvoyerMatiere = (eleve: Eleve) => {
    setSelectedEleve(eleve);
    setSelectedNote(getNoteData(eleve.id));
    setShowEnvoiModal(true);
  };

  const handleEnvoiGroupe = () => {
    setShowEnvoiGroupeModal(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen print:p-2 print:bg-white">

      {/* EN-TÊTE RESPONSIVE */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <FileText size={24} className="sm:w-7 sm:h-7" strokeWidth={1.8} />
            </div>
            Gestion des Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12 sm:ml-14">Saisie, suivi, analyse et communication aux parents</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowImportModal(true)} className="px-3 sm:px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-2 text-xs sm:text-sm font-medium">
            <ExcelIcon size={14} className="sm:w-4 sm:h-4" /> Importer Excel
          </button>
          <button onClick={exportCSV} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition" title="Exporter CSV">
            <Download size={16} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => window.print()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition" title="Imprimer">
            <Printer size={16} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleEnvoiGroupe}
            className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 hover:bg-green-600 transition shadow-sm shadow-green-200"
          >
            <UsersIcon size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Notifier tous les parents</span>
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              editMode ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-blue-600 text-white shadow-md shadow-blue-200"
            }`}
          >
            {editMode ? <Save size={14} className="sm:w-4 sm:h-4" /> : <Edit size={14} className="sm:w-4 sm:h-4" />}
            {editMode ? "Enregistrer" : "Modifier"}
          </button>
        </div>
      </div>

      {/* FILTRES RESPONSIFS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Classe</label>
            <select value={classe} onChange={(e) => setClasse(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              {classesDisponibles.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Matière</label>
            <select value={matiere} onChange={(e) => setMatiere(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom} (coeff. {m.coefficient})</option>)}
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

      {/* STATISTIQUES RESPONSIVES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 print:hidden">
        {[
          { label: "Moyenne", value: `${stats.moyenne}/20`, sub: `Coeff ${currentMatiere?.coefficient}`, icon: <TrendingUp size={16} />, bg: "bg-blue-50", color: "text-blue-500" },
          { label: "Taux réussite", value: `${stats.tauxReussite}%`, sub: "Notes ≥ 10/20", icon: <Award size={16} />, bg: "bg-emerald-50", color: "text-emerald-500" },
          { label: "Meilleure / Pire", value: `${stats.meilleure} / ${stats.pire}`, sub: `Écart-type ${stats.ecartType}`, icon: <BarChart3 size={16} />, bg: "bg-purple-50", color: "text-purple-500" },
          { label: "Effectif", value: `${elevesFiltres.length}`, sub: "élèves", icon: <Users size={16} />, bg: "bg-indigo-50", color: "text-indigo-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
            <div className="flex justify-between items-start mb-1 sm:mb-2">
              <span className="text-[9px] sm:text-xs text-slate-400 font-medium">{s.label}</span>
              <div className={`p-1 sm:p-1.5 rounded-lg ${s.bg}`}>{s.icon}</div>
            </div>
            <p className="text-base sm:text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* TABLEAU DES NOTES RESPONSIF */}
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
              {elevesRecherche.map((eleve: Eleve) => {
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
                    </td>                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
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
                        <button onClick={() => setBulletinEleve(eleve)} title="Bulletin complet" className="p-1 sm:p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
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

      {/* MODALS */}
      {bulletinEleve && (
        <BulletinModal 
          eleve={bulletinEleve} 
          allNotes={allNotes} 
          classe={classe} 
          periode={periode} 
          elevesList={elevesFiltres} 
          enseignants={enseignants} 
          etablissement={etablissement}
          cours={cours}
          stats={stats}
          onClose={() => setBulletinEleve(null)} 
        />
      )}
      {showEnvoiModal && selectedEleve && currentMatiere && (
        <EnvoiModal
          eleve={selectedEleve}
          allNotes={allNotes}
          classe={classe}
          periode={periode}
          elevesList={elevesFiltres}
          etablissement={etablissement}
          enseignants={enseignants}
          matiereCourante={selectedNote ? currentMatiere : undefined}
          noteMatiere={selectedNote || undefined}
          onClose={() => { setShowEnvoiModal(false); setSelectedEleve(null); setSelectedNote(null); }}
        />
      )}
      {showEnvoiGroupeModal && (
        <EnvoiGroupeModal
          eleves={elevesFiltres}
          allNotes={allNotes}
          classe={classe}
          periode={periode}
          etablissement={etablissement}
          enseignants={enseignants}
          matiereCourante={currentMatiere}
          onClose={() => setShowEnvoiGroupeModal(false)}
        />
      )}
      {showImportModal && (
        <ImportExcelModal onClose={() => setShowImportModal(false)} onImport={importNotes} elevesList={elevesFiltres} classe={classe} matiereNom={currentMatiere?.nom} periode={periode} />
      )}
    </div>
  );
}