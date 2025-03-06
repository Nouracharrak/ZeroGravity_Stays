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
    isAdmin: false,  // Si tu veux permettre un rôle admin côté frontend (sécurisé)
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();

  // Met à jour les champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestion de l'image sélectionnée avec validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image trop volumineuse (max: 5MB)");
        return;
      }

      if (!file.type.match('image.*')) {
        setError("Le fichier doit être une image");
        return;
      }
      
      setFormData({ ...formData, profileImage: file });
      
      if (previewImage) {
        window.URL.revokeObjectURL(previewImage); 
      }
      setPreviewImage(window.URL.createObjectURL(file));
    }
  };

  // Vérifie si les mots de passe correspondent
  useEffect(() => {
    setPasswordMatch(formData.password === formData.confirmPassword || formData.confirmPassword === "");
  }, [formData.password, formData.confirmPassword]);

  // Nettoyage de l'URL de prévisualisation
  useEffect(() => {
    return () => {
      if (previewImage) {
        window.URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Redirection vers la page de login après l'inscription
  const redirectToLogin = () => {
    navigate(`/login?registered=true&email=${encodeURIComponent(formData.email)}`);
  };

  // Envoi du formulaire au backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      register_form.append("isAdmin", formData.isAdmin);  // Ajout de la gestion du rôle si nécessaire

      if (formData.profileImage instanceof File) {
        register_form.append("profileImage", formData.profileImage);
      }

      const response = await fetch(URL.REGISTER, {
        method: "POST",
        body: register_form,
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationComplete(true);
      } else {
        setError(data.message || "Échec de l'inscription");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="register">
        <div className="register_content">
          <div className="registration-success">
            <h2>Inscription réussie !</h2>
            <p>Votre compte a été créé avec succès, mais vous devez vérifier votre adresse email pour l'activer.</p>
            <button onClick={redirectToLogin}>Aller à la page de connexion</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register">
      <div className="register_content">
        {error && <div className="error-message">{error}</div>}
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
          {!passwordMatch && <p className="password-mismatch">Passwords do not match</p>}
          
          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="Add Profile" />
            <p>{formData.profileImage ? "✓ Photo téléchargée" : "* Photo de profil (obligatoire)"}</p>
          </label>

          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Profile Preview" />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting || !passwordMatch}
            className={isSubmitting ? "loading" : ""}
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



