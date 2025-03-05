const User = require("../models/user.js");
const bcrypt = require("bcryptjs");

// Récupérer le profil de l'utilisateur connecté
exports.getMyProfile = async (req, res) => {
  try {
    console.log("Route /profile/me appelée, ID utilisateur:", req.user._id);
    
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
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
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
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
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
};

// Mettre à jour la photo de profil
exports.updateProfilePicture = async (req, res) => {
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
};

// Supprimer le profil de l'utilisateur
exports.deleteProfile = async (req, res) => {
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
};
