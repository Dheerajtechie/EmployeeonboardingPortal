import api from './api';

export const getMyTrainings = async () => {
  const response = await api.get('/trainings/my');
  return response.data;
};

export const completeTraining = async (trainingId) => {
  const response = await api.put(`/trainings/${trainingId}/complete`);
  return response.data;
};
