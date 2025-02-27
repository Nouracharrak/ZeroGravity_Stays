const router = require("express").Router();
const cloudinary = require("cloudinary").v2;
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

// Route pour créer une annonce avec des images déjà uploadées sur Cloudinary
router.post("/create", async (req, res) => {
  try {
    console.log("Requête reçue avec le body :", req.body);
    // Vérification et récupération des URLs Cloudinary envoyées par le front
    let listingPhotosPaths = [];

    for (let i = 0; ; i++) {
      const key = `listingPhotosPaths[${i}]`;
      if (req.body[key]) {
        listingPhotosPaths.push(req.body[key]);
      } else {
        break;
      }
    }
    if (listingPhotosPaths.length === 0) {
      return res.status(400).json({ message: "Aucune image reçue !" });
    }    
    // Récupération des autres données
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

    // Création du nouvel objet Listing
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
      listingPhotosPaths, // Stocke les URLs ici
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });

    // Sauvegarde en base de données
    await newListing.save();

    // Mise à jour de l'utilisateur pour ajouter l'ID du listing
    const user = await User.findById(creator);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    user.propertyList.push(newListing._id);
    await user.save();

    // Réponse au client
    res.status(200).json({
      message: "Listing créé avec succès",
      newListing,
    });
  } catch (err) {
    console.error("Erreur lors de la création du listing :", err);
    res.status(500).json({ message: "Échec de la création du listing", error: err.message });
  }
});


// Route pour rechercher des annonces

router.get("/search/:search", async (req, res) => {
  let { search } = req.params;
  search = search.trim(); // Nettoie les espaces

  console.log("Recherche reçue :", search);

  if (!search || search.toLowerCase() === "all") {
    console.warn("'all' détecté, réponse vide.");
    return res.status(400).json({ message: "Invalid search query" });
  }

  try {
    const listings = await Listing.find({
      $or: [
        { category: { $regex: `^${search}$`, $options: "i" } },
        { title: { $regex: `^${search}$`, $options: "i" } },
        { city: { $regex: `^${search}$`, $options: "i" } },
        { province: { $regex: `^${search}$`, $options: "i" } },
        { country: { $regex: `^${search}$`, $options: "i" } },
      ],
    }).populate("creator");

    console.log(`${listings.length} résultats trouvés.`);
    res.status(200).json(listings);
  } catch (err) {
    console.error("Erreur recherche :", err);
    res.status(500).json({ message: "Failed to retrieve listings", error: err.message });
  }
});


// Route pour récupérer toutes les annonces par catégorie
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

// Route pour récupérer une annonce par ID
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

// Route pour mettre à jour une annonce
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

// Route pour supprimer une annonce
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

