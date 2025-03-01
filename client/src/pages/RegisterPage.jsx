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
  const [registrationStatus, setRegistrationStatus] = useState('');
  const navigate = useNavigate();

  // Met à jour les champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestion de l'image sélectionnée
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Vérifie si les mots de passe correspondent
  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword || formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  // Envoi du formulaire au backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationStatus('pending'); // Indique que l'inscription est en cours
    
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
        setRegistrationStatus('success');
        // Au lieu de rediriger immédiatement vers login, on informe l'utilisateur
        // qu'il doit vérifier son email
        setTimeout(() => {
          navigate("/verification-sent", { 
            state: { email: formData.email } 
          });
        }, 2000);
      } else {
        setRegistrationStatus('error');
        console.error("Registration failed", data.message);
      }
    } catch (err) {
      setRegistrationStatus('error');
      console.error("Registration failed", err.message);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        {registrationStatus === 'success' ? (
          <div className="registration-success">
            <h2>Registration Successful!</h2>
            <p>A verification email has been sent to {formData.email}.</p>
            <p>Please check your inbox and verify your email address to complete the registration.</p>
          </div>
        ) : (
          <form className="register_content_form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {!passwordMatch && <p style={{ color: "red" }}>Passwords do not match</p>}

            {/* Gestion du fichier image */}
            <input
              id="image"
              type="file"
              name="profileImage"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <label htmlFor="image">
              <img src="/assets/addImage.png" alt="Add Profile" />
              <p style={{ color: "red" }}> Upload Profile Photo</p>
            </label>

            {/* Affichage dynamique de l'image */}
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile Preview"
                style={{ maxWidth: "80px", borderRadius: "50%" }}
              />
            ) : formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile from Server"
                style={{ maxWidth: "80px", borderRadius: "50%" }}
              />
            ) : null}

            {/* Message d'erreur d'inscription */}
            {registrationStatus === 'error' && (
              <p style={{ color: "red" }}>
                Registration failed. Please check your information and try again.
              </p>
            )}

            <button 
              type="submit" 
              disabled={!passwordMatch || registrationStatus === 'pending'}
            >
              {registrationStatus === 'pending' ? 'Processing...' : 'Register'}
            </button>
          </form>
        )}
        <a href="/login">Already have an account? Log In Here</a>
      </div>
    </div>
  );
};

export default RegisterPage;
