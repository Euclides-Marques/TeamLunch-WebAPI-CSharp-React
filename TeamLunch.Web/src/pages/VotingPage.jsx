import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import { getRestaurants } from '../services/restaurantService';
import { getUsers } from '../services/userService';
import { createVote, hasUserVotedToday } from '../services/voteService';
import { getCurrentWeekWinner } from '../services/weeklyWinnerService';

const VotingPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasVoted, setHasVoted] = useState(false);
  const [weeklyWinner, setWeeklyWinner] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restaurantsData, usersData] = await Promise.all([
          getRestaurants(),
          getUsers()
        ]);
        
        setRestaurants(restaurantsData);
        setUsers(usersData);
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar os dados necessários.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserChange = async (userId) => {
    setSelectedUser(userId);
    
    if (userId) {
      try {
        const hasVotedToday = await hasUserVotedToday(userId);
        setHasVoted(hasVotedToday);
        
        if (hasVotedToday) {
          setSnackbar({
            open: true,
            message: 'Você já votou hoje!',
            severity: 'info'
          });
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: `Erro ao verificar voto: ${err.response?.data?.message || err.message}`,
          severity: 'error'
        });
      }
    }
  };

  const handleVote = async () => {
    if (!selectedUser || !selectedRestaurant) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione um usuário e um restaurante',
        severity: 'error'
      });
      return;
    }

    try {
      const voteData = {
        userId: selectedUser,
        restaurantId: selectedRestaurant,
        voteDate: new Date().toISOString().split('T')[0]
      };
      
      await createVote(voteData);
      
      setSnackbar({
        open: true,
        message: 'Voto registrado com sucesso!',
        severity: 'success'
      });
      
      setSelectedRestaurant('');
      setHasVoted(true);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Erro ao registrar voto',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const availableRestaurants = weeklyWinner
    ? restaurants.filter(rest => rest.id !== weeklyWinner.restaurantId)
    : restaurants;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Votação do Dia
        </Typography>

        {weeklyWinner && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Atenção:</strong> O restaurante "{weeklyWinner.restaurant?.name}" venceu esta semana e não está disponível para votação.
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Registrar Voto
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="user-select-label">Seu Nome</InputLabel>
                    <Select
                      labelId="user-select-label"
                      id="user-select"
                      value={selectedUser}
                      label="Seu Nome"
                      onChange={(e) => handleUserChange(e.target.value)}
                      disabled={hasVoted}
                    >
                      <MenuItem value="">
                        <em>Selecione seu nome</em>
                      </MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal" disabled={!selectedUser || hasVoted}>
                    <InputLabel id="restaurant-select-label">Restaurante</InputLabel>
                    <Select
                      labelId="restaurant-select-label"
                      id="restaurant-select"
                      value={selectedRestaurant}
                      label="Restaurante"
                      onChange={(e) => setSelectedRestaurant(e.target.value)}
                      disabled={!selectedUser || hasVoted}
                    >
                      <MenuItem value="">
                        <em>Selecione um restaurante</em>
                      </MenuItem>
                      {availableRestaurants.map((restaurant) => (
                        <MenuItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box mt={2}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      onClick={handleVote}
                      disabled={!selectedUser || !selectedRestaurant || hasVoted}
                    >
                      {hasVoted ? 'Você já votou hoje' : 'Votar'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Instruções
                  </Typography>
                  <Typography paragraph>
                    1. Selecione seu nome na lista de usuários.
                  </Typography>
                  <Typography paragraph>
                    2. Escolha o restaurante de sua preferência.
                  </Typography>
                  <Typography paragraph>
                    3. Clique em "Votar" para confirmar sua escolha.
                  </Typography>
                  <Typography paragraph sx={{ color: 'warning.main', fontStyle: 'italic' }}>
                    * Você só pode votar uma vez por dia.
                  </Typography>
                  <Typography paragraph sx={{ color: 'info.main', fontStyle: 'italic' }}>
                    * Restaurantes que venceram esta semana não estão disponíveis para votação.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

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

export default VotingPage;
