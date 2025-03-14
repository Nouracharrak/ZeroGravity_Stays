import React, { useState, useEffect } from "react";
import "../styles/login.scss";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom"; 
import { setLogin } from "../redux/state";
import URL from "../constants/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // États pour la vérification d'email (existants)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Nouveaux états pour la réinitialisation de mot de passe
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Gestion des paramètres d'URL pour vérification, inscription et réinitialisation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Vérifier si l'utilisateur vient de s'inscrire (existant)
    const registered = params.get('registered');
    const registeredEmail = params.get('email');
    
    if (registered === 'true' && registeredEmail) {
      setEmail(registeredEmail);
      setRegistrationSuccess(true);
      setVerificationMessage("Votre compte a été créé avec succès. Veuillez vérifier votre boîte mail pour activer votre compte.");
    }
    
    // Vérifier si l'utilisateur a cliqué sur un lien de vérification (existant)
    const verifyToken = params.get('verify');
    const verifyEmail = params.get('email');
    
    if (verifyToken && verifyEmail) {
      setEmail(verifyEmail);
      handleVerifyEmail(verifyToken);
    }
    
    // NOUVEAU: Vérifier si l'utilisateur a cliqué sur un lien de réinitialisation de mot de passe
    const resetTokenParam = params.get('reset');
    const resetEmailParam = params.get('email');
    
    if (resetTokenParam && resetEmailParam) {
      setResetToken(resetTokenParam);
      setForgotPasswordEmail(resetEmailParam);
      setEmail(resetEmailParam);
      setShowResetForm(true);
    }
  }, [location]);

  // Fonction pour vérifier le token d'email (existante)
  const handleVerifyEmail = async (token) => {
    setVerificationStatus("pending");
    setError("");
  
    try {
      const response = await fetch(`${URL.VERIFY_EMAIL}/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setVerificationStatus("success");
        setVerificationMessage("Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.");
      } else {
        setVerificationStatus("error");
        setError(data.message || "Échec de la vérification de l'email");
      }
    } catch (err) {
      setVerificationStatus("error");
      setError("Problème de connexion au serveur");
    }
  };
  // NOUVEAU: Fonction pour gérer la demande de réinitialisation de mot de passe
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setError("Veuillez saisir votre email");
      return;
    }
    
    setForgotPasswordStatus("sending");
    setForgotPasswordMessage("");
    setError("");
    
    try {
      // Assurez-vous d'ajouter cette URL dans votre fichier constants/api.js
      const response = await fetch(URL.FORGOT_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setForgotPasswordStatus("success");
        setForgotPasswordMessage("Si un compte existe avec cet email, vous recevrez un lien de réinitialisation. Veuillez vérifier votre boîte de réception.");
      } else {
        setForgotPasswordStatus("error");
        setError(data.message || "Échec de l'envoi de l'email de réinitialisation");
      }
    } catch (err) {
      setForgotPasswordStatus("error");
      setError("Problème de connexion au serveur");
    }
  };

  // NOUVEAU: Fonction pour gérer la réinitialisation du mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    setResetStatus("sending");
    setError("");
    
    try {
      // Assurez-vous d'ajouter cette URL dans votre fichier constants/api.js
      const response = await fetch(URL.RESET_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: forgotPasswordEmail,
          token: resetToken,
          newPassword: newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetStatus("success");
        setForgotPasswordMessage("Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.");
        
        // Nettoyer les champs et revenir au formulaire de connexion après un délai
        setTimeout(() => {
          setShowResetForm(false);
          // Nettoyer l'URL
          navigate('/login', { replace: true });
        }, 3000);
      } else {
        setResetStatus("error");
        setError(data.message || "Échec de la réinitialisation du mot de passe");
      }
    } catch (err) {
      setResetStatus("error");
      setError("Problème de connexion au serveur");
    }
  };

  // Fonction de connexion existante
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    console.log("Tentative de connexion avec :", { email });
    
    try {
      const response = await fetch(URL.AUTHENTIFICATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      // Vérifier le statut de la réponse
      console.log("Statut de la réponse:", response.status);
      
      const data = await response.json();
      console.log("Données reçues:", data);
  
      if (response.ok) {
        console.log("Réponse complète:", data);
        console.log("Type du token:", typeof data.token);
        // Vérifier si le token est présent dans la réponse
        if (!data.token) {
          console.error("Erreur: Token manquant dans la réponse du serveur", data);
          setError("La réponse du serveur ne contient pas de token d'authentification");
          setIsLoading(false);
          return;
        }
        
        // Stocker le token
        localStorage.setItem('authToken', data.token);
        
        // Vérifier que le token a bien été stocké
        const storedToken = localStorage.getItem('authToken');
    
        console.log("Token stocké avec succès:", !!storedToken);
        console.log("Token stocké:", storedToken ? storedToken.substring(0, 20) + "..." : "NONE");
        
        if (storedToken) {
          console.log("Premier caractères du token:", storedToken.substring(0, 10) + "...");
        }
  
        // Continuer avec le dispatch et la navigation
        dispatch(
          setLogin({
            user: data.user,
            token: data.token,
          })
        );
        
        // Navigation réussie
        console.log("Login réussi, redirection vers la page d'accueil");
        navigate("/");
      } else {
        // Vérifier si l'email n'est pas vérifié
        if (response.status === 403 && data.needsVerification) {
          setNeedsVerification(true);
          setVerificationMessage("Votre email n'a pas été vérifié. Vérifiez votre boîte de réception ou demandez un nouveau lien.");
        } else {
          setError(data.message || "Échec de la connexion. Vérifiez vos identifiants.");
        }
      }
    } catch (storageError) {
      console.error("Erreur lors du stockage du token:", storageError);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour renvoyer l'email de vérification
  const handleResendVerification = async () => {
    if (!email) {
      setError("Veuillez saisir votre email");
      return;
    }
    
    setResendStatus("sending");
    setVerificationMessage("");
    
    try {
      const response = await fetch(URL.RESEND_VERIFICATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendStatus("success");
        setVerificationMessage("Email de vérification envoyé ! Veuillez vérifier votre boîte de réception.");
      } else {
        setResendStatus("error");
        setError(data.message || "Échec de l'envoi de l'email");
      }
    } catch (err) {
      setResendStatus("error");
      setError("Problème de connexion au serveur");
    }
  };

  return (
    <div className="login">
      <div className="login_content">
        {/* Afficher les messages de succès/erreur de vérification (existant) */}
        {verificationStatus === "success" && (
          <div className="verification-success">
            <h3>Email vérifié avec succès !</h3>
            <p>Vous pouvez maintenant vous connecter avec vos identifiants.</p>
          </div>
        )}
        
        {registrationSuccess && (
          <div className="registration-success-message">
            <h3>Inscription réussie !</h3>
            <p>{verificationMessage}</p>
          </div>
        )}
        
        {/* NOUVEAU: Afficher les messages de succès/erreur de réinitialisation */}
        {resetStatus === "success" && (
          <div className="reset-success">
            <h3>Réinitialisation réussie !</h3>
            <p>{forgotPasswordMessage}</p>
          </div>
        )}
        
        {/* Afficher les erreurs générales */}
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {/* NOUVEAU: Formulaire de réinitialisation de mot de passe */}
        {showResetForm ? (
          <div className="reset-password-section">
            <h3>Définir un nouveau mot de passe</h3>
            <p>Veuillez créer un nouveau mot de passe pour votre compte.</p>
            
            <form className="reset-form" onSubmit={handleResetPassword}>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={resetStatus === "sending"}
                minLength="8"
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={resetStatus === "sending"}
              />
              <button
                type="submit"
                disabled={resetStatus === "sending"}
                className={resetStatus === "sending" ? "loading" : ""}
              >
                {resetStatus === "sending" ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </div>
        ) : showForgotPassword ? (
          /* NOUVEAU: Section de demande de réinitialisation */
          <div className="forgot-password-section">
            <h3>Mot de passe oublié</h3>
            <p>Veuillez saisir votre adresse email pour recevoir un lien de réinitialisation.</p>
            
            {forgotPasswordStatus === "success" ? (
              <div className="forgot-success">
                <p>{forgotPasswordMessage}</p>
                <button 
                  onClick={() => setShowForgotPassword(false)}
                  className="back-button"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form className="forgot-form" onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  placeholder="Votre email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={forgotPasswordStatus === "sending"}
                />
                <button
                  type="submit"
                  disabled={forgotPasswordStatus === "sending"}
                  className={forgotPasswordStatus === "sending" ? "loading" : ""}
                >
                  {forgotPasswordStatus === "sending" ? "Envoi en cours..." : "Recevoir le lien de réinitialisation"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="back-button"
                >
                  Retour à la connexion
                </button>
              </form>
            )}
          </div>
        ) : needsVerification ? (
          // Section de vérification d'email (existante)
          <div className="verification-section">
            <div className="verification-info">
              <h3>Vérification requise</h3>
              <p>{verificationMessage}</p>
            </div>
            
            <div className="verification-actions">
              <input
                type="email"
                placeholder="Confirmez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={resendStatus === "sending"}
                className="verification-email-input"
              />
              
              {resendStatus === "success" ? (
                <div className="resend-success">
                  Email de vérification envoyé avec succès !
                </div>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={!email || resendStatus === "sending"}
                  className="resend-button"
                >
                  {resendStatus === "sending" ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
                </button>
              )}
              
              <button
                onClick={() => setNeedsVerification(false)}
                className="back-button"
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        ) : (
          // Formulaire de connexion normal (avec ajout du lien "Mot de passe oublié")
          <>
            <form className="login_content_form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading}
                className={isLoading ? "loading" : ""}
              >
                {isLoading ? "Connexion..." : "Log In"}
              </button>
            </form>
            
            {/* NOUVEAU: Lien mot de passe oublié */}
            <div className="login-links">
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)}
                className="forgot-password-link"
              >
                Mot de passe oublié ?
              </button>
              
              <a href="/register">Don't have an account? Sign Up Here</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

