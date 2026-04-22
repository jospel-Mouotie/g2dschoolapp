"use client";
import Image from "next/image";
import { Search, Bell, Mail, LayoutGrid, Settings, ChevronDown } from "lucide-react";

export default function Header() {
  // URL d'une image de profil professionnel sur internet
  const profileImageUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop";

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* Barre de recherche */}
      <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl w-96 border border-slate-100 focus-within:border-blue-200 transition-all">
        <Search size={16} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Rechercher ici..." 
          className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
        />
      </div>

      {/* Actions & Profil */}
      <div className="flex items-center gap-6">
        
        {/* Icônes de notification */}
        <div className="flex items-center gap-5 text-slate-400 border-r border-slate-100 pr-6">
          <div className="relative cursor-pointer hover:text-blue-500 transition-colors">
            <Mail size={19} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <LayoutGrid size={19} className="hover:text-blue-500 cursor-pointer transition-colors" />
          <div className="relative cursor-pointer hover:text-blue-500 transition-colors">
            <Bell size={19} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
          </div>
          <Settings size={19} className="hover:text-blue-500 cursor-pointer transition-colors" />
        </div>
        
        {/* Bloc Profil avec Image Internet */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800 leading-none mb-1">Admin M Kanga</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Administrateur</p>
          </div>
          
          <div className="relative w-10 h-10 rounded-full ring-2 ring-slate-100 ring-offset-2 overflow-hidden shadow-sm group-hover:ring-blue-100 transition-all">
            {/* Utilisation de img standard ou configuration de next.config.js requise pour next/image */}
            <img 
              src={profileImageUrl}
              alt="Profil Admin"
              className="w-full h-full object-cover"
            />
          </div>
          
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>

      </div>
    </header>
  );
}