// app/communication/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Users, Bell, Mail, Plus, Search, 
  Paperclip, Smile, MoreVertical, ChevronDown, X,
  Megaphone, MessageCircle, CheckCircle, Clock, 
  School, UserCheck, Calendar, Filter, Home, User
} from "lucide-react";
import { useLocalStorage } from "@/lib/stores"; // ou useIndexedDB

// Types
interface Message {
  id: number;
  expediteur: string;
  expediteurRole: "admin" | "teacher" | "student";
  expediteurAvatar: string;
  destinataire: string; // "all" pour annonces générales, "classe:6A" pour classe, "user:ID" pour privé
  contenu: string;
  date: string;
  pieceJointe?: string;
  lu: boolean;
}

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

// Simuler des contacts (enseignants et élèves) pour les conversations privées
const contactsInitiaux: Contact[] = [
  { id: "admin", nom: "Direction", role: "admin", avatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff" },
  { id: "teacher1", nom: "M. Kanga", role: "teacher", avatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff" },
  { id: "teacher2", nom: "Mme Ngo", role: "teacher", avatar: "https://ui-avatars.com/api/?name=Ngo&background=10b981&color=fff" },
  { id: "student1", nom: "Jean Mbélé", role: "student", avatar: "https://ui-avatars.com/api/?name=Jean+M&background=8b5cf6&color=fff" },
  { id: "student2", nom: "Élise Nend", role: "student", avatar: "https://ui-avatars.com/api/?name=Elise&background=8b5cf6&color=fff" },
];

// Simuler l'utilisateur connecté
const currentUser = {
  id: "teacher1",
  role: "teacher", // "admin", "teacher", "student"
  name: "M. Kanga",
  avatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff",
  classe: "6A"
};

// Messages initiaux (incluant quelques messages privés)
const initialMessages: Message[] = [
  { id: 1, expediteur: "Direction", expediteurRole: "admin", expediteurAvatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff", destinataire: "all", contenu: "📢 Réunion parents-professeurs le 15 avril à 15h en salle polyvalente.", date: "2025-04-01T08:00:00", lu: false },
  { id: 2, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataire: "classe:6A", contenu: "Devoir maison à rendre pour lundi. Chapitre 3.", date: "2025-04-02T10:30:00", lu: false },
  { id: 3, expediteur: "Jean Mbélé", expediteurRole: "student", expediteurAvatar: "https://ui-avatars.com/api/?name=Jean+M&background=8b5cf6&color=fff", destinataire: "classe:6A", contenu: "Monsieur, est-ce qu'on peut utiliser la calculatrice ?", date: "2025-04-02T14:20:00", lu: false },
  { id: 4, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataire: "classe:6A", contenu: "Oui, la calculatrice est autorisée pour ce devoir.", date: "2025-04-02T15:00:00", lu: false },
  { id: 5, expediteur: "Direction", expediteurRole: "admin", expediteurAvatar: "https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff", destinataire: "user:teacher1", contenu: "Bonjour M. Kanga, pouvez-vous me contacter ?", date: "2025-04-03T09:00:00", lu: false },
  { id: 6, expediteur: "M. Kanga", expediteurRole: "teacher", expediteurAvatar: "https://ui-avatars.com/api/?name=Kanga&background=10b981&color=fff", destinataire: "user:admin", contenu: "Bien sûr, je vous appelle dans l'après-midi.", date: "2025-04-03T10:00:00", lu: false },
];

export default function CommunicationPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationType, setConversationType] = useState<"classe" | "prive">("classe");
  const [selectedClasse, setSelectedClasse] = useState(currentUser.role === "student" ? currentUser.classe : "all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrer les messages selon la conversation courante
  const filteredMessages = messages
    .filter(m => {
      if (conversationType === "classe") {
        const classeId = selectedClasse === "all" ? "all" : `classe:${selectedClasse}`;
        return m.destinataire === classeId || (m.destinataire === "all" && selectedClasse !== "all");
      } else {
        // Conversation privée : les messages où l'un des deux participants est l'utilisateur courant
        const otherId = selectedContact?.id;
        if (!otherId) return false;
        const currentUserId = `user:${currentUser.id}`;
        const targetId = `user:${otherId}`;
        return (m.destinataire === currentUserId && m.expediteur === selectedContact?.nom) ||
               (m.destinataire === targetId && m.expediteur === currentUser.name);
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    let destinataire = "";
    if (conversationType === "classe") {
      destinataire = selectedClasse === "all" ? "all" : `classe:${selectedClasse}`;
    } else {
      destinataire = `user:${selectedContact?.id}`;
    }
    const newMsg: Message = {
      id: Date.now(),
      expediteur: currentUser.name,
      expediteurRole: currentUser.role as any,
      expediteurAvatar: currentUser.avatar,
      destinataire: destinataire,
      contenu: newMessage,
      date: new Date().toISOString(),
      lu: false,
    };
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  // Calculer le nombre de messages non lus pour la conversation courante
  const nonLus = messages.filter(m => !m.lu && 
    (conversationType === "classe" 
      ? (m.destinataire === (selectedClasse === "all" ? "all" : `classe:${selectedClasse}`) || (m.destinataire === "all" && selectedClasse !== "all"))
      : (m.destinataire === `user:${selectedContact?.id}` && m.expediteur !== currentUser.name))
  ).length;

  // Rendu des bulles
  const renderMessage = (msg: Message) => {
    const isOwn = msg.expediteur === currentUser.name;
    return (
      <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} mb-4`}>
        <img src={msg.expediteurAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
        <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span 
              className="text-xs font-bold text-slate-700 cursor-pointer hover:underline"
              onClick={() => {
                // Cliquer sur le nom de l'expéditeur pour démarrer une conversation privée
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
          </div>
          <div className={`p-3 rounded-2xl ${isOwn ? "bg-blue-500 text-white" : "bg-white border border-slate-100 shadow-sm"} text-sm`}>
            {msg.contenu}
            {msg.pieceJointe && <div className="text-xs mt-1 flex items-center gap-1"><Paperclip size={12}/> {msg.pieceJointe}</div>}
          </div>
        </div>
      </div>
    );
  };

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
        {/* SIDEBAR : Navigation entre conversations */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Filter size={16}/> Conversations
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Option : Annonces générales */}
              <button
                onClick={() => { setConversationType("classe"); setSelectedClasse("all"); setSelectedContact(null); }}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 ${conversationType === "classe" && selectedClasse === "all" ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
              >
                <Megaphone size={18} className="text-amber-500"/>
                <div><p className="font-medium text-sm">Annonces générales</p><p className="text-[10px] text-slate-400">Toute l'école</p></div>
              </button>
              
              {/* Classes disponibles pour l'utilisateur */}
              {classes.filter(c => c.id !== "all" && (currentUser.role !== "student" || c.id === currentUser.classe)).map(classe => (
                <button
                  key={classe.id}
                  onClick={() => { setConversationType("classe"); setSelectedClasse(classe.id); setSelectedContact(null); }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 ${conversationType === "classe" && selectedClasse === classe.id ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                >
                  <Users size={18} className="text-blue-500"/>
                  <div><p className="font-medium text-sm">{classe.nom}</p><p className="text-[10px] text-slate-400">{classe.nbEleves} élèves</p></div>
                </button>
              ))}

              {/* Section des conversations privées */}
              <div className="pt-2 pb-1 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Messages privés</div>
              {contactsInitiaux.filter(c => c.id !== currentUser.id).map(contact => (
                <button
                  key={contact.id}
                  onClick={() => { setConversationType("prive"); setSelectedContact(contact); }}
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
              <div className="text-center py-12"><MessageSquare className="mx-auto text-slate-300" size={48}/><p className="text-slate-400 mt-2">Aucun message.</p></div>
            ) : (
              filteredMessages.map(renderMessage)
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