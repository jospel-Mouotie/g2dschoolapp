// app/chat/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Users, Bell, Search, 
  Paperclip, MoreVertical, X,
  Megaphone, MessageCircle, CheckCircle, 
  Filter, Home, User, Trash2, Reply
} from "lucide-react";
import { useMessagesStore, Message } from "@/lib/stores";

// Types
interface Classe {
  id: string;
  nom: string;
  nbEleves: number;
  profPrincipal: string;
}

interface Contact {
  id: string;
  nom: string;
  role: string;
  avatar: string;
}

// Données des classes
const classes: Classe[] = [
  { id: "all", nom: "Annonces générales", nbEleves: 548, profPrincipal: "Direction" },
  { id: "6A", nom: "6ème A", nbEleves: 32, profPrincipal: "M. Kanga" },
  { id: "5B", nom: "5ème B", nbEleves: 28, profPrincipal: "Mme Ngo" },
  { id: "4A", nom: "4ème A", nbEleves: 30, profPrincipal: "M. Fofana" },
  { id: "3A", nom: "3ème A", nbEleves: 26, profPrincipal: "Mme Djou" },
  { id: "2nde", nom: "Seconde", nbEleves: 35, profPrincipal: "Mr Smith" },
  { id: "1ere", nom: "Première", nbEleves: 33, profPrincipal: "M. Kamga" },
  { id: "Tle", nom: "Terminale", nbEleves: 28, profPrincipal: "Mme Ngo" },
];

