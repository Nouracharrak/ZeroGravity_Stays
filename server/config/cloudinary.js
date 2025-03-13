const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
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
    folder: "profileImages", // Dossier où seront stockées les images sur Cloudinary
    format: async () => "png", // Convertir en PNG
    public_id: (req, file) => Date.now() + "-" + file.originalname, // Nom unique
  },
});

// MODIFIÉ : Exporter l'instance Multer plutôt qu'un middleware préconfigurée
const upload = multer({ storage });

module.exports = { cloudinary, upload };


