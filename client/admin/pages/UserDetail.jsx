import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Tabs, Tab, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip,
  Card, CardContent, CardMedia, CircularProgress, Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  FavoriteBorder as WishlistIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import URL from '../../src/constants/api'

// TabPanel component pour les onglets
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fonction pour gérer les erreurs des requêtes fetch
  const handleFetchError = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => {
        return { message: 'Une erreur inconnue est survenue' };
      });
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }
    return response.json();
  };

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Chargement des données de l'utilisateur
        const userRes = await fetch(`${URL.BACK_LINK}/users/${id}`);
        const userData = await handleFetchError(userRes);
        setUser(userData);
        
        // Chargement des propriétés de l'utilisateur
        const propertiesRes = await fetch(`${URL.BACK_LINK}/users/${id}/properties`);
        const propertiesData = await handleFetchError(propertiesRes);
        setProperties(propertiesData);
        
        // Chargement des voyages de l'utilisateur
        const tripsRes = await fetch(`${URL.BACK_LINK}/users/${id}/trips`);
        const tripsData = await handleFetchError(tripsRes);
        setTrips(tripsData);
        
        // Chargement des réservations reçues (en tant qu'hôte)
        const reservationsRes = await fetch(`${URL.BACK_LINK}users/${id}/reservations`);
        const reservationsData = await handleFetchError(reservationsRes);
        setReservations(reservationsData);
        
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données: ' + err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Alert severity="warning">Utilisateur non trouvé</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/users')}
        >
          Retour à la liste
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={Link}
          to={`/admin/users/${id}/edit`}
        >
          Modifier
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Informations de l'utilisateur */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={user.profileImagePath} 
                sx={{ width: 100, height: 100, mb: 2 }}
              >
                {user.firstName?.charAt(0) || <PersonIcon />}
              </Avatar>
              <Typography variant="h5">
                {user.firstName} {user.lastName}
              </Typography>
              <Chip 
                label={user.isAdmin ? "Administrateur" : "Utilisateur"} 
                color={user.isAdmin ? "primary" : "default"}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1 }} /> {user.email}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1 }} /> {user.phoneNumber || 'Non spécifié'}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 1 }} /> {properties.length} propriétés
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <WishlistIcon sx={{ mr: 1 }} /> {user.wishList?.length || 0} favoris
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Onglets pour les propriétés, réservations, etc. */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="user tabs">
              <Tab label="Propriétés" />
              <Tab label="Voyages" />
              <Tab label="Réservations reçues" />
            </Tabs>
            
            {/* Onglet des propriétés */}
            <TabPanel value={tabValue} index={0}>
              {properties.length === 0 ? (
                <Typography>Aucune propriété trouvée</Typography>
              ) : (
                <Grid container spacing={2}>
                  {properties.map((property) => (
                    <Grid item xs={12} sm={6} key={property._id}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="140"
                          image={property.listingPhotoPaths?.[0] || '/placeholder.jpg'}
                          alt={property.title}
                        />
                        <CardContent>
                          <Typography variant="h6">{property.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {property.city}, {property.country}
                          </Typography>
                          <Typography variant="body2">
                            {property.price}€ / nuit
                          </Typography>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/admin/listings/${property._id}`}
                            sx={{ mt: 1 }}
                          >
                            Voir détails
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
            
            {/* Onglet des voyages */}
            <TabPanel value={tabValue} index={1}>
              {trips.length === 0 ? (
                <Typography>Aucun voyage trouvé</Typography>
              ) : (
                <List>
                  {trips.map((trip) => (
                    <ListItem key={trip._id} divider>
                      <ListItemAvatar>
                        <Avatar src={trip.listingDetails?.listingPhotoPaths?.[0]}>
                          <HomeIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={trip.listingDetails?.title || 'Hébergement'}
                        secondary={`${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()} • ${trip.totalPrice}€`}
                      />
                      <Button 
                        size="small" 
                        component={Link} 
                        to={`/admin/bookings/${trip._id}`}
                      >
                        Détails
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
            
            {/* Onglet des réservations reçues */}
            <TabPanel value={tabValue} index={2}>
              {reservations.length === 0 ? (
                <Typography>Aucune réservation reçue</Typography>
              ) : (
                <List>
                  {reservations.map((reservation) => (
                    <ListItem key={reservation._id} divider>
                      <ListItemAvatar>
                        <Avatar src={reservation.customerId?.profileImagePath}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${reservation.customerId?.firstName} ${reservation.customerId?.lastName}`}
                        secondary={`${reservation.listingId?.title} • ${new Date(reservation.startDate).toLocaleDateString()} - ${new Date(reservation.endDate).toLocaleDateString()}`}
                      />
                      <Chip 
                        label={reservation.status} 
                        color={
                          reservation.status === 'confirmed' ? 'success' : 
                          reservation.status === 'pending' ? 'warning' : 'default'
                        }
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Button 
                        size="small" 
                        component={Link} 
                        to={`/admin/bookings/${reservation._id}`}
                      >
                        Détails
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetail;
