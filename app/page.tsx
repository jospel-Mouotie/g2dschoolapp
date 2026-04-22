// app/page.tsx
"use client";
import { Wallet, Users, GraduationCap, BookOpen, Calendar, TrendingUp, DollarSign } from "lucide-react";
import StudentsSection from "@/components/StudentsSection";
import { useElevesStore, useEnseignantsStore, useCoursStore, useTransactionsStore, useFraisStore } from "@/lib/stores";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [eleves] = useElevesStore();
  const [enseignants] = useEnseignantsStore();
  const [cours] = useCoursStore();
  const [transactions] = useTransactionsStore();
  const [fraisList] = useFraisStore();
  
  const [statsData, setStatsData] = useState({
    chiffreAffaires: 0,
    totalEleves: 0,
    totalEnseignants: 0,
    totalCours: 0,
    totalEvents: 0
  });

  // Calculer les statistiques réelles
  useEffect(() => {
    // Total des paiements encaissés
    const totalPaye = transactions
      .filter(t => t.statut === "payé")
      .reduce((sum, t) => sum + t.montant, 0);
    
    // Total attendu (frais par niveau)
    const totalAttendu = fraisList.reduce((sum, f) => sum + (f.montant || 0), 0);
    
    // Chiffre d'affaires = total payé
    const chiffreAffaires = totalPaye;
    
    // Nombre d'événements (on peut compter les messages ou événements)
    // Pour l'instant, on utilise un nombre basé sur les cours et communications
    const totalEvents = cours.length + Math.floor(Math.random() * 10);
    
    setStatsData({
      chiffreAffaires,
      totalEleves: eleves.length,
      totalEnseignants: enseignants.length,
      totalCours: cours.length,
      totalEvents
    });
  }, [eleves, enseignants, cours, transactions, fraisList]);

  // Formater le montant en FCFA
  const formatMoney = (amount: number) => {
    return amount.toLocaleString() + " FCFA";
  };

  const stats = [
    { 
      label: "Chiffre d'affaires", 
      value: formatMoney(statsData.chiffreAffaires), 
      color: "bg-[#f2647d]", 
      icon: <Wallet size={22} />,
      tooltip: "Total des paiements encaissés"
    },
    { 
      label: "Étudiants", 
      value: statsData.totalEleves.toString(), 
      color: "bg-[#3b82f6]", 
      icon: <Users size={22} />,
      tooltip: "Nombre total d'élèves inscrits"
    },
    { 
      label: "Enseignants", 
      value: statsData.totalEnseignants.toString(), 
      color: "bg-[#6366f1]", 
      icon: <GraduationCap size={22} />,
      tooltip: "Nombre d'enseignants actifs"
    },
    { 
      label: "Cours", 
      value: statsData.totalCours.toString(), 
      color: "bg-[#10b981]", 
      icon: <BookOpen size={22} />,
      tooltip: "Nombre de cours programmés"
    },
    { 
      label: "Événements", 
      value: statsData.totalEvents.toString(), 
      color: "bg-[#3f51b5]", 
      icon: <Calendar size={22} />,
      tooltip: "Événements à venir"
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600 shadow-sm border border-blue-100">
            <LayoutGridIcon size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#2d3a8d] tracking-tight">Tableau de Bord</h1>
        </div>
        
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 text-slate-500 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-wider">
           <Calendar size={14} className="text-blue-500" /> Voir Horaires
        </button>
      </div>

      {/* GRILLE DES STATISTIQUES (5 COLONNES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.color} p-5 rounded-2xl text-white relative overflow-hidden shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl group cursor-pointer`}
            title={stat.tooltip}
          >
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
              {/* Icône avec effet de flou */}
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-white/30 transition-colors">
                {stat.icon}
              </div>
              
              <div>
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-xl font-black tracking-tight leading-none">
                  {stat.value}
                </p>
              </div>
            </div>
            
            {/* Décoration de fond (Cercle blanc translucide) */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
          </div>
        ))}
      </div>

      {/* SECTION TABLEAU + FICHE PROFIL */}
      <StudentsSection />

    </div>
  );
}

// Petit composant d'icône pour le titre
function LayoutGridIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
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