const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { verifyToken } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// Route pour récupérer le profil de l'utilisateur connecté
router.get("/profile/me", verifyToken, profileController.getMyProfile);

// Route pour mettre à jour le profil de l'utilisateur connecté
router.put("/profile/update", verifyToken, profileController.updateProfile);

// Route pour changer le mot de passe
router.put("/profile/password", verifyToken, profileController.changePassword);

router.put("/profile/picture", verifyToken, upload.single("profileImage"), profileController.updateProfilePicture);

// Route de suppression du profil
router.delete("/delete", verifyToken, profileController.deleteProfile);

module.exports = router;
