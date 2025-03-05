const ContactUs = require("../models/ContactUs");
const mailer = require("../config/mailer");

// Soumettre un formulaire de contact
exports.submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validation des champs
    if (!firstName || !lastName || !email || !message) {
      console.log("Validation échouée : Tous les champs sont requis.");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validation de l'email avec regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation échouée : Adresse email invalide.");
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Créer un nouveau message de contact
    const newContact = new ContactUs({
      firstName,
      lastName,
      email,
      message
    });

    // Sauvegarder le message dans la base de données
    await newContact.save();
    console.log("Message de contact sauvegardé avec succès:", newContact);

    // Envoyer des notifications par email
    try {
      await mailer.sendContactAdminNotification({
        firstName,
        lastName,
        email,
        message
      });
      console.log("Notification envoyée à l'administrateur avec succès.");
      
      await mailer.sendContactUserConfirmation({
        firstName,
        lastName,
        email,
        message
      });
      console.log("Confirmation envoyée à l'utilisateur avec succès.");
    } catch (mailerError) {
      console.error("Erreur lors de l'envoi des notifications par email:", mailerError);
      return res.status(500).json({ message: "Error sending notification emails" });
    }

    // Répondre avec succès
    res.status(201).json({ 
      message: "Message sent successfully",
      contactId: newContact._id
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi du message de contact:", error);
    res.status(500).json({ message: "Server error while sending message", error: error.message });
  }
};
