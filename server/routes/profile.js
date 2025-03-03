const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { verifyToken } = require("../middleware/auth");
const cors = require("cors");

// Configuration CORS spécifique pour cette route
const corsOptions = {
  origin: "https://zero-gravity-stays.vercel.app",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Configuration pour Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profileImages",
    format: async () => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

// Configuration de multer avec des limites et gestion d'erreur
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // limite à 5MB
  }
}).single("profileImage");

// 1. Récupérer les informations du profil
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 2. Mettre à jour les informations du profil
router.put("/update", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 3. Changer le mot de passe
router.put("/me/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Le mot de passe actuel et le nouveau mot de passe sont requis" });
    }
    
    const user = await User.findById(req.user.id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Gérer explicitement les requêtes OPTIONS pour /me/picture
router.options("/me/picture", cors(corsOptions), (req, res) => {
  console.log("OPTIONS request received for /me/picture");
  return res.status(200).end();
});

// 4. Mettre à jour la photo de profil avec gestion CORS et multer améliorée
router.put("/me/picture", cors(corsOptions), (req, res, next) => {
  console.log("Processing PUT request for profile picture upload");
  
  // Vérifier le token avant de procéder à l'upload
  verifyToken(req, res, () => {
    // Envelopper multer dans un try-catch pour gérer les erreurs d'upload
    upload(req, res, function(err) {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          // Erreur spécifique à multer (taille de fichier etc.)
          return res.status(400).json({ message: `Erreur d'upload: ${err.message}` });
        } else {
          // Erreur inconnue
          return res.status(500).json({ message: `Erreur serveur lors de l'upload: ${err.message}` });
        }
      }
      
      // Si tout va bien, continuer avec le traitement
      handleProfileImageUpload(req, res);
    });
  });
});

// Fonction séparée pour gérer le traitement de l'image après l'upload
async function handleProfileImageUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucune image n'a été téléchargée" });
    }
    
    console.log("File successfully uploaded:", req.file.path);
    
    const profileImagePath = req.file.path;
    
    // Mettre à jour le chemin de l'image de profil
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profileImagePath } },
      { new: true }
    ).select("-password");
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la photo:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = router;
