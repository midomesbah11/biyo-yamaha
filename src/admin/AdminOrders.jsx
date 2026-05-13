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

      <div className="bg-black border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800">
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">N° Commande</th>
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Client & Info</th>
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Produit & Livraison</th>
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Prix Total</th>
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
                    <div className="text-xs text-zinc-400 font-bold mt-1 tracking-tight">{order.phone}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{order.commune}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shrink-0">
                        {order.productImage ? (
                          <img src={order.productImage.split('?')[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700">?</div>
                        )}
                      </div>
                      <div>
                        <div className="text-zinc-300 font-medium text-sm">{order.productName} <span className="text-red-500 font-black">x{order.quantity || 1}</span></div>
                        <div className={`text-[10px] font-black uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${order.shippingType === 'domicile' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {order.shippingType === 'domicile' ? '🚚 À Domicile' : '🏪 Stop Desk'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white font-semibold">{order.price} DA</td>
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

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-zinc-900">
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">Aucune commande trouvée.</div>
          ) : filteredOrders.map((order) => (
            <div key={order.id} className="p-4 bg-black/50 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                   <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shrink-0 mt-1">
                      {order.productImage ? (
                        <img src={order.productImage.split('?')[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">?</div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Commande #{order.id}</span>
                      <h4 className="text-white font-bold text-lg leading-tight mt-0.5">{order.customer}</h4>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{order.date} • {order.wilaya}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Produit</div>
                    <div className="text-white font-bold text-sm">{order.productName} <span className="text-red-500 font-black ml-1">x{order.quantity || 1}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Livraison</div>
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${order.shippingType === 'domicile' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {order.shippingType === 'domicile' ? 'Domicile' : 'Stop Desk'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                  <div>
                    <div className="text-zinc-600 text-[10px] uppercase font-bold mb-0.5">Contact</div>
                    <div className="text-zinc-300 text-xs font-bold">{order.phone}</div>
                    <div className="text-zinc-500 text-[10px] truncate">{order.commune}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-600 text-[10px] uppercase font-bold mb-0.5">Total</div>
                    <div className="text-red-500 font-black text-xl leading-none">{order.price} DA</div>
                  </div>
                </div>
              </div>

              {/* Quick Status Toggle for Mobile */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                 {['En attente', 'Expédié', 'Livré'].map(status => (
                   <button 
                     key={status}
                     onClick={() => updateOrderStatus(order.id, status)}
                     className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex-1 ${
                       order.status === status ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                     }`}
                   >
                     {status}
                   </button>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
