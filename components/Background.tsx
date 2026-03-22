
import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0a82fb]">
      {/* Base Sky Gradient - Warmer for Golden Hour */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e90ff] via-[#ff9a8b] to-[#ffc3a0]" />
      
      {/* Sun and Rays - More Golden */}
      <div className="absolute top-[15%] right-[15%] w-32 h-32 rounded-full bg-orange-100 shadow-[0_0_120px_50px_rgba(255,165,0,0.4)] animate-pulse pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-40" />
      </div>
      
      {/* Atmospheric Light Rays */}
      <div className="absolute top-0 right-0 w-full h-full opacity-15 pointer-events-none overflow-hidden">
        <div className="absolute top-[-50%] right-[-20%] w-[150%] h-[150%] bg-[conic-gradient(from_180deg_at_85%_15%,transparent_0deg,rgba(255,200,100,0.3)_10deg,transparent_20deg)] animate-spin-slow" />
      </div>

      {/* Airplane Jet Animation (High Altitude) */}
      <div className="absolute top-[15%] left-[-10%] w-full h-10 pointer-events-none animate-jet-fly">
        <div className="relative flex items-center">
          <div className="w-4 h-1 bg-white/80 rounded-full shadow-[0_0_10px_white]" />
          <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-white/10 ml-[-40px]" />
        </div>
      </div>

      {/* Commercial Airplane (Lower Altitude) */}
      <div className="absolute top-[35%] left-[-15%] pointer-events-none animate-plane-fly">
        <div className="relative">
          <div className="w-8 h-2 bg-white/90 rounded-full shadow-md" />
          <div className="absolute top-[-4px] left-3 w-1 h-3 bg-white/90 rounded-sm rotate-12" />
          <div className="absolute top-[2px] left-2 w-4 h-[1px] bg-gray-400/50" />
        </div>
      </div>

      {/* Small Propeller Plane (Very Low Altitude) */}
      <div className="absolute top-[75%] right-[-10%] pointer-events-none animate-prop-fly">
        <div className="relative flex items-center">
          <div className="w-6 h-1.5 bg-red-600/80 rounded-full shadow-sm" />
          <div className="absolute left-0 w-1 h-4 bg-black/40 animate-prop-spin" />
          <div className="absolute top-[-2px] left-2 w-3 h-1 bg-red-600/80 rounded-sm" />
        </div>
      </div>

      {/* Birds Animation (Flock 1 - V-Formation) */}
      <div className="absolute top-[40%] right-[-20%] pointer-events-none animate-birds-fly">
        <div className="flex flex-col gap-4">
          <div className="flex gap-8">
            <div className="bird w-2 h-1 bg-black/40 animate-bird-flap" />
            <div className="bird w-2 h-1 bg-black/40 animate-bird-flap delay-100" />
            <div className="bird w-2 h-1 bg-black/40 animate-bird-flap delay-500" />
          </div>
          <div className="flex gap-8 ml-4">
            <div className="bird w-2 h-1 bg-black/40 animate-bird-flap delay-200" />
            <div className="bird w-2 h-1 bg-black/40 animate-bird-flap delay-300" />
            <div className="bird w-2 h-1 bg-black/40 animate-bird-flap delay-700" />
          </div>
        </div>
      </div>

      {/* Birds Animation (Flock 2 - Higher and Slower) */}
      <div className="absolute top-[25%] right-[-25%] pointer-events-none animate-birds-fly-slow">
        <div className="flex gap-12">
          <div className="bird w-1.5 h-0.5 bg-black/30 animate-bird-flap" />
          <div className="bird w-1.5 h-0.5 bg-black/30 animate-bird-flap delay-500" />
          <div className="bird w-1.5 h-0.5 bg-black/30 animate-bird-flap delay-200" />
          <div className="bird w-1.5 h-0.5 bg-black/30 animate-bird-flap delay-800" />
          <div className="bird w-1.5 h-0.5 bg-black/30 animate-bird-flap delay-1000" />
        </div>
      </div>

      {/* Birds Animation (Flock 3 - Lower and Faster) */}
      <div className="absolute top-[60%] left-[-20%] pointer-events-none animate-birds-fly-fast">
        <div className="flex gap-6">
          <div className="bird w-2.5 h-1.5 bg-black/50 animate-bird-flap" />
          <div className="bird w-2.5 h-1.5 bg-black/50 animate-bird-flap delay-150" />
          <div className="bird w-2.5 h-1.5 bg-black/50 animate-bird-flap delay-400" />
        </div>
      </div>

      {/* Birds Animation (Flock 4 - Distant Scavengers) */}
      <div className="absolute top-[10%] left-[20%] pointer-events-none animate-birds-circle">
        <div className="flex gap-4">
          <div className="bird w-1 h-0.5 bg-black/20 animate-bird-flap" />
          <div className="bird w-1 h-0.5 bg-black/20 animate-bird-flap delay-300" />
        </div>
      </div>

      {/* Layered Animated Clouds - Orange Tinted */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Far Background Clouds */}
        <div 
          className="absolute top-[10%] left-0 w-[4000px] h-[300px] bg-repeat-x bg-contain opacity-25 blur-[3px] filter sepia(0.6) saturate(1.5) hue-rotate(-10deg) animate-cloud-slow" 
          style={{ backgroundImage: 'url(https://freepngimg.com/thumb/cloud/7-cloud-png-image.png)' }}
        />
        
        {/* Mid Background Clouds */}
        <div 
          className="absolute top-[25%] left-0 w-[4000px] h-[400px] bg-repeat-x bg-contain opacity-45 blur-[1px] filter sepia(0.8) saturate(2) hue-rotate(-20deg) animate-cloud-mid" 
          style={{ backgroundImage: 'url(https://freepngimg.com/thumb/cloud/7-cloud-png-image.png)' }}
        />

        {/* Foreground Clouds */}
        <div 
          className="absolute bottom-[-10%] left-0 w-[4000px] h-[600px] bg-repeat-x bg-contain opacity-65 filter sepia(0.5) saturate(1.8) hue-rotate(-15deg) animate-cloud-fast" 
          style={{ backgroundImage: 'url(https://freepngimg.com/thumb/cloud/7-cloud-png-image.png)' }}
        />
      </div>

      {/* Floating Particles */}
      <div className="particles-layer absolute inset-0 opacity-30" />

      <style>{`
        @keyframes cloud-move {
          from { transform: translateX(0); }
          to { transform: translateX(-2000px); }
        }

        @keyframes cloud-move-reverse {
          from { transform: translateX(-2000px); }
          to { transform: translateX(0); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes jet-fly {
          0% { transform: translateX(-100%) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(120vw) translateY(-50px); opacity: 0; }
        }

        @keyframes plane-fly {
          0% { transform: translateX(-20vw) translateY(0) scale(0.8); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(120vw) translateY(20px) scale(1); opacity: 0; }
        }

        @keyframes birds-fly {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-150vw) translateY(100px); opacity: 0; }
        }

        @keyframes birds-fly-alt {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateX(150vw) translateY(-50px); opacity: 0; }
        }

        @keyframes bird-flap {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.2); }
        }

        .animate-jet-fly {
          animation: jet-fly 25s linear infinite;
        }

        .animate-plane-fly {
          animation: plane-fly 35s linear infinite;
          animation-delay: 12s;
        }

        .animate-birds-fly {
          animation: birds-fly 40s linear infinite;
          animation-delay: 5s;
        }

        .animate-birds-fly-slow {
          animation: birds-fly 60s linear infinite;
          animation-delay: 15s;
        }

        .animate-birds-fly-fast {
          animation: birds-fly-alt 25s linear infinite;
          animation-delay: 8s;
        }

        .animate-prop-fly {
          animation: prop-fly 45s linear infinite;
          animation-delay: 2s;
        }

        .animate-prop-spin {
          animation: prop-spin 0.1s linear infinite;
        }

        .animate-birds-circle {
          animation: birds-circle 30s linear infinite;
        }

        .animate-bird-flap {
          animation: bird-flap 0.6s ease-in-out infinite;
          clip-path: polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%);
        }

        @keyframes prop-fly {
          0% { transform: translateX(110vw) translateY(0) scale(0.6); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(-20vw) translateY(30px) scale(0.8); opacity: 0; }
        }

        @keyframes prop-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes birds-circle {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translate(100px, 50px) rotate(180deg); }
          90% { opacity: 0.6; }
          100% { transform: translate(0, 0) rotate(360deg); opacity: 0; }
        }

        .animate-spin-slow {
          animation: spin-slow 120s linear infinite;
        }

        .animate-cloud-slow {
          animation: cloud-move 180s linear infinite;
        }

        .animate-cloud-mid {
          animation: cloud-move-reverse 120s linear infinite;
        }

        .animate-cloud-fast {
          animation: cloud-move 80s linear infinite;
        }

        .particles-layer {
          background-image: 
            radial-gradient(1px 1px at 20% 30%, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 50% 70%, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 80% 40%, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 10% 90%, #fff, rgba(0,0,0,0));
          background-size: 400px 400px;
          animation: particleFloat 10s ease-in-out infinite alternate;
        }

        @keyframes particleFloat {
          0% { opacity: 0.2; transform: translateY(0) translateX(0); }
          100% { opacity: 0.5; transform: translateY(-40px) translateX(20px); }
        }
      `}</style>
    </div>
  );
};

export default Background;
