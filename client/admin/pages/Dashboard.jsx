import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  BookOnline as BookOnlineIcon,
} from '@mui/icons-material';

// Vous pourriez avoir un composant StatCard dans components/
const StatCard = ({ title, value, icon, color }) => (
  <Paper 
    elevation={3} 
    sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
  >
    <Box>
      <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Box>
    <Box sx={{ p: 1, bgcolor: `${color}.light`, borderRadius: '50%', display: 'flex' }}>
      {icon}
    </Box>
  </Paper>
);

const Dashboard = () => {
  // Ces données seraient normalement chargées depuis votre API
  const stats = {
    users: 156,
    listings: 89,
    bookings: 243,
    revenue: "12,450 €"
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Utilisateurs" 
            value={stats.users} 
            icon={<PersonIcon sx={{ color: 'primary.main' }} />} 
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Annonces" 
            value={stats.listings} 
            icon={<HomeIcon sx={{ color: 'success.main' }} />} 
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Réservations" 
            value={stats.bookings} 
            icon={<BookOnlineIcon sx={{ color: 'warning.main' }} />} 
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Revenus (30%)" 
            value={stats.revenue} 
            icon={<TrendingUpIcon sx={{ color: 'info.main' }} />} 
            color="info"
          />
        </Grid>
      </Grid>
      
      {/* Vous pouvez ajouter ici des graphiques, des tableaux récents, etc. */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Activité récente
      </Typography>
      
      {/* Table des dernières activités */}
    </div>
  );
};

export default Dashboard;
