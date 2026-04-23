// lib/stores.ts
import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

// ========== HOOK INDEXEDDB ==========
export function useIndexedDB<T>(key: string, initialValue: T): [T, (value: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<T>(key).then(value => {
      if (value !== undefined) {
        setStoredValue(value);
      } else {
        setStoredValue(initialValue);
        set(key, initialValue).catch(console.error);
      }
    }).catch(() => {
      setStoredValue(initialValue);
    }).finally(() => {
      setLoading(false);
    });
  }, [key]);

  const setValue = (value: T) => {
    setStoredValue(value);
    set(key, value).catch(console.error);
  };

  return [storedValue, setValue, loading];
}

// ========== TYPES ==========
export interface Chapitre {
  id: string;
  titre: string;
  description?: string;
  estFait: boolean;
  duree?: number;
}

export interface Eleve {
  id: number;
  nom: string;
  classe: string;
  matricule: string;
  statusColor: string;
  img?: string;
  photo?: string;
  email?: string;
  telephone?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  sexe?: "M" | "F";
  adresse?: string;
  parentNom?: string;
  parentTelephone?: string;
  parentEmail?: string;
  parentProfession?: string;
  dateInscription?: string;
  ancienEtablissement?: string;
  redoublant?: boolean;
  situationFamiliale?: string;
  nomComplet?: string;
  selected?: boolean;
  moyenne?: string;
  noteColor?: string;
}

export interface Module {
  id: string;
  titre: string;
  description?: string;
  chapitres: Chapitre[];
}

export interface Enseignement {
  matiere: string;
  classe: string;
  estPrincipal?: boolean;
}

export interface Enseignant {
  id: number;
  name: string;
  email: string;
  phone: string;
  matieres: string[];
  classes: string[];
  status: string;
  photo: string;
  bureau?: string;
  horaires?: string;
  coursIds?: string[];
  enseignements?: Enseignement[];
}

export interface Cours {
  id: string;
  matiere: string;
  professeur: string;
  salle: string;
  classe: string;
  jour: string;
  heure: string;
  duree: number;
  progress: number;
  status: string;
  students: number;
  coefficient: number;
  hoursPerWeek: number;
  image: string;
  modules: Module[];
}

export interface Message {
  id: number;
  expediteur: string;
  expediteurRole: string;
  expediteurAvatar: string;
  destinataireClasse: string;
  contenu: string;
  date: string;
  lu: boolean;
  pieceJointe?: string;
}

export interface Document {
  id: number;
  nom: string;
  type: "pdf" | "doc" | "img" | "video" | "autre";
  categorie: string;
  classe: string;
  matiere?: string;
  taille: string;
  date: string;
  url: string;
  auteur: string;
  auteurId?: number;
  approuve?: boolean;
  telechargements?: number;
  favori?: boolean;
}

export interface Transaction {
  id: number;
  eleve: string;
  classe: string;
  type: string;
  montant: number;
  date: string;
  statut: string;
  methode: string;
  reference?: string;
}

// Interface NOTE avec deux évaluations (eval1 et eval2)
export interface Note {
  eleveId: number;
  eval1: number | null;
  eval2: number | null;
  moyenne: number | null;
  appreciation?: string;
}

export interface Salle {
  id: string;
  nom: string;
  capacite: number;
  batiment: string;
  equipements?: string[];
  description?: string;
}

export interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
  description?: string;
}

export interface FraisNiveau {
  id: string;
  niveau: string;
  montant: number;
  description?: string;
}

export interface Niveau {
  id: string;
  nom: string;
  description?: string;
  ordre: number;
}

export interface Classe {
  id: string;
  nom: string;
  niveauId: string;
  effectif?: number;
}

export interface Etablissement {
  id: string;
  nom: string;
  logo?: string;
  adresse: string;
  telephone: string;
  email: string;
  devise?: string;
  anneeScolaire: string;
  region?: string;
  delegation?: string;
  departement?: string;
}

