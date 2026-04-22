// app/finances/page.tsx
"use client";
import { useState, useMemo } from "react";
import {
  Wallet, TrendingUp, TrendingDown, Plus, Download, Printer,
  Search, Clock, X, BarChart3, FileText, Settings, Receipt,
  User, DollarSign
} from "lucide-react";
import { useTransactionsStore, useElevesStore, useFraisStore } from "@/lib/stores";

interface Transaction {
  id: number;
  eleveId: number;
  eleveNom: string;
  classe: string;
  montant: number;
  date: string;
  methode: string;
  reference?: string;
}

const classes = ["6A", "5B", "4A", "3A", "2nde", "1ere", "Tle"];
const methodes = ["Espèces", "Mobile Money", "Carte", "Virement"];

// Fonction pour convertir une classe en niveau
function classeToNiveau(classe: string): string {
  const map: Record<string, string> = {
    "6A": "6ème",
    "5B": "5ème",
    "4A": "4ème",
    "3A": "3ème",
    "2nde": "Seconde",
    "1ere": "Première",
    "Tle": "Terminale"
  };
  return map[classe] || classe;
}

// Modal pour définir les frais par niveau
function FraisModal({ fraisList, onSave, onClose }: any) {
  const [frais, setFrais] = useState(fraisList);
  const handleChange = (niveau: string, montant: number) => {
    setFrais(frais.map((f: any) => f.niveau === niveau ? { ...f, montant: montant } : f));
  };
  const handleSubmit = () => onSave(frais);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Définir les frais par niveau</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {frais.map((f: any) => (
            <div key={f.niveau} className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-xl">
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
          <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">Enregistrer</button>
          <button onClick={onClose} className="flex-1 border py-2.5 rounded-xl hover:bg-slate-50 transition">Annuler</button>
        </div>
      </div>
    </div>
  );
}

// Modal global de paiement
function PaiementGlobalModal({ onSave, onClose, elevesList }: any) {
  const [classe, setClasse] = useState("6A");
  const [eleveId, setEleveId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [methode, setMethode] = useState("Espèces");
  const [reference, setReference] = useState("");
  const [genererRecu, setGenererRecu] = useState(true);
  const elevesFiltres = useMemo(() => elevesList.filter((e: any) => e.classe === classe), [elevesList, classe]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eleve = elevesList.find((e: any) => e.id === parseInt(eleveId));
    if (!eleve) return;
    onSave({
      eleveId: eleve.id,
      eleveNom: eleve.nom,
      classe: eleve.classe,
      montant: parseInt(montant),
      date,
      methode,
      reference: reference || undefined,
      genererRecu,
    });
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Nouveau paiement</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Classe</label><select value={classe} onChange={e => { setClasse(e.target.value); setEleveId(""); }} className="w-full border rounded-xl p-2 bg-slate-50">{classes.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Élève</label><select required value={eleveId} onChange={e => setEleveId(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50"><option value="">Sélectionner</option>{elevesFiltres.map((e: any) => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Montant (FCFA)</label><input type="number" required value={montant} onChange={e => setMontant(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50" /></div>
          <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50" /></div>
          <div><label className="block text-sm font-medium mb-1">Méthode</label><select value={methode} onChange={e => setMethode(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50">{methodes.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Référence (optionnel)</label><input value={reference} onChange={e => setReference(e.target.value)} className="w-full border rounded-xl p-2 bg-slate-50" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={genererRecu} onChange={e => setGenererRecu(e.target.checked)} className="w-4 h-4" /> Générer un reçu</label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition">Enregistrer</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl hover:bg-slate-50 transition">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal détaillée des paiements d'un élève
function DetailEleveModal({ eleve, transactions, fraisTotal, onClose }: any) {
  const paiements = transactions.filter((t: any) => t.eleveId === eleve.id);
  const totalPaye = paiements.reduce((sum: number, t: any) => sum + t.montant, 0);
  const reste = fraisTotal - totalPaye;
  const [recuTransaction, setRecuTransaction] = useState<any>(null);
  const [showRecuModal, setShowRecuModal] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><User size={20}/> Détails des paiements - {eleve.nom}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div><p className="text-xs text-slate-500">Total dû</p><p className="text-xl font-bold text-blue-600">{fraisTotal.toLocaleString()} FCFA</p></div>
          <div><p className="text-xs text-slate-500">Total payé</p><p className="text-xl font-bold text-emerald-600">{totalPaye.toLocaleString()} FCFA</p></div>
          <div><p className="text-xs text-slate-500">Reste</p><p className={`text-xl font-bold ${reste < 0 ? 'text-emerald-600' : 'text-red-600'}`}>{reste.toLocaleString()} FCFA</p></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr className="text-slate-600 text-[11px] font-bold uppercase">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Montant</th>
                <th className="p-3 text-left">Méthode</th>
                <th className="p-3 text-left">Référence</th>
                <th className="p-3 text-center">Reçu</th>
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
                    <button onClick={() => { setRecuTransaction(p); setShowRecuModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Receipt size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Fermer</button>
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

// Modal de reçu professionnel
function RecuModal({ paiement, eleve, fraisTotal, onClose }: any) {
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
            <div className="flex justify-center mb-2"><div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">G</div></div>
            <h2 className="text-lg font-bold uppercase">GROUPE SCOLAIRE DIGITAL</h2>
            <p className="text-[10px] text-gray-500">Excellence & Innovation</p>
            <p className="text-[10px] text-gray-400">BP 1234 - Yaoundé, Cameroun</p>
          </div>
          <div className="text-center mb-3">
            <p className="text-xs font-bold uppercase tracking-wider">Reçu de paiement</p>
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
              <div className="flex justify-between text-xs"><span>Reste à payer :</span><span className="font-semibold">{reste.toLocaleString()} FCFA</span></div>
            </div>
          </div>
          <div className="text-center mt-4 pt-2 border-t">
            <p className="text-[9px] text-gray-400">Merci de votre confiance</p>
            <p className="text-[8px] text-gray-300 mt-1">Cachet et signature</p>
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm flex items-center gap-1"><Printer size={14}/> Imprimer</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-xl text-sm">Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useTransactionsStore();
  const [fraisList, setFraisList] = useFraisStore();
  const [eleves] = useElevesStore();
  const [search, setSearch] = useState("");
  const [classeFiltre, setClasseFiltre] = useState("Toutes");
  const [showFraisModal, setShowFraisModal] = useState(false);
  const [showPaiementGlobalModal, setShowPaiementGlobalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<any>(null);

  // Calcul des totaux par élève
  const elevesFinance = useMemo(() => {
    return eleves.map(eleve => {
      const niveau = classeToNiveau(eleve.classe);
      const frais = fraisList.find(f => f.niveau === niveau);
      const totalDu = frais?.montant || 0;
      const paiements = transactions.filter(t => t.eleveId === eleve.id);
      const totalPaye = paiements.reduce((sum, t) => sum + t.montant, 0);
      const reste = totalDu - totalPaye;
      return { ...eleve, totalDu, totalPaye, reste, paiements };
    });
  }, [eleves, fraisList, transactions]);

  const filtered = useMemo(() => {
    return elevesFinance.filter(e => {
      const matchSearch = e.nom.toLowerCase().includes(search.toLowerCase());
      const matchClasse = classeFiltre === "Toutes" || e.classe === classeFiltre;
      return matchSearch && matchClasse;
    });
  }, [elevesFinance, search, classeFiltre]);

  const stats = useMemo(() => {
    const totalAttendu = filtered.reduce((sum, e) => sum + e.totalDu, 0);
    const totalPaye = filtered.reduce((sum, e) => sum + e.totalPaye, 0);
    const totalReste = filtered.reduce((sum, e) => sum + e.reste, 0);
    const tauxRecouvrement = totalAttendu > 0 ? (totalPaye / totalAttendu * 100).toFixed(1) : "0";
    return { totalAttendu, totalPaye, totalReste, tauxRecouvrement };
  }, [filtered]);

  const addPaiement = (data: any) => {
    const newId = Math.max(...transactions.map(t => t.id), 0) + 1;
    const newTransaction: Transaction = {
      id: newId,
      eleveId: data.eleveId,
      eleveNom: data.eleveNom,
      classe: data.classe,
      montant: data.montant,
      date: data.date,
      methode: data.methode,
      reference: data.reference,
    };
    setTransactions([...transactions, newTransaction]);
    setShowPaiementGlobalModal(false);
  };

  const saveFrais = (newFrais: any[]) => {
    setFraisList(newFrais);
    setShowFraisModal(false);
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
        <h1>GROUPE SCOLAIRE DIGITAL</h1>
        <h2>Situation financière des élèves</h2>
        <p>Classe : ${classeFiltre !== "Toutes" ? classeFiltre : "Toutes"}</p>
        <p>Date : ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Élève</th>
              <th>Classe</th>
              <th class="text-right">Total dû</th>
              <th class="text-right">Payé</th>
              <th class="text-right">Reste</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(e => `
              <tr>
                <td>${e.nom}</td>
                <td>${e.classe}</td>
                <td class="text-right">${e.totalDu.toLocaleString()} FCFA</td>
                <td class="text-right">${e.totalPaye.toLocaleString()} FCFA</td>
                <td class="text-right">${e.reste.toLocaleString()} FCFA</td>
              </tr>
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
      <head><title>Liste des élèves ayant payé - ${classeFiltre !== "Toutes" ? classeFiltre : "Toutes classes"}</title>
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
          <h1>GROUPE SCOLAIRE DIGITAL</h1>
          <p>Excellence & Innovation</p>
          <p>BP 1234 - Yaoundé, Cameroun</p>
          <h2>LISTE DES ÉLÈVES AYANT PAYÉ</h2>
          <p>Classe : ${classeFiltre !== "Toutes" ? classeFiltre : "TOUTES LES CLASSES"}</p>
          <p>Date d'édition : ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Élève</th>
              <th>Classe</th>
              <th class="text-right">Montant payé (FCFA)</th>
              <th class="text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${payes.map((e: any, idx: number) => {
              const statut = e.reste <= 0 ? "Soldé" : "Partiel";
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${e.nom}</td>
                  <td>${e.classe}</td>
                  <td class="text-right">${e.totalPaye.toLocaleString()}</td>
                  <td class="text-center">${statut}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="text-center" style="margin-top: 30px; font-size: 10px; color: #666;">
          <p>GROUPE SCOLAIRE DIGITAL - Tous droits réservés</p>
        </div>
      </body>
      </html>
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
    const rows = payes.map((e: any, idx: number) => [
      idx + 1, e.nom, e.classe, e.totalPaye, e.reste <= 0 ? "Soldé" : "Partiel"
    ]);
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
    const rows = filtered.map(e => [e.nom, e.classe, e.totalDu, e.totalPaye, e.reste]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `situation_financiere_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600"><Wallet size={28} strokeWidth={1.8} /></div>
            Finances
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Gestion des frais et paiements</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowFraisModal(true)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center gap-1"><Settings size={18}/> Frais</button>
          <button onClick={handleExport} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"><Download size={18}/></button>
          <button onClick={handlePrint} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"><Printer size={18}/></button>
          <button onClick={handlePrintPaidList} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 flex items-center gap-1"><FileText size={18}/> Imprimer payés</button>
          <button onClick={handleExportPaidList} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 flex items-center gap-1"><Download size={18}/> Export payés</button>
          <button onClick={() => setShowPaiementGlobalModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-200 flex items-center gap-2">
            <Plus size={18}/> Nouveau paiement
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between"><span className="text-slate-400 text-sm">Total attendu</span><TrendingUp className="text-blue-500" size={20}/></div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalAttendu.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between"><span className="text-slate-400 text-sm">Total payé</span><TrendingUp className="text-emerald-500" size={20}/></div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.totalPaye.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between"><span className="text-slate-400 text-sm">Reste à payer</span><TrendingDown className="text-red-500" size={20}/></div>
          <p className="text-2xl font-bold text-red-600 mt-2">{stats.totalReste.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between"><span className="text-slate-400 text-sm">Taux recouvrement</span><BarChart3 className="text-blue-500" size={20}/></div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.tauxRecouvrement}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${stats.tauxRecouvrement}%`}}></div></div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder="Rechercher élève..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm"/>
          </div>
          <div className="flex gap-2">
            <select value={classeFiltre} onChange={e=>setClasseFiltre(e.target.value)} className="p-2 border rounded-xl text-sm bg-white">
              <option value="Toutes">Toutes classes</option>
              {classes.map(c=> <option key={c}>{c}</option>)}
            </select>
            <button onClick={()=>{setSearch("");setClasseFiltre("Toutes");}} className="p-2 text-slate-400 hover:text-blue-600"><X size={18}/></button>
          </div>
        </div>
      </div>

      {/* TABLEAU DES ÉLÈVES */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-32" />
              <col className="w-20" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
            </colgroup>
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Élève</th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Total dû</th>
                <th className="px-4 py-3 text-left">Payé</th>
                <th className="px-4 py-3 text-left">Reste</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => { setSelectedEleve(e); setShowDetailModal(true); }}>
                  <td className="px-4 py-3 font-medium truncate">{e.nom}</td>
                  <td className="px-4 py-3 text-slate-500">{e.classe}</td>
                  <td className="px-4 py-3 font-semibold">{e.totalDu.toLocaleString()} FCFA</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{e.totalPaye.toLocaleString()} FCFA</td>
                  <td className={`px-4 py-3 font-semibold ${e.reste < 0 ? 'text-emerald-600' : 'text-red-600'}`}>{e.reste.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showFraisModal && <FraisModal fraisList={fraisList} onSave={saveFrais} onClose={()=>setShowFraisModal(false)} />}
      {showPaiementGlobalModal && <PaiementGlobalModal elevesList={eleves} onSave={addPaiement} onClose={()=>setShowPaiementGlobalModal(false)} />}
      {showDetailModal && selectedEleve && <DetailEleveModal eleve={selectedEleve} transactions={transactions} fraisTotal={selectedEleve.totalDu} onClose={()=>{setShowDetailModal(false); setSelectedEleve(null);}} />}
    </div>
  );
}