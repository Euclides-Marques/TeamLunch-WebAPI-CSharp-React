import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress, 
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { getWeeklyWinners, getCurrentWeekWinner } from '../services/weeklyWinnerService';

const WinnersPage = () => {
  const [winners, setWinners] = useState([]);
  const [filteredWinners, setFilteredWinners] = useState([]);
  const [currentWeekWinner, setCurrentWeekWinner] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [winnersData, currentWinner] = await Promise.all([
          getWeeklyWinners(),
          getCurrentWeekWinner()
        ]);
        
        setWinners(winnersData);
        setFilteredWinners(winnersData);
        setCurrentWeekWinner(currentWinner);
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar os vencedores semanais.');
        setSnackbar({
          open: true,
          message: 'Erro ao carregar vencedores. Tente novamente mais tarde.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    if (!date) {
      setFilteredWinners(winners);
      return;
    }
    
    const weekStart = startOfWeek(date, { locale: ptBR });
    const weekEnd = endOfWeek(date, { locale: ptBR });
    
    const filtered = winners.filter(winner => {
      const winnerDate = parseISO(winner.weekStartDate);
      return isWithinInterval(winnerDate, { start: weekStart, end: weekEnd });
    });
    
    setFilteredWinners(filtered);
  };

  const getWeekRangeString = (startDate, endDate) => {
    const start = format(parseISO(startDate), 'dd/MM/yyyy');
    const end = endDate ? format(parseISO(endDate), 'dd/MM/yyyy') : 'Em andamento';
    return `${start} - ${end}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vencedores Semanais
        </Typography>

        {currentWeekWinner && (
          <Box mb={4} p={2} bgcolor="success.light" borderRadius={1}>
            <Typography variant="h6" color="white">
              Vencedor da Semana Atual:
            </Typography>
            <Typography variant="body1" color="white">
              {currentWeekWinner.restaurant.name} - {getWeekRangeString(currentWeekWinner.weekStartDate, currentWeekWinner.weekEndDate)}
            </Typography>
          </Box>
        )}

        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Selecione uma semana"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{ textField: { variant: 'outlined' } }}
            />
          </LocalizationProvider>
          {selectedDate && (
            <Chip 
              label={format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
              color="primary"
              variant="outlined"
              onDelete={() => {
                setSelectedDate(new Date());
                setFilteredWinners(winners);
              }}
            />
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredWinners.length === 0 ? (
          <Alert severity="info">
            Nenhum vencedor encontrado para o período selecionado.
          </Alert>
        ) : (
          <Card>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Período</TableCell>
                    <TableCell>Restaurante</TableCell>
                    <TableCell>Endereço</TableCell>
                    <TableCell>Votos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWinners.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell>
                        {getWeekRangeString(winner.weekStartDate, winner.weekEndDate)}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {winner.restaurant?.name || 'Restaurante não encontrado'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {winner.restaurant?.address || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={winner.voteCount} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        <Box mt={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sobre a Votação Semanal
              </Typography>
              <Typography paragraph>
                A cada semana, os membros da equipe votam em seus restaurantes preferidos para o almoço.
              </Typography>
              <Typography paragraph>
                <strong>Regras:</strong>
              </Typography>
              <ul>
                <li>Cada pessoa pode votar apenas uma vez por dia</li>
                <li>O restaurante mais votado na semana é o vencedor</li>
                <li>O restaurante vencedor não pode participar da votação na semana seguinte</li>
                <li>A votação é reiniciada a cada semana</li>
              </ul>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default WinnersPage;
