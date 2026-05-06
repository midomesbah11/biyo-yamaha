import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Wind } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

const subCategories = [
  { name: 'Tout', icon: null },
  { name: 'Crash Bars', icon: Shield },
  { name: 'Crash Radiateur', icon: Shield },
  { name: 'Les Pots', icon: Wind },
];

const AccessoriesPage = () => {
  const [activeSub, setActiveSub] = useState('Tout');
  const { products } = useContext(StoreContext);

  const filteredProducts = products.filter(p => 
    p.category === 'Accessoires' && (activeSub === 'Tout' || p.subCategory === activeSub)
  );

  return (
    <div className="pb-24 min-h-screen bg-black overflow-hidden">
      {/* Cinematic Animated Header */}
      <div className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden mb-12">
        {/* Background Image with Parallax effect */}
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="/images/categories/accessoires.png" 
            alt="Accessoires"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black"></div>
        </motion.div>

        {/* Floating Speed Lines (Animated) */}
        <div className="absolute inset-0 z-10 opacity-30 pointer-events-none">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"
          ></motion.div>
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
            className="absolute top-1/2 left-0 w-3/4 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
          ></motion.div>
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1 }}
            className="absolute top-3/4 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"
          ></motion.div>
        </div>

        {/* Title Content */}
        <div className="relative z-20 text-center px-4">
          <Breadcrumbs categoryName="Accessoires" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 text-white">
              Nos <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">Accessoires</span>
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 1, duration: 0.8 }}
              className="h-2 mx-auto rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]"
            ></motion.div>
          </motion.div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
        {/* Internal Navigation / Tabs */}
        <div className="flex flex-wrap gap-4 mb-16">
          {subCategories.map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSub === sub.name;
            
            return (
              <button
                key={sub.name}
                onClick={() => setActiveSub(sub.name)}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-sm border-2 transition-all duration-500 font-black italic uppercase tracking-widest text-sm
                  ${isActive 
                    ? 'bg-red-600 border-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.6)] scale-105' 
                    : 'border-white/10 text-gray-400 hover:border-red-600/50 hover:text-white'
                  }
                `}
              >
                {Icon && <Icon size={20} className={isActive ? 'animate-pulse' : ''} />}
                {sub.name}
              </button>
            );
          })}
        </div>

        <motion.div 
          layout
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Aucun produit disponible dans cette sous-catégorie.
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoriesPage;
