// components/notes/StatsCards.tsx
"use client";
import { TrendingUp, Award, BarChart3, Users } from "lucide-react";

interface StatsCardsProps {
  moyenne: string | number;
  tauxReussite: string | number;
  meilleure: string | number;
  pire: string | number;
  effectif: number;
  coefficient?: number;
}

export default function StatsCards({ moyenne, tauxReussite, meilleure, pire, effectif, coefficient }: StatsCardsProps) {
  // Convertir les valeurs en strings pour l'affichage
  const moyenneStr = typeof moyenne === 'number' ? moyenne.toFixed(1) : moyenne;
  const tauxReussiteStr = typeof tauxReussite === 'number' ? tauxReussite.toFixed(0) : tauxReussite;
  const meilleureStr = typeof meilleure === 'number' ? meilleure.toString() : meilleure;
  const pireStr = typeof pire === 'number' ? pire.toString() : pire;
  
  const stats = [
    { label: "Moyenne", value: `${moyenneStr}/20`, sub: `Coeff ${coefficient || "-"}`, icon: <TrendingUp size={16} />, bg: "bg-blue-50" },
    { label: "Taux réussite", value: `${tauxReussiteStr}%`, sub: "Notes ≥ 10/20", icon: <Award size={16} />, bg: "bg-emerald-50" },
    { label: "Meilleure / Pire", value: `${meilleureStr} / ${pireStr}`, sub: "Notes", icon: <BarChart3 size={16} />, bg: "bg-purple-50" },
    { label: "Effectif", value: `${effectif}`, sub: "élèves", icon: <Users size={16} />, bg: "bg-indigo-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-[9px] sm:text-xs text-slate-400 font-medium">{s.label}</span>
            <div className={`p-1 sm:p-1.5 rounded-lg ${s.bg}`}>{s.icon}</div>
          </div>
          <p className="text-base sm:text-2xl font-bold text-slate-800">{s.value}</p>
          <p className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}