export interface Pause {
  id: string;
  heureDebut: string;
  heureFin: string;
  description: string;
}

export interface Devoir {
  id: string;
  titre: string;
  description: string;
  matiere: string;
  classe: string;
  professeur: string;
  professeurId: number;
  datePublication: string;
  dateLimite: string;
  fichiers: Fichier[];
  type: "devoir" | "exercice" | "projet" | "examen";
  coefficient?: number;
  noteSur?: number;
}

export interface Fichier {
  id: string;
  nom: string;
  url: string;
  type: "pdf" | "image" | "doc" | "other";
  taille: number;
  dateUpload: string;
}

export interface Rendu {
  id: string;
  devoirId: string;
  eleveId: number;
  eleveNom: string;
  dateRendu: string;
  fichiers: Fichier[];
  note?: number;
  appreciation?: string;
  corrige?: Fichier[];
  estCorrige: boolean;
}

export interface Commentaire {
  id: string;
  devoirId: string;
  eleveId: number;
  eleveNom: string;
  professeurId?: number;
  professeurNom?: string;
  contenu: string;
  date: string;
}

// ========== FONCTION POUR CALCULER LA MOYENNE ==========
function calculerMoyenne(e1: number | null, e2: number | null): number | null {
  if (e1 !== null && e2 !== null) return Number(((e1 + e2) / 2).toFixed(1));
  if (e1 !== null) return e1;
  if (e2 !== null) return e2;
  return null;
}

function getAppreciation(note: number | null): string {
  if (note === null) return "Non évalué";
  if (note >= 16) return "Excellent";
  if (note >= 14) return "Très bien";
  if (note >= 12) return "Bien";
  if (note >= 10) return "Assez bien";
  if (note >= 8) return "Passable";
  return "Insuffisant";
}

