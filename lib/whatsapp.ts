// lib/whatsapp.ts

// Option 1: WhatsApp Web (ouvre l'interface WhatsApp)
export function envoyerWhatsAppWeb(telephone: string, message: string): boolean {
  if (!telephone) return false;
  
  // Nettoyer le numéro de téléphone
  let numero = telephone.replace(/\s/g, '').replace(/^0+/, '');
  if (!numero.startsWith('237') && !numero.startsWith('+237')) {
    numero = '237' + numero;
  }
  if (!numero.startsWith('+')) {
    numero = '+' + numero;
  }
  
  const messageEncode = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${numero}?text=${messageEncode}`;
  window.open(whatsappUrl, '_blank');
  return true;
}

// Option 2: API WhatsApp Business (nécessite un compte Business)
// Pour une utilisation en production réelle
export async function envoyerWhatsAppAPI(
  telephone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telephone, message }),
    });
    
    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}