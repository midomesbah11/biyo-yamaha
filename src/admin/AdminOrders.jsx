import { useContext, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useContext(StoreContext);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch(status) {
      case 'En attente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Expédié': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Livré': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id?.toString().includes(searchTerm) ||
    o.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Commandes</h2>
          <p className="text-zinc-400 mt-1">Gérez les demandes de vos clients.</p>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all w-full md:w-80 shadow-inner"
            placeholder="Rechercher une commande..."
          />
        </div>
      </div>

      <div className="bg-black border border-zinc-900 rounded-2xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="py-4 px-6 text-zinc-400 font-medium text-sm">N° Commande</th>
              <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Client & Date</th>
              <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Produit</th>
              <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Prix</th>
              <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-zinc-500">Aucune commande trouvée.</td>
              </tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors">
                <td className="py-4 px-6 text-white font-bold">{order.id}</td>
                <td className="py-4 px-6">
                  <div className="text-white font-medium">{order.customer}</div>
                  <div className="text-xs text-zinc-500 mt-1">{order.date} <span className="mx-1">•</span> {order.wilaya}</div>
                  <div className="text-xs text-zinc-500">{order.phone}</div>
                </td>
                <td className="py-4 px-6 text-zinc-300">{order.productName}</td>
                <td className="py-4 px-6 text-white font-semibold">{order.price} {order.price?.toString().includes('DA') ? '' : 'DA'}</td>
                <td className="py-4 px-6">
                  <div className="relative group/dropdown inline-block">
                    <button className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:brightness-110 cursor-pointer ${getStatusColor(order.status)}`}>
                      <span>{order.status}</span>
                      <ChevronDown size={14} />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden">
                      {['En attente', 'Expédié', 'Livré'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            order.status === status ? 'bg-red-600/20 text-red-500' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