// ========== GÉNÉRATION DES NOTES DE TEST ==========
function genererNotesTest(): Record<string, Note[]> {
  const notes: Record<string, Note[]> = {};
  
  // Classes avec leurs élèves
  const classesData: Record<string, { id: number; nom: string }[]> = {
    "6A": [
      { id: 1, nom: "Jean Mbélé" },
      { id: 4, nom: "Émile Tamko" }
    ],
    "5B": [
      { id: 2, nom: "Elise Nend" }
    ],
    "4A": [
      { id: 3, nom: "Dider Fongang" }
    ],
    "Terminale A": [
      { id: 5, nom: "Nadia Ebwelle" }
    ]
  };

  // Matières avec leurs IDs
  const matieresList = [
    { id: "maths", nom: "MATHÉMATIQUES", coefficient: 4 },
    { id: "francais", nom: "FRANÇAIS", coefficient: 3 },
    { id: "anglais", nom: "ANGLAIS", coefficient: 2 },
    { id: "histgeo", nom: "HISTOIRE-GÉOGRAPHIE", coefficient: 3 },
    { id: "physique", nom: "PHYSIQUE-CHIMIE", coefficient: 5 },
    { id: "info", nom: "INFORMATIQUE", coefficient: 2 },
    { id: "eps", nom: "EPS", coefficient: 2 },
    { id: "education", nom: "ÉDUCATION CIVIQUE", coefficient: 1 }
  ];

  const periodes = ["1er TRIMESTRE", "2ème TRIMESTRE", "3ème TRIMESTRE"];

  // Données de notes pour chaque élève, matière et période
  const notesData: Record<string, Record<string, Record<string, { eval1: number | null; eval2: number | null }>>> = {
    // Jean Mbélé (6A)
    "1": {
      "maths": {
        "1er TRIMESTRE": { eval1: 12, eval2: 14 },
        "2ème TRIMESTRE": { eval1: 13, eval2: 15 },
        "3ème TRIMESTRE": { eval1: 14, eval2: 16 }
      },
      "francais": {
        "1er TRIMESTRE": { eval1: 11, eval2: 13 },
        "2ème TRIMESTRE": { eval1: 12, eval2: 14 },
        "3ème TRIMESTRE": { eval1: 13, eval2: 15 }
      },
      "anglais": {
        "1er TRIMESTRE": { eval1: 10, eval2: 12 },
        "2ème TRIMESTRE": { eval1: 11, eval2: 13 },
        "3ème TRIMESTRE": { eval1: 12, eval2: 14 }
      },
      "histgeo": {
        "1er TRIMESTRE": { eval1: 9, eval2: 11 },
        "2ème TRIMESTRE": { eval1: 10, eval2: 12 },
        "3ème TRIMESTRE": { eval1: 11, eval2: 13 }
      },
      "physique": {
        "1er TRIMESTRE": { eval1: 13, eval2: 15 },
        "2ème TRIMESTRE": { eval1: 14, eval2: 16 },
        "3ème TRIMESTRE": { eval1: 15, eval2: 17 }
      },
      "info": {
        "1er TRIMESTRE": { eval1: 14, eval2: 16 },
        "2ème TRIMESTRE": { eval1: 15, eval2: 17 },
        "3ème TRIMESTRE": { eval1: 16, eval2: 18 }
      },
      "eps": {
        "1er TRIMESTRE": { eval1: 15, eval2: 17 },
        "2ème TRIMESTRE": { eval1: 16, eval2: 18 },
        "3ème TRIMESTRE": { eval1: 17, eval2: 19 }
      },
      "education": {
        "1er TRIMESTRE": { eval1: 12, eval2: 14 },
        "2ème TRIMESTRE": { eval1: 13, eval2: 15 },
        "3ème TRIMESTRE": { eval1: 14, eval2: 16 }
      }
    },
    // Émile Tamko (6A)
    "4": {
      "maths": {
        "1er TRIMESTRE": { eval1: 8, eval2: 10 },
        "2ème TRIMESTRE": { eval1: 9, eval2: 11 },
        "3ème TRIMESTRE": { eval1: 10, eval2: 12 }
      },
      "francais": {
        "1er TRIMESTRE": { eval1: 7, eval2: 9 },
        "2ème TRIMESTRE": { eval1: 8, eval2: 10 },
        "3ème TRIMESTRE": { eval1: 9, eval2: 11 }
      },
      "anglais": {
        "1er TRIMESTRE": { eval1: 6, eval2: 8 },
        "2ème TRIMESTRE": { eval1: 7, eval2: 9 },
        "3ème TRIMESTRE": { eval1: 8, eval2: 10 }
      },
      "histgeo": {
        "1er TRIMESTRE": { eval1: 5, eval2: 7 },
        "2ème TRIMESTRE": { eval1: 6, eval2: 8 },
        "3ème TRIMESTRE": { eval1: 7, eval2: 9 }
      },
      "physique": {
        "1er TRIMESTRE": { eval1: 9, eval2: 11 },
        "2ème TRIMESTRE": { eval1: 10, eval2: 12 },
        "3ème TRIMESTRE": { eval1: 11, eval2: 13 }
      },
      "info": {
        "1er TRIMESTRE": { eval1: 10, eval2: 12 },
        "2ème TRIMESTRE": { eval1: 11, eval2: 13 },
        "3ème TRIMESTRE": { eval1: 12, eval2: 14 }
      },
      "eps": {
        "1er TRIMESTRE": { eval1: 11, eval2: 13 },
        "2ème TRIMESTRE": { eval1: 12, eval2: 14 },
        "3ème TRIMESTRE": { eval1: 13, eval2: 15 }
      },
      "education": {
        "1er TRIMESTRE": { eval1: 8, eval2: 10 },
        "2ème TRIMESTRE": { eval1: 9, eval2: 11 },
        "3ème TRIMESTRE": { eval1: 10, eval2: 12 }
      }
    },
    // Elise Nend (5B)
    "2": {
      "maths": {
        "1er TRIMESTRE": { eval1: 14, eval2: 16 },
        "2ème TRIMESTRE": { eval1: 15, eval2: 17 },
        "3ème TRIMESTRE": { eval1: 16, eval2: 18 }
      },
      "francais": {
        "1er TRIMESTRE": { eval1: 13, eval2: 15 },
        "2ème TRIMESTRE": { eval1: 14, eval2: 16 },
        "3ème TRIMESTRE": { eval1: 15, eval2: 17 }
      },
      "anglais": {
        "1er TRIMESTRE": { eval1: 12, eval2: 14 },
        "2ème TRIMESTRE": { eval1: 13, eval2: 15 },
        "3ème TRIMESTRE": { eval1: 14, eval2: 16 }
      },
      "histgeo": {
        "1er TRIMESTRE": { eval1: 11, eval2: 13 },
        "2ème TRIMESTRE": { eval1: 12, eval2: 14 },
        "3ème TRIMESTRE": { eval1: 13, eval2: 15 }
      },
      "physique": {
        "1er TRIMESTRE": { eval1: 15, eval2: 17 },
        "2ème TRIMESTRE": { eval1: 16, eval2: 18 },
        "3ème TRIMESTRE": { eval1: 17, eval2: 19 }
      },
      "info": {
        "1er TRIMESTRE": { eval1: 16, eval2: 18 },
        "2ème TRIMESTRE": { eval1: 17, eval2: 19 },
        "3ème TRIMESTRE": { eval1: 18, eval2: 20 }
      },
      "eps": {
        "1er TRIMESTRE": { eval1: 14, eval2: 16 },
        "2ème TRIMESTRE": { eval1: 15, eval2: 17 },
        "3ème TRIMESTRE": { eval1: 16, eval2: 18 }
      },
      "education": {
        "1er TRIMESTRE": { eval1: 13, eval2: 15 },
        "2ème TRIMESTRE": { eval1: 14, eval2: 16 },
        "3ème TRIMESTRE": { eval1: 15, eval2: 17 }
      }
    },
    // Dider Fongang (4A)
    "3": {
      "maths": {
        "1er TRIMESTRE": { eval1: 6, eval2: 8 },
        "2ème TRIMESTRE": { eval1: 7, eval2: 9 },
        "3ème TRIMESTRE": { eval1: 8, eval2: 10 }
      },
      "francais": {
        "1er TRIMESTRE": { eval1: 5, eval2: 7 },
        "2ème TRIMESTRE": { eval1: 6, eval2: 8 },
        "3ème TRIMESTRE": { eval1: 7, eval2: 9 }
      },
      "anglais": {
        "1er TRIMESTRE": { eval1: 4, eval2: 6 },
        "2ème TRIMESTRE": { eval1: 5, eval2: 7 },
        "3ème TRIMESTRE": { eval1: 6, eval2: 8 }
      },
      "histgeo": {
        "1er TRIMESTRE": { eval1: 3, eval2: 5 },
        "2ème TRIMESTRE": { eval1: 4, eval2: 6 },
        "3ème TRIMESTRE": { eval1: 5, eval2: 7 }
      },
      "physique": {
        "1er TRIMESTRE": { eval1: 7, eval2: 9 },
        "2ème TRIMESTRE": { eval1: 8, eval2: 10 },
        "3ème TRIMESTRE": { eval1: 9, eval2: 11 }
      },
      "info": {
        "1er TRIMESTRE": { eval1: 8, eval2: 10 },
        "2ème TRIMESTRE": { eval1: 9, eval2: 11 },
        "3ème TRIMESTRE": { eval1: 10, eval2: 12 }
      },
      "eps": {
        "1er TRIMESTRE": { eval1: 9, eval2: 11 },
        "2ème TRIMESTRE": { eval1: 10, eval2: 12 },
        "3ème TRIMESTRE": { eval1: 11, eval2: 13 }
      },
      "education": {
        "1er TRIMESTRE": { eval1: 6, eval2: 8 },
        "2ème TRIMESTRE": { eval1: 7, eval2: 9 },
        "3ème TRIMESTRE": { eval1: 8, eval2: 10 }
      }
    },
    // Nadia Ebwelle (Terminale A)
    "5": {
      "maths": {
        "1er TRIMESTRE": { eval1: 17, eval2: 19 },
        "2ème TRIMESTRE": { eval1: 18, eval2: 19 },
        "3ème TRIMESTRE": { eval1: 19, eval2: 20 }
      },
      "francais": {
        "1er TRIMESTRE": { eval1: 16, eval2: 18 },
        "2ème TRIMESTRE": { eval1: 17, eval2: 19 },
        "3ème TRIMESTRE": { eval1: 18, eval2: 19 }
      },
      "anglais": {
        "1er TRIMESTRE": { eval1: 15, eval2: 17 },
        "2ème TRIMESTRE": { eval1: 16, eval2: 18 },
        "3ème TRIMESTRE": { eval1: 17, eval2: 19 }
      },
      "histgeo": {
        "1er TRIMESTRE": { eval1: 14, eval2: 16 },
        "2ème TRIMESTRE": { eval1: 15, eval2: 17 },
        "3ème TRIMESTRE": { eval1: 16, eval2: 18 }
      },
      "physique": {
        "1er TRIMESTRE": { eval1: 18, eval2: 19 },
        "2ème TRIMESTRE": { eval1: 18, eval2: 20 },
        "3ème TRIMESTRE": { eval1: 19, eval2: 20 }
      },
      "info": {
        "1er TRIMESTRE": { eval1: 17, eval2: 19 },
        "2ème TRIMESTRE": { eval1: 18, eval2: 20 },
        "3ème TRIMESTRE": { eval1: 19, eval2: 20 }
      },
      "eps": {
        "1er TRIMESTRE": { eval1: 16, eval2: 18 },
        "2ème TRIMESTRE": { eval1: 17, eval2: 19 },
        "3ème TRIMESTRE": { eval1: 18, eval2: 19 }
      },
      "education": {
        "1er TRIMESTRE": { eval1: 15, eval2: 17 },
        "2ème TRIMESTRE": { eval1: 16, eval2: 18 },
        "3ème TRIMESTRE": { eval1: 17, eval2: 19 }
      }
    }
  };

  // Générer les notes pour chaque classe, matière et période
  for (const [classe, eleves] of Object.entries(classesData)) {
    for (const matiere of matieresList) {
      for (const periode of periodes) {
        const key = `${classe}_${matiere.id}_${periode}`;
        const notesList: Note[] = [];

        for (const eleve of eleves) {
          const notesEleve = notesData[eleve.id.toString()]?.[matiere.id]?.[periode];
          
          if (notesEleve) {
            const { eval1, eval2 } = notesEleve;
            const moyenne = calculerMoyenne(eval1, eval2);
            const appreciation = getAppreciation(moyenne);

            notesList.push({
              eleveId: eleve.id,
              eval1,
              eval2,
              moyenne,
              appreciation
            });
          } else {
            // Si pas de données, mettre des valeurs par défaut
            notesList.push({
              eleveId: eleve.id,
              eval1: null,
              eval2: null,
              moyenne: null,
              appreciation: "Non évalué"
            });
          }
        }

        notes[key] = notesList;
      }
    }
  }

  return notes;
}

