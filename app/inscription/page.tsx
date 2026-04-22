// app/inscription/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, User, Mail, Phone, Calendar, MapPin, Flag, BookOpen,
  Briefcase, Home, School, AlertCircle, Save, X, ChevronRight,
  Users, GraduationCap, Heart, FileText, CheckCircle
} from "lucide-react";
import { useElevesStore } from "@/lib/stores";

// Fonction pour générer un matricule unique
function genererMatricule(classe: string, annee: number = new Date().getFullYear()): string {
  const prefix = classe.replace(/[^A-Z0-9]/g, '').toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${annee}/${prefix}/${random}`;
}

export default function InscriptionPage() {
  const router = useRouter();
  const [eleves, setEleves] = useElevesStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Formulaire
  const [form, setForm] = useState({
    // Informations personnelles
    nom: "",
    sexe: "M" as "M" | "F",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "Camerounaise",
    // Informations scolaires
    classe: "6A",
    ancienEtablissement: "",
    redoublant: false,
    // Contact
    email: "",
    telephone: "",
    adresse: "",
    // Parents
    parentNom: "",
    parentTelephone: "",
    parentEmail: "",
    parentProfession: "",
    situationFamiliale: "",
  });

  const [photo, setPhoto] = useState<string>("");
  const [error, setError] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.nom || !form.classe || !form.parentNom || !form.parentTelephone) {
      setError("Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    // Générer le matricule
    const matricule = genererMatricule(form.classe);
    const dateInscription = new Date().toISOString().split('T')[0];

    // Créer l'élève
    const newId = Math.max(...eleves.map(e => e.id), 0) + 1;
    const newEleve = {
      id: newId,
      nom: form.nom,
      nomComplet: form.nom,
      classe: form.classe,
      matricule: matricule,
      statusColor: "bg-emerald-400",
      img: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nom)}&background=3b82f6&color=fff`,
      email: form.email,
      telephone: form.telephone,
      dateNaissance: form.dateNaissance,
      lieuNaissance: form.lieuNaissance,
      nationalite: form.nationalite,
      sexe: form.sexe,
      adresse: form.adresse,
      ancienEtablissement: form.ancienEtablissement,
      redoublant: form.redoublant,
      parentNom: form.parentNom,
      parentTelephone: form.parentTelephone,
      parentEmail: form.parentEmail,
      parentProfession: form.parentProfession,
      situationFamiliale: form.situationFamiliale,
      dateInscription: dateInscription,
    };

    setEleves([...eleves, newEleve]);
    setLoading(false);
    
    // Rediriger vers la page de l'élève
    router.push(`/etudiants/${newId}?success=true`);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const classes = ["6A", "6B", "6C", "5A", "5B", "4A", "3A", "Seconde A", "Première A", "Terminale A"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Inscription Nouvel Élève</h1>
          <p className="text-slate-500 mt-2">Renseignez toutes les informations nécessaires</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            {[
              { num: 1, title: "Infos personnelles", icon: User },
              { num: 2, title: "Infos scolaires", icon: GraduationCap },
              { num: 3, title: "Contact", icon: Phone },
              { num: 4, title: "Parents", icon: Users },
            ].map((s) => (
              <div key={s.num} className="flex-1 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-all ${
                  step >= s.num ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-400"
                }`}>
                  {step > s.num ? <CheckCircle size={20} /> : <s.icon size={20} />}
                </div>
                <p className={`text-xs mt-2 font-semibold ${step >= s.num ? "text-blue-600" : "text-slate-400"}`}>
                  {s.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Step 1: Informations personnelles */}
          {step === 1 && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="text-blue-600" /> Identité de l'élève
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={e => setForm({...form, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    placeholder="Ex: Jean Mbélé"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sexe</label>
                  <select
                    value={form.sexe}
                    onChange={e => setForm({...form, sexe: e.target.value as "M" | "F"})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date de naissance</label>
                  <input
                    type="date"
                    value={form.dateNaissance}
                    onChange={e => setForm({...form, dateNaissance: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Lieu de naissance</label>
                  <input
                    type="text"
                    value={form.lieuNaissance}
                    onChange={e => setForm({...form, lieuNaissance: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="Douala, Yaoundé..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nationalité</label>
                  <input
                    type="text"
                    value={form.nationalite}
                    onChange={e => setForm({...form, nationalite: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Photo de profil</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photoUpload"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('photoUpload')?.click()}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50"
                    >
                      Choisir une photo
                    </button>
                    {photo && <img src={photo} className="w-12 h-12 rounded-full object-cover" alt="preview" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Informations scolaires */}
          {step === 2 && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="text-blue-600" /> Parcours scolaire
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Classe d'inscription <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.classe}
                    onChange={e => setForm({...form, classe: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  >
                    {classes.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Le matricule sera généré automatiquement</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ancien établissement</label>
                  <input
                    type="text"
                    value={form.ancienEtablissement}
                    onChange={e => setForm({...form, ancienEtablissement: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="Nom de l'école précédente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Redoublant ?</label>
                  <select
                    value={form.redoublant ? "oui" : "non"}
                    onChange={e => setForm({...form, redoublant: e.target.value === "oui"})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Phone className="text-blue-600" /> Coordonnées
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="eleve@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={e => setForm({...form, telephone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse</label>
                  <textarea
                    value={form.adresse}
                    onChange={e => setForm({...form, adresse: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    rows={2}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Parents */}
          {step === 4 && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Heart className="text-blue-600" /> Informations des parents/tuteurs
              </h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Ces informations sont confidentielles et servent uniquement pour les communications officielles
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nom du parent/tuteur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.parentNom}
                    onChange={e => setForm({...form, parentNom: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="Ex: Mbélé Jean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.parentTelephone}
                    onChange={e => setForm({...form, parentTelephone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.parentEmail}
                    onChange={e => setForm({...form, parentEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="parent@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Profession</label>
                  <input
                    type="text"
                    value={form.parentProfession}
                    onChange={e => setForm({...form, parentProfession: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="Enseignant, Commerçant..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Situation familiale</label>
                  <input
                    type="text"
                    value={form.situationFamiliale}
                    onChange={e => setForm({...form, situationFamiliale: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="Parents mariés, Garde alternée..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between p-8 border-t border-slate-100 bg-slate-50">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-white transition"
              >
                Retour
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
              >
                Suivant <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? "Inscription en cours..." : "Finaliser l'inscription"}
                <Save size={16} />
              </button>
            )}
          </div>

          {error && (
            <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}