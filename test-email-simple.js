const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'mouotiejospel@gmail.com',
      pass: 'aikrsslkykunmtnq'
    }
  });

  const info = await transporter.sendMail({
    from: '"Groupe Scolaire Digital" <mouotiejospel@gmail.com>',
    to: 'mouotiejospel@gmail.com',
    subject: '🔔 TEST - Configuration Email',
    text: 'Ceci est un email de test envoyé depuis votre application.',
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
    `
  });

  console.log('✅ Email envoyé avec succès !');
  console.log('📧 Message ID:', info.messageId);
  console.log('👤 Destinataire:', 'mouotiejospel@gmail.com');
  console.log('📅 Heure:', new Date().toLocaleString());
}

sendTestEmail().catch(console.error);