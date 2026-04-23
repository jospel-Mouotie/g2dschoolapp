// components/SendNotificationModal.tsx
"use client";
import { useState } from 'react';
import { Mail, MessageCircle, Send, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinataire: {
    nom: string;
    email?: string;
    telephone?: string;
  };
  sujet: string;
  message: string;
  onSuccess?: () => void;
}

export default function SendNotificationModal({
  isOpen,
  onClose,
  destinataire,
  sujet,
  message,
  onSuccess
}: SendNotificationModalProps) {
  const [envoiWhatsApp, setEnvoiWhatsApp] = useState(true);
  const [envoiEmail, setEnvoiEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleSend = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });
    
    const results = [];
    
    // Envoi par email
    if (envoiEmail && destinataire.email) {
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: destinataire.email,
            subject: sujet,
            html: message.replace(/\n/g, '<br/>'),
            text: message
          })
        });
        const data = await response.json();
        results.push({ canal: 'email', success: data.success, error: data.error });
      } catch (error) {
        results.push({ canal: 'email', success: false, error: 'Erreur réseau' });
      }
    }
    
    // Envoi par WhatsApp
    if (envoiWhatsApp && destinataire.telephone) {
      try {
        const response = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telephone: destinataire.telephone,
            message: message
          })
        });
        const data = await response.json();
        results.push({ canal: 'whatsapp', success: data.success, url: data.url });
        
        // Si succès, ouvrir WhatsApp Web
        if (data.success && data.url) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        results.push({ canal: 'whatsapp', success: false, error: 'Erreur réseau' });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      setStatus({
        type: 'success',
        message: `✅ Notification envoyée avec succès${successCount === 2 ? ' par email et WhatsApp' : successCount === 1 && results[0].canal === 'email' ? ' par email' : ' par WhatsApp'}!`
      });
      if (onSuccess) setTimeout(onSuccess, 2000);
    } else {
      setStatus({
        type: 'error',
        message: '❌ Échec de l\'envoi. Vérifiez les coordonnées et la configuration.'
      });
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Send size={20} className="text-blue-600" />
            Envoyer une notification
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700">Destinataire :</p>
          <p className="text-sm text-slate-600">{destinataire.nom}</p>
          {destinataire.email && (
            <p className="text-xs text-slate-500 mt-1">📧 {destinataire.email}</p>
          )}
          {destinataire.telephone && (
            <p className="text-xs text-slate-500">📱 {destinataire.telephone}</p>
          )}
        </div>
        
        <div className="space-y-3 mb-4">
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              checked={envoiWhatsApp}
              onChange={(e) => setEnvoiWhatsApp(e.target.checked)}
              disabled={!destinataire.telephone}
              className="w-4 h-4 text-green-600"
            />
            <MessageCircle size={18} className="text-green-600" />
            <span className="text-sm">
              WhatsApp {!destinataire.telephone && <span className="text-slate-400">(Aucun numéro)</span>}
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              checked={envoiEmail}
              onChange={(e) => setEnvoiEmail(e.target.checked)}
              disabled={!destinataire.email}
              className="w-4 h-4 text-blue-600"
            />
            <Mail size={18} className="text-blue-600" />
            <span className="text-sm">
              Email {!destinataire.email && <span className="text-slate-400">(Aucun email)</span>}
            </span>
          </label>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Aperçu du message</label>
          <div className="bg-slate-50 rounded-xl p-3 max-h-40 overflow-y-auto">
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">
              {message.length > 300 ? message.substring(0, 300) + '...' : message}
            </pre>
          </div>
        </div>
        
        {status.type && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm">{status.message}</span>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={loading || (!envoiWhatsApp && !envoiEmail)}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? "Envoi en cours..." : "Envoyer"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border py-2.5 rounded-xl hover:bg-slate-50 transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}