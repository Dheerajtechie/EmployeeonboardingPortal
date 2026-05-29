import api from './api';

export const getMyAssets = async () => {
  const response = await api.get('/assets/my');
  return response.data;
};

export const confirmAsset = async (assignmentId) => {
  const response = await api.put(`/assets/${assignmentId}/confirm`);
  return response.data;
};

export const assignAsset = async (assetId, userId) => {
  const response = await api.post('/admin/assets/assign', { asset_id: assetId, user_id: userId });
  return response.data;
};
