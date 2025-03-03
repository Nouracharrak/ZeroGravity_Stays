const express = require("express");
const router = express.Router();
const ContactUs = require("../models/ContactUs"); // Renommé ici
const mailer = require("../config/mailer");

// Route pour soumettre un formulaire de contact
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    
    // Validation des champs
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validation de l'email avec regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    
    // Envoyer des notifications par email
    await mailer.sendContactAdminNotification({
      firstName,
      lastName,
      email,
      message
    });
    
    await mailer.sendContactUserConfirmation({
      firstName,
      lastName,
      email,
      message
    });
    
    // Répondre avec succès
    res.status(201).json({ 
      message: "Message sent successfully",
      contactId: newContact._id
    });
    
  } catch (error) {
    console.error("Error sending contact message:", error);
    res.status(500).json({ message: "Server error while sending message" });
  }
});

module.exports = router;
