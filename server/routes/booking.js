const router = require("express").Router();
const bookingController = require('../controllers/bookingController');
const { check, validationResult } = require('express-validator');

// Middleware pour valider les paramètres d'ID
const validateBookingId = [
    check('id').isMongoId().withMessage('L\'ID de la réservation est invalide')
];

// Routes pour les réservations
// Créer une réservation
router.post("/create", [
    check('customerId').notEmpty().withMessage('customerId est requis'),
    check('hostId').notEmpty().withMessage('hostId est requis'),
    check('listingId').notEmpty().withMessage('listingId est requis'),
    check('startDate').notEmpty().withMessage('startDate est requis'),
    check('endDate').notEmpty().withMessage('endDate est requis'),
    check('totalPrice').isFloat().withMessage('totalPrice doit être un nombre valide')
], (req, res, next) => {
    // Validation de la requête
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, bookingController.createBooking);

// Récupérer toutes les réservations
router.get("/all", bookingController.getAllBookings);

// Récupérer une réservation par son ID
router.get("/:id", validateBookingId, bookingController.getBookingById);

// Mettre à jour une réservation
router.put("/:id", [
    check('customerId').notEmpty().withMessage('customerId est requis'),
    check('hostId').notEmpty().withMessage('hostId est requis'),
    check('listingId').notEmpty().withMessage('listingId est requis'),
    check('startDate').notEmpty().withMessage('startDate est requis'),
    check('endDate').notEmpty().withMessage('endDate est requis'),
    check('totalPrice').isFloat().withMessage('totalPrice doit être un nombre valide')
], (req, res, next) => {
    // Validation de la requête
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, bookingController.updateBooking);

// Supprimer une réservation
router.delete("/:id", validateBookingId, bookingController.deleteBooking);

module.exports = router;

