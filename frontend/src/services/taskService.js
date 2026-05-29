import api from './api';

export const getMyTasks = async () => {
  const response = await api.get('/tasks/my');
  return response.data;
};

export const completeTask = async (taskId) => {
  const response = await api.put(`/tasks/${taskId}/complete`);
  return response.data;
};
