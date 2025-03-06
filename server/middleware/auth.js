const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware pour vérifier le token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Vérifie si l'Authorization header est présent et commence par 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Access Denied: No Token Provided or incorrect Authorization Header");
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  // Récupère le token depuis l'Authorization header
  const token = authHeader.split(" ")[1];

  // Vérifie le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ajoute les informations décodées à la requête pour un accès ultérieur
    next(); // Passe au middleware suivant si la vérification est réussie
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};
