import { motion } from 'framer-motion';
import { useState } from 'react';

const Intro = () => {
  const [speedLines] = useState(() => {
    return [...Array(6)].map(() => ({
      width: Math.random() * 100 + 50,
      marginTop: Math.random() * 100 - 50
    }));
  });

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Red flash effect at the end */}
      <motion.div
        className="absolute inset-0 bg-red-600 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.4, 0] }}
        transition={{ duration: 2.8, times: [0, 0.8, 0.9, 1] }}
      />

      <div className="relative flex flex-col items-center">
        {/* Speed lines */}
        <motion.div
          className="absolute inset-0 -mx-32 flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          {speedLines.map((styleProps, i) => (
            <motion.div
              key={i}
              className="h-1 bg-white/20 rounded-full"
              style={styleProps}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: -300, opacity: 1 }}
              transition={{
                duration: 0.6,
                repeat: 2,
                delay: i * 0.1,
                ease: "linear"
              }}
            />
          ))}
        </motion.div>

        {/* Logo Text coming in fast */}
        <motion.div
          initial={{ x: -1000, skewX: -30, opacity: 0 }}
          animate={{ x: 0, skewX: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 120, 
            damping: 14, 
            delay: 0.5 
          }}
          className="relative z-10"
        >
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
            BIYO<span className="text-red-600 ml-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">YAMAHA</span>
          </h1>
          <motion.div 
            className="h-1 bg-red-600 w-full mt-2"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Intro;
