import React, { useState, useEffect } from "react";  // Ajout de useEffect
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
  
  // États pour la vérification d'email
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();  // Pour accéder aux paramètres d'URL

  // Gestion des paramètres d'URL pour vérification et inscription
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Vérifier si l'utilisateur vient de s'inscrire
    const registered = params.get('registered');
    const registeredEmail = params.get('email');
    
    if (registered === 'true' && registeredEmail) {
      setEmail(registeredEmail);
      setRegistrationSuccess(true);
      setVerificationMessage("Votre compte a été créé avec succès. Veuillez vérifier votre boîte mail pour activer votre compte.");
    }
    
    // Vérifier si l'utilisateur a cliqué sur un lien de vérification
    const verifyToken = params.get('verify');
    const verifyEmail = params.get('email');
    
    if (verifyToken && verifyEmail) {
      setEmail(verifyEmail);
      handleVerifyEmail(verifyToken);
    }
  }, [location]);

  // Fonction pour vérifier le token d'email
  const handleVerifyEmail = async (token) => {
    setVerificationStatus("pending");
    setError("");
    
    try {
      const response = await fetch(`${URL.VERIFY}/${token}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch(URL.AUTHENTIFICATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(
          setLogin({
            user: data.user,
            token: data.token,
          })
        );
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
    } catch (err) {
      setError("Problème de connexion au serveur");
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
        {/* Afficher les messages de succès/erreur de vérification */}
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
        
        {/* Afficher les erreurs générales */}
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {needsVerification ? (
          // Section de vérification d'email
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
          // Formulaire de connexion normal
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
            <a href="/register">Don't have an account? Sign Up Here</a>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
