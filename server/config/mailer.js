const nodemailer = require('nodemailer');

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Utiliser service au lieu de host/port pour Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction pour envoyer un email de confirmation
const sendConfirmationEmail = async (user, token) => {
  try {
    console.log("Préparation de l'email pour:", user.email);
    console.log("Variables d'environnement:");
    console.log("  - EMAIL_USER:", process.env.EMAIL_USER);
    console.log("  - FRONTEND_URL:", process.env.FRONTEND_URL);
    
    // Construire le lien de vérification - MODIFIÉ POUR POINTER VERS /login
    const verificationLink = `${process.env.FRONTEND_URL}/login?verify=${token}&email=${encodeURIComponent(user.email)}`;
    
    // Options de l'email
    const mailOptions = {
      from: `"Zero Gravity Stays" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Bienvenue - Vérifiez votre compte',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
          <h2>Bienvenue ${user.firstName} ${user.lastName} !</h2>
          <p>Merci de vous être inscrit sur Zero Gravity Stays. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
          
          <div style="margin: 20px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Vérifier mon compte</a>
          </div>
          
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
          <p>Merci,<br>L'équipe de Zero Gravity Stays</p>
        </div>
      `
    };

    // Vérifier que le transporteur est bien configuré
    console.log("Vérification du transporteur...");
    await new Promise((resolve, reject) => {
      transporter.verify(function(error, success) {
        if (error) {
          console.error('ERREUR DE TRANSPORTEUR:', error);
          reject(error);
        } else {
          console.log('Transporteur OK. Serveur prêt à envoyer des emails.');
          resolve(success);
        }
      });
    });

    // Envoyer l'email
    console.log("Envoi de l'email en cours...");
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    return true;
  } catch (error) {
    console.error('ERREUR DÉTAILLÉE LORS DE L\'ENVOI DE L\'EMAIL:');
    console.error('  Message:', error.message);
    if (error.code) console.error('  Code:', error.code);
    if (error.command) console.error('  Commande:', error.command);
    if (error.response) console.error('  Réponse:', error.response);
    console.error('  Stack:', error.stack);
    throw error; // Re-throw pour permettre la gestion des erreurs au niveau supérieur
  }
};

// Fonction pour envoyer un email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (user, token) => {
  try {
    console.log("Préparation de l'email de réinitialisation pour:", user.email);
    
    // Construire le lien de réinitialisation - REDIRECTION VERS PAGE LOGIN COMME VOTRE SYSTÈME ACTUEL
    const resetLink = `${process.env.FRONTEND_URL}/login?reset=${token}&email=${encodeURIComponent(user.email)}`;
    
    // Options de l'email
    const mailOptions = {
      from: `"Zero Gravity Stays" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
          <h2>Bonjour ${user.firstName} ${user.lastName},</h2>
          <p>Vous avez demandé une réinitialisation de mot de passe. Pour créer un nouveau mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>
          
          <div style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Réinitialiser mon mot de passe</a>
          </div>
          
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
          <p>Merci,<br>L'équipe de Zero Gravity Stays</p>
        </div>
      `
    };

    // Vérifier que le transporteur est bien configuré
    console.log("Vérification du transporteur...");
    await new Promise((resolve, reject) => {
      transporter.verify(function(error, success) {
        if (error) {
          console.error('ERREUR DE TRANSPORTEUR:', error);
          reject(error);
        } else {
          console.log('Transporteur OK. Serveur prêt à envoyer des emails.');
          resolve(success);
        }
      });
    });

    // Envoyer l'email
    console.log("Envoi de l'email de réinitialisation en cours...");
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de réinitialisation envoyé avec succès:', info.messageId);
    return true;
  } catch (error) {
    console.error('ERREUR DÉTAILLÉE LORS DE L\'ENVOI DE L\'EMAIL DE RÉINITIALISATION:');
    console.error('  Message:', error.message);
    if (error.code) console.error('  Code:', error.code);
    if (error.command) console.error('  Commande:', error.command);
    if (error.response) console.error('  Réponse:', error.response);
    console.error('  Stack:', error.stack);
    throw error;
  }
};
  
module.exports = { sendConfirmationEmail, sendPasswordResetEmail };
  

