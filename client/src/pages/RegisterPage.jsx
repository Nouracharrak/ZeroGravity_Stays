import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.scss";
import URL from "../constants/api"; // Assure-toi que `REGISTER` est bien défini ici

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImagePath: null,
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  // 🔹 Met à jour les champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 🔹 Gestion de l’image sélectionnée
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImagePath: file });
    }
  };

  // Vérifie si les mots de passe correspondent
  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword ||
        formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  // 🔹 Envoi du formulaire au backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const register_form = new FormData();
      register_form.append("firstName", formData.firstName);
      register_form.append("lastName", formData.lastName);
      register_form.append("email", formData.email);
      register_form.append("password", formData.password);

      if (formData.profileImagePath instanceof File) {
        register_form.append("profileImage", formData.profileImagePath); // ✅ Correspond à `upload.single("profileImage")`
      }

      // 🔹 Vérification avant d'envoyer au backend
      for (let pair of register_form.entries()) {
        console.log(pair[0], pair[1]); // Affiche les données envoyées
      }

      const response = await fetch(URL.REGISTER, {
        method: "POST",
        body: register_form,
      });

      const data = await response.json();
      console.log("Réponse du serveur :", data);

      if (response.ok) {
        navigate("/login");
      } else {
        console.log("Registration failed", data.message);
      }
    } catch (err) {
      console.log("Registration failed", err.message);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
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
          {!passwordMatch && (
            <p style={{ color: "red" }}>Passwords do not match</p>
          )}

          {/* 🔹 Gestion du fichier image */}
          <input
            id="image"
            type="file"
            name="profileImagePath"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="Add Profile" />
            <p style={{ color: "red" }}> Upload Profile Photo</p>
          </label>

          {/* 🔹 Affichage dynamique de l'image */}
          {formData.profileImagePath instanceof File ? (
            <img
              src={window.URL.createObjectURL(formData.profileImagePath)}
              alt="Profile Preview"
              style={{ maxWidth: "80px" }}
            />
          ) : formData.profileImagePath ? (
            <img
              src={`https://zero-gravity-stays-bevn.vercel.app${formData.profileImagePath}`}
              alt="Profile from Server"
              style={{ maxWidth: "80px" }}
            />
          ) : null}

          <button type="submit" disabled={!passwordMatch}>
            Register
          </button>
        </form>
        <a href="/login">Already have an account? Log In Here</a>
      </div>
    </div>
  );
};

export default RegisterPage;
