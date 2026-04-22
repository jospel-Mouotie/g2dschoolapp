// app/documents/page.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Folder, FileText, File, Image, Video, Download, Trash2, Share2,
  Upload, Search, Filter, Grid3x3, List, Calendar,
  BookOpen, Award, FileCheck, Clock, X
} from "lucide-react";
import { useDocumentsStore } from "@/lib/stores";
import type { Document } from "@/lib/stores";

// Catégories disponibles
const categories = [
  { id: "tous", nom: "Tous les documents", icon: Folder },
  { id: "cours", nom: "Cours & Supports", icon: BookOpen },
  { id: "examens", nom: "Examens", icon: Award },
  { id: "anciennes-epreuves", nom: "Anciennes épreuves", icon: FileCheck },
  { id: "pv", nom: "PV & Rapports", icon: Clock },
  { id: "administratif", nom: "Administratif", icon: FileText },
];

const classes = ["Toutes", "6A", "5B", "4A", "3A", "2nde", "1ere", "Tle"];
const matieresListe = ["Toutes", "Maths", "Français", "Anglais", "Histoire", "Physique", "Informatique"];

// Données par défaut (documents de démonstration)
const defaultDocuments: Omit<Document, "id">[] = [
  {
    nom: "Cours maths - Chapitre 3 (Fonctions)",
    type: "pdf",
    categorie: "cours",
    classe: "6A",
    matiere: "Maths",
    taille: "2.3 MB",
    date: "2025-03-15",
    url: "#",
    auteur: "M. Kanga"
  },
  {
    nom: "Devoir maison - Français",
    type: "doc",
    categorie: "examens",
    classe: "5B",
    matiere: "Français",
    taille: "1.1 MB",
    date: "2025-03-20",
    url: "#",
    auteur: "Mme Ngo"
  },
  {
    nom: "Épreuve Maths BAC 2024",
    type: "pdf",
    categorie: "anciennes-epreuves",
    classe: "Tle",
    matiere: "Maths",
    taille: "4.5 MB",
    date: "2024-06-10",
    url: "#",
    auteur: "Ministère"
  },
  {
    nom: "PV Conseil de classe T1",
    type: "pdf",
    categorie: "pv",
    classe: "Toutes",
    matiere: undefined,
    taille: "0.8 MB",
    date: "2025-02-28",
    url: "#",
    auteur: "Direction"
  },
  {
    nom: "Règlement intérieur",
    type: "pdf",
    categorie: "administratif",
    classe: "Toutes",
    matiere: undefined,
    taille: "1.2 MB",
    date: "2024-09-01",
    url: "#",
    auteur: "Direction"
  },
  {
    nom: "Cours Anglais - Present Perfect",
    type: "pdf",
    categorie: "cours",
    classe: "4A",
    matiere: "Anglais",
    taille: "1.8 MB",
    date: "2025-03-10",
    url: "#",
    auteur: "Mr Smith"
  },
  {
    nom: "Examen Blanc Histoire",
    type: "pdf",
    categorie: "examens",
    classe: "3A",
    matiere: "Histoire",
    taille: "3.2 MB",
    date: "2025-03-25",
    url: "#",
    auteur: "M. Fofana"
  },
  {
    nom: "Sujet Physique 2023",
    type: "pdf",
    categorie: "anciennes-epreuves",
    classe: "1ere",
    matiere: "Physique",
    taille: "2.9 MB",
    date: "2023-06-15",
    url: "#",
    auteur: "Ministère"
  }
];

// Icône selon le type de fichier
const getFileIcon = (type: string) => {
  switch(type) {
    case "pdf": return <FileText size={20} className="text-red-500" />;
    case "doc": return <File size={20} className="text-blue-500" />;
    case "img": return <Image size={20} className="text-green-500" />;
    case "video": return <Video size={20} className="text-purple-500" />;
    default: return <File size={20} className="text-slate-400" />;
  }
};

