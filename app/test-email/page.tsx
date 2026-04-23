// app/test-config/page.tsx
"use client";
import { useState } from 'react';

export default function TestConfigPage() {
  const [result, setResult] = useState('');

  const testEmail = async () => {
    setResult('Envoi en cours...');
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'mouotiejospel@gmail.com', // 🔴 REMPLACÉ par votre vrai email
          subject: 'Test de configuration - Groupe Scolaire',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">✅ Test Réussi !</h1>
              </div>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px;">
                <p style="color: #374151;">Votre configuration email fonctionne parfaitement.</p>
                <p style="color: #374151;">Vous pouvez maintenant envoyer :</p>
                <ul style="color: #374151;">
                  <li>📊 Bulletins de notes</li>
                  <li>💰 Reçus de paiement</li>
                  <li>📢 Annonces et communications</li>
                </ul>
                <hr style="border-color: #d1d5db; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px; text-align: center;">
                  Groupe Scolaire Digital - ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          `,
          text: 'Test réussi ! Votre configuration email fonctionne parfaitement.'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult('✅ Email envoyé avec succès ! Vérifiez votre boîte de réception.');
      } else {
        setResult(`❌ Erreur: ${data.error}`);
      }
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}`);
    }
  };

  const testConnexion = async () => {
    setResult('Vérification de la connexion...');
    
    try {
      const response = await fetch('/api/send-email', { method: 'GET' });
      const data = await response.json();
      
      if (data.connected) {
        setResult('✅ Connexion SMTP établie avec succès !');
      } else {
        setResult('❌ Échec de la connexion SMTP. Vérifiez vos identifiants.');
      }
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuration Email</h1>
      <div className="space-y-4">
        <button 
          onClick={testConnexion}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Tester la connexion SMTP
        </button>
        <button 
          onClick={testEmail}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Envoyer un email test
        </button>
      </div>
      {result && (
        <div className="mt-4 p-4 bg-slate-100 rounded-lg">
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  );
}