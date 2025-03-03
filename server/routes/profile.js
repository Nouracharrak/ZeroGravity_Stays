const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { verifyToken } = require("../middleware/auth"); // Import du middleware existant

// Configuration pour Cloudinary (réutilisez votre configuration existante)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profileImages",
    format: async () => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const upload = multer({ storage });

// 1. Récupérer les informations du profil
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Avec votre middleware, l'ID de l'utilisateur est disponible dans req.user.id
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
router.put("/me", verifyToken, async (req, res) => {
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
    
    // Récupérer l'utilisateur avec son mot de passe
    const user = await User.findById(req.user.id);
    
    // Vérifier si le mot de passe actuel est correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }
    
    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 4. Mettre à jour la photo de profil (utilisant Cloudinary)
router.put("/me/photo", verifyToken, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucune image n'a été téléchargée" });
    }
    
    // L'URL de l'image est disponible dans req.file.path avec CloudinaryStorage
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
});

module.exports = { verifyToken, router };
