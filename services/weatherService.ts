
import { 
  WeatherData, 
  ForecastData, 
  AQIData 
} from '../types';
import { 
  OPENWEATHER_API_KEY, 
  BASE_URL_OWM 
} from '../constants';

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  const cacheKey = `weather_city_${city.toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL_OWM}weather?units=metric&q=${city}&appid=${OPENWEATHER_API_KEY}`);
  if (!response.ok) throw new Error("City not found");
  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};

export const fetchWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData> => {
  const cacheKey = `weather_coords_${lat}_${lon}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL_OWM}weather?units=metric&lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`);
  if (!response.ok) throw new Error("Location not found");
  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};

export const fetchForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  const cacheKey = `forecast_${lat}_${lon}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL_OWM}forecast?units=metric&lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`);
  if (!response.ok) throw new Error("Forecast data unavailable");
  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};

export const fetchAQI = async (lat: number, lon: number): Promise<AQIData> => {
  const cacheKey = `aqi_${lat}_${lon}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL_OWM}air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`);
  if (!response.ok) throw new Error("AQI data unavailable");
  const data = await response.json();
  const formatted = {
    aqi: data.list[0].main.aqi,
    components: data.list[0].components
  };
  setCachedData(cacheKey, formatted);
  return formatted;
};

export const fetchUVIndex = async (lat: number, lon: number): Promise<number> => {
  const cacheKey = `uv_${lat}_${lon}`;
  const cached = getCachedData(cacheKey);
  if (cached !== null) return cached;

  const response = await fetch(`${BASE_URL_OWM}uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`);
  if (!response.ok) throw new Error("UV data unavailable");
  const data = await response.json();
  setCachedData(cacheKey, data.value);
  return data.value;
};

export const getHotspotData = async (): Promise<{ name: string; aqi: number }> => {
  const cities = [
    { name: 'Delhi', lat: 28.61, lon: 77.20 },
    { name: 'Beijing', lat: 39.90, lon: 116.40 },
    { name: 'Lahore', lat: 31.52, lon: 74.35 }
  ];

  // Fetch all hotspot data in parallel to save time
  const results = await Promise.all(cities.map(async (c) => {
    try {
      const data = await fetchAQI(c.lat, c.lon);
      return { name: c.name, aqi: data.aqi };
    } catch (e) {
      return null;
    }
  }));

  const validResults = results.filter((r): r is { name: string; aqi: number } => r !== null);
  if (validResults.length === 0) return { name: "N/A", aqi: 0 };

  return validResults.reduce((max, curr) => curr.aqi > max.aqi ? curr : max, validResults[0]);
};
