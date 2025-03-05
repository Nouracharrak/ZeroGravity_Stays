// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('./auth'); // Middleware d'authentification
const adminAuth = require('../middleware/admin'); // Middleware d'authentification admin
const adminController = require('../controllers/adminController');

// Tableau de bord - statistiques générales
router.get('/dashboard', auth, adminAuth, adminController.getDashboardStats); // Ajoutez la méthode pour le tableau de bord

// Gestion des utilisateurs
router.get('/users', auth, adminAuth, adminController.getAllUsers);
router.get('/users/:id', auth, adminAuth, adminController.getUser);
router.post('/users', auth, adminAuth, adminController.createUser);
router.put('/users/:id', auth, adminAuth, adminController.updateUser);
router.delete('/users/:id', auth, adminAuth, adminController.deleteUser);

// Gestion des réservations
router.get('/bookings', auth, adminAuth, adminController.getAllBookings);
router.get('/bookings/:id', auth, adminAuth, adminController.getBooking);
router.put('/bookings/:id', auth, adminAuth, adminController.updateBooking);
router.delete('/bookings/:id', auth, adminAuth, adminController.deleteBooking);

// Gestion des propriétés
router.get('/properties', auth, adminAuth, adminController.getAllProperties);
router.get('/properties/:id', auth, adminAuth, adminController.getProperty);
router.post('/properties', auth, adminAuth, adminController.createProperty);
router.put('/properties/:id', auth, adminAuth, adminController.updateProperty);
router.delete('/properties/:id', auth, adminAuth, adminController.deleteProperty);

// Gestion des messages de contact
router.get('/contact-messages', auth, adminAuth, adminController.getAllContactMessages);
router.put('/contact-messages/:id/status', auth, adminAuth, adminController.updateContactMessageStatus);

module.exports = router;

