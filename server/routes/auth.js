const express = require('express');
const router = express.Router();
// const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


router.post('/register', authController.register);

router.post('/login', authController.login);

// Route de vérification d'email
router.get('/verify-email/:token', authController.verifyEmail);

// Route pour renvoyer l'email de vérification
router.post('/resend-verification', authController.resendVerification);

// Route pour demander un lien de réinitialisation
router.post('/forgot-password', authController.forgotPassword);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', authController.resetPassword);

module.exports = router;

