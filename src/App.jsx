import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Intro from './components/Intro';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import AccessoriesPage from './pages/AccessoriesPage';
import AllProductsPage from './pages/AllProductsPage';
import ProductPage from './pages/ProductPage';

// Admin Imports
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminSettings from './admin/AdminSettings';

// ScrollToTop component to reset scroll position on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomeRoute = location.pathname === '/';

  useEffect(() => {
    // Only set timeout if on home route.
    if (isHomeRoute) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [isHomeRoute]);

  const displayIntro = showIntro && isHomeRoute;

  if (isAdminRoute) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-red-600">
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="statistiques" element={<AdminDashboard />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="commandes" element={<AdminOrders />} />
            <Route path="parametres" element={<AdminSettings />} />
          </Route>
        </Routes>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-red-600">
      {displayIntro ? (
        <Intro />
      ) : (
        <>
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/all-products" element={<AllProductsPage />} />
              <Route path="/accessoires" element={<AccessoriesPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/:categorySlug" element={<CategoryPage />} />
            </Routes>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

import { StoreProvider } from './context/StoreContext';

function App() {
  return (
    <StoreProvider>
      <Router>
        <AppContent />
      </Router>
    </StoreProvider>
  );
}

export default App;
