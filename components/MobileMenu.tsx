// components/MobileMenu.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, X, LayoutDashboard, Users, BookOpen, GraduationCap, 
  FileText, Calendar, MessageSquare, Files, Wallet, Settings, 
  LogOut, ChevronDown, ChevronRight, FolderOpen, Laptop, UserCircle,
  HelpCircle, Bell, Mail, BarChart3, Award, TrendingUp,
  CreditCard, School, UserCheck, ClipboardList, PenTool, UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClassesStore } from "@/lib/stores";

export default function MobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isTeacher, isParent } = useAuth();
  const [classes] = useClassesStore();
  const [isOpen, setIsOpen] = useState(false);
  const [espacesOuvert, setEspacesOuvert] = useState(false);
  const [classesEnseignantOuvert, setClassesEnseignantOuvert] = useState(false);

  const classesList = Array.isArray(classes) ? classes : [];
  const classesAccessibles = isAdmin || isTeacher ? classesList : [];

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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton menu burger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menu mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white overflow-y-auto pt-20 pb-6 px-4">
          <div className="space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link href={item.href} key={idx} onClick={() => setIsOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'
                  }`}>
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}


       

            <div className="my-3 border-t border-slate-200"></div>
            
            <Link href="/aide" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 text-slate-700">
                <HelpCircle size={18} />
                <span className="text-sm font-medium">Aide & Support</span>
              </div>
            </Link>
            
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all">
              <LogOut size={18} />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>

            <div className="pt-6 mt-4 text-center">
              <p className="text-[10px] text-slate-400">© 2024 G2D School</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}