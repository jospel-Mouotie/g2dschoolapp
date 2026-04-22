// components/MobileMenu.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, Users, BookOpen, GraduationCap, FileText, Calendar, MessageSquare, Files, Wallet, Settings, LogOut } from "lucide-react";

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
  { icon: <Users size={20} />, label: "Étudiants", href: "/etudiants" },
  { icon: <BookOpen size={20} />, label: "Cours", href: "/cours" },
  { icon: <GraduationCap size={20} />, label: "Enseignants", href: "/enseignants" },
  { icon: <FileText size={20} />, label: "Notes", href: "/notes" },
  { icon: <Calendar size={20} />, label: "Planning", href: "/planning" },
  { icon: <MessageSquare size={20} />, label: "Communication", href: "/chat" },
  { icon: <Files size={20} />, label: "Documents", href: "/docs" },
  { icon: <Wallet size={20} />, label: "Finances", href: "/finances" },
  { icon: <Settings size={20} />, label: "Paramètres", href: "/settings" },
];

export default function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Menu panel */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#1e293b] shadow-2xl flex flex-col z-50 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G2D</span>
            </div>
            <span className="text-white font-bold">G2D School</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={idx} onClick={onClose}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}>
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all">
            <LogOut size={20} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}