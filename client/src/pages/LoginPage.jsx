import React, { useState } from "react";
import "../styles/login.scss";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        {/* Afficher les erreurs générales */}
        {error && (
          <div 
            style={{ 
              color: "white", 
              backgroundColor: "#d32f2f", 
              padding: "10px", 
              borderRadius: "4px", 
              marginBottom: "15px" 
            }}
          >
            {error}
          </div>
        )}
        
        {needsVerification ? (
          // Section de vérification d'email
          <div className="verification-section">
            <div 
              style={{ 
                backgroundColor: "#f0f4c3", 
                border: "1px solid #cddc39", 
                padding: "15px", 
                borderRadius: "4px", 
                marginBottom: "20px" 
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#827717" }}>Vérification requise</h3>
              <p style={{ margin: "0 0 10px 0" }}>{verificationMessage}</p>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <input
                type="email"
                placeholder="Confirmez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={resendStatus === "sending"}
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  marginBottom: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc" 
                }}
              />
              
              {resendStatus === "success" ? (
                <div 
                  style={{ 
                    color: "#2e7d32", 
                    backgroundColor: "#e8f5e9", 
                    padding: "10px", 
                    borderRadius: "4px"
                  }}
                >
                  Email de vérification envoyé avec succès !
                </div>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={!email || resendStatus === "sending"}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: resendStatus === "sending" ? "wait" : "pointer",
                    opacity: !email || resendStatus === "sending" ? 0.7 : 1
                  }}
                >
                  {resendStatus === "sending" ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
                </button>
              )}
              
              <button
                onClick={() => setNeedsVerification(false)}
                style={{
                  width: "100%",
                  padding: "10px", 
                  marginTop: "10px",
                  backgroundColor: "transparent",
                  color: "#2196f3", 
                  border: "1px solid #2196f3",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
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
                style={{ opacity: isLoading ? 0.7 : 1 }}
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
