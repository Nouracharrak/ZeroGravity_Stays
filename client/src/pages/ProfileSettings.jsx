import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Form, Button, Alert, Image, Card, Row, Col } from 'react-bootstrap';
import URL from "../constants/api"

const ProfileSettings = () => {
  // États pour la gestion des onglets
  const [activeTab, setActiveTab] = useState('info');
  
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

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Vous devez être connecté pour accéder à cette page");
        setLoading(false);
        return;
      }
      
      const response = await fetch(URL.FETCH_PROFILE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
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
  }, []);
  
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
      setImageFile(e.target.files[0]);
    }
  };
  
  // Soumission du formulaire des informations personnelles
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(URL.UPDATE_USER, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(URL.UPDATE_PASSWORD, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      const token = localStorage.getItem('token');
      
      // Création d'un objet FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      const response = await fetch(URL.UPDATE_PICTURE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'upload de l'image");
      }
      
      const data = await response.json();
      setUserData(data);
      setSuccess("Photo de profil mise à jour avec succès");
      setImageFile(null);
      
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
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <h1 className="mb-4">Paramètres du profil</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="info" title="Informations personnelles">
          <Card>
            <Card.Body>
              <Form onSubmit={handleInfoSubmit}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Prénom</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={infoForm.firstName}
                      onChange={handleInfoChange}
                      required
                    />
                  </Col>
                </Form.Group>
                
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Nom</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={infoForm.lastName}
                      onChange={handleInfoChange}
                      required
                    />
                  </Col>
                </Form.Group>
                
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Email</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="email"
                      value={userData?.email || ''}
                      disabled
                    />
                    <Form.Text className="text-muted">
                      L'adresse email ne peut pas être modifiée.
                    </Form.Text>
                  </Col>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary">
                    Enregistrer les modifications
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="password" title="Changer le mot de passe">
          <Card>
            <Card.Body>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Mot de passe actuel</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Col>
                </Form.Group>
                
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Nouveau mot de passe</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                    />
                    <Form.Text className="text-muted">
                      Minimum 8 caractères
                    </Form.Text>
                  </Col>
                </Form.Group>
                
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>Confirmer le mot de passe</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Col>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary">
                    Changer le mot de passe
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="photo" title="Photo de profil">
          <Card>
            <Card.Body className="text-center">
              <div className="mb-4">
                <Image
                  src={userData?.profileImagePath || "/default-avatar.png"}
                  roundedCircle
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
              </div>
              
              <Form onSubmit={handleImageSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    id="imageInput"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <Form.Text className="text-muted">
                    Formats recommandés: JPG, PNG. Taille max: 5MB
                  </Form.Text>
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!imageFile || imageUploading}
                >
                  {imageUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Téléchargement...
                    </>
                  ) : (
                    "Mettre à jour la photo"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ProfileSettings;
