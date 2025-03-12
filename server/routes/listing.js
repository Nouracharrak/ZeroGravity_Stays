const router = require("express").Router();
const listingController = require("../controllers/listingController");

// Routes pour les listings
router.post("/create", listingController.uploadListingPhotos, listingController.createListing);
router.get("/search/:search", listingController.searchListings);
router.get("/", listingController.getListings);
router.get("/:listingId", listingController.getListingById);
router.put("/:listingId", listingController.updateListing);
router.delete("/:listingId", listingController.deleteListing);
router.get("/:userId/listings", listingController.getUserListings);

module.exports = router;
