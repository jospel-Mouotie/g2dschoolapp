import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header"; // Nouvel import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex h-screen bg-[#f8fafc] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header /> {/* On l'ajoute ici */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}