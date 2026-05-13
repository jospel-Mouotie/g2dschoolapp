// components/notes/EnvoiModal.tsx
"use client";
import { useState, useMemo } from "react";
import { X, Mail, MessageCircle, BookOpen, FileSpreadsheet, Phone, UserCheck, AlertCircle, CheckCircle, GraduationCap } from "lucide-react";
import { Eleve, Etablissement } from "@/lib/stores";
import { getElevePhoto, getAppreciation, calculerMoyenneGeneraleEleve, calculerRang, getProfesseurPrincipal, toutesLesMatieres } from "./utils";

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

interface EnvoiModalProps {
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
}

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
// components/notes/EnvoiModal.tsx
// Corrige l'appel de la fonction buildMessageBulletin

function buildMessageBulletin(
  eleve: Eleve,
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string,
  elevesList: Eleve[],
  etablissement: Etablissement,
  enseignants: any[]
): { whatsapp: string; emailSubject: string; emailBody: string } {
  // Correction : L'ordre des paramètres est (eleveId, allNotes, periode, classe)
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
  for (const m of toutesLesMatieres) {
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
  for (const m of toutesLesMatieres) {
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
      `
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
export default function EnvoiModal({
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
}: EnvoiModalProps) {
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
      return;
    }
    if (!currentMsg) return;

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
      return;
    }
    if (!currentMsg) return;

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
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Erreur de connexion");
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
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
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
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
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
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>
            <button
              onClick={handleSend}
              disabled={!email || sending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-40 flex items-center justify-center gap-2"
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