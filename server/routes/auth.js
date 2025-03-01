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

// Route de connexion de l'utilisateur - mise à jour pour vérifier le statut de vérification
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist!" });
    }

    // Vérifier si l'email est vérifié
    if (!existingUser.isVerified) {
      return res.status(403).json({ 
        message: "Please verify your email before logging in",
        needsVerification: true 
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const user = existingUser.toObject();
    delete user.password;

    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "An unexpected error occurred!" });
  }
});

// Route pour vérifier l'email
// Dans votre fichier routes/auth.js ou controllers/auth.js

// Route pour vérifier un email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Rechercher l'utilisateur avec ce token
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() } // Vérifier que le token n'a pas expiré
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Le lien de vérification est invalide ou a expiré.' 
      });
    }
    
    // Marquer l'utilisateur comme vérifié
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    return res.status(200).json({ 
      message: 'Votre email a été vérifié avec succès.' 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return res.status(500).json({ 
      message: 'Une erreur est survenue lors de la vérification de votre email.' 
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
