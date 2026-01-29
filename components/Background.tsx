
import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#1a0b36]">
      {/* Dynamic Sunset Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b36] via-[#4a192c] via-[#852a1a] via-[#f09819] to-[#ff7e5f] animate-gradient" />
      
      {/* Solar Core / Sun Glow */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-orange-500/20 blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute top-[35%] left-[55%] w-[40%] h-[40%] rounded-full bg-yellow-400/10 blur-[100px] animate-float-slow pointer-events-none" />

      {/* Floating Embers / Light Motes */}
      <div className="embers-layer absolute inset-0 opacity-40" />
      
      {/* Tech Grid Overlay - Subtler for Sunset */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Layered Parallax Sunset Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep background clouds - Silhouetted */}
        <div 
          className="absolute top-[10%] left-0 w-[4000px] h-[400px] bg-repeat-x bg-contain opacity-20 filter brightness-50 blur-[2px] animate-cloud-slow" 
          style={{ backgroundImage: 'url(https://freepngimg.com/thumb/cloud/7-cloud-png-image.png)' }}
        />
        {/* Mid-ground clouds - Orange tint */}
        <div 
          className="absolute top-[30%] left-0 w-[4000px] h-[350px] bg-repeat-x bg-contain opacity-30 filter sepia(1) saturate(5) hue-rotate(-15deg) animate-cloud-mid" 
          style={{ backgroundImage: 'url(https://freepngimg.com/thumb/cloud/7-cloud-png-image.png)' }}
        />
        {/* Foreground clouds - Dark and dramatic */}
        <div 
          className="absolute bottom-[-5%] left-0 w-[4000px] h-[500px] bg-repeat-x bg-contain opacity-25 filter brightness-50 contrast-125 animate-cloud-fast" 
          style={{ backgroundImage: 'url(https://freepngimg.com/thumb/cloud/7-cloud-png-image.png)' }}
        />
      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes cloud-move {
          from { transform: translateX(0); }
          to { transform: translateX(-2000px); }
        }

        @keyframes cloud-move-reverse {
          from { transform: translateX(-2000px); }
          to { transform: translateX(0); }
        }

        .animate-gradient {
          background-size: 400% 400%;
          animation: gradientShift 25s ease-in-out infinite;
        }

        .animate-cloud-slow {
          animation: cloud-move 140s linear infinite;
        }

        .animate-cloud-mid {
          animation: cloud-move-reverse 100s linear infinite;
        }

        .animate-cloud-fast {
          animation: cloud-move 60s linear infinite;
        }

        .animate-float-slow {
          animation: sunsetFloat 18s ease-in-out infinite;
        }

        @keyframes sunsetFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 20px) scale(1.15); }
        }

        .embers-layer {
          background-image: 
            radial-gradient(1.5px 1.5px at 10% 20%, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 30% 50%, #fbd38d, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 70% 80%, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90% 10%, #fbd38d, rgba(0,0,0,0));
          background-size: 350px 350px;
          animation: emberTwinkle 5s ease-in-out infinite alternate;
        }

        @keyframes emberTwinkle {
          0% { opacity: 0.1; transform: translateY(0); }
          100% { opacity: 0.6; transform: translateY(-20px) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default Background;
