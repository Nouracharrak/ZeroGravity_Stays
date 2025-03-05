const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Chemin vers votre contrôleur

// Route d'inscription
router.post('/register', userController.register);

// Route de connexion
router.post('/login', userController.login);

// Route de vérification d'email
router.get('/verify-email/:token', userController.verifyEmail);

// Route pour renvoyer l'email de vérification
router.post('/resend-verification', userController.resendVerification);

// Route pour demander un lien de réinitialisation
router.post('/forgot-password', userController.forgotPassword);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', userController.resetPassword);

module.exports = router;

