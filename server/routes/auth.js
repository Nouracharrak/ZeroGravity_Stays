const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { sendConfirmationEmail } = require('../config/mailer.js');
const crypto = require('crypto'); // Ajout de crypto pour la génération de tokens
require("dotenv").config();


// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de Multer pour Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profileImages", // Dossier où seront stockées les images sur Cloudinary
    format: async () => "png", // Convertir en PNG
    public_id: (req, file) => Date.now() + "-" + file.originalname, // Nom unique
  },
});

const upload = multer({ storage });


// Route d'enregistrement avec Cloudinary
router.post('/register', upload.single("profileImage"), async (req, res) => {
  try {
      console.log("Requête reçue avec le body :", req.body);
      console.log("Fichier reçu de Multer :", req.file);

      const { firstName, lastName, email, password } = req.body;
      if (!firstName || !lastName || !email || !password) {
          console.log("Erreur : Champs requis manquants !");
          return res.status(400).json({ message: "Missing required fields" });
      }

      if (!req.file || !req.file.path) {
          console.log("Erreur : Image non reçue !");
          return res.status(400).json({ message: "Image upload failed" });
      }

      console.log("Image envoyée sur Cloudinary :", req.file.path);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          console.log("Erreur : Utilisateur déjà existant !");
          return res.status(409).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Générer un token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24); // Token valide 24h

      const newUser = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          profileImagePath: req.file.path,
          isVerified: false,
          verificationToken: verificationToken,
          verificationTokenExpires: tokenExpiration
      });

      await newUser.save();
      console.log("Utilisateur enregistré :", newUser);

      // Envoyer l'email de confirmation avec le token
      try {
          await sendConfirmationEmail(newUser, verificationToken);
          console.log("Email de confirmation envoyé à :", email);
      } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email de confirmation :", emailError);
          // Notez que nous continuons malgré l'erreur d'email
      }

      res.status(201).json({ 
          message: "User registered successfully. A confirmation email has been sent.", 
          user: {
              id: newUser._id,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              email: newUser.email,
              profileImagePath: newUser.profileImagePath,
              isVerified: newUser.isVerified
          }
      });
  } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
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
    
    // Log important pour vérifier l'état de verification
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
});
// Route pour vérifier l'email (auth/verify/:token)
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Ajouter des logs détaillés
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
    
    // Vérifier si le token n'a pas expiré (si vous avez implémenté l'expiration)
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
});
// Ajoutez aussi une route pour renvoyer l'email de vérification
router.post('/resend-verification', async (req, res) => {
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
});


// Middleware pour vérifier le token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = { verifyToken, router };
