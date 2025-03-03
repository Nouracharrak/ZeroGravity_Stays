import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLogin } from '../redux/state';
import '../styles/profileSettings.scss';
import URL from "../constants/api";

const ProfileSettings = () => {
  // États pour la gestion des onglets
  const [activeTab, setActiveTab] = useState('info');
  const dispatch = useDispatch();
  
  // Récupérer les informations utilisateur et le token du Redux store
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  
  // États pour les données utilisateur
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // États pour les formulaires
  const [infoForm, setInfoForm] = useState({
    firstName: '',
    lastName: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // État pour l'upload d'image
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        setError("Vous devez être connecté pour accéder à cette page");
        setLoading(false);
        return;
      }
      
      const response = await fetch(URL.FETCH_PROFILE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la récupération des données");
      }
      
      const data = await response.json();
      setUserData(data);
      
      // Initialiser le formulaire avec les données utilisateur
      setInfoForm({
        firstName: data.firstName || '',
        lastName: data.lastName || ''
      });
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les données au montage du composant
  useEffect(() => {
    fetchUserData();
  }, [token]);
  
  // Gestionnaires pour les changements dans les formulaires
  const handleInfoChange = (e) => {
    setInfoForm({
      ...infoForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Créer une URL pour prévisualiser l'image
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };
  
  // Soumission du formulaire des informations personnelles
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const authToken = token || localStorage.getItem('token');
      
      const response = await fetch(URL.UPDATE_USER, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(infoForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }
      
      const data = await response.json();
      setUserData(data);
      
      // Mettre à jour le state Redux
      // Notez que nous devons préserver la structure actuelle
      if (user) {
        dispatch(setLogin({
          user: {
            ...user,
            firstName: data.firstName,
            lastName: data.lastName
          },
          token: authToken
        }));
      }
      
      setSuccess("Informations mises à jour avec succès");
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Une erreur s'est produite lors de la mise à jour");
    }
  };
  
  // Soumission du formulaire de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Vérifier que les nouveaux mots de passe correspondent
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    
    try {
      const authToken = token || localStorage.getItem('token');
      
      const response = await fetch(URL.UPDATE_PASSWORD, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du mot de passe");
      }
      
      // Réinitialiser le formulaire
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess("Mot de passe mis à jour avec succès");
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Une erreur s'est produite lors de la mise à jour du mot de passe");
    }
  };
  
  // Soumission du formulaire d'image de profil
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError("Veuillez sélectionner une image");
      return;
    }
    
    setError(null);
    setSuccess(null);
    setImageUploading(true);
    
    try {
      const authToken = token || localStorage.getItem('token');
      
      // Création d'un objet FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      const response = await fetch(URL.UPDATE_PICTURE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'upload de l'image");
      }
      
      const data = await response.json();
      setUserData(data);
      
      // Mettre à jour le state Redux avec la nouvelle image
      if (user) {
        dispatch(setLogin({
          user: {
            ...user,
            profileImagePath: data.profileImagePath
          },
          token: authToken
        }));
      }
      
      setSuccess("Photo de profil mise à jour avec succès");
      setImageFile(null);
      setImagePreview(null);
      
      // Réinitialiser le champ de fichier
      document.getElementById('imageInput').value = '';
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Une erreur s'est produite lors de l'upload de l'image");
    } finally {
      setImageUploading(false);
    }
  };
  
  // Fonction pour changer l'onglet actif
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };
  
  if (loading) {
    return (
      <div className="profile-settings-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Vérifier si l'utilisateur est connecté
  if (!user && !token) {
    return (
      <div className="profile-settings-container">
        <div className="alert alert-error">
          Vous devez être connecté pour accéder à cette page.
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-settings-container">
      <h1 className="settings-title">Paramètres du profil</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`} 
          onClick={() => handleTabClick('info')}
        >
          Informations personnelles
        </div>
        <div 
          className={`tab ${activeTab === 'password' ? 'active' : ''}`} 
          onClick={() => handleTabClick('password')}
        >
          Changer le mot de passe
        </div>
        <div 
          className={`tab ${activeTab === 'photo' ? 'active' : ''}`} 
          onClick={() => handleTabClick('photo')}
        >
          Photo de profil
        </div>
      </div>
      
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="card">
            <form onSubmit={handleInfoSubmit} className="form info-form">
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={infoForm.firstName}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={infoForm.lastName}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={userData?.email || user?.email || ''}
                  disabled
                />
                <small className="form-text">L'adresse email ne peut pas être modifiée.</small>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="card">
            <form onSubmit={handlePasswordSubmit} className="form password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
                <small className="form-text">Minimum 8 caractères</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Changer le mot de passe
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'photo' && (
          <div className="card photo-card">
            <div className="profile-photo-container">
              <img
                src={imagePreview || userData?.profileImagePath || user?.profileImagePath || "/default-avatar.png"}
                alt="Photo de profil"
                className="profile-photo"
              />
            </div>
            
            <form onSubmit={handleImageSubmit} className="form photo-form">
              <div className="form-group">
                <label htmlFor="imageInput" className="file-upload-label">
                  Sélectionner une image
                </label>
                <input
                  id="imageInput"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-upload-input"
                />
                <small className="form-text">Formats recommandés: JPG, PNG. Taille max: 5MB</small>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className={`btn btn-primary ${imageUploading ? 'loading' : ''}`}
                  disabled={!imageFile || imageUploading}
                >
                  {imageUploading ? 'Téléchargement...' : 'Mettre à jour la photo'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
