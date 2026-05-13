// app/parent/notes/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, BookOpen, Printer, Download, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  matricule: string;
  photo?: string;
  img?: string;
}

export default function ParentNotesListPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'parent')) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchEleves = async () => {
      if (!token || !user?.eleveId) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        const eleveRes = await fetch(`/api/eleves/${user.eleveId}`, { headers });
        if (eleveRes.ok) {
          const eleveData = await eleveRes.json();
          setEleves([eleveData]);
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEleves();
  }, [token, user, getAuthHeaders]);

  const getPhotoUrl = (eleve: Eleve) => {
    if (eleve.img && (eleve.img.startsWith('http') || eleve.img.startsWith('data:image'))) {
      return eleve.img;
    }
    if (eleve.photo && (eleve.photo.startsWith('http') || eleve.photo.startsWith('data:image'))) {
      return eleve.photo;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom)}&background=6366f1&color=fff&size=100&rounded=true&bold=true`;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'parent') {
    return null;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
            <BookOpen size={28} strokeWidth={1.8} />
          </div>
          Bulletins scolaires
        </h1>
        <p className="text-sm text-slate-500 mt-1 ml-14">
          Consultez les relevés de notes de votre enfant
        </p>
      </div>

      {/* Liste des enfants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eleves.map((eleve) => (
          <div key={eleve.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="flex items-center gap-4 p-5">
              <img 
                src={getPhotoUrl(eleve)} 
                alt={eleve.nom} 
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">{eleve.nom}</h3>
                <p className="text-sm text-slate-500">{eleve.classe}</p>
                <p className="text-xs text-slate-400">Matricule: {eleve.matricule}</p>
              </div>
              <button
                onClick={() => router.push(`/parent/notes/${eleve.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition"
              >
                Voir les notes <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {eleves.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <User size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Aucun enfant associé à ce compte</p>
        </div>
      )}
    </div>
  );
}