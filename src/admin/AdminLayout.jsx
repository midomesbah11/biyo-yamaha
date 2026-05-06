import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Settings, LogOut, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleNewOrder = (e) => {
      const order = e.detail;
      setNotification(order);
      
      // Play a notification sound
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
    { name: 'Paramètres', path: '/admin/parametres', exact: false, icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-900 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-zinc-900 text-center">
            <h1 className="text-2xl font-black italic tracking-wider text-white">
              BIYO <span className="text-red-600">YAMAHA</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Admin Dashboard</p>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Toast Notification */}
        {notification && (
          <div className="absolute top-8 right-8 bg-zinc-900 border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] rounded-2xl p-4 text-white z-50 animate-in slide-in-from-right-8 fade-in duration-300 flex items-start space-x-4">
            <div className="bg-red-600/20 text-red-500 p-3 rounded-full">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div className="pr-4">
              <h4 className="font-bold text-red-500 uppercase tracking-wider text-sm">Nouvelle Commande !</h4>
              <p className="text-sm text-zinc-300 mt-1"><span className="font-semibold text-white">{notification.customer}</span> a commandé:</p>
              <p className="text-md font-bold text-white mt-1 italic">{notification.productName}</p>
              <p className="text-xs font-medium text-zinc-500 mt-2 flex justify-between">
                <span>{notification.wilaya}</span>
                <span className="text-red-400">{notification.price} DA</span>
              </p>
            </div>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
