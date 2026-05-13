// components/notes/utils.ts
import { Eleve } from "@/lib/stores";

// Définir l'interface NoteComplete localement
export interface NoteComplete {
  id: number;
  eleveId: number;
  matiereId: string;
  periode: string;
  eval1: number | null;
  eval2: number | null;
  moyenne: number | null;
  appreciation: string | null;
}

export const toutesLesMatieres: Matiere[] = [
  { id: "maths", nom: "MATHÉMATIQUES", coefficient: 4 },
  { id: "francais", nom: "FRANÇAIS", coefficient: 3 },
  { id: "anglais", nom: "ANGLAIS", coefficient: 2 },
  { id: "histgeo", nom: "HISTOIRE-GÉOGRAPHIE", coefficient: 3 },
  { id: "physique", nom: "PHYSIQUE-CHIMIE", coefficient: 5 },
  { id: "info", nom: "INFORMATIQUE", coefficient: 2 },
  { id: "eps", nom: "EPS", coefficient: 2 },
  { id: "education", nom: "ÉDUCATION CIVIQUE", coefficient: 1 },
];

export const periodes = ["1er TRIMESTRE", "2ème TRIMESTRE", "3ème TRIMESTRE", "EXAMEN FINAL"];

export interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
}

export function calculerMoyenne(e1: number | null, e2: number | null): number | null {
  if (e1 !== null && e2 !== null) return Number(((e1 + e2) / 2).toFixed(1));
  if (e1 !== null) return e1;
  if (e2 !== null) return e2;
  return null;
}

export function getAppreciation(note: number | null): string {
  if (note === null) return "Non évalué";
  if (note >= 16) return "Excellent";
  if (note >= 14) return "Très bien";
  if (note >= 12) return "Bien";
  if (note >= 10) return "Assez bien";
  if (note >= 8) return "Passable";
  return "Insuffisant";
}

export function getMentionColor(note: number | null): string {
  if (note === null) return "text-slate-400";
  if (note >= 16) return "text-emerald-600";
  if (note >= 14) return "text-emerald-500";
  if (note >= 12) return "text-blue-600";
  if (note >= 10) return "text-blue-500";
  if (note >= 8) return "text-amber-600";
  return "text-red-500";
}

export function getMentionBg(note: number | null): string {
  if (note === null) return "bg-slate-100 text-slate-500";
  if (note >= 16) return "bg-emerald-100 text-emerald-700";
  if (note >= 14) return "bg-emerald-50 text-emerald-700";
  if (note >= 12) return "bg-blue-100 text-blue-700";
  if (note >= 10) return "bg-blue-50 text-blue-700";
  if (note >= 8) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

export function getElevePhoto(eleve: Eleve): string {
  if (eleve.photo?.startsWith("http") || eleve.photo?.startsWith("data:image")) return eleve.photo;
  if (eleve.img?.startsWith("http") || eleve.img?.startsWith("data:image")) return eleve.img;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom)}&background=random&color=fff&size=100&rounded=true`;
}

export function getProfesseurPrincipal(classe: string, enseignants: any[]): string {
  for (const ens of enseignants) {
    const found = ens.enseignements?.find((e: any) => e.classe === classe && e.estPrincipal);
    if (found) return ens.name;
  }
  return "Non attribué";
}

export function calculerMoyenneGeneraleEleve(
  eleveId: number,
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string
): number {
  let total = 0, coef = 0;
  for (const m of toutesLesMatieres) {
    const key = `${classe}_${m.id}_${periode}`;
    const note = (allNotes[key] || []).find((n) => n.eleveId === eleveId)?.moyenne ?? null;
    if (note !== null) {
      total += note * m.coefficient;
      coef += m.coefficient;
    }
  }
  return coef > 0 ? total / coef : 0;
}

export function calculerRang(
  eleveId: number,
  elevesList: Eleve[],
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string
): number {
  const moyennes = elevesList.map((e) => ({
    id: e.id,
    moyenne: calculerMoyenneGeneraleEleve(e.id, allNotes, periode, classe),
  }));
  moyennes.sort((a, b) => b.moyenne - a.moyenne);
  return moyennes.findIndex((m) => m.id === eleveId) + 1;
}

export function calculerMoyenneClasse(
  elevesList: Eleve[],
  allNotes: Record<string, NoteComplete[]>,
  periode: string,
  classe: string
): number {
  const moyennes = elevesList.map((e) =>
    calculerMoyenneGeneraleEleve(e.id, allNotes, periode, classe)
  ).filter(m => m > 0);
  return moyennes.length ? moyennes.reduce((a, b) => a + b, 0) / moyennes.length : 0;
}