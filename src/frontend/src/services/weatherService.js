import { weatherApi } from '../api/weather.api';

export const weatherService = {
  // The backend geocodes the supplied farm location and returns Open-Meteo data.
  // Errors are deliberately propagated so callers can display an unavailable state
  // instead of silently showing invented conditions.
  getCurrentWeather: (location) => weatherApi.getWeather(location),

  getForecast: async (location) => {
    const weather = await weatherApi.getWeather(location);
    return weather.forecast;
  },
};
