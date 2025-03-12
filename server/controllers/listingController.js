const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/user");
require("dotenv").config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de Multer pour Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ListingsImages",
    format: async (req, file) => file.originalname.split(".").pop(), // Conserver le format d'origine de l'image
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

// Middleware d'upload pour les photos
exports.uploadListingPhotos = multer({ storage }).array("listingPhotos", 10);

// Création d'un listing
exports.createListing = async (req, res) => {
  try {
    // Vérification explicite de l'existence du creator dans req.body
    if (!req.body.creator) {
      return res.status(400).json({ message: "ID du créateur manquant" });
    }

    // Vérifier si l'ID est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(req.body.creator)) {
      return res.status(400).json({ message: "Format d'ID du créateur invalide" });
    }

    console.log("ID créateur reçu:", req.body.creator);

    const listingPhotos = JSON.parse(req.body.listingPhotos);
    const parsedAmenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : JSON.parse(req.body.amenities || "[]");

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
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

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
      amenities: parsedAmenities,
      listingPhotosPaths: listingPhotos,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });

    const savedListing = await newListing.save();
    if (!savedListing) {
      return res.status(500).json({ message: "Échec de la sauvegarde du listing" });
    }

    res.status(200).json(savedListing);
  } catch (err) {
    console.error("Erreur lors de la création du listing :", err);
    res
      .status(500)
      .json({ message: "Échec de la création du listing", error: err.message });
  }
};

// Recherche de listings
exports.searchListings = async (req, res) => {
  let { search } = req.params;
  search = search.trim(); // Nettoie les espaces

  if (!search || search.toLowerCase() === "all") {
    console.warn("'all' détecté, réponse vide.");
    return res.status(400).json({ message: "Invalid search query" });
  }

  try {
    const listings = await Listing.find({
      $or: [
        { category: { $regex: `.*${search}.*`, $options: "i" } },
        { title: { $regex: `.*${search}.*`, $options: "i" } },
        { city: { $regex: `.*${search}.*`, $options: "i" } },
        { province: { $regex: `.*${search}.*`, $options: "i" } },
        { country: { $regex: `.*${search}.*`, $options: "i" } },
      ],
    }).populate("creator");

    console.log(`${listings.length} résultats trouvés.`);
    res.status(200).json(listings);
  } catch (err) {
    console.error("Erreur recherche :", err);
    res
      .status(500)
      .json({ message: "Failed to retrieve listings", error: err.message });
  }
};

// Récupération des listings
exports.getListings = async (req, res) => {
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
    res
      .status(500)
      .json({ message: "Failed to retrieve listings", error: err.message });
    console.log(err);
  }
};

// Récupération d'un listing par ID
exports.getListingById = async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("creator");
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get listing", error: err.message });
  }
};

// Mise à jour d'un listing
exports.updateListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findByIdAndUpdate(
      listingId,
      { $set: req.body },
      { new: true }
    );
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update listing", error: err.message });
  }
};

// Suppression d'un listing
exports.deleteListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findByIdAndDelete(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete listing", error: err.message });
  }
};

// Récupérer les propriétés d'un utilisateur
  exports.getUserListings = async (req, res) => {
    try {
        const { userId } = req.params;
        const userListings = await Listing.find({ userId }).populate("creator");
        res.status(200).json(userListings);
    } catch (err) {
        console.error("Erreur lors de la récupération des propriétés:", err);
        res.status(404).json({ message: 'Cannot find the properties!', error: err.message });
    }
};
