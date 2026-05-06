import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories } from '../data/products';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const { products } = useContext(StoreContext);
  
  const category = categories.find(c => c.slug === categorySlug);
  const filteredProducts = products.filter(p => p.slug === categorySlug);

  if (!category) {
    return <div className="min-h-screen flex items-center justify-center text-white">Catégorie non trouvée</div>;
  }

  const isRisol = category.slug === 'motos-risol';

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
            src={`/images/categories/${category.slug}.png`} 
            alt={category.name}
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
          <Breadcrumbs categoryName={category.name} />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className={`text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 ${
              isRisol ? 'text-blue-500 drop-shadow-[0_0_20px_rgba(37,99,235,0.6)]' : 'text-white'
            }`}>
              {isRisol ? 'Motos' : ''} <span className={isRisol ? '' : 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]'}>{category.name}</span>
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 1, duration: 0.8 }}
              className={`h-2 mx-auto rounded-full ${isRisol ? 'bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]'}`}
            ></motion.div>
          </motion.div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={product.id}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Aucun produit disponible dans cette catégorie pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
