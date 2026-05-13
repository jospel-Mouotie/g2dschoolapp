// components/Header.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Bell, Mail, LayoutGrid, Settings, ChevronDown, LogOut, UserCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout, isAdmin, isTeacher, isParent } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Obtenir le rôle affichable
  const getRoleLabel = () => {
    if (isAdmin) return "Administrateur";
    if (isTeacher) return "Enseignant";
    if (isParent) return "Parent d'élève";
    return "Utilisateur";
  };

  // Obtenir l'avatar de l'utilisateur
  const getAvatarUrl = () => {
    // Si l'utilisateur a une photo, l'utiliser
    if (user?.photo) return user.photo;
    // Sinon, générer une avatar avec les initiales
    const initials = user?.nom?.split(' ').map(n => n[0]).join('') || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=fff&size=128&rounded=true&bold=true`;
  };

  // Rediriger vers le profil
  const goToProfile = () => {
    if (isAdmin) router.push('/profile');
    else if (isTeacher) router.push('/enseignant/profil');
    else if (isParent) router.push('/parent/profil');
    setShowUserMenu(false);
  };

  // Rediriger vers les paramètres
  const goToSettings = () => {
    router.push('/settings');
    setShowUserMenu(false);
  };

  // Rediriger vers l'aide
  const goToHelp = () => {
    router.push('/aide');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 sticky top-0 z-40 shadow-sm bg-gradient-to-r from-white to-slate-50">
      
      <div className="flex items-center gap-4">
        {/* Logo - visible sur tous les écrans */}
        <div className="flex items-center">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="ml-2 font-bold text-slate-800 text-sm hidden sm:inline">G2D School</span>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl w-64 lg:w-80 border border-slate-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Actions (Icônes) - Masqué pour les parents */}
        {(isAdmin || isTeacher) && (
          <div className="hidden sm:flex items-center gap-3 md:gap-4 text-slate-400">
            <button 
              className="relative cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => router.push('/chat')}
              aria-label="Messages"
            >
              <Mail size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              className="hover:text-indigo-600 cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard')}
              aria-label="Tableau de bord"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className="relative cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => router.push('/notifications')}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              className="hover:text-indigo-600 cursor-pointer transition-colors"
              onClick={goToSettings}
              aria-label="Paramètres"
            >
              <Settings size={18} />
            </button>
          </div>
        )}
        
        {/* Séparateur */}
        {(isAdmin || isTeacher) && (
          <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
        )}
        
        {/* Profil avec menu déroulant */}
        <div className="relative" ref={menuRef}>
          <button 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menu utilisateur"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.nom || "Utilisateur"}</p>
              <p className="text-[9px] text-slate-400 font-medium">{getRoleLabel()}</p>
            </div>
            
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-indigo-200 ring-offset-2 overflow-hidden shadow-sm bg-indigo-100 flex items-center justify-center hover:ring-indigo-300 transition-all">
              <img 
                src={getAvatarUrl()} 
                alt={user?.nom || "Avatar"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom?.charAt(0) || 'U')}&background=6366f1&color=fff&size=128&rounded=true&bold=true`;
                }}
              />
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block transition-transform duration-200" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {/* Menu déroulant */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.nom}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <p className="text-xs text-slate-400 mt-1">{getRoleLabel()}</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={goToProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  <UserCircle size={16} />
                  Mon profil
                </button>
                <button 
                  onClick={goToSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  <Settings size={16} />
                  Paramètres
                </button>
                <button 
                  onClick={goToHelp}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  <HelpCircle size={16} />
                  Aide
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-slate-100 mt-1 pt-2"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}