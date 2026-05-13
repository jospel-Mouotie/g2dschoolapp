// app/enseignant/not-found.tsx
"use client";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";

export default function EnseignantNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-4">
      <div className="text-center max-w-md">
        {/* Animation 404 */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-slate-200">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🔍</div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Page introuvable
        </h1>
        
        <p className="text-slate-500 mb-6">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Home size={18} />
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
}