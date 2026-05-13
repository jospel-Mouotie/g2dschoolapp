// app/parent/planning/page.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, MapPin, Users, Search, Download, Printer,
  BookOpen, Coffee, Loader2, User, ChevronDown, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PlanningCours {
  id: string;
  matiere: string;
  professeur: string;
  salle: string;
  classe: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
}

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  matricule: string;
}

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function formaterHeure(heure: string): string {
  if (!heure) return "";
  const [h, m] = heure.split(":");
  return `${parseInt(h)}h${m !== "00" ? m : ""}`;
}

export default function ParentPlanningPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [cours, setCours] = useState<PlanningCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedJour, setSelectedJour] = useState("Tous");

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
    const fetchData = async () => {
      if (!token || !user?.eleveId) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        
        // Récupérer les infos de l'élève
        const eleveRes = await fetch(`/api/eleves/${user.eleveId}`, { headers });
        if (eleveRes.ok) {
          const eleveData = await eleveRes.json();
          setEleve(eleveData);
          
          // Récupérer les cours de la classe de l'élève
          const coursRes = await fetch(`/api/cours?classe=${encodeURIComponent(eleveData.classe)}`, { headers });
          if (coursRes.ok) {
            const coursData = await coursRes.json();
            
            // Convertir les cours en format planning
            const planningCours = coursData
              .filter((c: any) => c && c.heure)
              .map((c: any) => {
                const [heureDebut, heureFin] = c.heure.split("-");
                if (!heureDebut || !heureFin) return null;
                return {
                  id: c.id,
                  matiere: c.matiere || "Sans matière",
                  professeur: c.professeur || "Non attribué",
                  salle: c.salle || "Non définie",
                  classe: c.classe || eleveData.classe,
                  jour: c.jour || "Lundi",
                  heureDebut: heureDebut,
                  heureFin: heureFin,
                  duree: c.duree || 2,
                };
              })
              .filter((c: any) => c !== null);
            
            setCours(planningCours);
          }
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user, getAuthHeaders]);

  // Toutes les heures pour l'affichage
  const toutesHeures = useMemo(() => {
    const heures = new Set<string>();
    cours.forEach(c => { 
      if (c.heureDebut) heures.add(c.heureDebut); 
      if (c.heureFin) heures.add(c.heureFin); 
    });
    if (heures.size === 0) {
      ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].forEach(h => heures.add(h));
    }
    return Array.from(heures).sort((a, b) => {
      const [h1, m1] = a.split(":").map(Number);
      const [h2, m2] = b.split(":").map(Number);
      return (h1 * 60 + (m1 || 0)) - (h2 * 60 + (m2 || 0));
    });
  }, [cours]);

  // Filtrer les cours
  const filteredCours = useMemo(() => {
    let filtered = cours;
    
    if (selectedJour !== "Tous") {
      filtered = filtered.filter(c => c.jour === selectedJour);
    }
    
    if (search) {
      filtered = filtered.filter(c => 
        c.matiere.toLowerCase().includes(search.toLowerCase()) || 
        c.professeur.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered;
  }, [cours, selectedJour, search]);

  const getCoursForHour = (jour: string, heure: string) => {
    return filteredCours.filter(c => {
      if (c.jour !== jour) return false;
      
      const [hHeure, mHeure] = heure.split(":").map(Number);
      const heureMinutes = (hHeure || 0) * 60 + (mHeure || 0);
      
      const [hDebut, mDebut] = c.heureDebut.split(":").map(Number);
      const debutMinutes = (hDebut || 0) * 60 + (mDebut || 0);
      
      const [hFin, mFin] = c.heureFin.split(":").map(Number);
      const finMinutes = (hFin || 0) * 60 + (mFin || 0);
      
      return heureMinutes >= debutMinutes && heureMinutes < finMinutes;
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById("planning-table")?.cloneNode(true) as HTMLElement;
    if (!printContent) return;
    
    const title = eleve ? `Emploi du temps - ${eleve.classe}` : "Emploi du temps";
    const date = new Date().toLocaleDateString('fr-FR');
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Times New Roman',serif;padding:15px;font-size:10px}
          .header{text-align:center;margin-bottom:15px;padding-bottom:8px;border-bottom:1px solid #000}
          .header h1{font-size:14px;margin:0}
          .header p{font-size:8px;margin:2px 0}
          table{width:100%;border-collapse:collapse;font-size:8px}
          th,td{border:1px solid #999;padding:4px;text-align:left;vertical-align:top}
          th{background:#f1f5f9;font-weight:bold}
          .cours-card{background:#eff6ff;border-radius:4px;padding:3px}
          .cours-title{font-weight:bold;font-size:8px}
          .cours-detail{font-size:7px;color:#475569}
          .footer{margin-top:15px;text-align:center;font-size:7px;border-top:1px solid #ccc;padding-top:8px}
          @media print{body{padding:0;margin:0}}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Établi le ${date}</p>
          ${eleve ? `<p>Élève: ${eleve.nom} • Matricule: ${eleve.matricule}</p>` : ''}
        </div>
        ${printContent.outerHTML}
        <div class="footer">G2D School - Plateforme de gestion scolaire</div>
      </body>
    </html>`);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleExport = () => {
    const headers = ["Jour", "Début", "Fin", "Matière", "Professeur", "Salle"];
    const rows = filteredCours.map(c => [c.jour, c.heureDebut, c.heureFin, c.matiere, c.professeur, c.salle]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emploi_du_temps_${eleve?.classe || 'classe'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aucun enfant associé</h2>
          <p className="text-slate-500">Aucun enfant n'est associé à votre compte parent.</p>
          <button onClick={() => router.push('/parent/enfant')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Retour à mon enfant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <Calendar size={28} strokeWidth={1.8} />
            </div>
            Emploi du temps
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">
            {eleve.nom} • Classe {eleve.classe}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="p-2 bg-white border rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Exporter CSV">
            <Download size={18} />
          </button>
          <button onClick={handlePrint} className="p-2 bg-white border rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Imprimer">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedJour("Tous")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedJour === "Tous" ? "bg-blue-600 text-white" : "bg-slate-100"
              }`}
            >
              Tous
            </button>
            {jours.map(jour => (
              <button
                key={jour}
                onClick={() => setSelectedJour(jour)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedJour === jour ? "bg-blue-600 text-white" : "bg-slate-100"
                }`}
              >
                {jour.slice(0, 3)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une matière..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tableau planning */}
      <div id="planning-table" className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-2 text-left font-bold w-16">Horaire</th>
              {jours.map(jour => (
                <th key={jour} className="p-2 text-left font-bold">{jour}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {toutesHeures.map(heure => (
              <tr key={heure} className="border-t">
                <td className="p-2 font-medium bg-slate-50/30">{formaterHeure(heure)}</td>
                {jours.map(jour => {
                  const coursItems = getCoursForHour(jour, heure);
                  return (
                    <td key={jour} className="p-1 border-l align-top">
                      {coursItems.length > 0 ? (
                        coursItems.map(c => (
                          <div key={c.id} className="bg-blue-50 rounded p-1 mb-1">
                            <p className="font-bold text-[9px] truncate">{c.matiere}</p>
                            <p className="text-[7px] text-slate-500">{c.professeur}</p>
                            <p className="text-[7px] text-slate-400">{c.salle}</p>
                            <p className="text-[7px] text-slate-400">{formaterHeure(c.heureDebut)}-{formaterHeure(c.heureFin)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="h-10 text-slate-300 text-center text-[8px]">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cours.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Aucun cours programmé pour cette classe</p>
        </div>
      )}
    </div>
  );
}