import api from '../config/api';

/**
 * Verifica se um usuário já votou hoje
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} Retorna true se o usuário já votou hoje, false caso contrário
 */
export const hasUserVotedToday = async (userId) => {
  try {
    const response = await api.get(`/votes/hasvotedtoday/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Obtém os votos de hoje
 * @returns {Promise<Array>} Lista de votos de hoje
 */
export const getTodaysVotes = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/votes/bydate/${today}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém os votos de um usuário
 * @param {number} userId - ID do usuário
 * @returns {Promise<Array>} Lista de votos do usuário
 */
export const getUserVotes = async (userId) => {
  try {
    const response = await api.get(`/votes/byuser/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cria um novo voto
 * @param {Object} vote - Dados do voto
 * @param {number} vote.userId - ID do usuário que está votando
 * @param {number} vote.restaurantId - ID do restaurante votado
 * @param {string} [vote.voteDate] - Data do voto (opcional, padrão: hoje)
 * @returns {Promise<Object>} O voto criado
 */
export const createVote = async (vote) => {
  try {
    const voteData = {
      userId: parseInt(vote.userId),
      restaurantId: parseInt(vote.restaurantId),
      voteDate: vote.voteDate || new Date().toISOString().split('T')[0]
    };
    
    const response = await api.post('/votes', voteData);
    return response.data;
  } catch (error) {
    
    let errorMessage = 'Erro ao registrar voto';
    if (error.response) {
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors.join(' ');
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Obtém o restaurante vencedor de hoje
 * @returns {Promise<Object>} O restaurante vencedor de hoje
 */
export const getTodaysWinner = async () => {
  try {
    const response = await api.get('/votes/todayswinner');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};
