import apiClient from './client';

export const homeSummaryApi = {
  getFarmerDashboard: () => apiClient.get('/farmer/dashboard'),
};
