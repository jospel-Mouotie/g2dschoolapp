// app/inscription/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Phone, User, School, Calendar, MapPin, Users, ChevronRight, CheckCircle, Loader2 } from "lucide-react";

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");
  const [classesList, setClassesList] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    // Informations élève
    nom: "",
    classe: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "Camerounaise",
    sexe: "M",
    adresse: "",
    ancienEtablissement: "",
    redoublant: false,
    // Informations parent
    parentNom: "",
    parentTelephone: "",
    parentEmail: "",
    parentProfession: "",
  });

  // Charger les classes depuis l'API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const data = await response.json();
        setClassesList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    };
    
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data);
        setStep(3);
      } else {
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.nom || !form.classe) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setError("");
      setStep(2);
    }
  };

  const handlePrev = () => {
    setStep(1);
    setError("");
  };

  if (loadingClasses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (step === 3 && success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
            <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold">Inscription réussie !</h1>
            <p className="text-green-100 text-sm mt-1">Félicitations {success.eleve.nom}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-2">📋 Informations de l'élève</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nom :</span> {success.eleve.nom}</p>
                <p><span className="font-medium">Classe :</span> {success.eleve.classe}</p>
                <p><span className="font-medium">Matricule :</span> <code className="bg-blue-100 px-2 py-0.5 rounded">{success.eleve.matricule}</code></p>
              </div>
            </div>

            {success.parentAccount && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-bold text-amber-800 mb-2">🔐 Accès parent</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email :</span> {success.parentAccount.email}</p>
                  <p><span className="font-medium">Mot de passe :</span> <code className="bg-amber-100 px-2 py-1 rounded">{success.parentAccount.motDePasse}</code></p>
                  <p className="text-xs text-amber-600 mt-2">⚠️ Conservez ces informations précieusement</p>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold">Inscription</h1>
          <p className="text-blue-100 text-sm mt-1">Inscrivez votre enfant à l'école</p>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-2 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-2 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
          <div className="flex justify-between px-6 text-xs text-slate-500 mt-2">
            <span>Infos élève</span>
            <span>Infos parent</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      value={form.nom} 
                      onChange={e => setForm({...form, nom: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="Jean Mbélé" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Classe *</label>
                  <div className="relative">
                    <School size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      required 
                      value={form.classe} 
                      onChange={e => setForm({...form, classe: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Sélectionner une classe</option>
                      {classesList.map((c: any) => (
                        <option key={c.id} value={c.nom}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Le matricule sera généré automatiquement</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="eleve@email.com" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" 
                      value={form.telephone} 
                      onChange={e => setForm({...form, telephone: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="+237 6XX XX XX XX" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      value={form.dateNaissance} 
                      onChange={e => setForm({...form, dateNaissance: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance</label>
                  <input 
                    type="text" 
                    value={form.lieuNaissance} 
                    onChange={e => setForm({...form, lieuNaissance: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Douala" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
                  <select 
                    value={form.sexe} 
                    onChange={e => setForm({...form, sexe: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                    <textarea 
                      value={form.adresse} 
                      onChange={e => setForm({...form, adresse: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      rows={2} 
                      placeholder="Adresse complète" 
                    />
                  </div>
                </div>
              </div>
              <button type="button" onClick={handleNext} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                Suivant <ChevronRight size={18} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Users size={18} /> Informations du parent/tuteur</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                  <input 
                    type="text" 
                    required 
                    value={form.parentNom} 
                    onChange={e => setForm({...form, parentNom: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Jean Dupont" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      required 
                      value={form.parentEmail} 
                      onChange={e => setForm({...form, parentEmail: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="parent@email.com" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">⚠️ Un compte parent sera créé avec ce email</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone *</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" 
                      required 
                      value={form.parentTelephone} 
                      onChange={e => setForm({...form, parentTelephone: e.target.value})} 
                      className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="+237 6XX XX XX XX" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
                  <input 
                    type="text" 
                    value={form.parentProfession} 
                    onChange={e => setForm({...form, parentProfession: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Ingénieur, Médecin, ..." 
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handlePrev} className="flex-1 border border-slate-200 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition">Précédent</button>
                <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? "Inscription..." : "S'inscrire"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}