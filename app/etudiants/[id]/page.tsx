// app/etudiants/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, Flag, BookOpen,
  Briefcase, Home, School, GraduationCap, Heart, FileText, Edit,
  Printer, Download, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { useElevesStore } from "@/lib/stores";

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <h3 className="font-bold text-slate-700">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-slate-400 font-semibold">{label}</p>
        <p className="text-sm text-slate-700 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function EleveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [eleves] = useElevesStore();
  const [eleve, setEleve] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = parseInt(params.id as string);
    const found = eleves.find(e => e.id === id);
    setEleve(found);
    setLoading(false);
  }, [params.id, eleves]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800">Élève non trouvé</h2>
          <button onClick={() => router.back()} className="mt-4 text-blue-600">Retour</button>
        </div>
      </div>
    );
  }

  const photoUrl = eleve.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.nom)}&background=3b82f6&color=fff`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition mb-4"
          >
            <ArrowLeft size={20} /> Retour à la liste
          </button>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <img
                src={photoUrl}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg ring-4 ring-blue-100"
                alt={eleve.nom}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">{eleve.nom}</h1>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {eleve.classe}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    Matricule: {eleve.matricule}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    Inscrit le {eleve.dateInscription || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  <Edit size={18} />
                </button>
                <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  <Printer size={18} />
                </button>
                <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <InfoCard title="Informations personnelles">
            <InfoRow label="Nom complet" value={eleve.nom} icon={<User size={16} />} />
            <InfoRow label="Sexe" value={eleve.sexe === "M" ? "Masculin" : "Féminin"} icon={<User size={16} />} />
            <InfoRow label="Date de naissance" value={eleve.dateNaissance} icon={<Calendar size={16} />} />
            <InfoRow label="Lieu de naissance" value={eleve.lieuNaissance} icon={<MapPin size={16} />} />
            <InfoRow label="Nationalité" value={eleve.nationalite} icon={<Flag size={16} />} />
          </InfoCard>

          {/* Coordonnées */}
          <InfoCard title="Coordonnées">
            <InfoRow label="Email" value={eleve.email} icon={<Mail size={16} />} />
            <InfoRow label="Téléphone" value={eleve.telephone} icon={<Phone size={16} />} />
            <InfoRow label="Adresse" value={eleve.adresse} icon={<Home size={16} />} />
          </InfoCard>

          {/* Informations scolaires */}
          <InfoCard title="Parcours scolaire">
            <InfoRow label="Classe" value={eleve.classe} icon={<GraduationCap size={16} />} />
            <InfoRow label="Matricule" value={eleve.matricule} icon={<FileText size={16} />} />
            <InfoRow label="Ancien établissement" value={eleve.ancienEtablissement} icon={<School size={16} />} />
            <InfoRow 
              label="Redoublant" 
              value={eleve.redoublant ? "Oui" : "Non"} 
              icon={eleve.redoublant ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            />
            <InfoRow label="Date d'inscription" value={eleve.dateInscription} icon={<Calendar size={16} />} />
          </InfoCard>

          {/* Informations parents */}
          <InfoCard title="Parents / Tuteurs">
            <InfoRow label="Nom du parent" value={eleve.parentNom} icon={<Heart size={16} />} />
            <InfoRow label="Téléphone" value={eleve.parentTelephone} icon={<Phone size={16} />} />
            <InfoRow label="Email" value={eleve.parentEmail} icon={<Mail size={16} />} />
            <InfoRow label="Profession" value={eleve.parentProfession} icon={<Briefcase size={16} />} />
            <InfoRow label="Situation familiale" value={eleve.situationFamiliale} icon={<Heart size={16} />} />
          </InfoCard>
        </div>

        {/* Notes et bulletins (à compléter plus tard) */}
        <div className="mt-6">
          <InfoCard title="Résultats scolaires">
            <div className="text-center py-8 text-slate-400">
              <FileText className="mx-auto mb-2" size={32} />
              <p>Aucune note disponible pour le moment</p>
              <button className="mt-2 text-blue-600 text-sm hover:underline">
                Ajouter des notes
              </button>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}