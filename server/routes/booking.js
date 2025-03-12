const router = require("express").Router();
const bookingController = require('../controllers/bookingController');

// Routes pour les réservations
router.post("/create", bookingController.createBooking);
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);
router.get("/:userId/trips", bookingController.getUserTrips);
router.get("/:hostId/reservations", bookingController.getUserReservations);


module.exports = router;
