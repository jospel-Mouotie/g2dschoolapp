// lib/email.ts
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function envoyerEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();
    const schoolName = process.env.SCHOOL_NAME || 'Groupe Scolaire';
    const senderEmail = process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: `"${schoolName}" <${senderEmail}>`,
      to: to,
      subject: subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html: html,
      // Ajouter ces en-têtes pour éviter les spams
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });
    
    console.log('Email envoyé:', info.messageId);
    console.log('Destinataire:', to);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Erreur envoi email:', error);
    return { 
      success: false, 
      error: error.message || "Une erreur inconnue est survenue lors de l'envoi." 
    };
  }
}

export async function testerConnexionEmail(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('Connexion SMTP établie avec succès');
    return true;
  } catch (error: any) {
    console.error('Erreur de connexion SMTP:', error);
    return false;
  }
}