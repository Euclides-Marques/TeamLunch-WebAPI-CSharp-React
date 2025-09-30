import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Add, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../services/restaurantService';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar os restaurantes.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRestaurantForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenDialog = (restaurant = null) => {
    if (restaurant) {
      setEditing(true);
      setCurrentRestaurantId(restaurant.id);
      setRestaurantForm({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone || ''
      });
    } else {
      setEditing(false);
      setCurrentRestaurantId(null);
      setRestaurantForm({
        name: '',
        address: '',
        phone: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(false);
    setCurrentRestaurantId(null);
    setRestaurantForm({
      name: '',
      address: '',
      phone: ''
    });
  };

  const handleDeleteClick = (restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRestaurantToDelete(null);
  };

  const handleSaveRestaurant = async () => {
    if (!restaurantForm.name || restaurantForm.name.trim() === '') {
      setSnackbar({
        open: true,
        message: 'O nome do restaurante é obrigatório',
        severity: 'error'
      });
      return;
    }

    try {
      const restaurantData = {
        Id: editing ? currentRestaurantId : 0,
        Name: restaurantForm.name.trim(),
        Address: restaurantForm.address ? restaurantForm.address.trim() : '',
        Phone: restaurantForm.phone ? restaurantForm.phone.trim() : '',
        Votes: [],
        WeeklyWins: []
      };
      
      if (editing && currentRestaurantId) {
        await updateRestaurant(currentRestaurantId, restaurantData);
        setSnackbar({
          open: true,
          message: 'Restaurante atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        await createRestaurant(restaurantData);
        setSnackbar({
          open: true,
          message: 'Restaurante adicionado com sucesso!',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      setRestaurantForm({ name: '', address: '', phone: '' });
      await fetchRestaurants();
      
    } catch (err) {
      let errorMessage = `Erro ao ${editing ? 'atualizar' : 'adicionar'} restaurante`;
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.errors) {
          const validationErrors = Object.values(err.response.data.errors)
            .flat()
            .join('\n');
          errorMessage = `Erro de validação:\n${validationErrors}`;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await deleteRestaurant(restaurantToDelete.id);
      await fetchRestaurants();
      setSnackbar({
        open: true,
        message: 'Restaurante excluído com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Erro ao excluir restaurante: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Restaurantes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ mb: 2 }}
          >
            Adicionar Restaurante
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {restaurants.length > 0 ? (
                  restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell>{restaurant.name}</TableCell>
                      <TableCell>{restaurant.address || '-'}</TableCell>
                      <TableCell>{restaurant.phone || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(restaurant)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(restaurant)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhum restaurante cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editing ? 'Editar Restaurante' : 'Adicionar Novo Restaurante'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: '400px' }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nome do Restaurante"
              type="text"
              fullWidth
              variant="outlined"
              name="name"
              value={restaurantForm.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              id="address"
              label="Endereço"
              type="text"
              fullWidth
              variant="outlined"
              name="address"
              value={restaurantForm.address}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              id="phone"
              label="Telefone"
              type="text"
              fullWidth
              variant="outlined"
              name="phone"
              value={restaurantForm.phone}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveRestaurant} variant="contained" color="primary">
            {editing ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o restaurante <strong>{restaurantToDelete?.name}</strong>?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RestaurantsPage;
