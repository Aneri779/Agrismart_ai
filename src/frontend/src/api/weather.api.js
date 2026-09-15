import apiClient from './client';

export const weatherApi = {
  getWeather: (location = 'Ahmedabad') => apiClient.get(`/farmer/weather?location=${encodeURIComponent(location)}`),
};
