// app/finances/page.tsx - Version corrigée avec fallback
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet, TrendingUp, TrendingDown, Plus, Download, Printer,
  Search, Clock, X, BarChart3, FileText, Settings, Receipt,
  User, DollarSign, CheckCircle, AlertCircle, CreditCard,
  Calendar, Phone, Mail, MapPin, Building, Percent, Send
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const classes = ["6A", "6B", "6C", "5A", "5B", "4A", "3A", "Seconde A", "Première A", "Terminale A"];
const methodes = ["Espèces", "Mobile Money", "Carte", "Virement"];

// Données mockées pour le fallback
const mockEleves = [
  { id: 1, nom: "Jean Mbélé", classe: "6A", matricule: "9/02 410", parentEmail: "parent.jean@example.com", parentTelephone: "+237 612345678" },
  { id: 2, nom: "Elise Nend", classe: "5B", matricule: "5/22,000", parentEmail: "parent.elise@example.com", parentTelephone: "+237 623456789" },
  { id: 3, nom: "Dider Fongang", classe: "4A", matricule: "8/163 410", parentEmail: null, parentTelephone: "+237 634567890" },
  { id: 4, nom: "Émile Tamko", classe: "6A", matricule: "5/02,003", parentEmail: null, parentTelephone: "+237 645678901" },
  { id: 5, nom: "Nadia Ebwelle", classe: "Terminale A", matricule: "5/07/223", parentEmail: "parent.nadia@example.com", parentTelephone: "+237 656789012" },
];

const mockTransactions = [
  { id: 1, eleve: "Jean Mbélé", classe: "6A", type: "Paiement", montant: 50000, date: "2025-04-01", statut: "payé", methode: "Mobile Money", reference: "MM-12345" },
  { id: 2, eleve: "Elise Nend", classe: "5B", type: "Paiement", montant: 75000, date: "2025-03-28", statut: "payé", methode: "Espèces", reference: null },
];

const mockFrais = [
  { id: "1", niveau: "6ème", montant: 150000, description: "Frais de scolarité annuel" },
  { id: "2", niveau: "5ème", montant: 150000, description: "Frais de scolarité annuel" },
  { id: "3", niveau: "4ème", montant: 160000, description: "Frais de scolarité annuel" },
  { id: "4", niveau: "3ème", montant: 160000, description: "Frais de scolarité annuel" },
  { id: "5", niveau: "Seconde", montant: 170000, description: "Frais de scolarité annuel" },
  { id: "6", niveau: "Première", montant: 170000, description: "Frais de scolarité annuel" },
  { id: "7", niveau: "Terminale", montant: 180000, description: "Frais de scolarité annuel" },
];

const mockEtablissement = {
  id: "1",
  nom: "Lycée de Deido",
  logo: "",
  adresse: "BP : 6500 Douala",
  telephone: "65268234 / 695789136",
  email: "contact@lyceedeido.cm",
  anneeScolaire: "2026/2027",
  region: "Littoral",
  delegation: "DOUALA 5ÈME",
};

// Fonction pour convertir une classe en niveau
function classeToNiveau(classe: string): string {
  const map: Record<string, string> = {
    "6A": "6ème", "6B": "6ème", "6C": "6ème",
    "5A": "5ème", "5B": "5ème",
    "4A": "4ème",
    "3A": "3ème",
    "Seconde A": "Seconde",
    "Première A": "Première",
    "Terminale A": "Terminale"
  };
  return map[classe] || classe;
}

// ─── Fonctions d'envoi d'email ─────────────────────────────────────────────────

