import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ categoryName }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link to="/" className="hover:text-red-600 transition-colors">Accueil</Link>
      <ChevronRight size={14} />
      <span className="text-white font-medium">{categoryName}</span>
    </nav>
  );
};

export default Breadcrumbs;
