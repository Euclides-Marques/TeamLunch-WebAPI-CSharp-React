import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { 
  Container, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Box, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Typography,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userForm, setUserForm] = useState({
    Name: '',
    Email: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
  }, [editing]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar os usuários.');
      setSnackbar({
        open: true,
        message: 'Erro ao carregar usuários. Tente novamente mais tarde.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleOpenDialog = (user = null) => {
    const isEditing = Boolean(user);
    
    setEditing(isEditing);
    
    if (isEditing) {
      setCurrentUserId(user.id);
      setUserForm({
        Name: user.name || '',
        Email: user.email || ''
      });
    } else {
      setCurrentUserId(null);
      setUserForm({
        Name: '',
        Email: ''
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(false);
    setCurrentUserId(null);
    setUserForm({
      Name: '',
      Email: ''
    });
  };

  const handleSaveUser = async () => {
    if (!userForm.Name?.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, insira um nome válido',
        severity: 'error'
      });
      return;
    }

    if (!userForm.Email?.includes('@')) {
      setSnackbar({
        open: true,
        message: 'Por favor, insira um e-mail válido',
        severity: 'error'
      });
      return;
    }

    try {
      if (editing && currentUserId) {
        await updateUser(currentUserId, {
          Id: parseInt(currentUserId, 10),
          Name: userForm.Name.trim(),
          Email: userForm.Email.trim()
        });
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        await createUser({
          Name: userForm.Name.trim(),
          Email: userForm.Email.trim()
        });
        setSnackbar({
          open: true,
          message: 'Usuário adicionado com sucesso!',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      setUserForm({ Name: '', Email: '' });
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Erro ao salvar usuário: ${err.response?.data || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      fetchUsers();
      setSnackbar({
        open: true,
        message: 'Usuário excluído com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Erro ao excluir usuário: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gerenciar Usuários
        </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mb: 2 }}
          >
            Adicionar Usuário
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
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog(user)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(user)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editing ? 'Editar Usuário' : 'Adicionar Usuário'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nome"
              type="text"
              fullWidth
              variant="outlined"
              value={userForm.Name}
              onChange={(e) => setUserForm({ ...userForm, Name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="email"
              label="E-mail"
              type="email"
              fullWidth
              variant="outlined"
              value={userForm.Email}
              onChange={(e) => setUserForm({ ...userForm, Email: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {editing ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
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
    </Container>
  );
};

export default UsersPage;
