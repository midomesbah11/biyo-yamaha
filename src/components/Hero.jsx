import { motion } from 'framer-motion';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background with abstract dark shapes and red accents */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black to-black z-10"></div>
        {/* Carbon Fiber / Speed lines background overlay */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)
          `,
          backgroundSize: '20px 20px'
        }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2, delayChildren: 0.2 }
            }
          }}
          className="flex flex-col items-center italic"
        >
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            className="inline-block py-1 px-3 rounded-full bg-red-600/20 border border-red-600/50 text-red-500 font-medium text-[10px] md:text-sm mb-4 md:mb-6 tracking-wider uppercase"
          >
            Performance & Puissance
          </motion.span>
          <motion.h1 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 tracking-tight leading-tight md:leading-none"
          >
            L'Univers Yamaha & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">Mobilité</span><br />
            <span>Pièces, Protections & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Équipements</span></span>
          </motion.h1>
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            className="text-sm md:text-2xl text-gray-400 max-w-4xl mx-auto mb-6 md:mb-10 font-light px-4"
          >
            Performance pure et innovation Risol Électrique. 
            Découvrez notre sélection premium pour une expérience de conduite inégalée.
          </motion.p>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 w-full mt-2"
          >
            <Link 
              to="/all-products"
              className="w-full sm:w-auto"
            >
              <motion.button 
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 0 25px rgba(220, 38, 38, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 md:px-10 py-3 md:py-5 bg-red-600 text-white font-bold rounded-sm text-base md:text-xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider group not-italic"
              >
                <span>Acheter Maintenant</span>
                <ShoppingBag className="group-hover:rotate-12 transition-transform" size={20} />
              </motion.button>
            </Link>
            
            <Link 
              to="/accessoires"
              className="hidden sm:block w-full sm:w-auto"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-10 py-5 bg-transparent border-2 border-white/20 hover:border-white text-white font-bold rounded-sm text-xl transition-all uppercase tracking-wider not-italic"
              >
                Catalogue
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/50 animate-bounce cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
};

export default Hero;
