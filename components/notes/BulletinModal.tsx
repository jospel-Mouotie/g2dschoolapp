// components/notes/BulletinModal.tsx
"use client";
import { useMemo, useState, useEffect } from "react";
import { X, Printer } from "lucide-react";
import { Eleve } from "@/lib/stores";
import { 
  toutesLesMatieres, getAppreciation, getProfesseurPrincipal, 
  calculerRang, calculerMoyenneClasse 
} from "./utils";

// Définir le type Note localement
interface NoteComplete {
  id: number;
  eleveId: number;
  matiereId: string;
  periode: string;
  eval1: number | null;
  eval2: number | null;
  moyenne: number | null;
  appreciation: string | null;
}

interface BulletinModalProps {
  eleve: Eleve;
  allNotes: Record<string, NoteComplete[]>;
  classe: string;
  periode: string;
  elevesList: Eleve[];
  enseignants: any[];
  etablissement: any;
  cours: any[];
  stats: any;
  onClose: () => void;
}

export default function BulletinModal({ 
  eleve, allNotes, classe, periode, elevesList, 
  enseignants, etablissement, cours, onClose 
}: BulletinModalProps) {
  const [totalHeuresAbsence, setTotalHeuresAbsence] = useState(0);
  const [nombreAbsences, setNombreAbsences] = useState(0);
  const [loadingAbsences, setLoadingAbsences] = useState(true);

  // Récupérer les heures d'absence de l'élève
  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/absences?eleveId=${eleve.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const absences = await response.json();
          const totalHeures = absences.reduce((sum: number, a: any) => sum + (a.heuresAbsence || a.duree || 2), 0);
          setTotalHeuresAbsence(totalHeures);
          setNombreAbsences(absences.length);
        }
      } catch (error) {
        console.error("Erreur chargement absences:", error);
      } finally {
        setLoadingAbsences(false);
      }
    };
    
    fetchAbsences();
  }, [eleve.id]);

  // Fonction pour obtenir la photo de l'élève
  const getElevePhoto = (eleve: Eleve): string => {
    if (eleve.img && (eleve.img.startsWith('http') || eleve.img.startsWith('data:image'))) {
      return eleve.img;
    }
    if (eleve.photo && (eleve.photo.startsWith('http') || eleve.photo.startsWith('data:image'))) {
      return eleve.photo;
    }
    const nomComplet = `${eleve.nom}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nomComplet)}&background=6366f1&color=fff&size=150&rounded=true&bold=true`;
  };

  const matieresAvecNotes = useMemo(() => {
    return toutesLesMatieres.map((m) => {
      const key = `${classe}_${m.id}_${periode}`;
      const notes = allNotes[key] || [];
      const noteData = notes.find((n: NoteComplete) => n.eleveId === eleve.id);
      
      const professeur = cours?.find((c: any) => 
        c.classe === classe && c.matiere.toUpperCase() === m.nom
      )?.professeur || "";
      
      const toutesNotesMatiere = elevesList.map(e => {
        const noteMatiere = (allNotes[key] || []).find((n: NoteComplete) => n.eleveId === e.id);
        return { eleveId: e.id, moyenne: noteMatiere?.moyenne ?? 0 };
      }).sort((a, b) => b.moyenne - a.moyenne);
      
      const rangMatiere = toutesNotesMatiere.findIndex(n => n.eleveId === eleve.id) + 1;
      
      return { 
        ...m, 
        eval1: noteData?.eval1 ?? null, 
        eval2: noteData?.eval2 ?? null, 
        moyenne: noteData?.moyenne ?? null,
        professeur,
        rangMatiere: rangMatiere > 0 && noteData?.moyenne !== null ? rangMatiere : null
      };
    });
  }, [eleve.id, classe, periode, allNotes, elevesList, cours]);

  const professeurPrincipal = getProfesseurPrincipal(classe, enseignants);
  const annee = etablissement?.anneeScolaire || "2024/2025";
  const nomEtab = etablissement?.nom || "LYCEE DE DEIDO";
  const adresse = etablissement?.adresse || "BP : 6500 Douala";
  const telephone = etablissement?.telephone || "65268234 / 695789136";
  const emailEtab = etablissement?.email || "contact@lyceedeido.cm";
  const logoUrl = etablissement?.logo || "";
  const region = etablissement?.region || "LITTORAL";
  const delegation = etablissement?.delegation || "DOUALA 5ÈME";

  const resultats = useMemo(() => {
    let totalPoints = 0, totalCoef = 0;
    matieresAvecNotes.forEach((m: any) => {
      if (m.moyenne !== null) { 
        totalPoints += m.moyenne * m.coefficient; 
        totalCoef += m.coefficient; 
      }
    });
    const moyenneGenerale = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : "N/A";
    const rang = calculerRang(eleve.id, elevesList, allNotes, periode, classe);
    const moyenneClasse = calculerMoyenneClasse(elevesList, allNotes, periode, classe);
    
    let meilleureMoyenne = 0, pireMoyenne = 20;
    let meilleurEleveNom = "", pireEleveNom = "";
    
    for (const e of elevesList) {
      let total = 0, coef = 0;
      for (const m of toutesLesMatieres) {
        const key = `${classe}_${m.id}_${periode}`;
        const note = (allNotes[key] || []).find((n: NoteComplete) => n.eleveId === e.id);
        if (note && note.moyenne !== null) {
          total += note.moyenne * m.coefficient;
          coef += m.coefficient;
        }
      }
      const moy = coef > 0 ? total / coef : 0;
      if (moy > meilleureMoyenne) {
        meilleureMoyenne = moy;
        meilleurEleveNom = e.nom;
      }
      if (moy < pireMoyenne && moy > 0) {
        pireMoyenne = moy;
        pireEleveNom = e.nom;
      }
    }
    
    let appreciationDetail = "";
    const moyenneGen = parseFloat(moyenneGenerale as string);
    if (moyenneGen >= 16) {
      appreciationDetail = "Félicitations pour ces brillants résultats ! L'élève fait preuve d'un excellent niveau et d'une grande rigueur.";
    } else if (moyenneGen >= 14) {
      appreciationDetail = "Très bons résultats. L'élève a fourni un travail sérieux et régulier. Continuez ainsi.";
    } else if (moyenneGen >= 12) {
      appreciationDetail = "Bons résultats dans l'ensemble. Des efforts supplémentaires dans certaines matières permettraient à l'élève de progresser.";
    } else if (moyenneGen >= 10) {
      appreciationDetail = "Résultats satisfaisants mais perfectibles. Une meilleure implication est souhaitable.";
    } else if (moyenneGen >= 8) {
      appreciationDetail = "Résultats fragiles. L'élève doit fournir un travail plus soutenu.";
    } else {
      appreciationDetail = "Résultats préoccupants. Une remise en question du travail fourni est nécessaire.";
    }
    
    return {
      moyenneGenerale, rang,
      moyenneClasse: moyenneClasse.toFixed(2),
      meilleureMoyenne: meilleureMoyenne.toFixed(2),
      pireMoyenne: pireMoyenne.toFixed(2),
      meilleurEleveNom, pireEleveNom,
      effectif: elevesList.length,
      appreciationDetail
    };
  }, [matieresAvecNotes, eleve.id, classe, periode, allNotes, elevesList]);

  const handlePrint = () => setTimeout(() => window.print(), 100);
  
  const isFelicitations = parseFloat(resultats.moyenneGenerale as string) >= 15;
  const isEncouragement = parseFloat(resultats.moyenneGenerale as string) >= 12 && parseFloat(resultats.moyenneGenerale as string) < 15;
  const isSatisfaisant = parseFloat(resultats.moyenneGenerale as string) >= 10 && parseFloat(resultats.moyenneGenerale as string) < 12;
  const isPeutMieuxFaire = parseFloat(resultats.moyenneGenerale as string) >= 8 && parseFloat(resultats.moyenneGenerale as string) < 10;
  const isInsuffisant = parseFloat(resultats.moyenneGenerale as string) < 8;

  const photoUrl = getElevePhoto(eleve);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white overflow-y-auto">
      <div className="bg-white w-full max-w-4xl shadow-2xl print:shadow-none my-8" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        <div className="p-6 print:p-4">
          
          {/* EN-TÊTE OFFICIEL */}
          <div className="text-center border-b-2 border-black pb-3 mb-4">
            <div className="flex justify-between items-start">
              <div className="text-left text-[10px] leading-tight w-1/4">
                <p className="font-bold">REPUBLIQUE DU CAMEROUN</p>
                <p>Paix - Travail - Patrie</p>
              </div>
              <div className="text-center w-2/4">
                <p className="text-[9px] font-bold">MINISTERE DES ENSEIGNEMENTS SECONDAIRES</p>
                <p className="text-[8px]">DELEGATION REGIONALE DU {region}</p>
                <p className="text-[8px]">DELEGATION DEPARTEMENTALE DU {delegation}</p>
                <p className="text-xs font-bold mt-1">{nomEtab}</p>
                <p className="text-[8px]">{adresse}</p>
                <p className="text-[8px]">📞 {telephone}</p>
              </div>
              <div className="text-right w-1/4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain ml-auto" />
                ) : (
                  <div className="w-14 h-14 border border-black flex items-center justify-center text-[8px] ml-auto">LOGO</div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-sm font-bold uppercase">BULLETIN DE NOTES</h2>
              <p className="text-[10px] font-semibold mt-0.5">{periode}</p>
              <p className="text-[9px]">Année scolaire {annee}</p>
            </div>
          </div>

          {/* IDENTITÉ DE L'ÉLÈVE AVEC PHOTO */}
          <div className="flex gap-4 mb-4 border border-black p-3">
            <div className="flex-shrink-0">
              <img 
                src={photoUrl} 
                alt={eleve.nom} 
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-md"
              />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              <div><span className="font-bold">Prénoms:</span> {eleve.nom?.split(' ')[1] || eleve.nom || ""}</div>
              <div><span className="font-bold">Nom:</span> {eleve.nom?.split(' ')[0] || eleve.nom || ""}</div>
              <div><span className="font-bold">Né(e) le:</span> {eleve.dateNaissance || "—"}</div>
              <div><span className="font-bold">à:</span> {eleve.lieuNaissance || "—"}</div>
              <div><span className="font-bold">Classe:</span> {classe}</div>
              <div><span className="font-bold">Matricule:</span> {eleve.matricule || eleve.id.toString().padStart(6, '0')}</div>
              <div><span className="font-bold">Nbre d'élèves:</span> {resultats.effectif}</div>
              <div><span className="font-bold">Redouble:</span> {eleve.redoublant ? "Oui" : "Non"}</div>
              <div><span className="font-bold">Absences:</span> {loadingAbsences ? "..." : `${nombreAbsences} absence(s)`}</div>
              <div><span className="font-bold">Heures d'absence:</span> {loadingAbsences ? "..." : `${totalHeuresAbsence} h`}</div>
            </div>
          </div>

          {/* TABLEAU DES NOTES */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-[9px] border border-black">
              <thead>
                <tr className="border-b border-black bg-gray-100">
                  <th className="border-r border-black p-1 text-left w-28">DISCIPLINES</th>
                  <th className="border-r border-black p-1 text-center w-10">Devoir</th>
                  <th className="border-r border-black p-1 text-center w-10">Comp</th>
                  <th className="border-r border-black p-1 text-center w-10">Moy/20</th>
                  <th className="border-r border-black p-1 text-center w-8">Coef</th>
                  <th className="border-r border-black p-1 text-center w-12">Moy x</th>
                  <th className="border-r border-black p-1 text-center w-8">T.H</th>
                  <th className="border-r border-black p-1 text-center w-8">Rang</th>
                  <th className="border-r border-black p-1 text-left w-28">Appréciations</th>
                  <th className="border-r border-black p-1 text-left w-24">Professeur</th>
                </tr>
              </thead>
              <tbody>
                {matieresAvecNotes.map((m: any, idx: number) => (
                  <tr key={m.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-r border-black p-1 font-medium">{m.nom}</td>
                    <td className="border-r border-black p-1 text-center">{m.eval1 !== null ? m.eval1.toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1 text-center">{m.eval2 !== null ? m.eval2.toFixed(2) : "—"}</td>
                    <td className="border-r border-black p-1 text-center font-bold">
                      {m.moyenne !== null ? m.moyenne.toFixed(2) : "—"}
                    </td>
                    <td className="border-r border-black p-1 text-center">{m.coefficient}</td>
                    <td className="border-r border-black p-1 text-center">
                      {m.moyenne !== null ? (m.moyenne * m.coefficient).toFixed(2) : "—"}
                    </td>
                    <td className="border-r border-black p-1 text-center">TH</td>
                    <td className="border-r border-black p-1 text-center font-bold">
                      {m.rangMatiere ? `${m.rangMatiere}` : "—"}
                    </td>
                    <td className="border-r border-black p-1">{getAppreciation(m.moyenne)}</td>
                    <td className="border-r border-black p-1 text-[8px]">{m.professeur || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan={4} className="border-r border-black p-1 text-right pr-2">TOTAL:</td>
                  <td className="border-r border-black p-1 text-center">{matieresAvecNotes.reduce((sum: number, m: any) => sum + (m.moyenne !== null ? m.coefficient : 0), 0)}</td>
                  <td className="border-r border-black p-1 text-center">{matieresAvecNotes.reduce((sum: number, m: any) => sum + (m.moyenne !== null ? (m.moyenne * m.coefficient) : 0), 0).toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-center" colSpan={2}></td>
                  <td className="border-r border-black p-1 text-center" colSpan={2}></td>
                </tr>
                <tr>
                  <td colSpan={4} className="border-r border-black p-1 text-right pr-2">Moyenne / Rang:</td>
                  <td colSpan={2} className="border-r border-black p-1 text-center">{resultats.moyenneGenerale}/20</td>
                  <td className="border-r border-black p-1 text-center">Rang</td>
                  <td className="border-r border-black p-1 text-center font-bold">{resultats.rang}</td>
                  <td colSpan={2} className="border-r border-black p-1"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* STATISTIQUES CLASSE */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-[9px]">
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Moyenne de la classe:</span> {resultats.moyenneClasse}/20
            </div>
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Meilleure moyenne:</span> {resultats.meilleurEleveNom} ({resultats.meilleureMoyenne}/20)
            </div>
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Plus faible moyenne:</span> {resultats.pireEleveNom} ({resultats.pireMoyenne}/20)
            </div>
            <div className="border border-black p-1 text-center">
              <span className="font-bold">Total absences:</span> {loadingAbsences ? "..." : `${nombreAbsences} absence(s) (${totalHeuresAbsence} h)`}
            </div>
          </div>

          {/* MENTIONS */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Satisfaisant</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isSatisfaisant ? 'bg-black' : ''}`}></div>
                <span className="ml-2 text-[8px]">doit continuer</span>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Félicitations</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isFelicitations ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Encouragement</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isEncouragement ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Peut mieux faire</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isPeutMieuxFaire ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Insuffisant</p>
              <div className="flex justify-center items-center h-6">
                <div className={`w-4 h-4 border border-black ${isInsuffisant ? 'bg-black' : ''}`}></div>
              </div>
            </div>
            <div className="border border-black p-1">
              <p className="text-[8px] font-bold text-center">Avertissement</p>
              <div className="flex justify-center items-center h-6">
                <div className="w-4 h-4 border border-black"></div>
              </div>
            </div>
          </div>

          {/* OBSERVATIONS */}
          <div className="border border-black p-2 mb-4">
            <p className="text-[9px] font-bold uppercase mb-1">Observations du conseil des professeurs</p>
            <p className="text-[9px] italic">{resultats.appreciationDetail}</p>
          </div>

          {/* SIGNATURES */}
          <div className="flex justify-between items-end mt-2">
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mb-1"></div>
              <p className="text-[8px]">Le professeur principal</p>
              <p className="text-[9px] font-medium mt-1">{professeurPrincipal}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mb-1"></div>
              <p className="text-[8px]">Le Chef d'Établissement</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mb-1"></div>
              <p className="text-[8px]">Visu du Parent / Tuteur</p>
            </div>
          </div>
          
          <div className="text-center mt-2 text-[7px] text-slate-400">
            <p>{nomEtab} - {annee}</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 print:hidden bg-white sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm hover:bg-slate-50 transition">
            Fermer
          </button>
          <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-2">
            <Printer size={16} /> Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}