import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // Delay onComplete slightly to allow fade out animation to finish
      setTimeout(onComplete, 800);
    }, 3200); // Reduced duration for better UX

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const furSpans = Array.from({ length: 31 }, (_, i) => (
    <span key={`fur-${i + 1}`} className={`fur-${31 - i}`} />
  ));

  const lampSpans = Array.from({ length: 28 }, (_, i) => (
    <span key={`lamp-${i + 1}`} className={`lamp-${i + 1}`} />
  ));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          id="intro-container" 
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
        >
          <div className="netflixintro" data-letter="N">
            <div className="helper-1">
              <div className="effect-brush">
                {furSpans}
              </div>
              <div className="effect-lumieres">
                {lampSpans}
              </div>
            </div>
            <div className="helper-2">
              <div className="effect-brush">
                {furSpans}
              </div>
            </div>
            <div className="helper-3">
              <div className="effect-brush">
                {furSpans}
              </div>
            </div>
            <div className="helper-4">
              <div className="effect-brush">
                {furSpans}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
