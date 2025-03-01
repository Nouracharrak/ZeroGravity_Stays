import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.scss";
import URL from "../constants/api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Met à jour les champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestion de l'image sélectionnée avec validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    // Réinitialiser les erreurs
    setError("");
    
    if (file) {
      // Vérification de la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image trop volumineuse (max: 5MB)");
        return;
      }
      
      // Vérification du type de fichier
      if (!file.type.match('image.*')) {
        setError("Le fichier doit être une image");
        return;
      }
      
      setFormData({ ...formData, profileImage: file });
      
      // Créer une URL d'aperçu
      if (previewImage) {
        URL.revokeObjectURL(previewImage); // Nettoyer l'URL précédente
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Vérifie si les mots de passe correspondent
  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword || formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  // Nettoyage de l'URL de prévisualisation lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Envoi du formulaire au backend avec gestion améliorée
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation finale
    if (!formData.profileImage) {
      setError("Veuillez télécharger une photo de profil");
      return;
    }
    
    if (!passwordMatch) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const register_form = new FormData();
      register_form.append("firstName", formData.firstName);
      register_form.append("lastName", formData.lastName);
      register_form.append("email", formData.email);
      register_form.append("password", formData.password);

      if (formData.profileImage instanceof File) {
        register_form.append("profileImage", formData.profileImage);
      }

      const response = await fetch(URL.REGISTER, {
        method: "POST",
        body: register_form,
      });

      const data = await response.json();
      console.log("Réponse du serveur :", data);

      if (response.ok) {
        setSuccessMessage("Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.message || "Échec de l'inscription");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        {successMessage && (
          <div className="success-message" style={{ color: "green", marginBottom: "15px" }}>
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ color: "red", marginBottom: "15px" }}>
            {error}
          </div>
        )}
        
        <form className="register_content_form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <input
            type="text"
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          {!passwordMatch && <p style={{ color: "red" }}>Passwords do not match</p>}

          {/* Gestion du fichier image avec indication de chargement obligatoire */}
          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
          <label htmlFor="image" style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
            <img 
              src="/assets/addImage.png" 
              alt="Add Profile" 
              style={{ opacity: isSubmitting ? 0.5 : 1 }} 
            />
            <p style={{ color: formData.profileImage ? "green" : "red" }}>
              {formData.profileImage 
                ? "✓ Photo téléchargée" 
                : "* Photo de profil (obligatoire)"}
            </p>
          </label>

          {/* Affichage dynamique de l'image avec indicateur de chargement */}
          {previewImage && (
            <div className="image-preview">
              <img
                src={previewImage}
                alt="Profile Preview"
                style={{ 
                  maxWidth: "80px", 
                  maxHeight: "80px", 
                  borderRadius: "50%",
                  border: "2px solid #4CAF50" 
                }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting || !passwordMatch}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? "Inscription en cours..." : "Register"}
          </button>
        </form>
        <a href="/login">Already have an account? Log In Here</a>
      </div>
    </div>
  );
};

export default RegisterPage;
