// components/Sidebar.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileText, 
  Calendar, MessageSquare, Files, Wallet, Settings, LogOut,
  FolderOpen, ChevronDown, ChevronRight, Laptop, UserCircle,
  HelpCircle, Bell, Mail, BarChart3, Award, TrendingUp,
  CreditCard, School, UserCheck, ClipboardList, PenTool, UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClassesStore } from "@/lib/stores";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isTeacher, isParent } = useAuth();
  const [classes] = useClassesStore();
  const [espacesOuvert, setEspacesOuvert] = useState(false);
  const [classesEnseignantOuvert, setClassesEnseignantOuvert] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // S'assurer que classes est un tableau
  const classesList = Array.isArray(classes) ? classes : [];
  
  // Classes accessibles pour l'enseignant
  const classesAccessibles = isAdmin || isTeacher ? classesList : [];

  // Items du menu principal selon le rôle
  const getMenuItems = () => {
    const commonItems = [
      { icon: <LayoutDashboard size={20} />, label: "Tableau de bord", href: "/", roles: ["admin", "enseignant", "parent"] },
    ];

    const adminItems = [
      { icon: <Users size={20} />, label: "Étudiants", href: "/etudiants", roles: ["admin"] },
      { icon: <BookOpen size={20} />, label: "Cours", href: "/cours", roles: ["admin"] },
      { icon: <GraduationCap size={20} />, label: "Enseignants", href: "/enseignants", roles: ["admin"] },
      { icon: <FileText size={20} />, label: "Notes", href: "/notes", roles: ["admin"] },
      { icon: <Calendar size={20} />, label: "Planning", href: "/planning", roles: ["admin"] },
      { icon: <MessageSquare size={20} />, label: "Communication", href: "/chat", roles: ["admin", "enseignant", "parent"] },
      { icon: <Files size={20} />, label: "Documents", href: "/docs", roles: ["admin", "enseignant", "parent"] },
      { icon: <Wallet size={20} />, label: "Finances", href: "/finances", roles: ["admin"] },
      { icon: <Settings size={20} />, label: "Paramètres", href: "/settings", roles: ["admin"] },
    ];

    const teacherItems = [
      { icon: <ClipboardList size={20} />, label: "Mes classes", href: "/enseignants/classes", roles: ["enseignant"] },
      { icon: <BookOpen size={20} />, label: "Mes cours", href: "/cours", roles: ["enseignant"] },
      { icon: <UserPlus size={20} />, label: "Faire l'appel", href: "/enseignants/appel", roles: ["enseignant"] },
      { icon: <Calendar size={20} />, label: "Mon planning", href: "/planning", roles: ["enseignant"] },
      { icon: <MessageSquare size={20} />, label: "Messages", href: "/chat", roles: ["enseignant"] },
      { icon: <Files size={20} />, label: "Mes documents", href: "/docs", roles: ["enseignant"] },
    ];

    const parentItems = [
      { icon: <UserCircle size={20} />, label: "Mon enfant", href: "/parent/enfant", roles: ["parent"] },
      { icon: <FileText size={20} />, label: "Bulletins", href: "/parent/notes", roles: ["parent"] },
      { icon: <Calendar size={20} />, label: "Emploi du temps", href: "/parent/planning", roles: ["parent"] },
      { icon: <Wallet size={20} />, label: "Finances", href: "/parent/paiements", roles: ["parent"] },
      { icon: <MessageSquare size={20} />, label: "Messages", href: "/chat", roles: ["parent"] },
    ];

    let items = [...commonItems];
    if (isAdmin) items = [...items, ...adminItems];
    else if (isTeacher) items = [...items, ...teacherItems];
    else if (isParent) items = [...items, ...parentItems];
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="hidden lg:flex w-64 bg-[#1e293b] text-slate-400 flex-col h-screen sticky top-0 shadow-2xl shadow-indigo-900/20 z-50">
      {/* Logo */}
      <div className="w-full border-b border-slate-800/50 flex items-center justify-center bg-white py-5 px-4">
        <div className="relative w-full h-12">
          <Image src="/logo.png" alt="LOGO" fill className="object-contain px-2" priority />
        </div>
      </div>
      
      {/* Info utilisateur */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
            <UserCircle size={18} className="text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.nom || "Utilisateur"}</p>
            <p className="text-[9px] text-slate-400">
              {isAdmin && "Administrateur"}
              {isTeacher && "Enseignant"}
              {isParent && "Parent d'élève"}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link href={item.href} key={idx}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'hover:bg-slate-800 hover:text-slate-200 hover:shadow-md'
              }`}>
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}

       

        

        {/* Message si enseignant sans classes */}
        {isTeacher && classesAccessibles.length === 0 && (
          <div className="my-3 p-3 bg-amber-500/10 rounded-xl text-center">
            <p className="text-[10px] text-amber-400">Aucune classe assignée</p>
            <p className="text-[8px] text-slate-500 mt-1">Contactez l'administrateur</p>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <Link href="/aide">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-800 hover:text-slate-200 ${
            pathname === "/aide" ? 'bg-indigo-600 text-white' : ''
          }`}>
            <HelpCircle size={18} />
            <span className="text-sm font-medium">Aide & Support</span>
          </div>
        </Link>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
        <div className="pt-2 mt-1 text-center">
          <p className="text-[8px] text-slate-500">© 2024 G2D School</p>
          <p className="text-[8px] text-slate-600">Version 2.0.0</p>
        </div>
      </div>
    </aside>
  );
}