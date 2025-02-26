const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { verifyToken, router: userRoutes } = require("./auth");
const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/user");

// ✅ Modifier le chemin du dossier pour stocker les fichiers de manière permanente
const uploadDir = path.join(__dirname, "../uploads");

// ✅ Vérifie si le dossier "uploads" existe, sinon le crée
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Vérifie que seuls les fichiers images sont acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accepte le fichier
  } else {
    cb(new Error("Invalid file type"), false); // Rejette le fichier
  }
};

// ✅ Configure Multer pour enregistrer les fichiers dans "/uploads/"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // ✅ Stocke les images dans "uploads/"
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // ✅ Nom unique
  },
});

const upload = multer({ storage, fileFilter });


// Route to create a listing
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  // Validate file upload
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }

  try {
    const {
      creator, // Assurez-vous que l'ID du créateur est bien fourni
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

    const listingPhotos = req.files;
    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).send("No files found");
    }

    const listingPhotosPaths = listingPhotos.map((file) => `/uploads/${file.filename}`);

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

    // Sauvegarder le listing
    await newListing.save();

    // Mettre à jour l'utilisateur (ajouter l'ID du listing à sa propriété)
    const user = await User.findById(creator); // Trouver l'utilisateur via son ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ajouter l'ID du nouveau listing à la liste des propriétés de l'utilisateur
    user.propertyList.push(newListing._id);

    // Sauvegarder les modifications de l'utilisateur
    await user.save();

    // Retourner la réponse avec le listing créé et les propriétés mises à jour
    res.status(200).json({
      message: "Listing created and added to user property list",
      newListing,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create listing", error: err.message });
    console.log(err);
  }
});

// Get Listing by Search

router.get('/search/:search', async (req, res) => {
  const { search } = req.params;
  console.log('Search query:', search);  // Vérifier si la recherche est correcte
  try {
    let listings = [];
    if (search === 'all') {
      listings = await Listing.find().populate("creator");
    } else {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { province: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } },
        ]
      }).populate('creator');
    }
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve listings', error: err.message });
    console.log(err);
  }
});


// Route to get all listings by category
router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate('creator');
    } else {
      listings = await Listing.find().populate('creator');
    }
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve listings', error: err.message });
    console.log(err);
  }
});
// get listing byId
router.get('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    console.log(`Recherche du listing avec l'ID : ${listingId}`);
    const listing = await Listing.findById(listingId);
    if (!listing) {
      console.log(`Listing non trouvé`);
      return res.status(404).json({ message: "Listing not found" });
    }
    console.log(`Listing trouvé : ${listing}`);
    const listingWithCreator = await Listing.findById(listingId).populate('creator');
    console.log(`Listing avec creator : ${listingWithCreator}`);
    res.status(200).json(listingWithCreator);
  } catch (err) {
    console.error(`Erreur : ${err}`);
    res.status(500).json({ message: "Failed to get listing", error: err.message });
  }
});

// Route to update a listing
router.put('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    // Mettez à jour le listing
    const updatedListing = await Listing.findByIdAndUpdate(listingId, { $set: req.body }, { new: true });
    res.status(200).json(updatedListing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  }
});

// Route to delete a listing
router.delete('/:listingId', async (req, res) => {
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

