const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

// Routes CRUD basiques
router.get("/", verifyToken, userController.getAllUsers);
router.get("/:userId", verifyToken, userController.getUserById);
router.put("/:userId", verifyToken, userController.updateUser);
router.delete("/:userId", verifyToken, userController.deleteUser);
router.patch("/:userId/:listingId", userController.toggleWishlistItem);

module.exports = router;
