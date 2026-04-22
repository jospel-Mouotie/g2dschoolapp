// components/Header.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Search, Bell, Mail, LayoutGrid, Settings, ChevronDown, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const profileImageUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop";

  return (
    <header className="bg-white border-b border-slate-100 flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sticky top-0 z-40 shadow-sm">
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Bouton Menu Mobile */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Logo mobile */}
        <div className="lg:hidden flex items-center">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="ml-2 font-bold text-slate-800 text-sm">G2D School</span>
        </div>

        {/* Barre de recherche */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl w-48 md:w-64 lg:w-80 border border-slate-100 focus-within:border-blue-300 focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Actions (Icônes) */}
        <div className="hidden sm:flex items-center gap-3 md:gap-4 text-slate-400">
          <div className="relative cursor-pointer hover:text-blue-500 transition-colors">
            <Mail size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <LayoutGrid size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
          <div className="relative cursor-pointer hover:text-blue-500 transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
          </div>
          <Settings size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
        </div>
        
        {/* Séparateur */}
        <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
        
        {/* Profil */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Admin M Kanga</p>
            <p className="text-[9px] text-slate-400 font-medium">Administrateur</p>
          </div>
          
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-slate-100 ring-offset-1 overflow-hidden shadow-sm">
            <img src={profileImageUrl} alt="Profil" className="w-full h-full object-cover" />
          </div>
          <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}