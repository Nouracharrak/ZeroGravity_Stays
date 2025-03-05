const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Route pour soumettre un formulaire de contact
router.post("/", contactController.submitContactForm);

module.exports = router;

