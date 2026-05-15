// app/chat/page.tsx
"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  MessageSquare, Send, Users, Search, 
  X, MessageCircle, Filter, Trash2, Loader2, Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";

function parseJsonField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    console.warn("Erreur parsing JSON:", field);
    return [];
  }
}

interface Message {
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

interface Eleve {
  id: number;
  nom: string;
  classe: string;
  parentNom?: string;
  parentEmail?: string;
  parentTelephone?: string;
}

interface Enseignant {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  matieres: string;
  classes: string;
}

function useMessages() {
  const { token } = useAuth();
  const { fetchWithAuth } = useApi();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await fetchWithAuth('/api/messages');
      setMessages(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error("Erreur chargement messages:", err);
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [token, fetchWithAuth]);

  const sendMessage = useCallback(async (message: Omit<Message, 'id'>) => {
    if (!token) return null;
    
    try {
      const newMessage = await fetchWithAuth('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message)
      });
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error("Erreur envoi message:", err);
      return null;
    }
  }, [token, fetchWithAuth]);

  const markAsRead = useCallback(async (id: number) => {
    if (!token) return;
    
    try {
      await fetchWithAuth('/api/messages', {
        method: 'PUT',
        body: JSON.stringify({ id, lu: true })
      });
      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, lu: true } : m
      ));
    } catch (err) {
      console.error("Erreur marquage lu:", err);
    }
  }, [token, fetchWithAuth]);

  const deleteMessage = useCallback(async (id: number) => {
    if (!token) return;
    
    try {
      await fetchWithAuth(`/api/messages?id=${id}`, {
        method: 'DELETE'
      });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Erreur suppression message:", err);
    }
  }, [token, fetchWithAuth]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, sendMessage, markAsRead, deleteMessage, refresh: fetchMessages };
}

