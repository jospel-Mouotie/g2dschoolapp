"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Files, 
  Wallet, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Augmentation de la taille des icônes à 22 au lieu de 18
  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: "Dashboard", href: "/" },
    { icon: <Users size={22} />, label: "Étudiants", href: "/etudiants" },
    { icon: <BookOpen size={22} />, label: "Cours", href: "/cours" },
    { icon: <GraduationCap size={22} />, label: "Enseignants", href: "/enseignants" },
    { icon: <FileText size={22} />, label: "Notes", href: "/notes" },
    { icon: <Calendar size={22} />, label: "Planning", href: "/planning" },
    { icon: <MessageSquare size={22} />, label: "Communication", href: "/chat" },
    { icon: <Files size={22} />, label: "Documents", href: "/docs" },
    { icon: <Wallet size={22} />, label: "Finances", href: "/finances" },
    { icon: <Settings size={22} />, label: "Paramètres", href: "/settings" },
  ];

  return (
    /* Largeur passée de w-64 à w-72 pour plus d'espace */
    <aside className="w-72 bg-[#1e293b] text-slate-400 flex flex-col h-full shadow-2xl z-30">
      
      {/* ZONE LOGO (Plus de padding vertical) */}
      <div className="w-full border-b border-slate-800/50 flex items-center justify-center bg-white py-6 px-4">
        <div className="relative w-full h-16"> {/* Hauteur passée de h-14 à h-16 */}
          <Image 
            src="/logo.png" 
            alt="GO TO DIGITAL" 
            fill
            sizes="300px"
            className="object-contain px-2"
            priority
          />
        </div>
      </div>
      
      {/* MENU DE NAVIGATION */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={idx}>
              <div 
                /* Padding augmenté (py-4) et gap plus large */
                className={`flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all group mb-2 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </span>
                {/* Taille de texte passée de text-sm à text-base (plus lisible) */}
                <span className="text-base font-bold tracking-wide">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* BOUTON DÉCONNEXION */}
      <div className="p-6 border-t border-slate-800">
        <button className="flex items-center gap-4 px-5 py-4 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-base font-bold group">
          <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
          <span>Déconnexion</span>
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px; /* Légèrement plus large pour l'accessibilité */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}