// Dans votre fichier de routes admin
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth'); // Utilisez la destructuration pour récupérer la méthode verifyToken
const adminAuth = require('../middleware/admin');

// Utilisez verifyToken au lieu de auth
router.use(verifyToken);
router.use(adminAuth);

// Routes du tableau de bord admin
router.get('/dashboard', adminController.getDashboardStats);

// Routes de gestion des utilisateurs
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Routes de gestion des propriétés
router.get('/properties', adminController.getAllProperties);
router.get('/properties/:id', adminController.getProperty);
router.post('/properties', adminController.createProperty);
router.put('/properties/:id', adminController.updateProperty);
router.delete('/properties/:id', adminController.deleteProperty);

// Routes de gestion des réservations
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBooking);
router.put('/bookings/:id', adminController.updateBooking);
router.delete('/bookings/:id', adminController.deleteBooking);

// Routes de gestion des messages de contact
router.get('/contact-messages', adminController.getAllContactMessages);
router.put('/contact-messages/:id/status', adminController.updateContactMessageStatus);

module.exports = router;


