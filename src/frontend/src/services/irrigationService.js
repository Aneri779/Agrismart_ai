import apiClient from '../api/client';

export const irrigationService = {
  getRecommendation: async (weather, soilMoisture, crop = 'Crop') => {
    if (!weather) {
      return {
        title: 'Weather data unavailable',
        durationHours: null,
        waterAmountLiters: null,
        reason: 'A live weather reading is required before this heuristic can make a recommendation.',
        context: { soilMoisture, temperature: null, rainProbability: null, crop },
      };
    }

    try {
      const response = await apiClient.get('/farmer/irrigation/recommendation', {
        params: {
          location: weather.location,
          soil_moisture: soilMoisture,
          crop: crop
        }
      });
      return response;
    } catch (err) {
      console.error('Failed to get irrigation recommendation from backend', err);
      return {
        title: 'Recommendation Error',
        durationHours: null,
        waterAmountLiters: null,
        reason: 'Failed to fetch recommendation from the server.',
        context: { soilMoisture, temperature: weather.temperature, rainProbability: weather.rainProbability, crop },
      };
    }
  },
};
