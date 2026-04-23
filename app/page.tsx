// app/page.tsx
"use client";
import { Wallet, Users, GraduationCap, BookOpen, Calendar, TrendingUp, DollarSign, TrendingDown, BarChart3, LineChart, Activity, Filter } from "lucide-react";
import StudentsSection from "@/components/StudentsSection";
import { useElevesStore, useEnseignantsStore, useCoursStore, useTransactionsStore, useFraisStore, useNotesStore } from "@/lib/stores";
import { useState, useEffect, useMemo } from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Couleurs pour les graphiques
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function DashboardPage() {
  const [eleves] = useElevesStore();
  const [enseignants] = useEnseignantsStore();
  const [cours] = useCoursStore();
  const [transactions] = useTransactionsStore();
  const [fraisList] = useFraisStore();
  const [allNotes] = useNotesStore();
  
  const [selectedClasse, setSelectedClasse] = useState<string>("Toutes");
  
  // Liste des matières
  const matieresNoms = [
    "MATHÉMATIQUES", "FRANÇAIS", "ANGLAIS", "HISTOIRE-GÉOGRAPHIE",
    "PHYSIQUE-CHIMIE", "INFORMATIQUE", "EPS", "ÉDUCATION CIVIQUE"
  ];

  // Liste des classes disponibles
  const classesDisponibles = useMemo(() => {
    const classes = Array.from(new Set(eleves.map(e => e.classe))).sort();
    return ["Toutes", ...classes];
  }, [eleves]);

  // Filtrer les élèves par classe sélectionnée
  const elevesFiltres = useMemo(() => {
    if (selectedClasse === "Toutes") return eleves;
    return eleves.filter(e => e.classe === selectedClasse);
  }, [eleves, selectedClasse]);

  // Filtrer les cours par classe
  const coursFiltres = useMemo(() => {
    if (selectedClasse === "Toutes") return cours;
    return cours.filter(c => c.classe === selectedClasse);
  }, [cours, selectedClasse]);

  // Filtrer les transactions par classe
  const transactionsFiltres = useMemo(() => {
    if (selectedClasse === "Toutes") return transactions;
    return transactions.filter(t => t.classe === selectedClasse);
  }, [transactions, selectedClasse]);

  // Mapping matière nom -> clé
  const matiereKeyMap: Record<string, string> = {
    "MATHÉMATIQUES": "maths",
    "FRANÇAIS": "francais",
    "ANGLAIS": "anglais",
    "HISTOIRE-GÉOGRAPHIE": "histgeo",
    "PHYSIQUE-CHIMIE": "physique",
    "INFORMATIQUE": "info",
    "EPS": "eps",
    "ÉDUCATION CIVIQUE": "education"
  };

  // Statistiques des notes par matière
  const statsNotes = useMemo(() => {
    const result: Record<string, { 
      seq1: number; seq2: number; seq3: number; seq4: number; 
      seq5: number; seq6: number; seq7: number; moyenneAnnuelle: number 
    }> = {};
    
    // Initialiser les résultats
    matieresNoms.forEach(matiere => {
      result[matiere] = { seq1: 0, seq2: 0, seq3: 0, seq4: 0, seq5: 0, seq6: 0, seq7: 0, moyenneAnnuelle: 0 };
    });
    
    // Compter le nombre d'élèves ayant des notes par matière
    const compteur: Record<string, { seq1: number; seq2: number; seq3: number; seq4: number; seq5: number; seq6: number; seq7: number }> = {};
    matieresNoms.forEach(matiere => {
      compteur[matiere] = { seq1: 0, seq2: 0, seq3: 0, seq4: 0, seq5: 0, seq6: 0, seq7: 0 };
    });
    
    const periodes = ["1er TRIMESTRE", "2ème TRIMESTRE", "3ème TRIMESTRE", "EXAMEN FINAL"];
    
    // Parcourir tous les élèves de la classe sélectionnée
    for (const eleve of elevesFiltres) {
      const classe = eleve.classe;
      
      for (const matiereNom of matieresNoms) {
        const matiereKey = matiereKeyMap[matiereNom];
        
        periodes.forEach((periode, periodeIdx) => {
          const notesKey = `${classe}_${matiereKey}_${periode}`;
          const notes = allNotes[notesKey] || [];
          const noteEleve = notes.find((n: any) => n.eleveId === eleve.id);
          
          if (noteEleve) {
            if (periodeIdx === 0) { // 1er TRIMESTRE
              if (noteEleve.eval1 !== null && noteEleve.eval1 !== undefined) {
                result[matiereNom].seq1 += noteEleve.eval1;
                compteur[matiereNom].seq1++;
              }
              if (noteEleve.eval2 !== null && noteEleve.eval2 !== undefined) {
                result[matiereNom].seq2 += noteEleve.eval2;
                compteur[matiereNom].seq2++;
              }
            } else if (periodeIdx === 1) { // 2ème TRIMESTRE
              if (noteEleve.eval1 !== null && noteEleve.eval1 !== undefined) {
                result[matiereNom].seq3 += noteEleve.eval1;
                compteur[matiereNom].seq3++;
              }
              if (noteEleve.eval2 !== null && noteEleve.eval2 !== undefined) {
                result[matiereNom].seq4 += noteEleve.eval2;
                compteur[matiereNom].seq4++;
              }
            } else if (periodeIdx === 2) { // 3ème TRIMESTRE
              if (noteEleve.eval1 !== null && noteEleve.eval1 !== undefined) {
                result[matiereNom].seq5 += noteEleve.eval1;
                compteur[matiereNom].seq5++;
              }
              if (noteEleve.eval2 !== null && noteEleve.eval2 !== undefined) {
                result[matiereNom].seq6 += noteEleve.eval2;
                compteur[matiereNom].seq6++;
              }
            } else if (periodeIdx === 3) { // EXAMEN FINAL
              if (noteEleve.moyenne !== null && noteEleve.moyenne !== undefined) {
                result[matiereNom].seq7 += noteEleve.moyenne;
                compteur[matiereNom].seq7++;
              }
            }
          }
        });
      }
    }
    
    // Calculer les moyennes
    for (const matiere of matieresNoms) {
      result[matiere].seq1 = compteur[matiere].seq1 > 0 ? result[matiere].seq1 / compteur[matiere].seq1 : 0;
      result[matiere].seq2 = compteur[matiere].seq2 > 0 ? result[matiere].seq2 / compteur[matiere].seq2 : 0;
      result[matiere].seq3 = compteur[matiere].seq3 > 0 ? result[matiere].seq3 / compteur[matiere].seq3 : 0;
      result[matiere].seq4 = compteur[matiere].seq4 > 0 ? result[matiere].seq4 / compteur[matiere].seq4 : 0;
      result[matiere].seq5 = compteur[matiere].seq5 > 0 ? result[matiere].seq5 / compteur[matiere].seq5 : 0;
      result[matiere].seq6 = compteur[matiere].seq6 > 0 ? result[matiere].seq6 / compteur[matiere].seq6 : 0;
      result[matiere].seq7 = compteur[matiere].seq7 > 0 ? result[matiere].seq7 / compteur[matiere].seq7 : 0;
      
      // Arrondir à 1 décimale
      result[matiere].seq1 = Math.round(result[matiere].seq1 * 10) / 10;
      result[matiere].seq2 = Math.round(result[matiere].seq2 * 10) / 10;
      result[matiere].seq3 = Math.round(result[matiere].seq3 * 10) / 10;
      result[matiere].seq4 = Math.round(result[matiere].seq4 * 10) / 10;
      result[matiere].seq5 = Math.round(result[matiere].seq5 * 10) / 10;
      result[matiere].seq6 = Math.round(result[matiere].seq6 * 10) / 10;
      result[matiere].seq7 = Math.round(result[matiere].seq7 * 10) / 10;
      
      // Moyenne annuelle
      const somme = result[matiere].seq1 + result[matiere].seq2 + result[matiere].seq3 + 
                    result[matiere].seq4 + result[matiere].seq5 + result[matiere].seq6 + result[matiere].seq7;
      result[matiere].moyenneAnnuelle = Math.round((somme / 7) * 10) / 10;
    }
    
    return result;
  }, [allNotes, elevesFiltres]);

  // Top 5 meilleures matières (basé sur les notes réelles)
  const topMatieres = useMemo(() => {
    return Object.entries(statsNotes)
      .map(([nom, data]) => ({ nom, moyenne: data.moyenneAnnuelle }))
      .filter(m => m.moyenne > 0)
      .sort((a, b) => b.moyenne - a.moyenne)
      .slice(0, 5);
  }, [statsNotes]);

  // Top 5 matières à améliorer (basé sur les notes réelles)
  const bottomMatieres = useMemo(() => {
    return Object.entries(statsNotes)
      .map(([nom, data]) => ({ nom, moyenne: data.moyenneAnnuelle }))
      .filter(m => m.moyenne > 0)
      .sort((a, b) => a.moyenne - b.moyenne)
      .slice(0, 5);
  }, [statsNotes]);

  // Données pour le graphique d'évolution par matière (3 trimestres + examen)
  const evolutionParTrimestre = useMemo(() => {
    return Object.entries(statsNotes)
      .map(([matiere, data]) => ({
        matiere: matiere.length > 12 ? matiere.substring(0, 10) + "..." : matiere,
        matiereFull: matiere,
        "1er Trimestre": Math.round(((data.seq1 + data.seq2) / 2) * 10) / 10,
        "2ème Trimestre": Math.round(((data.seq3 + data.seq4) / 2) * 10) / 10,
        "3ème Trimestre": Math.round(((data.seq5 + data.seq6) / 2) * 10) / 10,
        "Examen": data.seq7,
      }))
      .filter(m => m["1er Trimestre"] > 0 || m["2ème Trimestre"] > 0 || m["3ème Trimestre"] > 0);
  }, [statsNotes]);

  // Données pour le graphique à barres (T1 S1 vs T1 S2)
  const barChartData = useMemo(() => {
    return Object.entries(statsNotes)
      .map(([matiere, data]) => ({
        name: matiere.length > 12 ? matiere.substring(0, 10) + "..." : matiere,
        fullName: matiere,
        seq1: data.seq1,
        seq2: data.seq2,
      }))
      .filter(m => m.seq1 > 0 || m.seq2 > 0);
  }, [statsNotes]);

  // Données pour le graphique circulaire (répartition des élèves)
  const repartitionClasses = useMemo(() => {
    const classesMap = new Map<string, number>();
    elevesFiltres.forEach(e => {
      classesMap.set(e.classe, (classesMap.get(e.classe) || 0) + 1);
    });
    return Array.from(classesMap.entries()).map(([name, value]) => ({ name, value }));
  }, [elevesFiltres]);

  // Statistiques générales
  const statsGenerales = useMemo(() => {
    // Chiffre d'affaires
    const totalPaye = transactionsFiltres
      .filter(t => t.statut === "payé")
      .reduce((sum, t) => sum + t.montant, 0);
    
    // Taux de recouvrement
    const tauxRecouvrement = transactionsFiltres.length > 0 
      ? Math.round((transactionsFiltres.filter(t => t.statut === "payé").length / transactionsFiltres.length) * 100) 
      : 0;
    
    // Taux d'occupation
    const tauxOccupation = coursFiltres.length > 0 ? Math.min(100, Math.round((coursFiltres.length / 20) * 100)) : 68;
    
    // Moyenne générale de la classe
    let totalMoyennes = 0;
    let countNotes = 0;
    for (const matiere of Object.values(statsNotes)) {
      if (matiere.moyenneAnnuelle > 0) {
        totalMoyennes += matiere.moyenneAnnuelle;
        countNotes++;
      }
    }
    const moyenneGenerale = countNotes > 0 ? totalMoyennes / countNotes : 0;
    
    // Nombre d'enseignants pour cette classe
    let enseignantsCount = 0;
    if (selectedClasse === "Toutes") {
      enseignantsCount = enseignants.length;
    } else {
      enseignantsCount = enseignants.filter(ens => 
        ens.classes?.includes(selectedClasse) || 
        ens.enseignements?.some((e: any) => e.classe === selectedClasse)
      ).length;
    }
    
    return {
      chiffreAffaires: totalPaye,
      totalEleves: elevesFiltres.length,
      totalEnseignants: enseignantsCount || enseignants.length,
      totalCours: coursFiltres.length,
      tauxOccupation,
      tauxRecouvrement,
      moyenneGenerale: Math.round(moyenneGenerale * 10) / 10,
      nbClasses: new Set(eleves.map(e => e.classe)).size
    };
  }, [elevesFiltres, enseignants, coursFiltres, transactionsFiltres, statsNotes, selectedClasse]);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString() + " FCFA";
  };

  // Vérifier si des données existent
  const hasData = evolutionParTrimestre.length > 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6 md:gap-8 w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 pb-8">
      
      {/* HEADER AVEC SÉLECTEUR DE CLASSE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
            <Activity size={18} className="sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Vue d'ensemble de l'établissement</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-200 flex-1 sm:flex-none">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={selectedClasse} 
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="text-xs sm:text-sm font-medium text-slate-700 bg-transparent border-none focus:ring-0 outline-none pr-6"
            >
              {classesDisponibles.map(classe => (
                <option key={classe} value={classe}>
                  {classe === "Toutes" ? "📊 Toutes les classes" : `📚 ${classe}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-200">
            <Calendar size={14} className="text-blue-500" />
            <span className="text-[10px] sm:text-xs font-medium text-slate-600">
              3 Trimestres
            </span>
          </div>
        </div>
      </div>

      {/* BADGE CLASSE SÉLECTIONNÉE */}
      {selectedClasse !== "Toutes" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] sm:text-sm text-blue-700">
            📊 Affichage des données pour la classe <strong>{selectedClasse}</strong>
          </span>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={formatMoney(statsGenerales.chiffreAffaires)}
          icon={<DollarSign size={16} className="sm:w-5 sm:h-5" />}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Étudiants"
          value={statsGenerales.totalEleves.toString()}
          icon={<Users size={16} className="sm:w-5 sm:h-5" />}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Enseignants"
          value={statsGenerales.totalEnseignants.toString()}
          icon={<GraduationCap size={16} className="sm:w-5 sm:h-5" />}
          color="from-purple-500 to-pink-600"
        />
        <StatCard
          title="Cours actifs"
          value={statsGenerales.totalCours.toString()}
          icon={<BookOpen size={16} className="sm:w-5 sm:h-5" />}
          color="from-orange-500 to-red-600"
        />
        <StatCard
          title="Moyenne générale"
          value={`${statsGenerales.moyenneGenerale}/20`}
          icon={<TrendingUp size={16} className="sm:w-5 sm:h-5" />}
          color="from-cyan-500 to-blue-600"
        />
      </div>

      {/* DEUXIÈME LIGNE DE STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Taux d'occupation</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{statsGenerales.tauxOccupation}%</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar size={16} className="sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${statsGenerales.tauxOccupation}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Taux de recouvrement</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{statsGenerales.tauxRecouvrement}%</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign size={16} className="sm:w-5 sm:h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${statsGenerales.tauxRecouvrement}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] sm:text-xs text-slate-400 font-medium">
                {selectedClasse === "Toutes" ? "Classes" : "Effectif"}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">
                {selectedClasse === "Toutes" ? statsGenerales.nbClasses : elevesFiltres.length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <GraduationCap size={16} className="sm:w-5 sm:h-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Ratio élèves/enseignant</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">
                {statsGenerales.totalEnseignants > 0 ? Math.round(statsGenerales.totalEleves / statsGenerales.totalEnseignants) : 0}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Users size={16} className="sm:w-5 sm:h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* GRAPHIQUE PRINCIPAL - ÉVOLUTION SUR L'ANNÉE */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <LineChart size={16} className="sm:w-5 sm:h-5 text-blue-500" />
            Évolution des moyennes par matière
            {selectedClasse !== "Toutes" && (
              <span className="text-[9px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {selectedClasse}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-1 sm:gap-2 text-[8px] sm:text-[10px]">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span>T1</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>T2</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div><span>T3</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span>Examen</span></div>
          </div>
        </div>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={evolutionParTrimestre}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="matiere" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 9 }} interval={0} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                formatter={(value: any) => [`${value}/20`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="1er Trimestre" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="2ème Trimestre" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="3ème Trimestre" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Examen" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
            </ReLineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <BarChart3 size={40} className="mb-3 opacity-30" />
            <p className="text-xs sm:text-sm">Aucune donnée de notes disponible</p>
            <p className="text-[10px] sm:text-xs mt-1">Saisissez des notes dans l'onglet "Notes"</p>
          </div>
        )}
      </div>

      {/* TOP ET BOTTOM MATIÈRES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Meilleures matières */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="sm:w-5 sm:h-5 text-emerald-500" />
            Meilleures matières
            {selectedClasse !== "Toutes" && (
              <span className="text-[9px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {selectedClasse}
              </span>
            )}
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {topMatieres.length > 0 ? (
              topMatieres.map((matiere, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg font-bold text-slate-400 w-5 sm:w-6">{idx + 1}</span>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">{matiere.nom}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-bold text-emerald-600">{matiere.moyenne}/20</p>
                    <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-1 mt-1">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(matiere.moyenne / 20) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">Aucune note saisie</div>
            )}
          </div>
        </div>

        {/* Matières à améliorer */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="sm:w-5 sm:h-5 text-red-500" />
            Matières à améliorer
            {selectedClasse !== "Toutes" && (
              <span className="text-[9px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {selectedClasse}
              </span>
            )}
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {bottomMatieres.length > 0 ? (
              bottomMatieres.map((matiere, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg font-bold text-slate-400 w-5 sm:w-6">{idx + 1}</span>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">{matiere.nom}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-bold text-red-600">{matiere.moyenne}/20</p>
                    <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-1 mt-1">
                      <div className="bg-red-500 h-1 rounded-full" style={{ width: `${(matiere.moyenne / 20) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">Aucune note saisie</div>
            )}
          </div>
        </div>
      </div>

      {/* TROISIÈME LIGNE - GRAPHIQUE À BARRES ET RÉPARTITION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Comparaison T1 S1 vs T1 S2 */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="sm:w-5 sm:h-5 text-emerald-500" />
            Comparaison 1er Trimestre (S1 vs S2)
            {selectedClasse !== "Toutes" && (
              <span className="text-[9px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {selectedClasse}
              </span>
            )}
          </h3>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', fontSize: '10px' }}
                  formatter={(value: any) => [`${value}/20`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="seq1" name="Séquence 1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="seq2" name="Séquence 2" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <BarChart3 size={40} className="mb-3 opacity-30" />
              <p className="text-xs sm:text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Répartition des élèves */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 mb-4">
            <Users size={16} className="sm:w-5 sm:h-5 text-indigo-500" />
            {selectedClasse === "Toutes" ? "Répartition par classe" : `Élèves de ${selectedClasse}`}
          </h3>
          {selectedClasse === "Toutes" ? (
            repartitionClasses.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={repartitionClasses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
             label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionClasses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Users size={40} className="mb-3 opacity-30" />
                <p className="text-xs sm:text-sm">Aucun élève inscrit</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Users size={28} className="sm:w-8 sm:h-8 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800">{elevesFiltres.length}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">élèves inscrits</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 rounded-xl p-2 sm:p-3">
                    <p className="text-[9px] sm:text-xs text-slate-400">Garçons</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      {elevesFiltres.filter(e => e.sexe === "M").length}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 sm:p-3">
                    <p className="text-[9px] sm:text-xs text-slate-400">Filles</p>
                    <p className="text-lg sm:text-xl font-bold text-pink-600">
                      {elevesFiltres.filter(e => e.sexe === "F").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PERFORMANCE PAR TRIMESTRE */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100 p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 mb-4">
          <Activity size={16} className="sm:w-5 sm:h-5 text-blue-600" />
          Performance par trimestre
          {selectedClasse !== "Toutes" && (
            <span className="text-[9px] sm:text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
              {selectedClasse}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {["1er TRIMESTRE", "2ème TRIMESTRE", "3ème TRIMESTRE", "EXAMEN FINAL"].map((periode, idx) => {
            let moyennePeriode = 0;
            let count = 0;
            const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
            
            for (const matiere of Object.values(statsNotes)) {
              let note = 0;
              if (periode === "1er TRIMESTRE") note = (matiere.seq1 + matiere.seq2) / 2;
              else if (periode === "2ème TRIMESTRE") note = (matiere.seq3 + matiere.seq4) / 2;
              else if (periode === "3ème TRIMESTRE") note = (matiere.seq5 + matiere.seq6) / 2;
              else note = matiere.seq7;
              
              if (note > 0) {
                moyennePeriode += note;
                count++;
              }
            }
            moyennePeriode = count > 0 ? moyennePeriode / count : 0;
            const pourcentage = (moyennePeriode / 20) * 100;
            
            return (
              <div key={idx} className="bg-white/80 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-slate-600">{periode}</span>
                  <span className="text-sm sm:text-base font-bold" style={{ color: colors[idx] }}>{moyennePeriode.toFixed(1)}/20</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pourcentage}%`, backgroundColor: colors[idx] }}></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium text-slate-600">Moyenne annuelle</span>
            <span className="text-base sm:text-lg font-bold text-blue-600">
              {topMatieres.reduce((sum, m) => sum + m.moyenne, 0) / (topMatieres.length || 1)}/20
            </span>
          </div>
        </div>
      </div>

      {/* SECTION TABLEAU DES ÉLÈVES */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <StudentsSection />
      </div>

    </div>
  );
}

// Composant StatCard réutilisable
function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-800 mt-0.5 sm:mt-1 break-words">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${color} p-1.5 sm:p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
}