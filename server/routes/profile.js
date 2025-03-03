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

// 1. Route pour récupérer le profil de l'utilisateur connecté
router.get("/profile/me", verifyToken, async (req, res) => {
    try {
      console.log("Route /me appelée, ID utilisateur:", req.user.id);
      
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
  
  // 2. Route pour mettre à jour le profil de l'utilisateur connecté
  // IMPORTANT: Cette route doit être définie AVANT toute route avec paramètre :id
  router.put("/profile/update", verifyToken, async (req, res) => {
    try {
      console.log("Mise à jour du profil pour l'utilisateur:", req.user.id);
      console.log("Données reçues:", req.body);
      
      const { firstName, lastName } = req.body;
      const updateData = {};
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      
      console.log("Données à mettre à jour:", updateData);
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true }
      ).select("-password");
      
      if (!updatedUser) {
        console.log("Utilisateur non trouvé pour l'ID:", req.user.id);
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
    // (code inchangé pour cette route)
  });
  
  // 4. Routes pour la gestion de la photo de profil
  router.options("/profile/picture", cors(corsOptions), (req, res) => {
    // (code inchangé pour cette route)
  });
  
  router.put("/profile/picture", cors(corsOptions), (req, res, next) => {
    // (code inchangé pour cette route)
  });
  
  // 5. Route de suppression du profil (si nécessaire)
  router.delete("/profile/delete", verifyToken, async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.user.id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.status(200).json({ message: "Profil supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du profil:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // IMPORTANT: Routes génériques avec paramètre :id APRÈS toutes les routes spécifiques
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

