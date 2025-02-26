const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
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
    folder: "profileImages", // ✅ Dossier où seront stockées les images sur Cloudinary
    format: async () => "png", // ✅ Convertir en PNG
    public_id: (req, file) => Date.now() + "-" + file.originalname, // ✅ Nom unique
  },
});

const upload = multer({ storage });


// ✅ Route d'enregistrement avec Cloudinary
router.post('/register', upload.single("profileImage"), async (req, res) => {
    try {
        console.log("Requête reçue avec le body :", req.body); // Debug
        console.log("Fichier reçu :", req.file); // Debug

        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Vérifier si une image a bien été uploadée sur Cloudinary
        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "Image upload failed" });
        }

        // Vérification si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        // Enregistrer l'URL Cloudinary de l'image
        const profileImagePath = req.file.path; 

        // Créer un nouvel utilisateur
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profileImagePath
        });

        await newUser.save();

        res.status(201).json({ message: "User Registered successfully", user: newUser });
    } catch (err) {
        console.error("Error during registration:", err);

        // S'assurer que l'erreur renvoyée est bien un JSON
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});
// ✅ Route de connexion de l'utilisateur
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist!" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const user = existingUser.toObject();
    delete user.password;

    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "An unexpected error occurred!" });
  }
});

// ✅ Middleware pour vérifier le token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = { verifyToken, router };




