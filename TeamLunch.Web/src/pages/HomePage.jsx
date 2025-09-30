import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { getTodaysWinner } from '../services/voteService';

const HomePage = () => {
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodaysWinner = async () => {
      try {
        const data = await getTodaysWinner();
        setWinner(data);
      } catch (err) {
        setError('Não foi possível carregar o vencedor do dia.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysWinner();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bem-vindo ao TemLunch
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            Participe da votação diária para escolher o restaurante do almoço!
          </Typography>
          <Typography variant="body1">
            Navegue pelo menu para gerenciar restaurantes, usuários e ver o histórico de vencedores.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
