
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
  
  const components = data.list[0].components;
  
  // US EPA AQI Calculation
  const calculateAQI = (val: number, breakpoints: number[], aqiBreakpoints: number[]) => {
    for (let i = 0; i < breakpoints.length - 1; i++) {
      if (val >= breakpoints[i] && val <= breakpoints[i + 1]) {
        return ((aqiBreakpoints[i + 1] - aqiBreakpoints[i]) / (breakpoints[i + 1] - breakpoints[i])) * (val - breakpoints[i]) + aqiBreakpoints[i];
      }
    }
    return aqiBreakpoints[aqiBreakpoints.length - 1];
  };

  const aqiBP = [0, 50, 100, 150, 200, 300, 400, 500];
  
  // PM2.5 breakpoints
  const pm25BP = [0, 12, 35.4, 55.4, 150.4, 250.4, 350.4, 500.4];
  const aqiPM25 = calculateAQI(components.pm2_5, pm25BP, aqiBP);
  
  // PM10 breakpoints
  const pm10BP = [0, 54, 154, 254, 354, 424, 504, 604];
  const aqiPM10 = calculateAQI(components.pm10, pm10BP, aqiBP);
  
  // NO2 breakpoints (convert µg/m³ to ppb: 1 ppb = 1.88 µg/m³)
  const no2PPB = components.no2 / 1.88;
  const no2BP = [0, 53, 100, 360, 649, 1249, 1649, 2049];
  const aqiNO2 = calculateAQI(no2PPB, no2BP, aqiBP);
  
  // SO2 breakpoints (convert µg/m³ to ppb: 1 ppb = 2.62 µg/m³)
  const so2PPB = components.so2 / 2.62;
  const so2BP = [0, 35, 75, 185, 304, 604, 804, 1004];
  const aqiSO2 = calculateAQI(so2PPB, so2BP, aqiBP);
  
  // CO breakpoints (convert µg/m³ to ppm: 1 ppm = 1145 µg/m³)
  const coPPM = components.co / 1145;
  const coBP = [0, 4.4, 9.4, 12.4, 15.4, 30.4, 40.4, 50.4];
  const aqiCO = calculateAQI(coPPM, coBP, aqiBP);
  
  // O3 breakpoints (convert µg/m³ to ppb: 1 ppb = 1.96 µg/m³)
  const o3PPB = components.o3 / 1.96;
  const o3BP = [0, 54, 70, 85, 105, 200];
  const aqiO3 = calculateAQI(o3PPB, o3BP, [0, 50, 100, 150, 200, 300]);

  const us_epa_aqi = Math.round(Math.max(aqiPM25, aqiPM10, aqiNO2, aqiSO2, aqiCO, aqiO3));

  const formatted = {
    aqi: data.list[0].main.aqi,
    us_epa_aqi,
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
    { name: 'Delhi, India', lat: 28.61, lon: 77.20 },
    { name: 'Beijing, China', lat: 39.90, lon: 116.40 },
    { name: 'Lahore, Pakistan', lat: 31.52, lon: 74.35 },
    { name: 'Dhaka, Bangladesh', lat: 23.81, lon: 90.41 },
    { name: 'Baghdad, Iraq', lat: 33.31, lon: 44.36 },
    { name: 'Cairo, Egypt', lat: 30.04, lon: 31.23 },
    { name: 'Mumbai, India', lat: 19.07, lon: 72.87 },
    { name: 'Karachi, Pakistan', lat: 24.86, lon: 67.00 },
    { name: 'Jakarta, Indonesia', lat: -6.20, lon: 106.84 }
  ];

  // Fetch all hotspot data in parallel to save time
  const results = await Promise.all(cities.map(async (c) => {
    try {
      const data = await fetchAQI(c.lat, c.lon);
      return { name: c.name, aqi: data.us_epa_aqi };
    } catch (e) {
      return null;
    }
  }));

  const validResults = results.filter((r): r is { name: string; aqi: number } => r !== null);
  if (validResults.length === 0) return { name: "N/A", aqi: 0 };

  return validResults.reduce((max, curr) => curr.aqi > max.aqi ? curr : max, validResults[0]);
};
