import axios from 'axios';

export const WEATHER_CONFIG = {
  BASE_URL: 'https://api.weatherapi.com/v1',
  API_KEY: process.env.EXPO_PUBLIC_WEATHER_API_KEY,
};

const forecastEndpoint = (params: { cityName: any; days: any }) =>
  `${WEATHER_CONFIG.BASE_URL}/forecast.json?key=${WEATHER_CONFIG.API_KEY}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;

const locationEndpoint = (params: { cityName: any }) =>
  `${WEATHER_CONFIG.BASE_URL}/search.json?key=${WEATHER_CONFIG.API_KEY}&q=${params.cityName}`;

const apiCall = async (endpoint: string) => {
  const options = {
    method: 'GET',
    url: endpoint,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const fetchWeatherForecast = async (params: {
  cityName: any;
  days: any;
}) => {
  const forecastUrl = forecastEndpoint(params);
  return await apiCall(forecastUrl);
};

export const fetchLocationWeather = async (params: { cityName: any }) => {
  const locationUrl = locationEndpoint(params);
  return await apiCall(locationUrl);
};
