import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

const Products = () => {
  const { products, isLoading } = useContext(StoreContext);
  // Show only 6 featured products on the homepage
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight italic">
            Notre <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">Catalogue</span>
          </h2>
          <div className="h-1 w-24 bg-red-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Découvrez nos accessoires de protection, équipements du motard et la nouvelle gamme Risol Électrique.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
             <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={product.id}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <button className="px-8 py-3 border-2 border-red-600 text-white font-bold hover:bg-red-600 transition-colors duration-300 rounded-sm uppercase tracking-widest text-sm">
            Voir tout le catalogue
          </button>
        </div>
      </div>
    </section>
  );
};

export default Products;
