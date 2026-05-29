import api from './api';

export const getMyDocuments = async () => {
  const response = await api.get('/documents/my');
  return response.data;
};

export const uploadDocument = async (docType, file) => {
  const formData = new FormData();
  formData.append('doc_type', docType);
  formData.append('file', file);
  
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const verifyDocument = async (docId) => {
  const response = await api.put(`/documents/${docId}/verify`);
  return response.data;
};

export const rejectDocument = async (docId, reason) => {
  const response = await api.put(`/documents/${docId}/reject`, { reason });
  return response.data;
};
