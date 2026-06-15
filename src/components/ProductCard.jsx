import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div
      whileHover={{ y: -10 }}
      className="group relative bg-[#111111] rounded-lg overflow-hidden border border-transparent hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
    >
      {/* Sale/New Badge */}
      {product.badge && product.stock > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
          {product.badge}
        </div>
      )}

      {Number(product.stock) <= 0 && (
        <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter shadow-lg border border-white/20">
          نفذت الكمية
        </div>
      )}

      {/* Product Image Area */}
      <div className="relative h-80 bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500 via-black to-black"></div>
        {/* Product Image */}
        <motion.img 
          src={product.images?.[0] || product.image}
          alt={product.name}
          className={`w-full h-full object-cover z-10 relative ${Number(product.stock) <= 0 ? 'grayscale opacity-40 contrast-75' : ''}`}
          whileHover={Number(product.stock) > 0 ? { scale: 1.1, rotate: 5 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {Number(product.stock) <= 0 && (
           <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
              <div className="border-2 border-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">غير متوفر حالياً</span>
              </div>
           </div>
        )}

        {/* Placeholder Fallback */}
        <div className="hidden w-48 h-48 bg-gradient-to-tr from-gray-700 to-gray-300 rounded-lg shadow-2xl z-10 relative items-center justify-center text-center p-2">
          <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">{product.category}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-500 text-sm mb-1">{product.category}</p>
            <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="text-white text-sm ml-1 font-bold">{product.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{product.price} <span className="text-sm font-normal text-gray-500">DA</span></span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">{product.oldPrice} DA</span>
            )}
          </div>
          <button className="bg-white/5 hover:bg-red-600 p-3 rounded-full text-white transition-colors duration-300">
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
