import apiClient from './client';

export const sustainabilityApi = {
  getScore: () => apiClient.get('/farmer/sustainability'),
  updateParameters: (data) => apiClient.post('/farmer/sustainability/update', data),
};
