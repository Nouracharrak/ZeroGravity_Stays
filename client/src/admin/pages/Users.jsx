import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import URL from '../../constants/api'
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  // Récupérer les utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${URL.BACK_LINK}/users`);
        const data = await handleFetchError(response);
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des utilisateurs: ' + err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Gestion du changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gestion du changement de nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Ouvrir le dialogue de confirmation de suppression
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Fermer le dialogue
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`${URL.BACK_LINK}/users/${userToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      setUsers(users.filter(user => user._id !== userToDelete._id));
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Erreur lors de la suppression: ' + err.message);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Utilisateurs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/users/new"
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Propriétés</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isAdmin ? "Admin" : "Utilisateur"} 
                        color={user.isAdmin ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.properties?.length || 0}</TableCell>
                    <TableCell>
                      <IconButton 
                        component={Link} 
                        to={`/admin/users/${user._id}`}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        component={Link} 
                        to={`/admin/users/${user._id}/edit`}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenDeleteDialog(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
        />
      </Paper>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur {userToDelete?.firstName} {userToDelete?.lastName} ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteUser} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