function genererEmailReçu(
  eleve: any, 
  paiement: any, 
  totalDu: number, 
  etablissement: any
): { sujet: string; html: string; text: string } {
  const reste = totalDu - paiement.montant;
  const date = new Date(paiement.date).toLocaleDateString('fr-FR');
  const nomEtab = etablissement?.nom || "Établissement Scolaire";
  const adresse = etablissement?.adresse || "";
  const telephone = etablissement?.telephone || "";
  const emailEtab = etablissement?.email || "";
  const logoUrl = etablissement?.logo || "";
  const annee = etablissement?.anneeScolaire || "2024/2025";

  const sujet = `🧾 Reçu de paiement - ${eleve.nom} - ${date}`;
  
  const text = `REÇU DE PAIEMENT - ${nomEtab}
  
Élève : ${eleve.nom}
Classe : ${eleve.classe}
Date : ${date}
Montant : ${paiement.montant.toLocaleString()} FCFA
Méthode : ${paiement.methode}
${paiement.reference ? `Référence : ${paiement.reference}` : ''}

Situation financière :
- Total dû : ${totalDu.toLocaleString()} FCFA
- Montant payé : ${paiement.montant.toLocaleString()} FCFA
- Solde restant : ${reste > 0 ? reste.toLocaleString() : "0"} FCFA

${reste <= 0 ? '✅ COMPTE SOLDÉ - Merci pour votre paiement intégral !' : '📌 Veuillez régulariser le solde restant.'}

---
${nomEtab}
${adresse}
📞 ${telephone}
📧 ${emailEtab}`;

  const html = `<!DOCTYPE html>
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
    .receipt-title { text-align: center; margin-bottom: 20px; }
    .receipt-title h2 { color: #1e3a8a; margin: 0; }
    .receipt-title p { color: #6b7280; font-size: 12px; margin: 5px 0 0; }
    .info-card { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; color: #4b5563; }
    .info-value { font-weight: bold; }
    .amount { font-size: 24px; color: #10b981; }
    .remaining { font-size: 18px; }
    .status-sold { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 8px; text-align: center; margin-top: 15px; }
    .status-pending { background: #fed7aa; color: #92400e; padding: 10px; border-radius: 8px; text-align: center; margin-top: 15px; }
    .footer { text-align: center; font-size: 11px; color: #6b7280; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
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
      <div class="receipt-title">
        <h2>🧾 REÇU DE PAIEMENT</h2>
        <p>N° ${paiement.id}-${new Date().getFullYear()} | ${annee}</p>
      </div>
      
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">👨‍🎓 Élève :</span>
          <span class="info-value">${eleve.nom}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📚 Classe :</span>
          <span class="info-value">${eleve.classe}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Date :</span>
          <span class="info-value">${date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">💰 Montant :</span>
          <span class="info-value amount">${paiement.montant.toLocaleString()} FCFA</span>
        </div>
        <div class="info-row">
          <span class="info-label">💳 Méthode :</span>
          <span class="info-value">${paiement.methode}</span>
        </div>
        ${paiement.reference ? `
        <div class="info-row">
          <span class="info-label">📎 Référence :</span>
          <span class="info-value">${paiement.reference}</span>
        </div>` : ''}
      </div>
      
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">📊 Total des frais :</span>
          <span class="info-value">${totalDu.toLocaleString()} FCFA</span>
        </div>
        <div class="info-row">
          <span class="info-label">✅ Total déjà payé :</span>
          <span class="info-value">${paiement.montant.toLocaleString()} FCFA</span>
        </div>
        <div class="info-row">
          <span class="info-label">📌 Solde restant :</span>
          <span class="info-value remaining ${reste <= 0 ? 'good' : 'pending'}">${reste > 0 ? reste.toLocaleString() : "0"} FCFA</span>
        </div>
      </div>
      
      ${reste <= 0 
        ? '<div class="status-sold">✅ FÉLICITATIONS ! Votre compte est entièrement soldé. Merci pour votre confiance.</div>'
        : '<div class="status-pending">⚠️ Veuillez régulariser le solde restant dans les meilleurs délais.</div>'}
      
      <div class="footer">
        <p>${nomEtab} - Excellence & Innovation</p>
        <p>${adresse} | 📞 ${telephone} | 📧 ${emailEtab}</p>
        <p>© ${new Date().getFullYear()} ${nomEtab} - Tous droits réservés</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { sujet, html, text };
}

async function envoyerEmailReçu(
  to: string,
  sujet: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject: sujet, html, text })
    });
    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (error: any) {
    console.warn("Email non envoyé (API non disponible):", error.message);
    return { success: false, error: "Service d'email non disponible" };
  }
}

// ─── MODALS ───────────────────────────────────────────────────────────────────

function FraisModal({ fraisList, onSave, onClose }: any) {
  const [frais, setFrais] = useState(fraisList);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (niveau: string, montant: number) => {
    setFrais(frais.map((f: any) => f.niveau === niveau ? { ...f, montant: montant } : f));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    await onSave(frais);
    setLoading(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><DollarSign className="text-blue-600" size={24}/> Définir les frais par niveau</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {frais.map((f: any) => (
            <div key={f.niveau} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 rounded-xl transition">
              <span className="w-24 font-semibold text-slate-700">{f.niveau}</span>
              <div className="flex-1 flex items-center gap-2">
                <DollarSign size={16} className="text-slate-400" />
                <input type="number" value={f.montant} onChange={e => handleChange(f.niveau, parseInt(e.target.value))} className="flex-1 border rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-200" />
                <span className="text-slate-500 text-sm">FCFA</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4 mt-4 border-t">
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button onClick={onClose} className="flex-1 border py-2.5 rounded-xl hover:bg-slate-50 transition">Annuler</button>
        </div>
      </div>
    </div>
  );
}

function PaiementGlobalModal({ onSave, onClose, elevesList, elevesFinance }: any) {
  const [classe, setClasse] = useState("6A");
  const [eleveNom, setEleveNom] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [methode, setMethode] = useState("Espèces");
  const [reference, setReference] = useState("");
  const [genererRecu, setGenererRecu] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const elevesFiltres = useMemo(() => elevesList.filter((e: any) => e.classe === classe), [elevesList, classe]);
  
  const eleveSelectionne = useMemo(() => {
    if (!eleveNom) return null;
    return elevesFinance?.find((e: any) => e.nom === eleveNom);
  }, [eleveNom, elevesFinance]);
  
  const resteAPayer = eleveSelectionne ? Math.max(0, eleveSelectionne.reste) : 0;
  
  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMontant(e.target.value);
    
    if (value > resteAPayer && resteAPayer > 0) {
      setError(`Le montant ne peut pas dépasser le reste à payer (${resteAPayer.toLocaleString()} FCFA)`);
    } else {
      setError("");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montantValue = parseInt(montant);
    
    if (montantValue > resteAPayer && resteAPayer > 0) {
      setError(`Le montant ne peut pas dépasser le reste à payer (${resteAPayer.toLocaleString()} FCFA)`);
      return;
    }
    
    const eleve = elevesList.find((e: any) => e.nom === eleveNom);
    if (!eleve) return;
    
    setLoading(true);
    await onSave({
      eleveId: eleve.id,
      eleve: eleve.nom,
      classe: eleve.classe,
      montant: montantValue,
      date,
      methode,
      reference: reference || undefined,
      type: "Paiement",
      statut: "payé",
      genererRecu,
    });
    setLoading(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-blue-600" size={24}/> Nouveau paiement</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Classe</label>
            <select 
              value={classe} 
              onChange={e => { 
                setClasse(e.target.value); 
                setEleveNom("");
                setError("");
              }} 
              className="w-full border rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-200"
            >
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Élève</label>
            <select 
              required 
              value={eleveNom} 
              onChange={e => {
                setEleveNom(e.target.value);
                setError("");
                setMontant("");
              }} 
              className="w-full border rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Sélectionner un élève</option>
              {elevesFiltres.map((e: any) => (
                <option key={e.id} value={e.nom}>{e.nom}</option>
              ))}
            </select>
          </div>
          
          {eleveSelectionne && (
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total dû :</span>
                <span className="font-semibold text-blue-700">{eleveSelectionne.totalDu.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-600">Déjà payé :</span>
                <span className="font-semibold text-emerald-600">{eleveSelectionne.totalPaye.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-1 border-t border-blue-200">
                <span className="text-slate-600 font-medium">Reste à payer :</span>
                <span className="font-bold text-amber-600">{resteAPayer.toLocaleString()} FCFA</span>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
            <input 
              type="number" 
              required 
              value={montant} 
              onChange={handleMontantChange}
              max={resteAPayer || undefined}
              className={`w-full border rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 ${error ? 'border-red-500' : ''}`}
              placeholder="Ex: 25000"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            {resteAPayer > 0 && !error && montant && <p className="text-xs text-green-600 mt-1">✓ Montant valide</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-200" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Méthode</label>
            <select value={methode} onChange={e => setMethode(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-200">
              {methodes.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Référence (optionnel)</label>
            <input value={reference} onChange={e => setReference(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-200" placeholder="N° transaction" />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
            <input type="checkbox" checked={genererRecu} onChange={e => setGenererRecu(e.target.checked)} className="w-4 h-4 text-blue-600" /> 
            Envoyer le reçu par email au parent
          </label>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={!!error || !montant || loading || (resteAPayer > 0 && parseInt(montant) > resteAPayer)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border py-2.5 rounded-xl hover:bg-slate-50 transition">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailEleveModal({ eleve, transactions, fraisTotal, onClose, etablissement, onRefresh }: any) {
  const paiements = transactions.filter((t: any) => t.eleve === eleve.nom && t.type === "Paiement");
  const totalPaye = paiements.reduce((sum: number, t: any) => sum + t.montant, 0);
  const reste = fraisTotal - totalPaye;
  const [recuTransaction, setRecuTransaction] = useState<any>(null);
  const [showRecuModal, setShowRecuModal] = useState(false);
  const [envoiStatus, setEnvoiStatus] = useState<{ [key: number]: string }>({});

  const handleRenvoiReçu = async (paiement: any) => {
    if (!eleve.parentEmail) {
      alert("Aucun email parent renseigné pour cet élève");
      return;
    }
    
    setEnvoiStatus(prev => ({ ...prev, [paiement.id]: "envoi" }));
    
    const emailData = genererEmailReçu(eleve, paiement, fraisTotal, etablissement);
    const result = await envoyerEmailReçu(eleve.parentEmail, emailData.sujet, emailData.html, emailData.text);
    
    if (result.success) {
      setEnvoiStatus(prev => ({ ...prev, [paiement.id]: "success" }));
      setTimeout(() => setEnvoiStatus(prev => ({ ...prev, [paiement.id]: "" })), 3000);
    } else {
      setEnvoiStatus(prev => ({ ...prev, [paiement.id]: "error" }));
      setTimeout(() => setEnvoiStatus(prev => ({ ...prev, [paiement.id]: "" })), 3000);
      alert(`⚠️ Reçu non envoyé: ${result.error}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><User size={22} className="text-blue-600"/> Détails des paiements - {eleve.nom}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div><p className="text-xs text-slate-500">Total dû</p><p className="text-xl font-bold text-blue-600">{fraisTotal.toLocaleString()} FCFA</p></div>
          <div><p className="text-xs text-slate-500">Total payé</p><p className="text-xl font-bold text-emerald-600">{totalPaye.toLocaleString()} FCFA</p></div>
          <div><p className="text-xs text-slate-500">Reste</p><p className={`text-xl font-bold ${reste <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{Math.abs(reste).toLocaleString()} FCFA</p></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr className="text-slate-600 text-[11px] font-bold uppercase">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Montant</th>
                <th className="p-3 text-left">Méthode</th>
                <th className="p-3 text-left">Référence</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paiements.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">{p.date}</td>
                  <td className="p-3 font-semibold text-emerald-600">{p.montant.toLocaleString()} FCFA</td>
                  <td className="p-3">{p.methode}</td>
                  <td className="p-3 text-xs text-slate-500">{p.reference || '—'}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setRecuTransaction(p); setShowRecuModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir reçu">
                        <Receipt size={16}/>
                      </button>
                      {eleve.parentEmail && (
                        <button onClick={() => handleRenvoiReçu(p)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Renvoyer le reçu par email" disabled={envoiStatus[p.id] === "envoi"}>
                          {envoiStatus[p.id] === "envoi" ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : envoiStatus[p.id] === "success" ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : envoiStatus[p.id] === "error" ? (
                            <AlertCircle size={16} className="text-red-500" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition">Fermer</button>
        </div>
      </div>
      {showRecuModal && recuTransaction && (
        <RecuModal
          paiement={recuTransaction}
          eleve={eleve}
          fraisTotal={fraisTotal}
          onClose={() => { setShowRecuModal(false); setRecuTransaction(null); }}
        />
      )}
    </div>
  );
}

function RecuModal({ paiement, eleve, fraisTotal, onClose }: any) {
  const [etablissement, setEtablissement] = useState<any>(mockEtablissement);
  
  const reste = fraisTotal - paiement.montant;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Reçu de paiement</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50">
          <div className="text-center border-b pb-3 mb-3">
            {etablissement?.logo ? (
              <img src={etablissement.logo} alt="Logo" className="w-16 h-16 mx-auto object-contain mb-2" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2 shadow-lg">
                GSD
              </div>
            )}
            <h2 className="text-lg font-bold uppercase">{etablissement?.nom || "GROUPE SCOLAIRE DIGITAL"}</h2>
            <p className="text-[10px] text-gray-500">{etablissement?.adresse || "Excellence & Innovation"}</p>
            <p className="text-[9px] text-gray-400">Tél: {etablissement?.telephone || "+237 6XX XX XX XX"}</p>
            <p className="text-[9px] text-gray-400">Email: {etablissement?.email || "contact@ecole.cm"}</p>
          </div>
          <div className="text-center mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Reçu de paiement</p>
            <p className="text-[9px] text-gray-400">N° {paiement.id}-{new Date().getFullYear()}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="font-medium">Élève :</span><span>{eleve.nom}</span></div>
            <div className="flex justify-between"><span className="font-medium">Classe :</span><span>{eleve.classe}</span></div>
            <div className="flex justify-between"><span className="font-medium">Date :</span><span>{paiement.date}</span></div>
            <div className="flex justify-between"><span className="font-medium">Montant :</span><span className="font-bold text-blue-600">{paiement.montant.toLocaleString()} FCFA</span></div>
            <div className="flex justify-between"><span className="font-medium">Méthode :</span><span>{paiement.methode}</span></div>
            {paiement.reference && <div className="flex justify-between"><span className="font-medium">Référence :</span><span>{paiement.reference}</span></div>}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-xs"><span>Total dû :</span><span>{fraisTotal.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-xs"><span>Reste à payer :</span><span className={`font-semibold ${reste <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{Math.abs(reste).toLocaleString()} FCFA</span></div>
            </div>
          </div>
          <div className="text-center mt-4 pt-2 border-t">
            <p className="text-[9px] text-gray-400">Merci de votre confiance</p>
            <p className="text-[8px] text-gray-300 mt-1">Cachet et signature</p>
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm flex items-center gap-1 hover:shadow-lg transition"><Printer size={14}/> Imprimer</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50 transition">Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────

export default function FinancesPage() {
  const { isAdmin, token } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>(mockTransactions);
  const [fraisList, setFraisList] = useState<any[]>(mockFrais);
  const [eleves, setEleves] = useState<any[]>(mockEleves);
  const [etablissement, setEtablissement] = useState<any>(mockEtablissement);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [classeFiltre, setClasseFiltre] = useState("Toutes");
  const [showFraisModal, setShowFraisModal] = useState(false);
  const [showPaiementGlobalModal, setShowPaiementGlobalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<any>(null);

  // Redirection si non admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      router.push('/');
    }
  }, [isAdmin, router, loading]);

  // Calcul des totaux par élève
  const elevesFinance = useMemo(() => {
    return eleves.map(eleve => {
      const niveau = classeToNiveau(eleve.classe);
      const frais = fraisList.find(f => f.niveau === niveau);
      const totalDu = frais?.montant || 150000;
      
      const paiements = transactions.filter(t => t.eleve === eleve.nom && t.type === "Paiement");
      const totalPaye = paiements.reduce((sum, t) => sum + (t.montant || 0), 0);
      const reste = totalDu - totalPaye;
      
      return { 
        ...eleve, 
        totalDu, 
        totalPaye, 
        reste, 
        paiements 
      };
    });
  }, [eleves, fraisList, transactions]);

  const filtered = useMemo(() => {
    return elevesFinance.filter(e => {
      const matchSearch = e.nom.toLowerCase().includes(search.toLowerCase()) || 
                         (e.matricule && e.matricule.toLowerCase().includes(search.toLowerCase()));
      const matchClasse = classeFiltre === "Toutes" || e.classe === classeFiltre;
      return matchSearch && matchClasse;
    });
  }, [elevesFinance, search, classeFiltre]);

  const stats = useMemo(() => {
    const totalAttendu = filtered.reduce((sum, e) => sum + e.totalDu, 0);
    const totalPaye = filtered.reduce((sum, e) => sum + e.totalPaye, 0);
    const totalReste = filtered.reduce((sum, e) => sum + Math.max(0, e.reste), 0);
    const tauxRecouvrement = totalAttendu > 0 ? (totalPaye / totalAttendu * 100).toFixed(1) : "0";
    const nbEleves = filtered.length;
    const nbSoldes = filtered.filter(e => e.totalPaye >= e.totalDu).length;
    const nbImpayes = filtered.filter(e => e.totalPaye === 0).length;
    const nbPartiels = filtered.filter(e => e.totalPaye > 0 && e.totalPaye < e.totalDu).length;
    
    return { totalAttendu, totalPaye, totalReste, tauxRecouvrement, nbEleves, nbSoldes, nbImpayes, nbPartiels };
  }, [filtered]);

  const addPaiement = async (data: any) => {
    const newId = Math.max(...transactions.map(t => t.id), 0) + 1;
    const newTransaction = {
      id: newId,
      eleve: data.eleve,
      classe: data.classe,
      type: data.type,
      montant: data.montant,
      date: data.date,
      statut: data.statut,
      methode: data.methode,
      reference: data.reference,
    };
    
    setTransactions([...transactions, newTransaction]);
    setShowPaiementGlobalModal(false);
    
    // Envoi du reçu par email si demandé
    if (data.genererRecu && data.eleve) {
      const eleve = eleves.find(e => e.nom === data.eleve);
      if (eleve?.parentEmail) {
        const emailData = genererEmailReçu(eleve, newTransaction, elevesFinance.find(e => e.nom === data.eleve)?.totalDu || 150000, etablissement);
        await envoyerEmailReçu(eleve.parentEmail, emailData.sujet, emailData.html, emailData.text);
      }
    }
    
    alert(`✅ Paiement de ${data.montant.toLocaleString()} FCFA enregistré pour ${data.eleve}`);
  };

  const saveFrais = async (newFrais: any[]) => {
    setFraisList(newFrais);
    setShowFraisModal(false);
    alert("✅ Frais mis à jour !");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Situation financière des élèves</title>
      <style>
        body{font-family:Arial;margin:30px;} 
        h1{color:#1e293b;border-bottom:2px solid #3b82f6;}
        table{border-collapse:collapse;width:100%;} 
        th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;}
        th{background:#f1f5f9;}
        .text-right{text-align:right;}
      </style>
      </head>
      <body>
        <h1>${etablissement?.nom || "GROUPE SCOLAIRE DIGITAL"}</h1>
        <h2>Situation financière des élèves</h2>
        <p>Classe : ${classeFiltre !== "Toutes" ? classeFiltre : "Toutes"}</p>
        <p>Date : ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr><th>Élève</th><th>Classe</th><th class="text-right">Total dû</th><th class="text-right">Payé</th><th class="text-right">Reste</th></tr>
          </thead>
          <tbody>
            ${filtered.map(e => `
              <tr><td>${e.nom}</td><td>${e.classe}</td><td class="text-right">${e.totalDu.toLocaleString()} FCFA</td><td class="text-right">${e.totalPaye.toLocaleString()} FCFA</td><td class="text-right">${Math.max(0, e.reste).toLocaleString()} FCFA</td></tr>
            `).join('')}
          </tbody>
        </table>
      </body></html>
    `;
    printWindow?.document.write(htmlContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handlePrintPaidList = () => {
    const filteredByClass = classeFiltre !== "Toutes" 
      ? elevesFinance.filter((e: any) => e.classe === classeFiltre)
      : elevesFinance;
    const payes = filteredByClass.filter((e: any) => e.totalPaye > 0);

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Liste des élèves ayant payé</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; margin: 30px; }
        h1 { font-size: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
      </style>
      </head>
      <body>
        <div class="text-center" style="border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 20px;">
          <h1>${etablissement?.nom || "GROUPE SCOLAIRE DIGITAL"}</h1>
          <p>Excellence & Innovation</p>
          <h2>LISTE DES ÉLÈVES AYANT PAYÉ</h2>
          <p>Classe : ${classeFiltre !== "Toutes" ? classeFiltre : "TOUTES LES CLASSES"}</p>
          <p>Date : ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead><tr><th>N°</th><th>Élève</th><th>Classe</th><th class="text-right">Montant payé</th><th class="text-center">Statut</th></tr></thead>
          <tbody>
            ${payes.map((e: any, idx: number) => {
              const statut = e.totalPaye >= e.totalDu ? "Soldé" : "Partiel";
              return `<tr><td class="text-center">${idx + 1}</td><td>${e.nom}</td><td>${e.classe}</td><td class="text-right">${e.totalPaye.toLocaleString()} FCFA</td><td class="text-center">${statut}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </body></html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleExportPaidList = () => {
    const filteredByClass = classeFiltre !== "Toutes" 
      ? elevesFinance.filter((e: any) => e.classe === classeFiltre)
      : elevesFinance;
    const payes = filteredByClass.filter((e: any) => e.totalPaye > 0);
    const headers = ["N°", "Élève", "Classe", "Montant payé (FCFA)", "Statut"];
    const rows = payes.map((e: any, idx: number) => [idx + 1, e.nom, e.classe, e.totalPaye, e.totalPaye >= e.totalDu ? "Soldé" : "Partiel"]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payes_${classeFiltre !== "Toutes" ? classeFiltre : "toutes_classes"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const headers = ["Élève", "Classe", "Total dû", "Payé", "Reste"];
    const rows = filtered.map(e => [e.nom, e.classe, e.totalDu, e.totalPaye, Math.max(0, e.reste)]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `situation_financiere_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 min-h-screen">
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-emerald-600">
              <Wallet size={28} strokeWidth={1.8} />
            </div>
            Gestion Financière
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Suivi des frais de scolarité et paiements</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowFraisModal(true)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-blue-200 transition flex items-center gap-2 text-sm font-medium"><Settings size={16}/> Configuration frais</button>
          <button onClick={handleExport} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition"><Download size={18}/></button>
          <button onClick={handlePrint} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition"><Printer size={18}/></button>
          <button onClick={handlePrintPaidList} className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-2 text-sm font-medium"><FileText size={16}/> Imprimer payés</button>
          <button onClick={handleExportPaidList} className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-2 text-sm font-medium"><Download size={16}/> Export payés</button>
          <button onClick={() => setShowPaiementGlobalModal(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-200 flex items-center gap-2 transition-all">
            <Plus size={18}/> Nouveau paiement
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start">
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total attendu</p><p className="text-2xl font-bold text-slate-800 mt-2">{stats.totalAttendu.toLocaleString()} FCFA</p></div>
            <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition"><TrendingUp className="text-blue-500" size={22}/></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start">
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total encaissé</p><p className="text-2xl font-bold text-emerald-600 mt-2">{stats.totalPaye.toLocaleString()} FCFA</p></div>
            <div className="p-3 bg-emerald-50 rounded-xl group-hover:scale-110 transition"><CheckCircle className="text-emerald-500" size={22}/></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start">
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Reste à payer</p><p className="text-2xl font-bold text-amber-600 mt-2">{stats.totalReste.toLocaleString()} FCFA</p></div>
            <div className="p-3 bg-amber-50 rounded-xl group-hover:scale-110 transition"><AlertCircle className="text-amber-500" size={22}/></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start">
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Taux recouvrement</p><p className="text-2xl font-bold text-blue-600 mt-2">{stats.tauxRecouvrement}%</p></div>
            <div className="p-3 bg-purple-50 rounded-xl group-hover:scale-110 transition"><Percent className="text-purple-500" size={22}/></div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" style={{width: `${stats.tauxRecouvrement}%`}}></div></div>
        </div>
      </div>

      {/* STATS SUPPLEMENTAIRES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Total élèves</p><p className="text-2xl font-bold text-slate-800">{stats.nbEleves}</p></div><div className="text-3xl">👨‍🎓</div></div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Soldés</p><p className="text-2xl font-bold text-emerald-600">{stats.nbSoldes}</p></div><div className="text-3xl">✅</div></div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Partiels</p><p className="text-2xl font-bold text-amber-600">{stats.nbPartiels}</p></div><div className="text-3xl">⚠️</div></div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100">
          <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Impayés</p><p className="text-2xl font-bold text-red-600">{stats.nbImpayes}</p></div><div className="text-3xl">❌</div></div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder="Rechercher par nom ou matricule..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"/>
          </div>
          <div className="flex gap-2">
            <select value={classeFiltre} onChange={e=>setClasseFiltre(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-200">
              <option value="Toutes">📚 Toutes classes</option>
              {classes.map(c=> <option key={c}>{c}</option>)}
            </select>
            <button onClick={()=>{setSearch("");setClasseFiltre("Toutes");}} className="px-4 py-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><X size={18}/></button>
          </div>
        </div>
      </div>

      {/* TABLEAU DES ÉLÈVES */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr className="text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Élève</th><th className="px-4 py-3 text-left">Classe</th><th className="px-4 py-3 text-right">Total dû</th><th className="px-4 py-3 text-right">Payé</th><th className="px-4 py-3 text-right">Reste</th><th className="px-4 py-3 text-center">Statut</th><th className="px-4 py-3 text-center">Email parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(e => {
                let statut = "", statutColor = "";
                if (e.totalPaye === 0) { statut = "Impayé"; statutColor = "bg-red-100 text-red-700"; }
                else if (e.totalPaye > 0 && e.totalPaye < e.totalDu) { statut = "Partiel"; statutColor = "bg-amber-100 text-amber-700"; }
                else if (e.totalPaye >= e.totalDu) { statut = "Soldé"; statutColor = "bg-emerald-100 text-emerald-700"; }
                const montantReste = Math.max(0, e.reste);
                const hasEmail = e.parentEmail;
                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition cursor-pointer group" onClick={() => { setSelectedEleve(e); setShowDetailModal(true); }}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{e.nom}</td>
                    <td className="px-4 py-3 text-slate-500">{e.classe}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">{e.totalDu.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{e.totalPaye.toLocaleString()} FCFA</td>
                    <td className={`px-4 py-3 text-right font-semibold ${montantReste === 0 ? 'text-emerald-600' : 'text-red-600'}`}>{montantReste.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-center"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statutColor}`}>{statut}</span></td>
                    <td className="px-4 py-3 text-center">{hasEmail ? <span title={`Email: ${e.parentEmail}`} className="text-green-600"><Mail size={14} /></span> : <span className="text-xs text-slate-400">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (<div className="text-center py-12"><div className="text-6xl mb-4">📭</div><p className="text-slate-400">Aucun élève trouvé</p></div>)}
      </div>

      {/* MODALS */}
      {showFraisModal && <FraisModal fraisList={fraisList} onSave={saveFrais} onClose={()=>setShowFraisModal(false)} />}
      {showPaiementGlobalModal && (<PaiementGlobalModal elevesList={eleves} elevesFinance={elevesFinance} onSave={addPaiement} onClose={() => setShowPaiementGlobalModal(false)} />)}
      {showDetailModal && selectedEleve && (<DetailEleveModal eleve={selectedEleve} transactions={transactions} fraisTotal={selectedEleve.totalDu} etablissement={etablissement} onClose={() => { setShowDetailModal(false); setSelectedEleve(null); }} />)}
    </div>
  );
}