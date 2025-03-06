const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const PasswordReset = require('../models/PasswordReset.js');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../config/mailer.js');
require("dotenv").config();

// Contrôleur d'inscription
exports.register = async (req, res) => {
  try {
    console.log("Requête reçue avec le body :", req.body);
    console.log("Fichier reçu de Multer :", req.file);

    const { firstName, lastName, email, password } = req.body;

    // Vérification des champs obligatoires
    if (!firstName || !lastName || !email || !password) {
      console.log("Erreur : Champs requis manquants !");
      return res.status(400).json({ message: "Missing required fields" });
    }

        // Vérification si l'image est bien reçue
    if (!req.file || !req.file.path || req.file.path === "") {
      console.log("Erreur : Image non reçue ou non envoyée sur Cloudinary !");
      return res.status(400).json({ message: "Image upload failed" });
    }

    console.log("Image envoyée sur Cloudinary :", req.file.path);

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Erreur : Utilisateur déjà existant !");
      return res.status(409).json({ message: "User already exists" });
    }

    // Hashage du mot de passe avec un salt plus sécurisé
    const salt = await bcrypt.genSalt(12);  // Augmenter la sécurité avec un salt de 12 rounds
    const hashedPassword = await bcrypt.hash(password, salt);

    // Génération d'un token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24); // Token valide 24h

    // Création du nouvel utilisateur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImagePath: req.file.path, // chemin de l'image
      isVerified: false,
      isAdmin: false, // Valeur par défaut à false
      verificationToken,
      verificationTokenExpires: tokenExpiration
    });

    await newUser.save();
    console.log("Utilisateur enregistré :", newUser);

    // Envoi de l'email de confirmation
    try {
      await sendConfirmationEmail(newUser, verificationToken);
      console.log("Email de confirmation envoyé à :", email);
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email de confirmation :", emailError);
      // Notez que nous continuons malgré l'erreur d'email
    }

    // Réponse structurée avec l'utilisateur
    res.status(201).json({ 
      message: "User registered successfully. A confirmation email has been sent.", 
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        profileImagePath: newUser.profileImagePath,
        isVerified: newUser.isVerified,
        isAdmin: newUser.isAdmin, // Retourner la valeur de isAdmin
        verificationTokenExpires: newUser.verificationTokenExpires // Ajout de l'expiration du token
      }
    });
  } catch (err) {
    console.error("Erreur lors de l'inscription :", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// Contrôleur de connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`[DEBUG] Tentative de connexion pour: ${email}`);
    console.log(`[DEBUG] Corps de la requête:`, req.body);
    
    if (!email || !password) {
      console.log(`[ERROR] Données manquantes: email=${!!email}, password=${!!password}`);
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un email et un mot de passe"
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`[INFO] Utilisateur non trouvé: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }
    
    console.log(`[DEBUG] Statut de vérification pour ${email}: isVerified = ${user.isVerified}`);
    
    // Vérifier si l'email est confirmé
    if (!user.isVerified) {
      console.log(`[INFO] Email non vérifié pour: ${email}`);
      return res.status(403).json({
        success: false,
        message: "Votre email n'a pas été vérifié. Vérifiez votre boîte de réception ou demandez un nouveau lien.",
        needsVerification: true
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`[INFO] Mot de passe invalide pour: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }
    
    // Créer un token JWT
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`[DEBUG] Connexion réussie pour: ${email}`);
    
    // Retourner le token et les informations de l'utilisateur
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImagePath: user.profileImagePath,
      }
    });
  } catch (error) {
    console.error(`[ERROR] Erreur connexion: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion"
    });
  }
};

// Contrôleur de vérification d'email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log(`[DEBUG] Tentative de vérification avec token: ${token}`);
    
    // Recherche d'un utilisateur avec ce token de vérification
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      console.log(`[ERROR] Aucun utilisateur trouvé avec token: ${token}`);
      return res.status(400).json({ 
        success: false, 
        message: "Token de vérification invalide ou expiré"
      });
    }
    
    // Vérifier si le token n'a pas expiré
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      console.log(`[ERROR] Token expiré pour utilisateur: ${user.email}`);
      return res.status(400).json({
        success: false,
        message: "Le lien de vérification a expiré, veuillez en demander un nouveau"
      });
    }
    
    console.log(`[DEBUG] Utilisateur trouvé: ${user.email}, isVerified avant: ${user.isVerified}`);
    
    // Mise à jour de l'état de vérification
    user.isVerified = true;
    user.verificationToken = undefined; // Supprimer le token après utilisation
    user.verificationTokenExpires = undefined; // Supprimer la date d'expiration
    
    // Sauvegarde de l'utilisateur
    await user.save();
    
    // Vérifier que la sauvegarde a fonctionné
    const updatedUser = await User.findById(user._id);
    console.log(`[DEBUG] Utilisateur mis à jour: ${updatedUser.email}, isVerified après: ${updatedUser.isVerified}`);
    
    return res.status(200).json({
      success: true,
      message: "Email vérifié avec succès"
    });
  } catch (error) {
    console.error(`[ERROR] Erreur de vérification d'email: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de l'email"
    });
  }
};

// Contrôleur pour renvoyer l'email de vérification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Rechercher l'utilisateur
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Aucun compte avec cet email n\'a été trouvé.' 
      });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ 
        message: 'Ce compte est déjà vérifié.' 
      });
    }
    
    // Générer un nouveau token de vérification
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
    
    // Mettre à jour l'utilisateur avec le nouveau token
    user.verificationToken = token;
    user.verificationTokenExpires = tokenExpires;
    await user.save();
    
    // Envoyer l'email de vérification
    await sendConfirmationEmail(user, token);
    
    return res.status(200).json({ 
      message: 'Un nouvel email de vérification a été envoyé.' 
    });
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email de vérification:', error);
    return res.status(500).json({ 
      message: 'Une erreur est survenue lors de l\'envoi de l\'email de vérification.' 
    });
  }
};

// Contrôleur pour demander un lien de réinitialisation
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      // Pour des raisons de sécurité, ne pas indiquer si l'email existe
      return res.status(200).json({ 
        success: true, 
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." 
      });
    }

    // Générer un token aléatoire
    const token = crypto.randomBytes(32).toString('hex');
    
    // Supprimer tout ancien token existant pour cet utilisateur
    await PasswordReset.deleteMany({ email });
    
    // Créer un nouveau document de réinitialisation
    await PasswordReset.create({
      email: user.email,
      token: token
    });

    // Envoyer l'email de réinitialisation
    await sendPasswordResetEmail(user, token);
    
    res.status(200).json({ 
      success: true, 
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." 
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({ 
      success: false, 
      message: "Une erreur est survenue. Veuillez réessayer plus tard." 
    });
  }
};

// Contrôleur pour réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    // Vérifier si la demande de réinitialisation est valide
    const passwordReset = await PasswordReset.findOne({
      email,
      token
    });
    
    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: "Ce lien est invalide ou a expiré."
      });
    }
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé."
      });
    }
    
    // Mettre à jour le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    
    // Supprimer le token de réinitialisation
    await PasswordReset.deleteOne({ _id: passwordReset._id });
    
    res.status(200).json({
      success: true,
      message: "Votre mot de passe a été réinitialisé avec succès."
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue. Veuillez réessayer plus tard."
    });
  }
};
