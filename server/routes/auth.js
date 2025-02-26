const router = require('express').Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();


// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Enregistre les fichiers dans le dossier 'uploads'
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
    }
});

const upload = multer({ storage });

// Route d'enregistrement de l'utilisateur
router.post('/register', upload.single("profileImage"), async (req, res) => {
    try {
        console.log("Requête reçue avec le body :", req.body); // Debug
        console.log("Fichier reçu :", req.file); // Debug

        const { firstName, lastName, email, password } = req.body;
        const profileImage = req.file; // L'image téléchargée

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!profileImage) {
            return res.status(400).json({ message: "No profile image uploaded" });
        }

        // Vérification si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        // Récupérer le chemin de l'image téléchargée
        const profileImagePath = profileImage ? `/uploads/${profileImage.filename}` : "";

        // Créer un nouvel utilisateur
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profileImagePath
        });

        // Sauvegarder l'utilisateur dans la base de données
        await newUser.save();

        // Réponse de succès
        res.status(200).json({ message: "User Registered successfully", user: newUser });

    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// Route de connexion de l'utilisateur
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur avec son email
        const existingUser = await User.findOne({ email }).select("+password"); // Inclut le mot de passe
        if (!existingUser) {
            return res.status(404).json({ message: "User does not exist!" }); // 404 si l'utilisateur n'existe pas
        }

        // Comparer les mots de passe
        const isMatch = await bcrypt.compare(password, existingUser.password); // Comparaison du mdp
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" }); // 400 si mot de passe invalide
        }

        // Générer un token JWT
        const token = jwt.sign(
            { id: existingUser._id }, // Payload du token
            process.env.JWT_SECRET,  // Clé secrète
            { expiresIn: "1h" }      // Expiration (1 heure)
        );

        // Supprimer le mot de passe avant de retourner la réponse
        const user = existingUser.toObject(); // Convertir en objet JS ordinaire
        delete user.password;

        // Envoyer la réponse
        res.status(200).json({ token, user });
    } catch (err) {
        console.error("Login error:", err); // Log l'erreur sur la console
        res.status(500).json({ error: "An unexpected error occurred!" }); // Envoyer une réponse générique
    }
});


const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; // Récupère le header Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(' ')[1]; // Récupère le token après "Bearer"
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token
        console.log('Decoded JWT:', decoded); // Log des données décodées
        req.user = decoded; // Passe les infos utilisateur dans req.user
        next(); // Passe au middleware ou route suivante
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

  module.exports = { verifyToken, router };
  



