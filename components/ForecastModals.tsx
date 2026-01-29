
import React from 'react';
import { ForecastItem, AQIData } from '../types';

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: ForecastItem[];
  type: 'hourly' | 'daily';
}

export const ForecastModal: React.FC<ForecastModalProps> = ({ isOpen, onClose, title, items, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
      <div className="glass w-full max-w-3xl rounded-[40px] p-6 md:p-10 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden relative">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-white/5 pb-4 md:pb-6">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{title}</h2>
            <p className="text-[10px] font-bold text-orange-500 tracking-[0.3em] uppercase">Predictive Analysis</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-3xl hover:bg-red-500/20 hover:text-red-500 hover:rotate-90 hover:scale-110 active:scale-90 transition-all duration-300"
          >
            &times;
          </button>
        </div>
        
        <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 p-1 custom-scrollbar">
          {items.map((item, idx) => {
            const date = new Date(item.dt * 1000);
            const label = type === 'daily' 
              ? date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
              : date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

            return (
              <div 
                key={idx} 
                className="group bg-white/5 border border-white/5 rounded-3xl p-4 md:p-5 flex flex-col items-center text-center hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                <span className="text-[10px] font-black opacity-40 mb-3 md:mb-4 tracking-widest uppercase">{label}</span>
                <img 
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} 
                  alt="icon" 
                  className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" 
                />
                <span className="text-xl md:text-2xl font-black mt-2">{Math.round(item.main.temp)}°</span>
                <span className="text-[10px] font-bold capitalize opacity-60 mt-1 line-clamp-1 tracking-tight">{item.weather[0].description}</span>
                
                <div className="mt-4 md:mt-6 grid grid-cols-2 gap-2 text-[8px] bg-black/20 p-2 md:p-2.5 rounded-2xl w-full border border-white/5">
                  <span className="flex items-center gap-1 font-bold opacity-80"><i className="fas fa-wind text-blue-400"></i> {Math.round(item.wind.speed * 3.6)}</span>
                  <span className="flex items-center gap-1 font-bold opacity-80"><i className="fas fa-tint text-cyan-400"></i> {item.main.humidity}%</span>
                  <span className="col-span-2 flex items-center justify-center gap-1.5 font-black text-cyan-300 mt-1 border-t border-white/5 pt-1.5">
                    <i className="fas fa-cloud-showers-heavy text-[7px]"></i> {Math.round((item.pop || 0) * 100)}% RAIN
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface AQIModalProps {
  isOpen: boolean;
  onClose: () => void;
  aqiData: AQIData;
  hotspot?: { name: string; aqi: number };
}

export const AQIModal: React.FC<AQIModalProps> = ({ isOpen, onClose, aqiData, hotspot }) => {
  if (!isOpen) return null;

  const getAQIStatus = (val: number) => {
    switch (val) {
      case 1: return { label: "Good", color: "#68d546", bg: "rgba(104, 213, 70, 0.1)", desc: "Air quality is considered satisfactory." };
      case 2: return { label: "Fair", color: "#fdd835", bg: "rgba(253, 216, 53, 0.1)", desc: "Air quality is acceptable." };
      case 3: return { label: "Moderate", color: "#ff9800", bg: "rgba(255, 152, 0, 0.1)", desc: "Minor health concerns for sensitive groups." };
      case 4: return { label: "Poor", color: "#e91e63", bg: "rgba(233, 30, 99, 0.1)", desc: "Health effects may be experienced by everyone." };
      case 5: return { label: "Very Poor", color: "#9c27b0", bg: "rgba(156, 39, 176, 0.1)", desc: "Health warnings of emergency conditions." };
      default: return { label: "Unknown", color: "#ffffff", bg: "rgba(255, 255, 255, 0.1)", desc: "No data available." };
    }
  };

  const status = getAQIStatus(aqiData.aqi);
  const percentage = (aqiData.aqi / 5) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
      <div className="glass w-full max-w-lg rounded-[40px] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden relative">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none opacity-20" style={{ backgroundColor: status.color }} />
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 md:px-10 pt-8 md:pt-10 pb-6 bg-slate-900/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Atmospheric Quality</h2>
            <p className="text-[10px] font-bold text-orange-500 tracking-[0.3em] uppercase">Pollution Analysis</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-3xl hover:bg-red-500/20 hover:text-red-500 hover:rotate-90 hover:scale-110 active:scale-90 transition-all duration-300"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-8 md:p-10 custom-scrollbar space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="group">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-orange-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" /> Index Level
              </div>
              <div className="text-7xl md:text-8xl font-black transition-transform duration-500 group-hover:scale-110 group-hover:translate-x-1 flex items-baseline" style={{ color: status.color }}>
                {aqiData.aqi}
                <span className="text-sm font-medium ml-2 opacity-20">/ 5</span>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-[10px] font-black opacity-30 mb-3 uppercase tracking-widest">Current Rating</div>
              <div 
                className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-tighter border transition-all duration-500 hover:scale-105 inline-block" 
                style={{ borderColor: status.color, color: status.color, backgroundColor: status.bg }}
              >
                {status.label}
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-sm font-medium opacity-70 italic leading-relaxed">"{status.desc}"</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { label: "PM10", val: Math.round(aqiData.components.pm10), icon: "fa-cloud" },
              { label: "PM2.5", val: Math.round(aqiData.components.pm2_5), icon: "fa-smog" },
              { label: "NO₂", val: Math.round(aqiData.components.no2), icon: "fa-atom" },
              { label: "O₃", val: Math.round(aqiData.components.o3), icon: "fa-wind" },
              { label: "SO₂", val: Math.round(aqiData.components.so2), icon: "fa-vial" }
            ].map((comp, i) => (
              <div key={i} className="bg-white/5 p-4 md:p-5 rounded-3xl flex justify-between items-center border border-white/5 hover:border-white/20 transition-all duration-300 hover:bg-white/10 group">
                <div className="flex items-center gap-2 md:gap-3">
                  <i className={`fas ${comp.icon} text-xs opacity-20 group-hover:opacity-60 transition-opacity`} />
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{comp.label}</span>
                </div>
                <span className="font-black text-sm">{comp.val} <span className="text-[8px] font-medium opacity-20">µg/m³</span></span>
              </div>
            ))}
          </div>

          <div className="relative pt-8 pb-4">
             <div className="flex justify-between text-[8px] font-black opacity-30 mb-2 px-1 uppercase tracking-widest">
               <span>Good</span><span>Fair</span><span>Moderate</span><span>Poor</span><span>Critical</span>
             </div>
             <div className="h-3 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 via-orange-500 via-red-600 to-purple-900 shadow-inner" />
             <div 
               className="absolute top-10.5 w-6 h-6 bg-white border-2 border-slate-900 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out z-10"
               style={{ left: `calc(${percentage}% - 12px)` }}
             />
          </div>

          {hotspot && (
            <div className="bg-gradient-to-br from-red-600/20 to-pink-900/30 border border-red-500/20 rounded-[32px] p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/10">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-colors shrink-0">
                  <i className="fas fa-exclamation-triangle text-red-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-red-500 mb-1 uppercase tracking-widest flex items-center gap-1">
                    Global Hotspot
                  </div>
                  <div className="text-lg md:text-xl font-black tracking-tight line-clamp-1">{hotspot.name}</div>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6">
                <div className="text-3xl font-black text-red-500">Lv.{hotspot.aqi}</div>
                <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Severity</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(249, 115, 22, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.5);
        }
      `}</style>
    </div>
  );
};
