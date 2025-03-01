const nodemailer = require('nodemailer');

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
// Fonction pour envoyer un email de confirmation
const sendConfirmationEmail = async (user) => {
  try {
    // Options de l'email
    const mailOptions = {
      from: `"Zero Gravity Stays" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Bienvenue - Confirmation de création de compte',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
          <h2>Bienvenue ${user.firstName} ${user.lastName} !</h2>
          <p>Votre compte a été créé avec succès.</p>
          <p>Vous pouvez maintenant vous connecter à notre application avec votre email :</p>
          <p style="font-weight: bold;">${user.email}</p>
          
          <div style="margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Se connecter</a>
          </div>
          
          <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
          <p>Merci,<br>L'équipe de votre application</p>
        </div>
      `
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

module.exports = { sendConfirmationEmail };
