"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, GraduationCap, FileText, Calendar, MessageSquare, Files, Wallet, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

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
    /* Caché sur mobile, affiché à partir de 'lg' (1024px) */
    <aside className="hidden lg:flex w-72 bg-[#1e293b] text-slate-400 flex-col h-screen sticky top-0 shadow-2xl z-50">
      <div className="w-full border-b border-slate-800/50 flex items-center justify-center bg-white py-6 px-4">
        <div className="relative w-full h-16">
          <Image src="/logo.png" alt="LOGO" fill className="object-contain px-2" priority />
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={idx}>
              <div className={`flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all mb-1 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <span>{item.icon}</span>
                <span className="text-base font-bold tracking-wide">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button className="flex items-center gap-4 px-5 py-4 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 text-base font-bold transition-all">
          <LogOut size={22} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}