export default function ChatPage() {
  const { user, isAdmin, isTeacher, isParent, token } = useAuth();
  const { fetchWithAuth } = useApi();
  const { messages, loading: messagesLoading, sendMessage: sendMessageToApi, markAsRead: markAsReadApi, deleteMessage: deleteMessageApi } = useMessages();
  
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasse, setSelectedClasse] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Charger les élèves et enseignants
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const headers = getAuthHeaders();
        const [elevesRes, enseignantsRes] = await Promise.all([
          fetch('/api/eleves', { headers }),
          fetch('/api/enseignants', { headers })
        ]);
        
        const elevesData = elevesRes.ok ? await elevesRes.json() : [];
        const enseignantsData = enseignantsRes.ok ? await enseignantsRes.json() : [];
        
        console.log("========== DONNÉES CHARGÉES ==========");
        console.log("👨‍🎓 Élèves:", elevesData.length);
        console.log("👨‍🏫 Enseignants:", enseignantsData.length);
        console.log("📋 Détail enseignants:", enseignantsData.map((e: any) => ({ 
          id: e.id, 
          name: e.name, 
          classes: e.classes,
          matieres: e.matieres
        })));
        
        setEleves(Array.isArray(elevesData) ? elevesData : []);
        setEnseignants(Array.isArray(enseignantsData) ? enseignantsData : []);
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, getAuthHeaders]);

  // Récupérer l'enseignant connecté
  const enseignantConnecte = useMemo(() => {
    if (!isTeacher || !user?.enseignantId) return null;
    const enseignant = enseignants.find(e => e.id === user.enseignantId);
    console.log("🔍 Enseignant connecté:", enseignant?.name);
    console.log("📦 Classes (brut):", enseignant?.classes);
    return enseignant;
  }, [isTeacher, user, enseignants]);

  // Classes auxquelles l'enseignant a accès
  const classesAccessibles = useMemo(() => {
    if (isAdmin) return [];
    if (isTeacher && enseignantConnecte) {
      const classes = parseJsonField(enseignantConnecte.classes);
      console.log("📋 Classes parsées pour l'enseignant:", classes);
      return classes;
    }
    return [];
  }, [isAdmin, isTeacher, enseignantConnecte]);

  // Pour un parent, récupérer sa classe
  const parentClasse = useMemo(() => {
    if (isParent && user?.eleveId) {
      const eleve = eleves.find(e => e.id === user.eleveId);
      console.log("👨‍👩‍👧 Parent - Classe de l'élève:", eleve?.classe);
      return eleve?.classe || null;
    }
    return null;
  }, [isParent, user, eleves]);

  // Liste des classes disponibles
  const classesDisponibles = useMemo(() => {
    if (isAdmin) {
      const allClasses = [...new Set(eleves.map(e => e.classe))].sort();
      console.log("👑 Admin - Toutes les classes:", allClasses);
      return allClasses;
    }
    if (isTeacher) {
      console.log("👨‍🏫 Enseignant - Classes accessibles:", classesAccessibles);
      return classesAccessibles;
    }
    if (isParent && parentClasse) {
      console.log("👨‍👩‍👧 Parent - Sa classe:", [parentClasse]);
      return [parentClasse];
    }
    return [];
  }, [isAdmin, isTeacher, isParent, parentClasse, eleves, classesAccessibles]);

  // Initialiser la sélection par défaut
  useEffect(() => {
    if (classesDisponibles.length > 0 && !selectedClasse) {
      setSelectedClasse(classesDisponibles[0]);
      console.log("🎯 Classe sélectionnée par défaut:", classesDisponibles[0]);
    }
  }, [classesDisponibles, selectedClasse]);

  // Filtrer les messages par classe
  const filteredMessages = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];
    
    let filtered = [...messages];
    
    if (selectedClasse) {
      if (isParent) {
        filtered = filtered.filter(m => 
          m.destinataireClasse === `parent:${selectedClasse}` ||
          (m.destinataireClasse === "all" && m.expediteurRole === "admin")
        );
      } else {
        filtered = filtered.filter(m => m.destinataireClasse === `parent:${selectedClasse}`);
      }
    }
    
    if (search) {
      filtered = filtered.filter(m => 
        m.contenu.toLowerCase().includes(search.toLowerCase()) ||
        m.expediteur.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [messages, selectedClasse, search, isParent]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!user) {
      alert("Vous devez être connecté");
      return;
    }
    if (!selectedClasse) {
      alert("Veuillez sélectionner une classe");
      return;
    }
    
    let contenu = newMessage;
    
    if (replyTo) {
      contenu = `> @${replyTo.expediteur}: ${replyTo.contenu.substring(0, 60)}${replyTo.contenu.length > 60 ? "..." : ""}\n\n${newMessage}`;
    }
    
    const expediteurRole = isAdmin ? "admin" : isTeacher ? "teacher" : "parent";
    const expediteurAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom || "User")}&background=${isAdmin ? "3b82f6" : isTeacher ? "10b981" : "8b5cf6"}&color=fff`;
    
    let destinataireClasse;
    if (isAdmin && selectedClasse === "all") {
      destinataireClasse = "all";
    } else {
      destinataireClasse = `parent:${selectedClasse}`;
    }
    
    const newMsg = {
      expediteur: user.nom || "Utilisateur",
      expediteurRole: expediteurRole,
      expediteurAvatar: expediteurAvatar,
      destinataireClasse: destinataireClasse,
      contenu: contenu,
      date: new Date().toISOString(),
      lu: false
    };
    
    const sent = await sendMessageToApi(newMsg);
    if (sent) {
      setNewMessage("");
      setReplyTo(null);
    }
  };

  const handleDeleteMessage = (id: number) => {
    if (isAdmin && confirm("Supprimer ce message ?")) {
      deleteMessageApi(id);
    }
  };

  const handleMarkAsRead = (msg: Message) => {
    if (!msg.lu && msg.expediteur !== user?.nom) {
      markAsReadApi(msg.id);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  if (messagesLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Vue Parent
  if (isParent && parentClasse) {
    return (
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <MessageSquare size={28} />
            </div>
            Messages
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Communications avec les enseignants de {parentClasse}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-250px)]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/30 rounded-t-2xl">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <MessageCircle size={18} className="text-blue-500"/>
              Classe {parentClasse}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Messages des enseignants et de l'administration</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/20">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto text-slate-300" size={48}/>
                <p className="text-slate-400 mt-2">Aucun message pour le moment.</p>
              </div>
            ) : (
              filteredMessages.map(msg => {
                const isOwn = msg.expediteur === user?.nom;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} mb-4`}>
                    <img src={msg.expediteurAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">{msg.expediteur}</span>
                        <span className="text-[10px] text-slate-400">{new Date(msg.date).toLocaleString()}</span>
                        {msg.expediteurRole === "teacher" && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">Enseignant</span>}
                        {msg.expediteurRole === "admin" && <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">Administration</span>}
                        {!msg.lu && !isOwn && <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Nouveau</span>}
                      </div>
                      <div className={`p-3 rounded-2xl ${isOwn ? "bg-blue-500 text-white" : "bg-white border border-slate-100 shadow-sm"} text-sm`}>
                        {msg.contenu.split('\n').map((line, i) => {
                          if (line.startsWith('> @')) {
                            return <div key={i} className="text-xs italic bg-slate-50 p-1 rounded mb-1">{line}</div>;
                          }
                          return <div key={i}>{line}</div>;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSendMessage()}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-sm transition"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              💬 Votre message sera visible par les enseignants de la classe
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue Enseignant
  if (isTeacher) {
    if (classesDisponibles.length === 0) {
      return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
                <MessageSquare size={28} />
              </div>
              Communication
            </h1>
            <p className="text-sm text-slate-500 mt-1 ml-14">Aucune classe assignée</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Aucune classe assignée</h2>
            <p className="text-slate-500">Vous n'êtes pas encore assigné à des classes.</p>
            <p className="text-xs text-slate-400 mt-2">Contactez l'administrateur pour obtenir des classes.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <MessageSquare size={28} />
            </div>
            Communication avec les parents
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Envoyez des messages aux parents de vos classes</p>
          <p className="text-xs text-green-600 mt-1 ml-14">✓ {classesDisponibles.length} classe(s) disponible(s)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR - CLASSES */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Filter size={16}/> Mes classes ({classesDisponibles.length})
                </h3>
              </div>
              
              <div className="divide-y divide-slate-100">
                {classesDisponibles.map(classe => (
                  <button
                    key={classe}
                    onClick={() => { setSelectedClasse(classe); setReplyTo(null); }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 ${selectedClasse === classe ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                  >
                    <Users size={18} className="text-blue-500"/>
                    <div>
                      <p className="font-medium text-sm">{classe}</p>
                      <p className="text-[10px] text-slate-400">Envoyer un message aux parents</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ZONE DE CHAT */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-250px)]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Bell size={18} className="text-blue-500"/>
                  {selectedClasse 
                    ? `Message à tous les parents de la classe ${selectedClasse}`
                    : "Sélectionnez une classe"
                  }
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedClasse 
                    ? `Ce message sera envoyé à tous les parents de la classe ${selectedClasse}`
                    : "Choisissez une classe dans le menu de gauche"
                  }
                </p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un message..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm w-48"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/20">
              {!selectedClasse ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto text-slate-300" size={48}/>
                  <p className="text-slate-400 mt-2">Sélectionnez une classe pour commencer</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto text-slate-300" size={48}/>
                  <p className="text-slate-400 mt-2">Aucun message. Envoyez le premier message aux parents !</p>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isOwn = msg.expediteur === user?.nom;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} mb-4 group`} onMouseEnter={() => handleMarkAsRead(msg)}>
                      <img src={msg.expediteurAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold text-slate-700">{msg.expediteur}</span>
                          <span className="text-[10px] text-slate-400">{new Date(msg.date).toLocaleString()}</span>
                          {msg.expediteurRole === "teacher" && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">Enseignant</span>}
                          {msg.expediteurRole === "parent" && <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">Parent</span>}
                          {!msg.lu && !isOwn && <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Nouveau</span>}
                        </div>
                        <div className={`p-3 rounded-2xl ${isOwn ? "bg-blue-500 text-white" : "bg-white border border-slate-100 shadow-sm"} text-sm`}>
                          {msg.contenu.split('\n').map((line, i) => {
                            if (line.startsWith('> @')) {
                              return <div key={i} className="text-xs italic bg-slate-50 p-1 rounded mb-1">{line}</div>;
                            }
                            return <div key={i}>{line}</div>;
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {replyTo && (
                <div className="bg-blue-50 p-2 rounded-lg text-sm flex justify-between items-center">
                  <span>Réponse à <strong>{replyTo.expediteur}</strong>: {replyTo.contenu.substring(0, 50)}...</span>
                  <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={selectedClasse ? `Écrivez un message aux parents de ${selectedClasse}...` : "Sélectionnez une classe d'abord"}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && handleSendMessage()}
                  disabled={!selectedClasse}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !selectedClasse}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-sm transition"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 text-center">
                {selectedClasse 
                  ? `📢 Ce message sera visible par TOUS les parents de la classe ${selectedClasse}`
                  : "Sélectionnez une classe pour envoyer un message"
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue Admin
  const adminClasses = ["all", ...classesDisponibles];
  
  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
            <MessageSquare size={28} />
          </div>
          Communication
        </h1>
        <p className="text-sm text-slate-500 mt-1 ml-14">Gérer les communications avec les parents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Filter size={16}/> Classes ({adminClasses.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {adminClasses.map(classe => (
                <button
                  key={classe}
                  onClick={() => { setSelectedClasse(classe); setReplyTo(null); }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 ${selectedClasse === classe ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                >
                  <Users size={18} className="text-blue-500"/>
                  <div>
                    <p className="font-medium text-sm">
                      {classe === "all" ? "Toutes les classes" : classe}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {classe === "all" 
                        ? "Message à toutes les classes" 
                        : `Envoyer un message aux parents de ${classe}`
                      }
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-250px)]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 rounded-t-2xl">
            <div>
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Bell size={18} className="text-blue-500"/>
                {selectedClasse === "all" 
                  ? "Message à toutes les classes"
                  : selectedClasse 
                    ? `Message aux parents de ${selectedClasse}`
                    : "Sélectionnez une classe"
                }
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {selectedClasse === "all"
                  ? "Ce message sera envoyé à tous les parents de toutes les classes"
                  : selectedClasse
                    ? `Ce message sera envoyé à tous les parents de la classe ${selectedClasse}`
                    : "Choisissez une classe dans le menu de gauche"
                }
              </p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un message..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm w-48"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/20">
            {!selectedClasse ? (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto text-slate-300" size={48}/>
                <p className="text-slate-400 mt-2">Sélectionnez une classe pour commencer</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto text-slate-300" size={48}/>
                <p className="text-slate-400 mt-2">Aucun message. Envoyez le premier message !</p>
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div key={msg.id} className={`flex gap-3 mb-4 group`}>
                  <img src={msg.expediteurAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">{msg.expediteur}</span>
                      <span className="text-[10px] text-slate-400">{new Date(msg.date).toLocaleString()}</span>
                      {msg.expediteurRole === "admin" && <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">Admin</span>}
                      {msg.expediteurRole === "teacher" && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">Enseignant</span>}
                      {msg.expediteurRole === "parent" && <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">Parent</span>}
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm">
                      {msg.contenu.split('\n').map((line, i) => {
                        if (line.startsWith('> @')) {
                          return <div key={i} className="text-xs italic bg-slate-50 p-1 rounded mb-1">{line}</div>;
                        }
                        return <div key={i}>{line}</div>;
                      })}
                    </div>
                    <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => handleDeleteMessage(msg.id)} className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={10}/> Supprimer</button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={selectedClasse === "all" 
                  ? "Écrivez un message à toutes les classes..." 
                  : selectedClasse 
                    ? `Écrivez un message aux parents de ${selectedClasse}...`
                    : "Sélectionnez une classe d'abord"
                }
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSendMessage()}
                disabled={!selectedClasse}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !selectedClasse}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-sm transition"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              {selectedClasse === "all"
                ? "📢 Ce message sera visible par TOUS les parents de toutes les classes"
                : selectedClasse
                  ? `📢 Ce message sera visible par TOUS les parents de la classe ${selectedClasse}`
                  : "Sélectionnez une classe pour envoyer un message"
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}