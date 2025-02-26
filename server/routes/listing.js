const router = require("express").Router();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { verifyToken } = require("./auth");
const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/user");
require("dotenv").config();

// ✅ Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Configuration de Multer pour Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "listingsPhotos", // ✅ Dossier où seront stockées les images sur Cloudinary
    format: async () => "png", // ✅ Convertir en PNG
    public_id: (req, file) => Date.now() + "-" + file.originalname, // ✅ Nom unique
  },
});

const upload = multer({ storage });

// ✅ Route pour créer une annonce avec upload sur Cloudinary
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    // ✅ Récupérer les URLs des images stockées sur Cloudinary
    const listingPhotosPaths = req.files.map((file) => file.path);

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotosPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });

    // ✅ Sauvegarde du listing
    await newListing.save();

    // ✅ Mettre à jour l'utilisateur pour ajouter l'ID du listing
    const user = await User.findById(creator);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.propertyList.push(newListing._id);
    await user.save();

    res.status(200).json({
      message: "Listing created successfully",
      newListing,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create listing", error: err.message });
    console.log(err);
  }
});

// ✅ Route pour rechercher des annonces
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  try {
    let listings;
    if (search === "all") {
      listings = await Listing.find().populate("creator");
    } else {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { province: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } },
        ],
      }).populate("creator");
    }
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve listings", error: err.message });
    console.log(err);
  }
});

// ✅ Route pour récupérer toutes les annonces par catégorie
router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate("creator");
    } else {
      listings = await Listing.find().populate("creator");
    }
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve listings", error: err.message });
    console.log(err);
  }
});

// ✅ Route pour récupérer une annonce par ID
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("creator");
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to get listing", error: err.message });
  }
});

// ✅ Route pour mettre à jour une annonce
router.put("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findByIdAndUpdate(listingId, { $set: req.body }, { new: true });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  }
});

// ✅ Route pour supprimer une annonce
router.delete("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findByIdAndDelete(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  }
});

module.exports = router;

