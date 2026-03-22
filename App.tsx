
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Background from './components/Background';
import MapDisplay from './components/MapDisplay';
import LoginModal from './components/Auth';
import IntroAnimation from './components/IntroAnimation';
import { 
  fetchWeatherByCity, 
  fetchWeatherByCoords, 
  fetchForecast, 
  fetchAQI, 
  fetchUVIndex,
  getHotspotData 
} from './services/weatherService';
import { getWeatherInsight, WeatherInsightResult } from './services/geminiService';
import { 
  WeatherData, 
  ForecastData, 
  AQIData, 
  User, 
  ViewMode 
} from './types';

const App: React.FC = () => {
  // UI State
  const [showIntro, setShowIntro] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('auto');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // Data State
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [aqi, setAqi] = useState<AQIData | null>(null);
  const [uv, setUv] = useState<number | null>(null);
  const [hotspot, setHotspot] = useState<{ name: string; aqi: number } | undefined>();
  const [aiInsight, setAiInsight] = useState<WeatherInsightResult>({ text: '', links: [] });
  const [loading, setLoading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('rx_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  // Time state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSunTime = (timestamp: number, timezoneOffset: number) => {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    return date.getUTCHours().toString().padStart(2, '0') + ":" + 
           date.getUTCMinutes().toString().padStart(2, '0');
  };

  const getUVStatus = (val: number) => {
    if (val <= 2) return { label: "Low", color: "text-green-400" };
    if (val <= 5) return { label: "Mod", color: "text-yellow-400" };
    if (val <= 7) return { label: "High", color: "text-orange-400" };
    if (val <= 10) return { label: "Very High", color: "text-red-400" };
    return { label: "Extreme", color: "text-purple-500" };
  };

  const getAQIStatus = (val: number) => {
    if (val <= 50) return { label: "Pristine", color: "text-green-400", bg: "bg-green-500/10" };
    if (val <= 100) return { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10" };
    if (val <= 150) return { label: "Sensitive", color: "text-orange-400", bg: "bg-orange-500/10" };
    if (val <= 200) return { label: "Unhealthy", color: "text-red-400", bg: "bg-red-500/10" };
    if (val <= 300) return { label: "Critical", color: "text-purple-400", bg: "bg-purple-500/10" };
    return { label: "Hazardous", color: "text-rose-600", bg: "bg-rose-600/10" };
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setShowHistory(false);
    setAiInsight({ text: '', links: [] });
    
    try {
      const weatherData = await fetchWeatherByCity(query);
      setWeather(weatherData);
      setLoading(false);

      setSecondaryLoading(true);
      const lat = weatherData.coord.lat;
      const lon = weatherData.coord.lon;

      const [fData, aData, uValue] = await Promise.all([
        fetchForecast(lat, lon).catch(() => null),
        fetchAQI(lat, lon).catch(() => null),
        fetchUVIndex(lat, lon).catch(() => null)
      ]);

      setForecast(fData as ForecastData);
      setAqi(aData as AQIData);
      setUv(uValue as number);
      setSecondaryLoading(false);

      if (aData) {
        const currentAqi = (aData as AQIData).us_epa_aqi;
        setHotspot(prev => {
          if (!prev || currentAqi > prev.aqi) {
            return { name: weatherData.name, aqi: currentAqi };
          }
          return prev;
        });
        getWeatherInsight(weatherData, aData as AQIData, (uValue as number) || 0, lat, lon)
          .then(setAiInsight)
          .catch(console.error);
      }

      if (user) {
        setHistory(prev => {
          const updated = [weatherData.name, ...prev.filter(i => i !== weatherData.name)].slice(0, 5);
          localStorage.setItem('rx_history', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather data");
      setLoading(false);
    }
  }, [user]);

  const handleLocationSearch = useCallback(() => {
    if (!navigator.geolocation) return alert("Geolocation not supported by your browser");
    
    setLoading(true);
    setError(null);
    setAiInsight({ text: '', links: [] });
    
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const weatherData = await fetchWeatherByCoords(latitude, longitude);
        setWeather(weatherData);
        setLoading(false);

        setSecondaryLoading(true);
        const [fData, aData, uValue] = await Promise.all([
          fetchForecast(latitude, longitude).catch(() => null),
          fetchAQI(latitude, longitude).catch(() => null),
          fetchUVIndex(latitude, longitude).catch(() => null)
        ]);

        setForecast(fData as ForecastData);
        setAqi(aData as AQIData);
        setUv(uValue as number);
        setSecondaryLoading(false);

        if (aData) {
          const currentAqi = (aData as AQIData).us_epa_aqi;
          setHotspot(prev => {
            if (!prev || currentAqi > prev.aqi) {
              return { name: weatherData.name, aqi: currentAqi };
            }
            return prev;
          });
          getWeatherInsight(weatherData, aData as AQIData, (uValue as number) || 0, latitude, longitude)
            .then(setAiInsight)
            .catch(console.error);
        }
      } catch (err: any) {
        setError(err.message || "Precision sync failed. Try manual search.");
        setLoading(false);
      }
    }, (err) => {
      setLoading(false);
      let msg = "Location access denied.";
      if (err.code === 1) msg = "Location access denied. Please enable GPS.";
      else if (err.code === 2) msg = "Position unavailable. Check your connection.";
      else if (err.code === 3) msg = "Location request timed out. Try again.";
      setError(msg);
    }, options);
  }, []);

  useEffect(() => {
    getHotspotData().then(setHotspot);
  }, []);

  const toggleView = () => {
    const modes: ViewMode[] = ['auto', 'mobile', 'pc'];
    const next = modes[(modes.indexOf(viewMode) + 1) % 3];
    setViewMode(next);
  };

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('rx_user', JSON.stringify(newUser));
  };

  return (
    <div className={`min-h-screen py-6 sm:py-10 px-4 flex flex-col items-center justify-start transition-all duration-500 ${viewMode === 'mobile' ? 'max-w-md mx-auto' : 'w-full'}`}>
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      </AnimatePresence>
      
      <Background />

      {!showIntro && (
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center"
        >
          {/* Top Navigation Bar */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1 }
            }}
            className="w-full max-w-2xl flex items-center justify-between mb-4 z-50"
          >
        <div className="flex gap-2">
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 sm:w-11 sm:h-11 glass rounded-2xl flex items-center justify-center hover:bg-orange-600 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-ellipsis-v'} text-xs sm:text-sm transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 glass rounded-2xl p-2 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl border border-white/10">
                <button 
                  onClick={() => { setIsContactOpen(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs font-bold transition-all"
                >
                  <i className="fas fa-envelope text-orange-500" /> Contact Us
                </button>
                {user && (
                   <button 
                   onClick={() => { setUser(null); localStorage.removeItem('rx_user'); setIsMenuOpen(false); }}
                   className="w-full text-left px-4 py-2 rounded-xl hover:bg-red-500/20 text-red-400 flex items-center gap-3 text-xs font-bold transition-all"
                 >
                   <i className="fas fa-sign-out-alt" /> Logout
                 </button>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => user ? null : setIsLoginOpen(true)}
            className={`px-3 sm:px-5 h-10 sm:h-11 glass rounded-2xl flex items-center gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 shadow-xl ${user ? 'border-green-500/50 text-green-400' : 'hover:scale-105 active:scale-95 hover:bg-white/10'}`}
          >
            <i className={`fas ${user ? 'fa-user-check' : 'fa-user'} ${user ? 'animate-bounce' : ''}`} />
            {user ? user.nickname : 'Login'}
          </button>
        </div>

        <button 
          onClick={toggleView}
          className="h-10 sm:h-11 px-3 sm:px-5 glass rounded-2xl flex items-center gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:bg-white/10"
        >
          <i className="fas fa-magic text-cyan-400" />
          <span className="hidden sm:inline">{viewMode}</span>
        </button>
      </motion.div>

      {/* Main Glass Card */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        }}
        className={`glass w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden ${viewMode === 'pc' ? 'scale-110 mt-8' : ''}`}
      >
        <div className="bg-black/20 p-4 sm:p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-black tracking-widest uppercase">
            <i className="fas fa-cloud-sun text-orange-500 animate-pulse" /> RX WEATHER
          </div>
          <div className="text-right">
            <div className="text-[8px] sm:text-[10px] font-bold opacity-60 uppercase tracking-widest">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm sm:text-xl font-bold font-mono">
              {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-8 pb-2 sm:pb-4 relative">
          <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-full focus-within:bg-black/40 focus-within:border-orange-500/50 transition-all duration-500 shadow-inner">
            <input 
              type="text" 
              placeholder="Search location..." 
              className="bg-transparent flex-1 px-3 sm:px-6 outline-none text-sm sm:text-lg placeholder:opacity-40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            />
            <button 
              onClick={() => weather && handleSearch(weather.name)} 
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full hover:bg-blue-500/20 hover:text-blue-400 flex items-center justify-center transition-all duration-300 active:scale-90 ${loading ? 'pointer-events-none opacity-40' : ''}`}
              title="Refresh"
              disabled={loading || !weather}
            >
              <i className={`fas fa-sync-alt text-xs sm:text-base ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLocationSearch} 
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full hover:bg-green-500/20 hover:text-green-400 flex items-center justify-center transition-all duration-300 active:scale-90"
              title="Location"
            >
              <i className="fas fa-location-arrow text-xs sm:text-base" />
            </button>
            <button 
              onClick={() => handleSearch(searchQuery)} 
              className="w-9 h-9 sm:w-11 sm:h-11 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-500 hover:rotate-90 hover:scale-110 active:scale-90 transition-all duration-500 shadow-lg shadow-orange-500/20"
            >
              <i className="fas fa-search text-xs sm:text-base" />
            </button>
          </div>

          {showHistory && user && history.length > 0 && (
            <div className="absolute top-16 sm:top-24 left-6 right-6 sm:left-10 sm:right-10 glass rounded-2xl p-1 sm:p-2 z-40 border-white/20 animate-in fade-in slide-in-from-top-1 shadow-2xl">
              {history.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => { setSearchQuery(h); handleSearch(h); }}
                  className="w-full text-left px-3 py-2 sm:py-3 rounded-xl hover:bg-white/10 flex items-center justify-between group transition-all duration-200 hover:translate-x-1"
                >
                  <span className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium"><i className="fas fa-history opacity-30 text-[10px]" /> {h}</span>
                  <i className="fas fa-arrow-right text-[10px] opacity-0 group-hover:opacity-30 transition-all duration-300 group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weather Display */}
        <div className="px-4 sm:px-8 pb-4 sm:pb-8">
          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 p-3 sm:p-4 rounded-xl mb-4 animate-in shake-in">
              <span className="font-bold uppercase text-[8px] sm:text-[10px] block mb-1 text-red-400 tracking-widest">Error detected</span>
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          {weather && !loading ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Primary Mobile Header */}
              <div className="flex flex-col items-center justify-center py-6 sm:hidden border-b border-white/5 mb-6">
                 <div className="relative group mb-2">
                    <img 
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                      className="w-32 h-32 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-[float_4s_ease-in-out_infinite]" 
                      alt="icon" 
                    />
                 </div>
                 <div className="text-6xl font-black tracking-tighter mb-2">
                   {Math.round(weather.main.temp)}<span className="text-2xl font-light align-top mt-2 inline-block">°C</span>
                 </div>
                 <div className="text-xl font-black flex items-center gap-2 tracking-tight">
                    <i className="fas fa-map-marker-alt text-orange-500" />
                    {weather.name}
                 </div>
                 <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">
                   {weather.weather[0].description} • Feels like {Math.round(weather.main.feels_like)}°
                 </div>
              </div>

              {/* Desktop/Tablet Header */}
              <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center border-b border-white/10 pb-4 sm:pb-8">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl animate-[float_4s_ease-in-out_infinite]" alt="icon" />
                    <div>
                      <div className="text-5xl sm:text-7xl font-bold tracking-tighter">{Math.round(weather.main.temp)}<span className="text-2xl sm:text-3xl font-light align-top mt-1 sm:mt-2 inline-block">°C</span></div>
                      <div className="text-[10px] sm:text-sm font-medium opacity-60 uppercase tracking-widest">Feels like {Math.round(weather.main.feels_like)}°</div>
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black mt-2 sm:mt-4 flex items-center gap-2 group cursor-default tracking-tight">
                    <i className="fas fa-map-marker-alt text-orange-500 transition-transform group-hover:scale-125" />
                    {weather.name}, {weather.sys.country}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 sm:space-y-3">
                  {[
                    { label: "Today's Low", val: `${Math.round(weather.main.temp_min)}°C`, icon: 'fa-temperature-low' },
                    { label: "Wind Speed", val: `${Math.round(weather.wind.speed * 3.6)} km/h`, icon: 'fa-wind' },
                    { label: "Humidity", val: `${weather.main.humidity}%`, icon: 'fa-tint' },
                    { 
                      label: "Rain Chance", 
                      val: forecast ? (
                        <span className="flex items-center gap-1 sm:gap-2 text-cyan-400">
                          <i className="fas fa-cloud-showers-heavy text-[8px]"></i>
                          {Math.round((forecast.list[0].pop || 0) * 100)}%
                        </span>
                      ) : (secondaryLoading ? <i className="fas fa-circle-notch animate-spin opacity-20" /> : '0%') 
                    },
                    { label: "UV Index", val: uv !== null ? (
                      <span className="flex items-center gap-1 sm:gap-2">
                        {Math.round(uv)} 
                        <span className={`text-[7px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 ${getUVStatus(uv).color} animate-pulse`}>
                          {getUVStatus(uv).label}
                        </span>
                      </span>
                    ) : (secondaryLoading ? <i className="fas fa-circle-notch animate-spin opacity-20" /> : '--') },
                    { 
                      label: "Sunrise", 
                      val: (
                        <span className="flex items-center gap-1.5">
                          <i className="fas fa-sun text-yellow-400 animate-pulse text-[10px]"></i>
                          <span>{formatSunTime(weather.sys.sunrise, weather.timezone)}</span>
                        </span>
                      ) 
                    },
                    { 
                      label: "Sunset", 
                      val: (
                        <span className="flex items-center gap-1.5">
                          <i className="fas fa-cloud-moon text-orange-400 animate-pulse text-[10px]"></i>
                          <span>{formatSunTime(weather.sys.sunset, weather.timezone)}</span>
                        </span>
                      ) 
                    },
                    { 
                      label: "AQI Status", 
                      val: aqi ? (
                        <span className={`flex items-center gap-2 ${getAQIStatus(aqi.us_epa_aqi).color}`}>
                          {aqi.us_epa_aqi} ({getAQIStatus(aqi.us_epa_aqi).label})
                          <span className="text-[10px] opacity-40">PM2.5: {Math.round(aqi.components.pm2_5)}</span>
                        </span>
                      ) : (secondaryLoading ? <i className="fas fa-circle-notch animate-spin opacity-20" /> : '--')
                    },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 -mx-2 rounded-lg">
                      <span className="text-[9px] sm:text-xs opacity-50 font-black uppercase tracking-widest">{d.label}</span>
                      <div className="font-bold flex items-center text-[10px] sm:text-xs">{d.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Bento Metrics Grid */}
              <div className="sm:hidden grid grid-cols-2 gap-3 mb-6">
                {[
                    { label: "Wind", val: `${Math.round(weather.wind.speed * 3.6)} km/h`, icon: 'fa-wind', color: 'text-blue-400' },
                    { label: "Humidity", val: `${weather.main.humidity}%`, icon: 'fa-droplet', color: 'text-cyan-400' },
                    { 
                      label: "Rain", 
                      val: forecast ? `${Math.round((forecast.list[0].pop || 0) * 100)}%` : '0%', 
                      icon: 'fa-cloud-rain', 
                      color: 'text-blue-500' 
                    },
                    { label: "UV Index", val: uv !== null ? Math.round(uv) : '--', icon: 'fa-sun', color: uv !== null ? getUVStatus(uv).color : 'text-yellow-400' },
                    { label: "Temp Low", val: `${Math.round(weather.main.temp_min)}°C`, icon: 'fa-temperature-low', color: 'text-teal-400' },
                    { 
                      label: "Sunrise", 
                      val: formatSunTime(weather.sys.sunrise, weather.timezone), 
                      icon: 'fa-arrow-up', 
                      color: 'text-orange-400' 
                    },
                    { 
                      label: "Sunset", 
                      val: formatSunTime(weather.sys.sunset, weather.timezone), 
                      icon: 'fa-arrow-down', 
                      color: 'text-indigo-400' 
                    },
                    { 
                      label: "AQI (PM2.5)", 
                      val: aqi ? `${aqi.us_epa_aqi} (${Math.round(aqi.components.pm2_5)}µg)` : '--', 
                      icon: 'fa-mask-face', 
                      color: aqi ? getAQIStatus(aqi.us_epa_aqi).color : 'text-slate-400' 
                    },
                ].map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-[24px] flex flex-col gap-2 group hover:bg-white/10 transition-all active:scale-95">
                    <div className="flex items-center justify-between">
                       <i className={`fas ${m.icon} ${m.color} text-xs`} />
                       <span className="text-[8px] font-black uppercase opacity-30 tracking-widest">{m.label}</span>
                    </div>
                    <div className="text-sm font-black text-white/90">{m.val}</div>
                  </div>
                ))}
              </div>

              {/* Refined Atmospheric Analysis Section */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 }
                }}
                className="mt-2 sm:mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-black/20 shadow-2xl"
              >
                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-5 py-3.5 flex justify-between items-center border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                      <i className="fas fa-feather text-blue-400 text-xs" />
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Atmospheric Analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {aqi && (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 ${getAQIStatus(aqi.us_epa_aqi).bg}`}>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${getAQIStatus(aqi.us_epa_aqi).color}`}>
                          AQI {aqi.us_epa_aqi} • {getAQIStatus(aqi.us_epa_aqi).label}
                        </span>
                        <div className="w-px h-2 bg-white/10" />
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                          PM2.5: {Math.round(aqi.components.pm2_5)}µg
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest hidden sm:inline">Grounded Insight</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  {aiInsight.text ? (
                    <div className="animate-in fade-in duration-700">
                      <div className="text-[11px] sm:text-[13px] font-medium text-white/90 leading-relaxed italic border-l-2 border-blue-500/30 pl-4 py-1">
                        {aiInsight.text}
                      </div>

                      {aiInsight.links.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {aiInsight.links.slice(0, 2).map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="group flex items-center gap-2 bg-white/5 hover:bg-blue-600/20 px-3 py-1.5 rounded-xl border border-white/10 transition-all duration-300"
                            >
                              <i className="fas fa-location-arrow text-[8px] text-blue-400" />
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">{link.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {aiInsight.text.includes('temporarily unavailable') && (
                        <button 
                          onClick={() => {
                            if (weather && aqi) {
                              setAiInsight({ text: '', links: [] });
                              getWeatherInsight(weather, aqi, uv || 0, weather.coord.lat, weather.coord.lon)
                                .then(setAiInsight)
                                .catch(console.error);
                            }
                          }}
                          className="mt-4 text-[8px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-2"
                        >
                          <i className="fas fa-redo-alt" /> Retry Analysis
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center gap-4">
                       <div className="relative">
                         <div className="w-10 h-10 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                         <div className="absolute inset-0 flex items-center justify-center">
                           <i className="fas fa-sparkles text-blue-400 text-[10px] animate-pulse" />
                         </div>
                       </div>
                       <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Analyzing Skies...</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Hourly Forecast Horizontal Scroll */}
              {forecast && (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  className="mt-8"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Hourly Forecast</span>
                    <span className="text-[8px] font-black uppercase text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">Next 24h</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                    {forecast.list.slice(0, 8).map((item, idx) => (
                      <motion.div 
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, scale: 0.5 },
                          visible: { opacity: 1, scale: 1 }
                        }}
                        whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.1)', transition: { duration: 0.2 } }}
                        className="flex-shrink-0 w-28 glass rounded-[24px] p-4 flex flex-col items-center gap-2 snap-center border border-white/5"
                      >
                        <span className="text-[9px] font-black opacity-40 uppercase">
                          {new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                        </span>
                        <img 
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} 
                          alt="icon" 
                          className="w-12 h-12 drop-shadow-lg" 
                        />
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black">{Math.round(item.main.temp)}°</span>
                          <div className="flex items-center gap-1 text-[8px] font-bold text-cyan-400">
                            <i className="fas fa-droplet text-[7px]" />
                            {Math.round(item.pop * 100)}%
                          </div>
                        </div>
                        <div className="flex justify-between w-full mt-1 px-1 border-t border-white/5 pt-2">
                          <div className="flex flex-col items-center">
                            <i className="fas fa-wind text-[7px] opacity-40 mb-0.5" />
                            <span className="text-[7px] font-bold opacity-60">{Math.round(item.wind.speed * 3.6)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <i className="fas fa-tint text-[7px] opacity-40 mb-0.5" />
                            <span className="text-[7px] font-bold opacity-60">{item.main.humidity}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Daily Forecast List */}
              {forecast && (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  className="mt-6"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">5-Day Outlook</span>
                    <i className="fas fa-calendar-alt text-[10px] text-white/20" />
                  </div>
                  <div className="space-y-3">
                    {forecast.list.filter((_, i) => i % 8 === 0).map((item, idx) => (
                      <motion.div 
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8 },
                          visible: { opacity: 1, scale: 1 }
                        }}
                        whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)', transition: { duration: 0.2 } }}
                        className="glass rounded-[24px] p-4 flex items-center justify-between border border-white/5"
                      >
                        <div className="flex items-center gap-3 w-28">
                          <span className="text-[10px] font-black uppercase opacity-40 w-8">
                            {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <img 
                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} 
                            alt="icon" 
                            className="w-10 h-10" 
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-black">{Math.round(item.main.temp)}°</span>
                            <div className="flex items-center gap-1 text-[8px] font-bold text-cyan-400">
                              <i className="fas fa-droplet text-[7px]" />
                              {Math.round(item.pop * 100)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 px-4 flex justify-around items-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <i className="fas fa-wind text-[9px] opacity-30" />
                            <span className="text-[9px] font-bold opacity-60">{Math.round(item.wind.speed * 3.6)}<span className="text-[7px] ml-0.5">km/h</span></span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <i className="fas fa-tint text-[9px] opacity-30" />
                            <span className="text-[9px] font-bold opacity-60">{item.main.humidity}%</span>
                          </div>
                          <div className="hidden sm:flex flex-col items-center">
                            <span className="text-[9px] font-bold capitalize opacity-60 truncate max-w-[80px]">{item.weather[0].description}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-24 justify-end">
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.main.temp / 40) * 100}%` }}
                              transition={{ delay: 0.5 + idx * 0.1, duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-orange-600 to-orange-400" 
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Map Display */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
                className="h-60 sm:h-80"
              >
                <MapDisplay lat={weather.coord.lat} lon={weather.coord.lon} cityName={weather.name} />
              </motion.div>
            </div>
          ) : loading ? (
            <div className="py-16 sm:py-24 flex flex-col items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-satellite-dish text-orange-500 animate-pulse text-[10px] sm:text-xs" />
                </div>
              </div>
              <p className="opacity-50 text-[9px] sm:text-xs font-black uppercase tracking-[0.3em] animate-pulse">Establishing precise sync...</p>
            </div>
          ) : (
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              className="py-16 sm:py-24 flex flex-col items-center text-center gap-8"
            >
               <div className="relative">
                 <div className="w-24 h-24 sm:w-32 sm:h-32 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                   <i className="fas fa-compass text-4xl sm:text-5xl text-orange-500 animate-[spin_10s_linear_infinite]" />
                 </div>
                 <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                   <i className="fas fa-search text-white text-xs" />
                 </div>
               </div>
               <div className="space-y-3">
                 <h3 className="text-2xl sm:text-3xl font-black tracking-tighter">Ready for Sync?</h3>
                 <p className="text-xs sm:text-sm opacity-50 max-w-[280px] mx-auto font-medium leading-relaxed">
                   Search for any city or use your GPS for a hyper-local atmospheric analysis.
                 </p>
               </div>
               <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                 <button 
                  onClick={handleLocationSearch}
                  className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                 >
                   <i className="fas fa-location-arrow" /> Use GPS
                 </button>
                 <button 
                  onClick={() => document.querySelector('input')?.focus()}
                  className="flex-1 glass py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all border border-white/10"
                 >
                   Manual Search
                 </button>
               </div>
            </motion.div>
          )}
        </div>

        <div className="bg-black/30 p-6 sm:p-8 text-center space-y-1 sm:space-y-2 border-t border-white/5">
          <div className="text-[10px] sm:text-sm opacity-80 font-medium">Powered by <span className="font-black text-orange-500 hover:text-orange-400 cursor-help transition-colors">RX ENTERTAINMENT</span></div>
          <div className="text-[8px] sm:text-[10px] opacity-30 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold">&copy; 2026 RX Weather. Engineered by Aman.</div>
        </div>
      </motion.div>

      <a 
        href="https://www.instagram.com/aman_devv/" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 w-11 h-11 sm:w-14 sm:h-14 glass rounded-full flex items-center justify-center text-xl sm:text-2xl group transition-all duration-500 hover:scale-125 hover:rotate-6 active:scale-90 shadow-2xl z-[100]"
      >
        <i className="fab fa-instagram bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent" />
      </a>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin} 
      />
      
      {isContactOpen && (
        <div className="fixed inset-0 z-[200] flex animate-in slide-in-from-left duration-700">
          <div className="w-64 sm:w-80 h-full bg-gradient-to-br from-indigo-900 to-purple-950 p-8 sm:p-12 flex flex-col justify-center relative shadow-[50px_0_100px_rgba(0,0,0,0.5)] border-r border-white/10">
            <button 
              onClick={() => setIsContactOpen(false)} 
              className="absolute top-6 sm:top-8 right-6 sm:right-8 text-2xl sm:text-3xl opacity-40 hover:opacity-100 transition-all duration-300"
            >
              &times;
            </button>
            <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tighter text-white">Get In Touch</h2>
            <p className="text-[10px] sm:text-xs opacity-50 mb-8 font-bold uppercase tracking-widest">Support & Inquiries</p>
            <div className="space-y-3">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 font-mono text-[10px] sm:text-xs break-all text-white">
                sdfre3511@gmail.com
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText("sdfre3511@gmail.com"); alert("Email copied!"); }}
                className="w-full bg-white text-indigo-950 py-3 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Copy Email
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-md" onClick={() => setIsContactOpen(false)} />
        </div>
      )}

        </motion.div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
