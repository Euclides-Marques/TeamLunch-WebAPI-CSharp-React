import api from '../config/api';

export const getWeeklyWinners = async () => {
  try {
    const response = await api.get('/weeklywinners');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const apiWith404 = api.create();
apiWith404.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 404) {
      return { status: 404, data: null };
    }
    return Promise.reject(error);
  }
);

export const getCurrentWeekWinner = async () => {
  try {
    const response = await apiWith404.get('/weeklywinners/current');
    
    if (response.status === 404) {
      return null;
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createWeeklyWinner = async (winner) => {
  try {
    const response = await api.post('/weeklywinners', winner);
    return response.data;
  } catch (error) {
    throw error;
  }
};
