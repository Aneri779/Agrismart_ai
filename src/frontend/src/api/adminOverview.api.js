import apiClient from './client';

export const adminOverviewApi = {
  getOverview: () => apiClient.get('/admin/overview'),
};
