// app/login/page.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, LogIn, School, Eye, EyeOff, Sparkles, GraduationCap, BookOpen, Users, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          motDePasse: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (data.user.role === 'admin') {
          window.location.href = '/';
        } else if (data.user.role === 'enseignant') {
          window.location.href = '/enseignants/classes';
        } else if (data.user.role === 'parent') {
          window.location.href = '/parent/enfant';
        }
      } else {
        setError(data.error || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('Erreur login:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Remplir les comptes de démonstration
  const fillAdmin = () => {
    setEmail('admin@lyceedeido.cm');
    setPassword('admin123');
  };

  const fillTeacher = () => {
    setEmail('kanga@lyceedeido.cm');
    setPassword('teacher123');
  };

  const fillParent = () => {
    setEmail('jean.mbele@example.com');
    setPassword('jean123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-[1200px] min-h-[680px] h-[85vh] m-4 flex rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/10 bg-white relative animate-fade-in">
        
        {/* Left Side - Visual Presentation */}
        <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 lg:p-16">
          <div className="absolute top-[-15%] left-[-15%] w-[130%] h-[130%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/20 via-slate-900/0 to-slate-900/0 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-1/4 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4 animate-slide-in">
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
              <School className="text-white" size={32} strokeWidth={1.5} />
            </div>
            <span className="text-white text-3xl font-bold tracking-tight">G2D School</span>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
              <Sparkles size={14} />
              <span>Plateforme Nouvelle Génération</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-6">
              L'excellence éducative <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">à portée de main.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-md">
              Gérez votre établissement scolaire avec un outil moderne, intuitif et ultra-performant.
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {[
                { icon: LayoutDashboard, color: "text-blue-400", bg: "bg-blue-400/10", label: "Gestion Centralisée" },
                { icon: Users, color: "text-indigo-400", bg: "bg-indigo-400/10", label: "Portail Parents" },
                { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Suivi des Notes" },
                { icon: GraduationCap, color: "text-amber-400", bg: "bg-amber-400/10", label: "Réussite Scolaire" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:bg-white/[0.06] transition-colors cursor-default">
                  <div className={`${item.bg} p-2.5 rounded-xl ${item.color}`}>
                    <item.icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-slate-200 text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between text-slate-500 text-sm font-medium">
            <p>© {new Date().getFullYear()} G2D School. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white overflow-y-auto">
          <div className="absolute top-6 left-6 lg:hidden flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
              <School className="text-white" size={24} />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">G2D School</span>
          </div>
          
          <div className="w-full max-w-md mt-16 lg:mt-0">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Bon retour ! 👋</h2>
              <p className="text-slate-500 font-medium">Veuillez entrer vos identifiants pour continuer.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Adresse Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                  <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Mot de passe oublié ?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal text-lg tracking-wide"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-start gap-3 border border-red-100 animate-slide-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(79,70,229,0.6)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn size={20} strokeWidth={2.5} />
                )}
                <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
              </button>
            </form>

            {/* Comptes de démonstration */}
            <div className="mt-12">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-wider text-xs">
                    Comptes de démonstration
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {/* Admin */}
                <button 
                  type="button"
                  onClick={fillAdmin}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">A</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Admin</p>
                    <p className="text-[10px] text-slate-400">Cliquer pour remplir</p>
                  </div>
                </button>
                
                {/* Enseignant */}
                <button 
                  type="button"
                  onClick={fillTeacher}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">P</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Enseignant</p>
                    <p className="text-[10px] text-slate-400">Cliquer pour remplir</p>
                  </div>
                </button>

                {/* Parent */}
                <button 
                  type="button"
                  onClick={fillParent}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">M</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Parent</p>
                    <p className="text-[10px] text-slate-400">Cliquer pour remplir</p>
                  </div>
                </button>
              </div>

              {/* Informations supplémentaires */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-400">
                  👑 Admin: admin@lyceedeido.cm / admin123
                </p>
                <p className="text-[10px] text-slate-400">
                  👨‍🏫 Enseignant: kanga@lyceedeido.cm / teacher123
                </p>
                <p className="text-[10px] text-slate-400">
                  👨‍👩‍👧 Parent: jean.mbele@example.com / jean123
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}