// Couleur de catégorie
const getCategoryColor = (categorie: string) => {
  switch(categorie) {
    case "cours": return "bg-blue-100 text-blue-700";
    case "examens": return "bg-amber-100 text-amber-700";
    case "anciennes-epreuves": return "bg-purple-100 text-purple-700";
    case "pv": return "bg-emerald-100 text-emerald-700";
    case "administratif": return "bg-slate-100 text-slate-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

// Modal d'import
function ImportModal({ onClose, onSave }: { onClose: () => void; onSave: (doc: Omit<Document, "id">) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [nom, setNom] = useState("");
  const [type, setType] = useState<Document["type"]>("pdf");
  const [taille, setTaille] = useState("");
  const [form, setForm] = useState({
    classe: "6A",
    matiere: "Maths",
    categorie: "cours",
    auteur: "Utilisateur",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      let fileType: Document["type"] = "autre";
      if (selectedFile.type === "application/pdf") fileType = "pdf";
      else if (selectedFile.type.includes("word")) fileType = "doc";
      else if (selectedFile.type.startsWith("image/")) fileType = "img";
      else if (selectedFile.type.startsWith("video/")) fileType = "video";

      const fileSize = (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB";
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");

      setFile(selectedFile);
      setNom(fileName);
      setType(fileType);
      setTaille(fileSize);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    onSave({
      nom,
      type,
      categorie: form.categorie,
      classe: form.classe,
      matiere: form.matiere === "Toutes" ? undefined : form.matiere,
      taille,
      date: form.date,
      url: fileUrl,
      auteur: form.auteur,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Importer un document</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Classe</label>
            <select value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} className="w-full border rounded-xl p-2">
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Matière</label>
            <select value={form.matiere} onChange={e => setForm({...form, matiere: e.target.value})} className="w-full border rounded-xl p-2">
              {matieresListe.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <select value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})} className="w-full border rounded-xl p-2">
              {categories.filter(c => c.id !== "tous").map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fichier (PDF, DOC, Image, Vidéo)</label>
            <input type="file" accept=".pdf,.doc,.docx,image/*,video/*" onChange={handleFileChange} required className="w-full border rounded-xl p-2" />
          </div>
          {file && (
            <>
              <div><label className="block text-sm font-medium mb-1">Nom du document</label><input value={nom} onChange={e => setNom(e.target.value)} required className="w-full border rounded-xl p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Auteur</label><input value={form.auteur} onChange={e => setForm({...form, auteur: e.target.value})} className="w-full border rounded-xl p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border rounded-xl p-2" /></div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={!file} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50">Importer</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useDocumentsStore();
  const [search, setSearch] = useState("");
  const [categorieActive, setCategorieActive] = useState("tous");
  const [classeFiltre, setClasseFiltre] = useState("Toutes");
  const [matiereFiltre, setMatiereFiltre] = useState("Toutes");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser avec les documents par défaut si le store est vide
  useEffect(() => {
    if (!isInitialized && documents.length === 0) {
      // Ajouter les documents par défaut
      const initialDocs = defaultDocuments.map((doc, index) => ({
        ...doc,
        id: index + 1
      }));
      setDocuments(initialDocs);
      setIsInitialized(true);
    }
  }, [documents, setDocuments, isInitialized]);

  // Filtrage
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.nom.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.matiere && doc.matiere.toLowerCase().includes(search.toLowerCase())) ||
                          doc.auteur.toLowerCase().includes(search.toLowerCase());
      const matchCategorie = categorieActive === "tous" || doc.categorie === categorieActive;
      const matchClasse = classeFiltre === "Toutes" || doc.classe === classeFiltre || doc.classe === "Toutes";
      const matchMatiere = matiereFiltre === "Toutes" || doc.matiere === matiereFiltre;
      return matchSearch && matchCategorie && matchClasse && matchMatiere;
    });
  }, [documents, search, categorieActive, classeFiltre, matiereFiltre]);

  const resetFilters = () => {
    setSearch("");
    setCategorieActive("tous");
    setClasseFiltre("Toutes");
    setMatiereFiltre("Toutes");
  };

  const addDocument = (docData: Omit<Document, "id">) => {
    const newId = Math.max(...documents.map(d => d.id), 0) + 1;
    setDocuments([...documents, { id: newId, ...docData }]);
    setShowImportModal(false);
  };

  const deleteDocument = (id: number) => {
    if (confirm("Supprimer ce document définitivement ?")) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.url && doc.url !== "#") {
      const a = document.createElement("a");
      a.href = doc.url;
      a.download = doc.nom;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("Ce document n'est pas disponible au téléchargement.");
    }
  };

  const totalDocs = documents.length;
  const totalSize = documents.reduce((acc, doc) => {
    const size = parseFloat(doc.taille) || 0;
    return acc + size;
  }, 0).toFixed(1);
  const coursCount = documents.filter(d => d.categorie === "cours").length;
  const examensCount = documents.filter(d => d.categorie === "examens" || d.categorie === "anciennes-epreuves").length;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <Folder size={28} strokeWidth={1.8} />
            </div>
            Bibliothèque de documents
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Cours, examens, archives et ressources pédagogiques</p>
        </div>
        <button onClick={() => setShowImportModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-200 flex items-center gap-2 transition-all">
          <Upload size={18} /> Importer un document
        </button>
      </div>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-blue-50 rounded-lg"><FileText size={18} className="text-blue-500"/></div>
          <div><p className="text-xs text-slate-400">Total docs</p><p className="text-xl font-bold">{totalDocs}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-emerald-50 rounded-lg"><Download size={18} className="text-emerald-500"/></div>
          <div><p className="text-xs text-slate-400">Taille totale</p><p className="text-xl font-bold">{totalSize} MB</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-amber-50 rounded-lg"><BookOpen size={18} className="text-amber-500"/></div>
          <div><p className="text-xs text-slate-400">Cours</p><p className="text-xl font-bold">{coursCount}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-purple-50 rounded-lg"><Award size={18} className="text-purple-500"/></div>
          <div><p className="text-xs text-slate-400">Examens</p><p className="text-xl font-bold">{examensCount}</p></div>
        </div>
      </div>

      {/* CATÉGORIES (onglets) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategorieActive(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              categorieActive === cat.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <cat.icon size={16} />
            {cat.nom}
          </button>
        ))}
      </div>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              <Filter size={16} /> Filtres {showFilters ? "▲" : "▼"}
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1" />
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}>
              <Grid3x3 size={18} />
            </button>
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}>
              <List size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classe</label>
              <select value={classeFiltre} onChange={e => setClasseFiltre(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-sm bg-white">
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matière</label>
              <select value={matiereFiltre} onChange={e => setMatiereFiltre(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-sm bg-white">
                {matieresListe.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-end justify-end">
              <button onClick={resetFilters} className="text-xs text-blue-600 flex items-center gap-1"><X size={12}/> Réinitialiser</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500"><span className="font-bold text-slate-700">{filteredDocs.length}</span> document(s) trouvé(s)</p>
        {filteredDocs.length !== documents.length && <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">Afficher tous</button>}
      </div>

      {/* VUE GRILLE */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl">{getFileIcon(doc.type)}</div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{doc.nom}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{doc.taille || "—"} • {doc.date}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(doc.categorie)}`}>
                  {categories.find(c => c.id === doc.categorie)?.nom || doc.categorie}
                </span>
              </div>
              <div className="px-4 py-3 bg-slate-50/50 flex justify-between items-center text-[10px] text-slate-500">
                <div className="flex items-center gap-2"><Calendar size={12} />{doc.date}</div>
                <div className="flex gap-1">
                  {doc.classe !== "Toutes" && <span className="bg-white px-2 py-0.5 rounded-full border">{doc.classe}</span>}
                  {doc.matiere && <span className="bg-white px-2 py-0.5 rounded-full border">{doc.matiere}</span>}
                </div>
              </div>
              <div className="p-3 flex gap-2">
                <button onClick={() => handleDownload(doc)} className="flex-1 py-2 text-xs font-medium bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-1">
                  <Download size={12} /> Télécharger
                </button>
                <button onClick={() => deleteDocument(doc.id)} className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VUE TABLEAU */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-1/3" />
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/6" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-4 text-left">Fichier</th>
                  <th className="px-5 py-4 text-left">Catégorie</th>
                  <th className="px-5 py-4 text-left">Classe</th>
                  <th className="px-5 py-4 text-left">Matière</th>
                  <th className="px-5 py-4 text-left">Taille</th>
                  <th className="px-5 py-4 text-left">Date</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3"><div className="flex items-center gap-3">{getFileIcon(doc.type)}<span className="font-medium text-slate-700">{doc.nom}</span></div></td>
                    <td className="px-5 py-3"><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(doc.categorie)}`}>{categories.find(c => c.id === doc.categorie)?.nom}</span></td>
                    <td className="px-5 py-3 text-slate-500">{doc.classe === "Toutes" ? "—" : doc.classe}</td>
                    <td className="px-5 py-3 text-slate-500">{doc.matiere || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{doc.taille || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{doc.date}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleDownload(doc)} className="p-1.5 text-slate-400 hover:text-blue-500"><Download size={16}/></button>
                        <button onClick={() => deleteDocument(doc.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDocs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <Folder size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">Aucun document ne correspond à ces critères.</p>
        </div>
      )}

      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onSave={addDocument} />}
    </div>
  );
}