// Contacts pour les conversations privées
const contactsInitiaux: Contact[] = [
  { id: "admin", nom: "Direction", role: "admin", avatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff" },
  { id: "teacher1", nom: "M. Kanga", role: "teacher", avatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff" },
  { id: "teacher2", nom: "Mme Ngo", role: "teacher", avatar: "https://ui-avatars.com/api/?name=Ngo&background=10b981&color=fff" },
  { id: "teacher3", nom: "Mr Smith", role: "teacher", avatar: "https://ui-avatars.com/api/?name=Smith&background=10b981&color=fff" },
  { id: "student1", nom: "Jean Mbélé", role: "student", avatar: "https://ui-avatars.com/api/?name=Jean+M&background=8b5cf6&color=fff" },
  { id: "student2", nom: "Élise Nend", role: "student", avatar: "https://ui-avatars.com/api/?name=Elise&background=8b5cf6&color=fff" },
  { id: "student3", nom: "Sarah Ngono", role: "student", avatar: "https://ui-avatars.com/api/?name=Sarah&background=8b5cf6&color=fff" },
  { id: "student4", nom: "Michel Essomba", role: "student", avatar: "https://ui-avatars.com/api/?name=Michel&background=8b5cf6&color=fff" },
];

// Utilisateur connecté (simulé - à remplacer par votre auth)
const currentUser = {
  id: "teacher1",
  role: "teacher",
  name: "M. Kanga",
  avatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff",
  classe: "6A"
};

// Messages initiaux préremplis - conforme à l'interface Message du store
const initialMessages: Message[] = [
  // Annonces générales (Direction)
  { id: 1, expediteur: "Direction", expediteurRole: "admin", expediteurAvatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff", destinataireClasse: "all", contenu: "📢 Réunion parents-professeurs le 15 avril à 15h en salle polyvalente.", date: "2025-04-01T08:00:00", lu: false },
  { id: 2, expediteur: "Direction", expediteurRole: "admin", expediteurAvatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff", destinataireClasse: "all", contenu: "📢 Fermeture exceptionnelle le 20 avril pour cause de travaux.", date: "2025-04-03T11:00:00", lu: false },
  { id: 3, expediteur: "Direction", expediteurRole: "admin", expediteurAvatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff", destinataireClasse: "all", contenu: "📢 Nouveau règlement intérieur disponible en ligne.", date: "2025-04-05T09:00:00", lu: false },
  
  // Messages dans la classe 6A
  { id: 4, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "6A", contenu: "Devoir maison à rendre pour lundi. Chapitre 3 sur les fonctions.", date: "2025-04-02T10:30:00", lu: false },
  { id: 5, expediteur: "Jean Mbélé", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Jean+M&background=8b5cf6&color=fff", destinataireClasse: "6A", contenu: "Monsieur, est-ce qu'on peut utiliser la calculatrice ?", date: "2025-04-02T14:20:00", lu: false },
  { id: 6, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "6A", contenu: "Oui, la calculatrice est autorisée pour ce devoir.", date: "2025-04-02T15:00:00", lu: false },
  { id: 7, expediteur: "Élise Nend", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Elise&background=8b5cf6&color=fff", destinataireClasse: "6A", contenu: "Monsieur, est-ce que le devoir est à rendre par écrit ou en ligne ?", date: "2025-04-03T09:00:00", lu: false },
  { id: 8, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "6A", contenu: "Par écrit sur feuille, à rendre en main propre.", date: "2025-04-03T10:15:00", lu: false },
  { id: 9, expediteur: "Dider Fongang", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Dider&background=8b5cf6&color=fff", destinataireClasse: "6A", contenu: "Monsieur, est-ce qu'il y aura une correction en classe ?", date: "2025-04-04T08:30:00", lu: false },
  { id: 10, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "6A", contenu: "Oui, on corrigera ensemble mercredi prochain.", date: "2025-04-04T09:00:00", lu: false },
  
  // Messages dans la classe 5B
  { id: 11, expediteur: "Mme Ngo", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Ngo&background=10b981&color=fff", destinataireClasse: "5B", contenu: "Correction du contrôle jeudi en classe. Préparez-vous !", date: "2025-04-03T09:15:00", lu: false },
  { id: 12, expediteur: "Sarah Ngono", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Sarah&background=8b5cf6&color=fff", destinataireClasse: "5B", contenu: "Madame, pour le contrôle, on révise jusqu'à quelle page ?", date: "2025-04-04T09:00:00", lu: false },
  { id: 13, expediteur: "Mme Ngo", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Ngo&background=10b981&color=fff", destinataireClasse: "5B", contenu: "Jusqu'à la page 42, bon courage !", date: "2025-04-04T10:15:00", lu: false },
  { id: 14, expediteur: "Michel Essomba", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Michel&background=8b5cf6&color=fff", destinataireClasse: "5B", contenu: "Merci madame !", date: "2025-04-04T10:30:00", lu: false },
  { id: 15, expediteur: "Mme Ngo", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Ngo&background=10b981&color=fff", destinataireClasse: "5B", contenu: "Les notes du dernier devoir sont disponibles.", date: "2025-04-06T14:00:00", lu: false },
  
  // Messages privés (on utilise destinataireClasse pour stocker l'ID du destinataire)
  { id: 16, expediteur: "Direction", expediteurRole: "admin", expediteurAvatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff", destinataireClasse: "user:teacher1", contenu: "Bonjour M. Kanga, pouvez-vous me contacter concernant le conseil de classe ?", date: "2025-04-03T09:00:00", lu: false },
  { id: 17, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "user:admin", contenu: "Bien sûr, je vous appelle dans l'après-midi.", date: "2025-04-03T10:00:00", lu: false },
  { id: 18, expediteur: "Mme Ngo", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Ngo&background=10b981&color=fff", destinataireClasse: "user:teacher1", contenu: "Bonjour collègue, avez-vous reçu le programme du trimestre ?", date: "2025-04-05T08:00:00", lu: false },
  { id: 19, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "user:teacher2", contenu: "Oui, je l'ai reçu. Merci pour l'envoi !", date: "2025-04-05T09:00:00", lu: false },
  { id: 20, expediteur: "Jean Mbélé", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Jean+M&background=8b5cf6&color=fff", destinataireClasse: "user:teacher1", contenu: "Monsieur, j'ai une question sur l'exercice 3 du DM.", date: "2025-04-06T14:00:00", lu: false },
  { id: 21, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataireClasse: "user:student1", contenu: "Viens me voir en perm, je t'expliquerai en détail.", date: "2025-04-06T15:00:00", lu: false },
  { id: 22, expediteur: "Élise Nend", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Elise&background=8b5cf6&color=fff", destinataireClasse: "user:teacher1", contenu: "Monsieur, est-ce qu'on peut rendre le devoir en avance ?", date: "2025-04-07T08:00:00", lu: false },
];

export default function ChatPage() {
  const [messages, setMessages, loadingMessages] = useMessagesStore();
  const [conversationType, setConversationType] = useState<"classe" | "prive">("classe");
  const [selectedClasse, setSelectedClasse] = useState(currentUser.role === "student" ? currentUser.classe : "all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialiser les messages par défaut
  useEffect(() => {
    if (messages.length === 0 && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [messages, setMessages]);

  // Filtrer les messages
  const filteredMessages = (messages || [])
    .filter(m => {
      if (conversationType === "classe") {
        // Pour les messages de classe
        if (selectedClasse === "all") {
          return m.destinataireClasse === "all";
        } else {
          return m.destinataireClasse === selectedClasse;
        }
      } else {
        // Pour les messages privés
        const otherId = selectedContact?.id;
        if (!otherId) return false;
        const currentUserId = `user:${currentUser.id}`;
        const targetId = `user:${otherId}`;
        return m.destinataireClasse === currentUserId && m.expediteur === selectedContact?.nom ||
               m.destinataireClasse === targetId && m.expediteur === currentUser.name;
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    let destinataireClasse = "";
    if (conversationType === "classe") {
      destinataireClasse = selectedClasse === "all" ? "all" : selectedClasse;
    } else {
      destinataireClasse = `user:${selectedContact?.id}`;
    }
    
    let contenu = newMessage;
    if (replyTo) {
      contenu = `> @${replyTo.expediteur}: ${replyTo.contenu.substring(0, 60)}${replyTo.contenu.length > 60 ? "..." : ""}\n\n${newMessage}`;
    }
    
    const newMsg: Message = {
      id: Date.now(),
      expediteur: currentUser.name,
      expediteurRole: currentUser.role,
      expediteurAvatar: currentUser.avatar,
      destinataireClasse: destinataireClasse,
      contenu: contenu,
      date: new Date().toISOString(),
      lu: false,
    };
    setMessages([...(messages || []), newMsg]);
    setNewMessage("");
    setReplyTo(null);
  };

  // Supprimer un message (admin seulement)
  const deleteMessage = (id: number) => {
    if (currentUser.role === "admin" && confirm("Supprimer ce message ?")) {
      setMessages((messages || []).filter(m => m.id !== id));
    }
  };

  // Marquer comme lu
  const markAsRead = (msg: Message) => {
    if (!msg.lu && msg.expediteur !== currentUser.name) {
      setMessages((messages || []).map(m => m.id === msg.id ? { ...m, lu: true } : m));
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  const nonLus = (messages || []).filter(m => !m.lu && m.expediteur !== currentUser.name && 
    (conversationType === "classe" 
      ? (selectedClasse === "all" ? m.destinataireClasse === "all" : m.destinataireClasse === selectedClasse)
      : (m.destinataireClasse === `user:${selectedContact?.id}`))
  ).length;

  // Rendu des bulles
  const renderMessage = (msg: Message) => {
    const isOwn = msg.expediteur === currentUser.name;
    return (
      <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} mb-4 group`} onMouseEnter={() => markAsRead(msg)}>
        <img src={msg.expediteurAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
        <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span 
              className="text-xs font-bold text-slate-700 cursor-pointer hover:underline"
              onClick={() => {
                const contact = contactsInitiaux.find(c => c.nom === msg.expediteur);
                if (contact && contact.id !== currentUser.id) {
                  setConversationType("prive");
                  setSelectedContact(contact);
                }
              }}
            >
              {msg.expediteur}
            </span>
            <span className="text-[10px] text-slate-400">{new Date(msg.date).toLocaleString()}</span>
            {msg.expediteurRole === "admin" && <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">Admin</span>}
            {msg.expediteurRole === "teacher" && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">Enseignant</span>}
            {msg.expediteurRole === "student" && <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">Élève</span>}
            {!msg.lu && !isOwn && <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Nouveau</span>}
          </div>
          <div className={`p-3 rounded-2xl ${isOwn ? "bg-blue-500 text-white" : "bg-white border border-slate-100 shadow-sm"} text-sm`}>
            {msg.contenu.split('\n').map((line, i) => {
              if (line.startsWith('> @')) {
                return <div key={i} className="text-xs text-slate-400 italic bg-slate-50 p-1 rounded mb-1">{line}</div>;
              }
              return <div key={i}>{line}</div>;
            })}
          </div>
          {!isOwn && (
            <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => setReplyTo(msg)} className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-1"><Reply size={10}/> Répondre</button>
              {currentUser.role === "admin" && (
                <button onClick={() => deleteMessage(msg.id)} className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={10}/> Supprimer</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loadingMessages) {
    return <div className="p-8 text-center">Chargement des messages...</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 text-blue-600">
              <MessageSquare size={28} strokeWidth={1.8} />
            </div>
            Communication
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-14">Messages et annonces par classe</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm">
            <Bell size={16} /> {nonLus} notifications
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR - CONVERSATIONS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Filter size={16}/> Conversations
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Annonces générales */}
              <button
                onClick={() => { setConversationType("classe"); setSelectedClasse("all"); setSelectedContact(null); setReplyTo(null); }}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 ${conversationType === "classe" && selectedClasse === "all" ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
              >
                <Megaphone size={18} className="text-amber-500"/>
                <div><p className="font-medium text-sm">Annonces générales</p><p className="text-[10px] text-slate-400">Toute l'école</p></div>
              </button>
              
              {/* Classes */}
              {classes.filter(c => c.id !== "all" && (currentUser.role !== "student" || c.id === currentUser.classe)).map(classe => (
                <button
                  key={classe.id}
                  onClick={() => { setConversationType("classe"); setSelectedClasse(classe.id); setSelectedContact(null); setReplyTo(null); }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 ${conversationType === "classe" && selectedClasse === classe.id ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                >
                  <Users size={18} className="text-blue-500"/>
                  <div><p className="font-medium text-sm">{classe.nom}</p><p className="text-[10px] text-slate-400">{classe.nbEleves} élèves</p></div>
                </button>
              ))}

              {/* Messages privés */}
              <div className="pt-2 pb-1 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Messages privés</div>
              {contactsInitiaux.filter(c => c.id !== currentUser.id).map(contact => (
                <button
                  key={contact.id}
                  onClick={() => { setConversationType("prive"); setSelectedContact(contact); setReplyTo(null); }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 ${conversationType === "prive" && selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                >
                  <User size={18} className="text-purple-500"/>
                  <div><p className="font-medium text-sm">{contact.nom}</p><p className="text-[10px] text-slate-400">{contact.role === "teacher" ? "Enseignant" : contact.role === "admin" ? "Administration" : "Élève"}</p></div>
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
                <MessageCircle size={18} className="text-blue-500"/>
                {conversationType === "classe" 
                  ? (selectedClasse === "all" ? "Annonces générales" : classes.find(c => c.id === selectedClasse)?.nom || "Discussion")
                  : `Discussion avec ${selectedContact?.nom}`
                }
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {conversationType === "classe" 
                  ? (selectedClasse === "all" ? "Messages visibles par toute l'école" : `Messages de la classe ${selectedClasse}`)
                  : `Messages privés`
                }
              </p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm w-48"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/20">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12"><MessageSquare className="mx-auto text-slate-300" size={48}/><p className="text-slate-400 mt-2">Aucun message. Soyez le premier à écrire !</p></div>
            ) : (
              filteredMessages.map(renderMessage)
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
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMessage()}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-sm transition"
              >
                <Send size={18} />
              </button>
              <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500">
                <Paperclip size={18} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
              <span>Messages visibles par tous les membres de {conversationType === "classe" ? (selectedClasse === "all" ? "l'école" : `la classe ${selectedClasse}`) : "cette conversation privée"}</span>
              <span>⚡ Envoi instantané</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}