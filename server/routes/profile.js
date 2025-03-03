const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { verifyToken } = require("../routes/auth.js");
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

// 1. Route pour récupérer le profil de l'utilisateur connecté
router.get("/profile/me", verifyToken, async (req, res) => {
    try {
      console.log("Route /me appelée, ID utilisateur:", req.user._id);
      
      const user = await User.findById(req.user._id).select("-password");
      
      if (!user) {
        console.log("Utilisateur non trouvé pour l'ID:", req.user._id);
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      console.log("Utilisateur trouvé:", user.email);
      res.status(200).json(user);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // 2. Route pour mettre à jour le profil de l'utilisateur connecté
  router.put("/profile/update", verifyToken, async (req, res) => {
    try {
      console.log("Mise à jour du profil pour l'utilisateur:", req.user._id);
      console.log("Données reçues:", req.body);
      
      const { firstName, lastName } = req.body;
      const updateData = {};
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      
      console.log("Données à mettre à jour:", updateData);
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
      ).select("-password");
      
      if (!updatedUser) {
        console.log("Utilisateur non trouvé pour l'ID:", req.user._id);
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      console.log("Mise à jour réussie, données retournées:", updatedUser);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // 3. Route pour changer le mot de passe
  router.put("/profile/password", verifyToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Vérifier le mot de passe actuel
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mot de passe actuel incorrect" });
      }
      
      // Hasher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      
      res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // 4. Routes pour la gestion de la photo de profil
  router.options("/profile/picture", cors(corsOptions), (req, res) => {
    res.status(200).send();
  });
  
  router.put("/profile/picture", cors(corsOptions), verifyToken, upload.single("profileImage"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucune image fournie" });
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profileImagePath: req.file.path },
        { new: true }
      ).select("-password");
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.status(200).json({
        message: "Photo de profil mise à jour",
        profileImagePath: updatedUser.profileImagePath
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la photo:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // 5. Route de suppression du profil
  router.delete("/profile/delete", verifyToken, async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.user._id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.status(200).json({ message: "Profil supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du profil:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // 6. Route pour obtenir un utilisateur par ID
  router.get("/:id", verifyToken, async (req, res) => {
    try {
      // Vérifiez que l'ID n'est pas "me", "update" ou autre route spéciale
      const specialRoutes = ["me", "update", "delete"];
      if (specialRoutes.includes(req.params.id)) {
        return res.status(400).json({ message: "Route incorrecte" });
      }
      
      const user = await User.findById(req.params.id).select("-password");
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // 7. Route pour mettre à jour un utilisateur par ID (admin)
  router.put("/:id", verifyToken, async (req, res) => {
    try {
      // Vérifiez que l'ID n'est pas "me", "update" ou autre route spéciale
      const specialRoutes = ["me", "update", "delete"];
      if (specialRoutes.includes(req.params.id)) {
        return res.status(400).json({ message: "Route incorrecte" });
      }
      
      // Vérifier les permissions (admin seulement)
      // Implémentez votre logique d'autorisation ici
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      ).select("-password");
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // 8. Route pour supprimer un utilisateur par ID (admin)
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      // Vérifiez que l'ID n'est pas "me", "update" ou autre route spéciale
      const specialRoutes = ["me", "update", "delete"];
      if (specialRoutes.includes(req.params.id)) {
        return res.status(400).json({ message: "Route incorrecte" });
      }
      
      // Vérifier les permissions (admin seulement)
      // Implémentez votre logique d'autorisation ici
      
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      
      if (!deletedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  module.exports = router;


