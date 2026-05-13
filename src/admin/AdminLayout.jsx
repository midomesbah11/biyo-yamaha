import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Settings, LogOut, Bell, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  const [notification, setNotification] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleNewOrder = (e) => {
      const order = e.detail;
      setNotification(order);
      
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch (err) {
        console.error('Audio failed', err);
      }

      setTimeout(() => setNotification(null), 6000);
    };

    window.addEventListener('new_order', handleNewOrder);
    return () => window.removeEventListener('new_order', handleNewOrder);
  }, []);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Statistiques', path: '/admin', exact: true, icon: <BarChart3 size={20} /> },
    { name: 'Produits', path: '/admin/produits', exact: false, icon: <Package size={20} /> },
    { name: 'Commandes', path: '/admin/commandes', exact: false, icon: <ShoppingCart size={20} /> },
  ];


  const SidebarContent = () => (
    <>
      <div>
        <div className="p-6 border-b border-zinc-900 text-center relative">
          <h1 className="text-2xl font-black italic tracking-wider text-white">
            BIYO <span className="text-red-600">YAMAHA</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Admin Dashboard</p>
          
          {/* Close button for mobile drawer */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-6 right-4 lg:hidden text-zinc-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
              
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-900">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
        <div className="mt-6 mb-2 text-center">
          <p className="text-zinc-600 text-xs font-semibold tracking-wider">Developed by MBH</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-black border-r border-zinc-900 flex-col justify-between shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-black z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-black border-b border-zinc-900 flex items-center justify-between px-4 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-black italic tracking-wider text-white">
            BIYO <span className="text-red-600">YAMAHA</span>
          </h1>
          <div className="w-10 h-10 flex items-center justify-center">
            {/* Placeholder for notification bell or avatar */}
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Toast Notification */}
          {notification && (
            <div className="fixed top-20 right-4 md:top-8 md:right-8 bg-zinc-900 border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] rounded-2xl p-4 text-white z-50 animate-in slide-in-from-right-8 fade-in duration-300 flex items-start space-x-4 max-w-[calc(100vw-32px)]">
              <div className="bg-red-600/20 text-red-500 p-3 rounded-full shrink-0">
                <Bell size={24} className="animate-bounce" />
              </div>
              <div className="pr-4 overflow-hidden">
                <h4 className="font-bold text-red-500 uppercase tracking-wider text-xs">Nouvelle Commande !</h4>
                <p className="text-sm text-zinc-300 mt-1 truncate">
                  <span className="font-semibold text-white">{notification.customer}</span>
                </p>
                <p className="text-md font-bold text-white mt-1 italic truncate">{notification.productName}</p>
                <p className="text-xs font-medium text-zinc-500 mt-2 flex justify-between gap-4">
                  <span className="truncate">{notification.wilaya}</span>
                  <span className="text-red-400 whitespace-nowrap">{notification.price} DA</span>
                </p>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

