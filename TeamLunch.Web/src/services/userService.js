import api from '../config/api';

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (user) => {
  try {
    const userWithVotes = {
      ...user,
      votes: []
    };
    const response = await api.post('/users', userWithVotes);
    return response.data;
  } catch (error) {
    console.error('Erro detalhado ao criar usuário:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      },
      request: error.request,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      },
    });
    
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = 'Erro ao processar a requisição';
      
      if (status === 400) {
        errorMessage = data?.title || 'Dados inválidos';
        if (data?.errors) {
          errorMessage += ': ' + Object.values(data.errors).flat().join(', ');
        }
      } else if (status === 401) {
        errorMessage = 'Não autorizado. Por favor, faça login novamente.';
      } else if (status === 403) {
        errorMessage = 'Você não tem permissão para realizar esta ação.';
      } else if (status === 404) {
        errorMessage = 'Recurso não encontrado.';
      } else if (status >= 500) {
        errorMessage = 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      throw enhancedError;
    } else if (error.request) {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
    } else {
      throw new Error('Erro ao processar a requisição. Por favor, tente novamente.');
    }
  }
};

export const updateUser = async (id, user) => {
  try {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    throw error;
  }
};
