// app/layout.tsx
"use client";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileMenu from "@/components/MobileMenu";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="fr">
      <body className="bg-[#f8fafc] min-h-screen">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar desktop - cachée sur mobile */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 flex flex-col min-w-0 w-full">
            <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="max-w-[1600px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* Menu Mobile */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </body>
    </html>
  );
}