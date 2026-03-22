
export interface WeatherData {
  name: string;
  coord: { lat: number; lon: number };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: { speed: number; gust?: number };
  weather: Array<{ description: string; icon: string; main: string }>;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface ForecastItem {
  dt: number;
  main: { temp: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number };
  pop: number;
}

export interface ForecastData {
  list: ForecastItem[];
}

export interface AQIData {
  aqi: number;
  us_epa_aqi: number;
  components: {
    co: number;
    pm2_5: number;
    pm10: number;
    no2: number;
    o3: number;
    so2: number;
  };
}

export interface User {
  nickname: string;
  email: string;
}

export type ViewMode = 'auto' | 'mobile' | 'pc';

export interface UVData {
  value: number;
}
