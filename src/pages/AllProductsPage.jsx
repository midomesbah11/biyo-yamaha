import { motion } from 'framer-motion';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

const AllProductsPage = () => {
  const { products, isLoading } = useContext(StoreContext);
  return (
    <div className="pt-32 pb-24 min-h-screen bg-black">
      <Breadcrumbs categoryName="Tous les produits" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 text-white"
          >
            Toutes nos <span className="text-red-600">Pièces</span>
          </motion.h1>
          <div className="h-1 w-24 rounded-full bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explorez notre catalogue complet de pièces moteur, accessoires de protection, équipements et motos électriques.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
             <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={product.id}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;
