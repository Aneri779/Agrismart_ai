import apiClient from './client';

export const detectApi = {
  analyzeScan: (formData) => apiClient.post('/farmer/scan', formData),
  getScan: (scanId) => apiClient.get(`/farmer/scan/${scanId}`),
};
