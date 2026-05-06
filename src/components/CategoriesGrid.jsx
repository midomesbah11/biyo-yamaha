import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '../data/products';

const CategoriesGrid = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">
            Explorer par <span className="text-red-600">Catégorie</span>
          </h2>
          <div className="h-1 w-24 bg-red-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link 
                to={category.slug === 'pieces-moteur' ? '/pieces-moteur' : `/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg border border-white/5 bg-[#0a0a0a] transition-all duration-500 hover:border-red-600/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]"
              >
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={`/images/categories/${category.slug}.png`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback Placeholder */}
                  <div className="hidden absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 items-center justify-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-black italic text-white uppercase tracking-tighter transition-transform duration-300 group-hover:-translate-y-2">
                    {category.name}
                    <span className="block h-1 w-8 bg-red-600 mt-2 transform origin-left transition-all duration-300 group-hover:w-full"></span>
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
