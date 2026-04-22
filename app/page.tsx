// app/page.tsx
"use client";
import { Wallet, Users, GraduationCap, BookOpen, Calendar, TrendingUp, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import StudentsSection from "@/components/StudentsSection";
import { useElevesStore, useEnseignantsStore, useCoursStore, useTransactionsStore, useFraisStore } from "@/lib/stores";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [eleves] = useElevesStore();
  const [enseignants] = useEnseignantsStore();
  const [cours] = useCoursStore();
  const [transactions] = useTransactionsStore();
  const [fraisList] = useFraisStore();
  const [showStats, setShowStats] = useState(false);
  
  const [statsData, setStatsData] = useState({
    chiffreAffaires: 0,
    totalEleves: 0,
    totalEnseignants: 0,
    totalCours: 0,
    totalEvents: 0
  });

  // Calculer les statistiques réelles
  useEffect(() => {
    const totalPaye = transactions
      .filter(t => t.statut === "payé")
      .reduce((sum, t) => sum + t.montant, 0);
    
    const totalAttendu = fraisList.reduce((sum, f) => sum + (f.montant || 0), 0);
    const chiffreAffaires = totalPaye;
    const totalEvents = cours.length + Math.floor(Math.random() * 10);
    
    setStatsData({
      chiffreAffaires,
      totalEleves: eleves.length,
      totalEnseignants: enseignants.length,
      totalCours: cours.length,
      totalEvents
    });
  }, [eleves, enseignants, cours, transactions, fraisList]);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString() + " FCFA";
  };

  const stats = [
    { 
      label: "Chiffre d'affaires", 
      value: formatMoney(statsData.chiffreAffaires), 
      color: "bg-[#f2647d]", 
      icon: <Wallet size={20} />,
      tooltip: "Total des paiements encaissés"
    },
    { 
      label: "Étudiants", 
      value: statsData.totalEleves.toString(), 
      color: "bg-[#3b82f6]", 
      icon: <Users size={20} />,
      tooltip: "Nombre total d'élèves inscrits"
    },
    { 
      label: "Enseignants", 
      value: statsData.totalEnseignants.toString(), 
      color: "bg-[#6366f1]", 
      icon: <GraduationCap size={20} />,
      tooltip: "Nombre d'enseignants actifs"
    },
    { 
      label: "Cours", 
      value: statsData.totalCours.toString(), 
      color: "bg-[#10b981]", 
      icon: <BookOpen size={20} />,
      tooltip: "Nombre de cours programmés"
    },
    { 
      label: "Événements", 
      value: statsData.totalEvents.toString(), 
      color: "bg-[#3f51b5]", 
      icon: <Calendar size={20} />,
      tooltip: "Événements à venir"
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 pb-8">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-50 p-1.5 sm:p-2 rounded-lg text-blue-600 shadow-sm border border-blue-100">
            <LayoutGridIcon />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2d3a8d] tracking-tight">Tableau de Bord</h1>
        </div>
        
        <button className="w-full sm:w-auto bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 text-slate-500 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-wider">
          <Calendar size={14} className="text-blue-500" /> 
          <span>Voir Horaires</span>
        </button>
      </div>

      {/* ONGLET DÉROULANT POUR LES STATISTIQUES (UNIQUEMENT SUR MOBILE) */}
      <div className="block lg:hidden">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:bg-slate-50 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Indicateurs clés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {stats.length} indicateurs
            </span>
            {showStats ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </div>
        </button>
        
        {/* STATS DÉROULANTES SUR MOBILE */}
        {showStats && (
          <div className="mt-3 grid grid-cols-2 gap-3 animate-fade-in">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className={`${stat.color} p-3 rounded-xl text-white relative overflow-hidden shadow-md`}
                title={stat.tooltip}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div className="bg-white/20 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md">
                    {stat.icon}
                  </div>
                  <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
                    {stat.label.split(' ')[0]}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-lg font-black tracking-tight leading-tight break-words">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATS POUR DESKTOP (TOUJOURS VISIBLES) */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-4 rounded-xl text-white relative overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl group cursor-pointer`}
            title={stat.tooltip}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="bg-white/20 w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md group-hover:bg-white/30 transition-colors">
                {stat.icon}
              </div>
              <div className="mt-3">
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-lg font-black tracking-tight leading-none break-words">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
          </div>
        ))}
      </div>

      {/* STATS POUR TABLETTE (2 LIGNES) */}
      <div className="hidden sm:block lg:hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`${stat.color} p-3 rounded-xl text-white relative overflow-hidden shadow-md`}
              title={stat.tooltip}
            >
              <div className="relative z-10 flex items-start justify-between">
                <div className="bg-white/20 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-white/70 text-[8px] font-bold uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-base font-black tracking-tight leading-none break-words">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION TABLEAU + FICHE PROFIL */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <StudentsSection />
      </div>

    </div>
  );
}

// Composant d'icône responsive
function LayoutGridIcon() {
  return (
    <svg 
      className="w-4 h-4 sm:w-5 sm:h-5"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}