import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.scss";
import API_URL from "../constants/api";  // Renommé pour éviter le conflit avec l'objet global URL

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
        window.URL.revokeObjectURL(previewImage); // Utiliser window.URL pour éviter les conflits
      }
      setPreviewImage(window.URL.createObjectURL(file));
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
        window.URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Redirection vers la page de login après l'inscription
  const redirectToLogin = () => {
    navigate(`/login?registered=true&email=${encodeURIComponent(formData.email)}`);
  };

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

      const response = await fetch(API_URL.REGISTER, {
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

  // Si l'inscription est terminée, afficher l'écran de confirmation
  if (registrationComplete) {
    return (
      <div className="register">
        <div className="register_content">
          <div className="registration-success">
            <div className="success-message">
              <h2>Inscription réussie !</h2>
              <p>Votre compte a été créé avec succès, mais vous devez vérifier votre adresse email pour l'activer.</p>
              
              <div className="steps-info">
                <h3>Prochaines étapes :</h3>
                <ol>
                  <li>Vérifiez votre boîte mail <strong>{formData.email}</strong> pour trouver notre email de confirmation.</li>
                  <li>Cliquez sur le lien de vérification dans cet email.</li>
                  <li>Une fois votre email vérifié, vous pourrez vous connecter à votre compte.</li>
                </ol>
              </div>
              
              <p className="note">Si vous ne trouvez pas l'email, vérifiez votre dossier spam ou demandez un nouvel email de vérification sur la page de connexion.</p>
            </div>
            
            <button onClick={redirectToLogin}>
              Aller à la page de connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register">
      <div className="register_content">
        {error && (
          <div className="error-message">
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
          {!passwordMatch && <p className="password-mismatch">Passwords do not match</p>}

          <div className="verification-info">
            <p>Après l'inscription, vous recevrez un email de vérification pour activer votre compte.</p>
          </div>
          
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
            <p className={formData.profileImage ? "image-uploaded" : "image-required"}>
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
              />
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


