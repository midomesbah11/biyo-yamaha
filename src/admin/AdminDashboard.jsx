import { useContext, useMemo } from 'react';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

export default function AdminDashboard() {
  const { orders } = useContext(StoreContext);

  const ventesTotales = orders.reduce((sum, order) => sum + (order.rawPrice || 0), 0);
  const commandesEnAttente = orders.filter(o => o.status === 'En attente').length;
  const clientsRecents = new Set(orders.map(o => o.phone)).size;

  const chartData = useMemo(() => {
    const dataByDate = {};
    // Populate last 7 days with 0 to have a clean chart timeline
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      dataByDate[dateStr] = 0;
    }

    orders.forEach(order => {
      if (order.timestamp) {
        const d = new Date(order.timestamp);
        const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        // Only sum for the last 7 days that we care about in the UI
        if (dataByDate[dateStr] !== undefined) {
          dataByDate[dateStr] += (order.rawPrice || 0);
        } else {
          // If it's older or in a different format, we might not show it in the 7-day chart
        }
      }
    });

    const values = Object.values(dataByDate);
    const maxVal = Math.max(...values, 1000); // ensure we have a scale even if 0

    return Object.entries(dataByDate).map(([date, total]) => ({
      date,
      total,
      height: `${(total / maxVal) * 100}%`
    }));
  }, [orders]);

  const stats = [
    { title: 'Ventes Totales', value: `${ventesTotales.toLocaleString()} DA`, icon: <DollarSign size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'Commandes en attente', value: commandesEnAttente.toString(), icon: <Package size={24} />, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { title: 'Clients Récents', value: clientsRecents.toString(), icon: <Users size={24} />, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { title: 'Croissance', value: '+12.5%', icon: <TrendingUp size={24} />, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Statistiques</h2>
        <p className="text-zinc-400 mt-1">Aperçu en temps réel de vos ventes et de l'activité.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-black border ${stat.border} rounded-2xl p-6 hover:bg-zinc-900/20 transition-all shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-black border border-zinc-900 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">Ventes des 7 derniers jours</h3>
          <p className="text-zinc-500 text-sm mt-1">Total généré jour par jour</p>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2 md:gap-4 mt-8 pt-4 border-t border-zinc-900/50">
          {chartData.map((data, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 group">
              {/* Bar tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-xs font-bold text-white bg-zinc-800 py-1 px-2 rounded whitespace-nowrap">
                {data.total.toLocaleString()} DA
              </div>
              {/* Bar */}
              <div className="w-full bg-zinc-900 rounded-t-sm relative flex justify-end flex-col h-full group-hover:bg-zinc-800 transition-colors">
                <div 
                  className="w-full bg-red-600 rounded-t-sm transition-all duration-1000 shadow-[0_0_15px_rgba(220,38,38,0.3)] group-hover:bg-red-500" 
                  style={{ height: data.height === '0%' ? '4px' : data.height }}
                ></div>
              </div>
              {/* Label */}
              <div className="mt-4 text-xs font-medium text-zinc-500 whitespace-nowrap">
                {data.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
