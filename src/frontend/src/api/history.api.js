import apiClient from './client';

export const historyApi = {
  getScans: (filters) => apiClient.get('/farmer/history', { params: filters }),
};
