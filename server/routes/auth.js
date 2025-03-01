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
router.get('/verify-email', async (req, res) => {
  try {
    const { token, userId } = req.query;
    
    if (!token || !userId) {
      return res.status(400).json({ message: "Missing token or userId" });
    }
    
    const user = await User.findOne({ 
      _id: userId, 
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() } // Token non expiré
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired verification link" 
      });
    }
    
    // Mettre à jour le statut de vérification de l'utilisateur
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    return res.status(200).json({ 
      message: "Email verified successfully. You can now log in." 
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ 
      message: "Email verification failed", 
      error: error.message 
    });
  }
});

// Route pour renvoyer l'email de vérification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: "This account is already verified" });
    }
    
    // Générer un nouveau token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24);
    
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = tokenExpiration;
    await user.save();
    
    // Envoyer l'email
    try {
      await sendConfirmationEmail(user, verificationToken);
      return res.status(200).json({ 
        message: "Verification email has been sent" 
      });
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email :", emailError);
      return res.status(500).json({ 
        message: "Failed to send verification email", 
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({ 
      message: "Failed to resend verification email", 
      error: error.message 
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