// ========== STORES ==========

export function useElevesStore() {
  const initialEleves: Eleve[] = [
    { id: 1, nom: "Jean Mbélé", classe: "6A", matricule: "9/02 410", statusColor: "bg-emerald-400", img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop", parentTelephone: "+237 612345678", parentEmail: "parent.jean@example.com", dateNaissance: "2012-05-15", lieuNaissance: "Douala" },
    { id: 2, nom: "Elise Nend", classe: "5B", matricule: "5/22,000", statusColor: "bg-teal-400", img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=100&h=100&fit=crop", selected: true, parentTelephone: "+237 623456789", parentEmail: "parent.elise@example.com", dateNaissance: "2011-08-22", lieuNaissance: "Yaoundé" },
    { id: 3, nom: "Dider Fongang", classe: "4A", matricule: "8/163 410", statusColor: "bg-sky-400", img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop", parentTelephone: "+237 634567890", parentEmail: "parent.dider@example.com", dateNaissance: "2010-03-10", lieuNaissance: "Bafoussam" },
    { id: 4, nom: "Émile Tamko", classe: "6A", matricule: "5/02,003", statusColor: "bg-indigo-400", img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop", parentTelephone: "+237 645678901", parentEmail: "parent.emile@example.com", dateNaissance: "2012-11-30", lieuNaissance: "Douala" },
    { id: 5, nom: "Nadia Ebwelle", classe: "Terminale A", matricule: "5/07/223", statusColor: "bg-amber-400", img: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop", parentTelephone: "+237 656789012", parentEmail: "parent.nadia@example.com", dateNaissance: "2006-07-18", lieuNaissance: "Yaoundé" },
  ];
  return useIndexedDB("eleves", initialEleves);
}

export function useEnseignantsStore() {
  const initialEnseignants: Enseignant[] = [
    { id: 1, name: "Dr. Kanga Martin", email: "martin.kanga@enspd.cm", phone: "+237 670 00 00 01", matieres: ["Maths", "Algorithmique"], classes: ["6A", "5B"], status: "Titulaire", photo: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop", enseignements: [] },
    { id: 2, name: "Mme Ngo Pauline", email: "pauline.ngo@enspd.cm", phone: "+237 690 00 00 02", matieres: ["Français", "Littérature"], classes: ["5B", "4A"], status: "Contractuelle", photo: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=100&h=100&fit=crop", enseignements: [] },
    { id: 3, name: "M. Fongang Didier", email: "didier.f@enspd.cm", phone: "+237 650 00 00 03", matieres: ["Anglais", "Business"], classes: ["Terminale A", "Seconde A"], status: "Titulaire", photo: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop", enseignements: [] },
    { id: 4, name: "M. Ibrahim Fofana", email: "i.fofana@enspd.cm", phone: "+237 677 88 99 04", matieres: ["Histoire-Géo"], classes: ["4A", "3A"], status: "Vacataire", photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop", enseignements: [] },
    { id: 5, name: "Mme Djou Alice", email: "alice.djou@enspd.cm", phone: "+237 611 22 33 05", matieres: ["Physique", "Chimie"], classes: ["Première A", "Terminale A"], status: "Titulaire", photo: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop", enseignements: [] },
    { id: 6, name: "M. Paul Kamga", email: "paul.k@enspd.cm", phone: "+237 644 55 66 06", matieres: ["Informatique"], classes: ["3A", "Seconde A"], status: "Contractuel", photo: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=100&h=100&fit=crop", enseignements: [] },
  ];
  return useIndexedDB("enseignants", initialEnseignants);
}

export function useCoursStore() {
  const initialCours: Cours[] = [
    {
      id: "1", matiere: "Mathématiques", professeur: "M. Kanga", salle: "Salle 12", classe: "6A",
      jour: "Lundi", heure: "8h-10h", duree: 2, progress: 0, status: "En cours", students: 32,
      coefficient: 4, hoursPerWeek: 4,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop",
      modules: genererModulesParDefaut("Mathématiques")
    },
    {
      id: "2", matiere: "Français", professeur: "Mme Ngo", salle: "Salle 8", classe: "5B",
      jour: "Mardi", heure: "10h-12h", duree: 2, progress: 0, status: "Avancé", students: 28,
      coefficient: 3, hoursPerWeek: 3,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=100&h=100&fit=crop",
      modules: genererModulesParDefaut("Français")
    },
  ];
  return useIndexedDB("cours", initialCours);
}

export function useMessagesStore() {
  const initialMessages: Message[] = [
    { id: 1, expediteur: "Direction", expediteurRole: "admin", expediteurAvatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff", destinataireClasse: "all", contenu: "📢 Réunion parents-professeurs le 15 avril à 15h.", date: new Date().toISOString(), lu: false },
    { id: 2, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "6A", contenu: "Devoir maison à rendre pour lundi.", date: new Date().toISOString(), lu: false },
  ];
  return useIndexedDB("messages", initialMessages);
}

export function useTransactionsStore() {
  const initialTransactions: Transaction[] = [
    { id: 1, eleve: "Jean Mbélé", classe: "6A", type: "Paiement", montant: 25000, date: "2025-04-01", statut: "payé", methode: "Mobile Money", reference: "MM-12345" },
    { id: 2, eleve: "Elise Nend", classe: "5B", type: "Paiement", montant: 20000, date: "2025-03-28", statut: "payé", methode: "Espèces" },
    { id: 3, eleve: "Dider Fongang", classe: "4A", type: "Frais scolarité", montant: 45000, date: "2025-04-05", statut: "impayé", methode: "—" },
  ];
  return useIndexedDB("transactions", initialTransactions);
}

export function useNotesStore() {
  // Générer des données de test pour les notes
  const initialNotes: Record<string, Note[]> = genererNotesTest();
  return useIndexedDB("notes", initialNotes);
}

export function useDocumentsStore() {
  const initialDocuments: Document[] = [
    { id: 1, nom: "Cours maths - Chapitre 3", type: "pdf", categorie: "cours", classe: "6A", matiere: "Maths", taille: "2.3 MB", date: "2025-03-15", url: "#", auteur: "M. Kanga" },
    { id: 2, nom: "Épreuve Maths BAC 2024", type: "pdf", categorie: "anciennes-epreuves", classe: "Terminale A", matiere: "Maths", taille: "4.5 MB", date: "2024-06-10", url: "#", auteur: "Ministère" },
  ];
  return useIndexedDB("documents", initialDocuments);
}

export function useSallesStore() {
  const initialSalles: Salle[] = [
    { id: "1", nom: "Salle 12", capacite: 32, batiment: "A", equipements: ["tableau", "vidéoprojecteur"] },
    { id: "2", nom: "Salle 8", capacite: 28, batiment: "A", equipements: ["tableau"] },
    { id: "3", nom: "Labo 1", capacite: 24, batiment: "B", equipements: ["ordinateurs", "tableau interactif"] },
    { id: "4", nom: "Labo 2", capacite: 24, batiment: "B", equipements: ["ordinateurs"] },
    { id: "5", nom: "Salle 5", capacite: 30, batiment: "C", equipements: ["tableau"] },
    { id: "6", nom: "Salle Info", capacite: 20, batiment: "D", equipements: ["ordinateurs", "vidéoprojecteur"] },
    { id: "7", nom: "Terrain", capacite: 50, batiment: "Extérieur", equipements: [] },
  ];
  return useIndexedDB("salles", initialSalles);
}

function genererModulesParDefaut(matiere: string): Module[] {
  return [
    {
      id: `mod-${Date.now()}-1`,
      titre: "Introduction",
      description: `Les bases de ${matiere}`,
      chapitres: [
        { id: `ch-${Date.now()}-1`, titre: "Chapitre 1 : Concepts fondamentaux", estFait: false, duree: 60 },
        { id: `ch-${Date.now()}-2`, titre: "Chapitre 2 : Premières applications", estFait: false, duree: 90 },
      ]
    },
    {
      id: `mod-${Date.now()}-2`,
      titre: "Approfondissement",
      description: "Sujets avancés",
      chapitres: [
        { id: `ch-${Date.now()}-3`, titre: "Chapitre 3 : Théorie avancée", estFait: false, duree: 120 },
        { id: `ch-${Date.now()}-4`, titre: "Chapitre 4 : Exercices pratiques", estFait: false, duree: 90 },
      ]
    }
  ];
}

export function useMatieresStore() {
  const initialMatieres: Matiere[] = [
    { id: "maths", nom: "MATHÉMATIQUES", coefficient: 4, description: "Mathématiques générales" },
    { id: "francais", nom: "FRANÇAIS", coefficient: 3, description: "Langue française" },
    { id: "anglais", nom: "ANGLAIS", coefficient: 2, description: "Langue anglaise" },
    { id: "histgeo", nom: "HISTOIRE-GÉOGRAPHIE", coefficient: 3, description: "Histoire et Géographie" },
    { id: "physique", nom: "PHYSIQUE-CHIMIE", coefficient: 5, description: "Sciences physiques" },
    { id: "info", nom: "INFORMATIQUE", coefficient: 2, description: "Informatique" },
    { id: "eps", nom: "EPS", coefficient: 2, description: "Éducation physique" },
    { id: "education", nom: "ÉDUCATION CIVIQUE", coefficient: 1, description: "Éducation civique" },
  ];
  return useIndexedDB("matieres", initialMatieres);
}

export function useFraisStore() {
  const initialFrais: FraisNiveau[] = [
    { id: "1", niveau: "6ème", montant: 150000, description: "Frais de scolarité annuel" },
    { id: "2", niveau: "5ème", montant: 150000, description: "Frais de scolarité annuel" },
    { id: "3", niveau: "4ème", montant: 160000, description: "Frais de scolarité annuel" },
    { id: "4", niveau: "3ème", montant: 160000, description: "Frais de scolarité annuel" },
    { id: "5", niveau: "Seconde", montant: 170000, description: "Frais de scolarité annuel" },
    { id: "6", niveau: "Première", montant: 170000, description: "Frais de scolarité annuel" },
    { id: "7", niveau: "Terminale", montant: 180000, description: "Frais de scolarité annuel" },
  ];
  return useIndexedDB("frais", initialFrais);
}

export function useNiveauxStore() {
  const initialNiveaux: Niveau[] = [
    { id: "1", nom: "6ème", ordre: 1, description: "Cycle d'orientation" },
    { id: "2", nom: "5ème", ordre: 2, description: "Cycle d'orientation" },
    { id: "3", nom: "4ème", ordre: 3, description: "Cycle d'observation" },
    { id: "4", nom: "3ème", ordre: 4, description: "Cycle d'observation" },
    { id: "5", nom: "Seconde", ordre: 5, description: "Cycle déterminant" },
    { id: "6", nom: "Première", ordre: 6, description: "Cycle terminal" },
    { id: "7", nom: "Terminale", ordre: 7, description: "Cycle terminal" },
  ];
  return useIndexedDB("niveaux", initialNiveaux);
}

export function useClassesStore() {
  const initialClasses: Classe[] = [
    { id: "1", nom: "6A", niveauId: "1", effectif: 32 },
    { id: "2", nom: "6B", niveauId: "1", effectif: 30 },
    { id: "3", nom: "6C", niveauId: "1", effectif: 28 },
    { id: "4", nom: "5A", niveauId: "2", effectif: 31 },
    { id: "5", nom: "5B", niveauId: "2", effectif: 29 },
    { id: "6", nom: "4A", niveauId: "3", effectif: 30 },
    { id: "7", nom: "3A", niveauId: "4", effectif: 27 },
    { id: "8", nom: "Seconde A", niveauId: "5", effectif: 35 },
    { id: "9", nom: "Première A", niveauId: "6", effectif: 33 },
    { id: "10", nom: "Terminale A", niveauId: "7", effectif: 28 },
  ];
  return useIndexedDB("classes", initialClasses);
}

export function useEtablissementStore() {
  const initialEtablissement: Etablissement = {
    id: "1",
    nom: "Lycée de Deido",
    logo: "",
    adresse: "BP : 6500 Douala",
    telephone: "65268234 / 695789136",
    email: "contact@lyceedeido.cm",
    anneeScolaire: "2026/2027",
    region: "Littoral",
    delegation: "DOUALA 5ÈME",
  };
  return useIndexedDB("etablissement", initialEtablissement);
}

export function usePausesStore() {
  const initialPauses: Pause[] = [
    { id: "1", heureDebut: "12:00", heureFin: "14:00", description: "Pause déjeuner" },
  ];
  return useIndexedDB("pauses", initialPauses);
}