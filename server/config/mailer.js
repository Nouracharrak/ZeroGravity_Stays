const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Utiliser service au lieu de host/port pour Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction générique pour envoyer un email
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    console.log(`Preparing to send email to: ${to}`);
    
    // Options de l'email
    const mailOptions = {
      from: `"Zero Gravity Stays" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Fallback texte simple si non fourni
    };

    // Vérifier que le transporteur est bien configuré
    console.log("Verifying transporter...");
    await new Promise((resolve, reject) => {
      transporter.verify(function(error, success) {
        if (error) {
          console.error('TRANSPORTER ERROR:', error);
          reject(error);
        } else {
          console.log('Transporter OK. Server ready to send emails.');
          resolve(success);
        }
      });
    });

    // Envoyer l'email
    console.log(`Sending email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('DETAILED ERROR WHILE SENDING EMAIL:');
    console.error('  Message:', error.message);
    if (error.code) console.error('  Code:', error.code);
    if (error.command) console.error('  Command:', error.command);
    if (error.response) console.error('  Response:', error.response);
    console.error('  Stack:', error.stack);
    throw error;
  }
};

// Fonction pour envoyer un email de confirmation
const sendConfirmationEmail = async (user, token) => {
  try {
    console.log("Preparing email for:", user.email);
    console.log("Environment variables:");
    console.log("  - EMAIL_USER:", process.env.EMAIL_USER);
    console.log("  - FRONTEND_URL:", process.env.FRONTEND_URL);
    
    // Construire le lien de vérification
    const verificationLink = `${process.env.FRONTEND_URL}/login?verify=${token}&email=${encodeURIComponent(user.email)}`;
    
    // Contenu HTML de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <h2>Welcome ${user.firstName} ${user.lastName}!</h2>
        <p>Thank you for registering with Zero Gravity Stays. To activate your account, please click the button below:</p>
        
        <div style="margin: 20px 0;">
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify my account</a>
        </div>
        
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>Thank you,<br>The Zero Gravity Stays Team</p>
      </div>
    `;

    return await sendEmail(user.email, 'Welcome - Verify Your Account', htmlContent);
  } catch (error) {
    console.error('Error in sendConfirmationEmail:', error);
    throw error;
  }
};

// Fonction pour envoyer un email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (user, token) => {
  try {
    console.log("Preparing password reset email for:", user.email);
    
    // Construire le lien de réinitialisation
    const resetLink = `${process.env.FRONTEND_URL}/login?reset=${token}&email=${encodeURIComponent(user.email)}`;
    
    // Contenu HTML de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <h2>Hello ${user.firstName} ${user.lastName},</h2>
        <p>You have requested a password reset. To create a new password, please click the button below:</p>
        
        <div style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset my password</a>
        </div>
        
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
        <p>Thank you,<br>The Zero Gravity Stays Team</p>
      </div>
    `;

    return await sendEmail(user.email, 'Password Reset Request', htmlContent);
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw error;
  }
};
const sendPaymentConfirmationEmail = async (userEmail, tripId, tripPrice) => {
    try {
        const bookingDetails = await Booking.findById(tripId)
            .populate('customerId', 'name')
            .populate('hostId', 'name');

        if (!bookingDetails) {
            throw new Error('Booking details not found for tripId: ' + tripId);
        }

        // Conversion des chaînes en objets Date
        const startDate = new Date(bookingDetails.startDate);
        const endDate = new Date(bookingDetails.endDate);

        // Vérification de la validité des dates
        if (isNaN(startDate) || isNaN(endDate)) {
            throw new Error('Invalid date format in booking details');
        }

        const formattedStartDate = startDate.toDateString();
        const formattedEndDate = endDate.toDateString();

        const htmlContent = `
            <div>
                <h2>Thank You for Your Payment!</h2>
                <p>Your payment of ${tripPrice} € has been successfully processed. Here are the details of your booking:</p>
                <p><strong>Booking Dates:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
                <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
                <p>Thank you,<br>The Team</p>
            </div>
        `;

        const emailSent = await sendEmail(userEmail, 'Payment Confirmation', htmlContent);

        if (emailSent) {
            console.log("Email sent successfully to:", userEmail);
        } else {
            console.warn("Failed to send email to:", userEmail);
        }

        return emailSent;
    } catch (error) {
        console.error('Error in sendPaymentConfirmationEmail:', error.message);
        throw error;
    }
};

// Fonction pour envoyer un email de notification à l'administrateur pour un nouveau message de contact
const sendContactAdminNotification = async (contactData) => {
  try {
    console.log("Preparing admin notification email for contact from:", contactData.email);
    
    // Contenu HTML de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <h2>New Contact Message</h2>
        
        <p><strong>From:</strong> ${contactData.firstName} ${contactData.lastName} (${contactData.email})</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Message:</strong></p>
          <p>${contactData.message}</p>
        </div>
        
        <p>You can manage this message from the admin dashboard.</p>
        
        <div style="margin-top: 20px; font-size: 0.9em; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 15px;">
          <p>This is an automated notification from Zero Gravity Stays.</p>
        </div>
      </div>
    `;

    return await sendEmail(process.env.ADMIN_EMAIL, 'New Contact Form Submission - Zero Gravity Stays', htmlContent);
  } catch (error) {
    console.error('Error in sendContactAdminNotification:', error);
    throw error;
  }
};

// Fonction pour envoyer un email de confirmation à l'utilisateur qui a soumis le formulaire de contact
const sendContactUserConfirmation = async (contactData) => {
  try {
    console.log("Preparing user confirmation email for contact form submitter:", contactData.email);
    
    // Contenu HTML de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <h2>Thank You for Reaching Out!</h2>
        
        <p>Dear ${contactData.firstName} ${contactData.lastName},</p>
        
        <p>We have received your message and we appreciate you taking the time to contact us. Our team is working to respond to you as soon as possible.</p>
        
        <p>For your reference, here's a copy of your message:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic;">
          ${contactData.message}
        </div>
        
        <p>If you have any additional information to provide, please feel free to reply to this email.</p>
        
        <div style="margin-top: 20px;">
          <p>Best regards,</p>
          <p>The Zero Gravity Stays Team</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 0.9em; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 15px;">
          <p>This is an automated confirmation. Please do not reply if your question has been answered.</p>
        </div>
      </div>
    `;

    return await sendEmail(contactData.email, 'Thanks for Contacting Us - Zero Gravity Stays', htmlContent);
  } catch (error) {
    console.error('Error in sendContactUserConfirmation:', error);
    throw error;
  }
};

module.exports = { 
  sendEmail, // Exporter la nouvelle fonction générique
  sendConfirmationEmail, 
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendContactAdminNotification,
  sendContactUserConfirmation
};


  

