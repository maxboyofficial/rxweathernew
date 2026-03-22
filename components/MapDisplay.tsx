
import React, { useEffect, useRef, useState } from 'react';
import { OPENWEATHER_API_KEY } from '../constants';

interface MapDisplayProps {
  lat: number;
  lon: number;
  cityName: string;
}

type MapLayer = 'satellite' | 'streets' | 'terrain';

interface RadarFrame {
  time: number;
  path: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ lat, lon, cityName }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const layersRef = useRef<Record<string, any>>({});
  
  // Radar Animation State
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);
  const [isStaticRadar, setIsStaticRadar] = useState(false);
  const radarLayersRef = useRef<any[]>([]);
  const staticRadarLayerRef = useRef<any>(null);
  const animationIntervalRef = useRef<number | null>(null);

  const layerConfigs = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
    },
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    },
    terrain: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri, HERE, Garmin, Intermap'
    }
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      // @ts-ignore
      mapRef.current = L.map(containerRef.current, { 
        zoomControl: false,
        attributionControl: false 
      }).setView([lat, lon], 10);
      
      updateBaseLayer('satellite');
      fetchRadarFrames();
    } else {
      mapRef.current.flyTo([lat, lon], 10);
    }

    return () => {
      if (animationIntervalRef.current) window.clearInterval(animationIntervalRef.current);
    };
  }, [lat, lon]);

  // 2. Fetch Radar Timestamps from RainViewer (Standard for Animation)
  const fetchRadarFrames = async (retries = 3) => {
    const urls = [
      'https://api.rainviewer.com/public/weather-maps.json',
      'https://api.rainviewer.com/public/maps.json',
      'https://www.rainviewer.com/api/weather-maps.json'
    ];
    
    const url = urls[retries % urls.length];
    
    try {
      setRadarError(null);
      setIsStaticRadar(false);
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Handle both formats (radar.past or just an array)
      const pastFrames = data.radar?.past || (Array.isArray(data) ? data : null);
      
      if (!pastFrames) {
        throw new Error("Invalid radar data format");
      }

      const frames: RadarFrame[] = pastFrames.map((f: any) => ({
        time: f.time,
        path: f.path
      }));
      setRadarFrames(frames);
      setActiveFrameIndex(frames.length - 1); // Start with most recent
    } catch (error: any) {
      // Only log as error on final failure to reduce console noise
      if (retries === 0) {
        console.error(`Final radar fetch failure from ${url}:`, error);
        console.log("Falling back to static radar layer...");
        setIsStaticRadar(true);
        setRadarError("Animation data unavailable. Using static radar.");
      } else {
        console.warn(`Radar fetch attempt failed (${url}). Retrying...`);
        setTimeout(() => fetchRadarFrames(retries - 1), 2000);
      }
    }
  };

  // 3. Update Base Tile Layer
  const updateBaseLayer = (layerType: MapLayer) => {
    if (!mapRef.current) return;
    Object.values(layersRef.current).forEach(layer => mapRef.current.removeLayer(layer));
    
    // @ts-ignore
    const newLayer = L.tileLayer(layerConfigs[layerType].url, {
      maxZoom: 18,
      attribution: layerConfigs[layerType].attribution
    });

    newLayer.addTo(mapRef.current);
    layersRef.current[layerType] = newLayer;

    if (layerType === 'satellite') {
      // @ts-ignore
      const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 18,
        zIndex: 50
      });
      labels.addTo(mapRef.current);
      layersRef.current['labels'] = labels;
    }

    // Re-bring radar to front if static
    if (isStaticRadar && staticRadarLayerRef.current) {
      staticRadarLayerRef.current.bringToFront();
    }
  };

  useEffect(() => {
    updateBaseLayer(activeLayer);
  }, [activeLayer]);

  // 4. Manage Radar Layers Animation
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing radar layers
    radarLayersRef.current.forEach(layer => mapRef.current.removeLayer(layer));
    radarLayersRef.current = [];
    if (staticRadarLayerRef.current) {
      mapRef.current.removeLayer(staticRadarLayerRef.current);
      staticRadarLayerRef.current = null;
    }

    if (isStaticRadar) {
      // Fallback: Static OWM Radar Layer
      // @ts-ignore
      staticRadarLayerRef.current = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, {
        opacity: 0.6,
        zIndex: 100
      }).addTo(mapRef.current);
      return;
    }

    if (radarFrames.length === 0) return;

    // Pre-load all frames but keep them hidden (opacity 0)
    radarFrames.forEach((frame, idx) => {
      // @ts-ignore
      const layer = L.tileLayer(`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`, {
        opacity: 0,
        zIndex: 100 + idx
      }).addTo(mapRef.current);
      radarLayersRef.current[idx] = layer;
    });

    // Initial show
    if (activeFrameIndex !== -1 && radarLayersRef.current[activeFrameIndex]) {
      radarLayersRef.current[activeFrameIndex].setOpacity(0.6);
    }
  }, [radarFrames, isStaticRadar]);

  // 5. Handle Animation Interval
  useEffect(() => {
    if (isPlaying) {
      animationIntervalRef.current = window.setInterval(() => {
        setActiveFrameIndex((prev) => (prev + 1) % radarFrames.length);
      }, 600);
    } else {
      if (animationIntervalRef.current) window.clearInterval(animationIntervalRef.current);
    }
    return () => {
      if (animationIntervalRef.current) window.clearInterval(animationIntervalRef.current);
    };
  }, [isPlaying, radarFrames.length]);

  // 6. Update Visible Frame
  useEffect(() => {
    radarLayersRef.current.forEach((layer, idx) => {
      if (layer) layer.setOpacity(idx === activeFrameIndex ? 0.6 : 0);
    });
  }, [activeFrameIndex]);

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative w-full h-full rounded-[24px] sm:rounded-[32px] overflow-hidden border border-white/20 mt-4 sm:mt-6 group bg-slate-800 shadow-2xl transition-all duration-500">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* City Label */}
      <div className="absolute top-3 left-3 sm:top-4 left-4 z-[400] bg-black/60 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black pointer-events-none uppercase tracking-[0.1em] sm:tracking-[0.2em] flex items-center gap-1.5 sm:gap-2 border border-white/10 shadow-lg transition-transform group-hover:translate-x-1">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
        {cityName} RADAR
      </div>

      {/* Layer Switcher */}
      <div className="absolute top-3 right-3 sm:top-4 right-4 z-[400] flex flex-col gap-1.5 sm:gap-2">
        {(['satellite', 'streets', 'terrain'] as MapLayer[]).map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 border backdrop-blur-md shadow-xl active:scale-90
              ${activeLayer === layer 
                ? 'bg-orange-600 border-orange-400 text-white scale-110 shadow-orange-500/30' 
                : 'bg-black/40 border-white/10 text-white/60 hover:bg-black/60 hover:text-white hover:scale-105'
              }`}
            title={layer.charAt(0).toUpperCase() + layer.slice(1)}
          >
            <i className={`fas ${
              layer === 'satellite' ? 'fa-globe' : 
              layer === 'streets' ? 'fa-road' : 'fa-mountain'
            } text-xs sm:text-base transition-transform duration-300`} />
          </button>
        ))}
      </div>

      {/* Radar Animation Player Bar */}
      {radarError && (
        <div className={`absolute bottom-4 left-4 right-4 z-[400] ${isStaticRadar ? 'bg-orange-500/20 border-orange-500/30' : 'bg-red-500/20 border-red-500/30'} backdrop-blur-md border rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-2xl`}>
          <i className={`fas ${isStaticRadar ? 'fa-info-circle text-orange-400' : 'fa-exclamation-triangle text-red-400'} text-xs`} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${isStaticRadar ? 'text-orange-200' : 'text-red-200'}`}>{radarError}</span>
          <button 
            onClick={() => fetchRadarFrames()}
            className={`ml-auto ${isStaticRadar ? 'bg-orange-500/20 hover:bg-orange-500/40' : 'bg-red-500/20 hover:bg-red-500/40'} px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all`}
          >
            {isStaticRadar ? 'Try Animation' : 'Retry'}
          </button>
        </div>
      )}

      {radarFrames.length > 0 && !isStaticRadar && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 left-4 right-4 z-[400] glass border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center gap-3 sm:gap-5 animate-in slide-in-from-bottom-6 duration-700 shadow-2xl">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 hover:bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg shadow-orange-500/20 active:scale-90 hover:scale-105"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs sm:text-sm transition-transform duration-300 ${isPlaying ? 'scale-110' : ''}`} />
          </button>

          <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
            <div className="flex justify-between items-center text-[7px] sm:text-[10px] font-black tracking-widest uppercase opacity-80">
              <span className="text-orange-500 flex items-center gap-1 sm:gap-2">
                {isPlaying && <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500 rounded-full animate-ping" />}
                Loop
              </span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded-md">{formatTime(radarFrames[activeFrameIndex]?.time)}</span>
            </div>
            
            <div className="relative h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden shadow-inner group/slider">
              <div 
                className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-300 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                style={{ width: `${((activeFrameIndex + 1) / radarFrames.length) * 100}%` }}
              />
              <input 
                type="range"
                min="0"
                max={radarFrames.length - 1}
                value={activeFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setActiveFrameIndex(parseInt(e.target.value));
                }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-[8px] sm:text-[10px] font-black opacity-30 uppercase tracking-[0.1em] sm:tracking-[0.2em] shrink-0">
            <span>Past 2h</span>
            <span>{radarFrames.length} F</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
