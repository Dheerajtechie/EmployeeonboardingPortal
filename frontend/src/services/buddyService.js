import api from './api';

export const getMyBuddy = async () => {
  const response = await api.get('/buddy/my');
  return response.data;
};

export const getCheckins = async (userId) => {
  const response = await api.get(`/buddy/checkins/${userId}`);
  return response.data;
};

export const addCheckin = async (data) => {
  const response = await api.post('/buddy/checkin', data);
  return response.data;
};
