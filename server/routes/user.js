const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

// Routes CRUD basiques
router.get("/", verifyToken, userController.getAllUsers);
router.get("/:userId", verifyToken, userController.getUserById);
router.put("/:userId", verifyToken, userController.updateUser);
router.delete("/:userId", verifyToken, userController.deleteUser);

// Routes pour les fonctionnalités spécifiques
router.get("/:userId/trips", verifyToken, userController.getUserTrips);
router.get("/:userId/properties", verifyToken, userController.getUserProperties);
router.get("/:userId/reservations", verifyToken, userController.getUserReservations);
router.patch("/:userId/wishlist/:listingId", verifyToken, userController.toggleWishlistItem);

module.exports = router;

