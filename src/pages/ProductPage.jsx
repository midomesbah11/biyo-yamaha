import { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Truck, Building2 } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { wilayasData, algeriaData, getShippingFee, shippingFees } from '../data/algeriaCities';

export default function ProductPage() {
  const { id } = useParams();
  const { products, addOrder } = useContext(StoreContext);
  const product = products.find(p => p.id === parseInt(id));

  const [selectedImage, setSelectedImage] = useState(() => {
    if (!product) return '';
    if (product.images && product.images.length > 0) return product.images[0];
    return product.image || '';
  });
  
  const [formData, setFormData] = useState({ 
    nom: '', 
    prenom: '', 
    tel: '', 
    wilaya: '42', // Tipaza par défaut
    commune: '',
    shippingType: 'domicile' 
  });
  const [orderStatus, setOrderStatus] = useState('idle');
  
  const formRef = useRef(null);
  const [showStickyBtn, setShowStickyBtn] = useState(true);

  // Convert local data to arrays for rendering
  const wilayasList = Object.entries(wilayasData)
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));

  const [communesList, setCommunesList] = useState(algeriaData['42'] || []);

  const homePrice = getShippingFee(formData.wilaya, 'home') || 0;
  const deskPrice = getShippingFee(formData.wilaya, 'office') || 0;
  const savings = homePrice - deskPrice;

  const currentShippingCost = formData.shippingType === 'domicile' ? homePrice : deskPrice;

  const productRawPrice = product ? parseFloat(product.price.replace(/,/g, '')) : 0;
  const totalPrice = productRawPrice + currentShippingCost;

  useEffect(() => {
    if (formData.wilaya && algeriaData[formData.wilaya]) {
      setCommunesList(algeriaData[formData.wilaya]);
      // Only reset commune if it's not the first load or if wilaya changed
    } else {
      setCommunesList([]);
    }
  }, [formData.wilaya]);

  useEffect(() => {
    const node = formRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide sticky button when form is visible
        setShowStickyBtn(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Produit non trouvé</h2>
        <Link to="/" className="text-red-600 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const thumbnails = product.images?.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderStatus('submitting');
    
    const wilayaName = wilayasData[formData.wilaya] || formData.wilaya;

    // Add to global state
    addOrder({
      customer: `${formData.nom} ${formData.prenom}`,
      phone: formData.tel,
      wilaya: wilayaName,
      commune: formData.commune,
      productName: product.name,
      price: totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " DA",
      rawPrice: totalPrice,
      shippingType: formData.shippingType,
      shippingCost: currentShippingCost
    });
    
    setTimeout(() => {
      setOrderStatus('success');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 animate-in fade-in duration-500">
      <Breadcrumbs />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl group border border-zinc-800 relative cursor-zoom-in bg-[#111111] aspect-square flex items-center justify-center p-8 shadow-2xl">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className={`w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.35] ${product.stock === 0 ? 'grayscale contrast-75 opacity-50' : ''}`}
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-red-600 text-white font-black px-6 py-3 rounded-xl text-xl rotate-[-5deg] shadow-2xl border-4 border-white/20 uppercase tracking-tighter">
                  Rupture de Stock
                </span>
              </div>
            )}
          </div>
          {thumbnails.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {thumbnails.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(img)}
                  className={`w-24 h-24 rounded-2xl border-2 overflow-hidden flex-shrink-0 bg-[#111111] p-3 transition-all ${
                    selectedImage === img 
                      ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                      : 'border-zinc-800 hover:border-zinc-500'
                  }`}
                >
                  <img src={img.split('?')[0]} alt={`Vue ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Form */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-4 uppercase leading-tight">
              {product.name}
            </h1>
            <p className="text-red-600 font-black text-4xl mb-6">
              {totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <span className="text-xl font-bold text-red-600/70">DA</span>
              {currentShippingCost > 0 && (
                <span className="block text-sm text-zinc-400 font-medium mt-2">
                  (Produit: {product.price} DA + Livraison: {currentShippingCost} DA)
                </span>
              )}
            </p>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold mb-4 text-white border-b border-zinc-800 pb-3 flex items-center">
                <span className="w-2 h-6 bg-red-600 mr-3 rounded-full"></span>
                Détails du Produit
              </h3>
              <p className="text-zinc-400 mb-6 text-lg leading-relaxed">{product.description}</p>
              <ul className="list-none space-y-3 text-zinc-300 font-medium">
                <li className="flex items-center"><span className="text-red-600 mr-3 text-xl">•</span> Matériaux premium de haute résistance</li>
                <li className="flex items-center"><span className="text-red-600 mr-3 text-xl">•</span> Installation facile et rapide</li>
                <li className="flex items-center"><span className="text-red-600 mr-3 text-xl">•</span> Conçu spécifiquement pour les motos Yamaha</li>
                <li className="flex items-center"><span className="text-red-600 mr-3 text-xl">•</span> Garantie de qualité Biyo Yamaha</li>
              </ul>
            </div>
          </div>

          {/* Order Form */}
          <div ref={formRef} className="bg-[#111111] border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mt-auto">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-900"></div>
            
            {orderStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-2xl font-black mb-3 text-white">Commande Réussie !</h4>
                <p className="text-emerald-400 font-medium text-lg">شكراً لثقتكم، سنتصل بكم لتأكيد الطلب في أقرب وقت.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-wider flex items-center">
                  Commander Maintenant
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">Nom (اللقب)</label>
                      <input required type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="Votre nom" />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">Prénom (الاسم)</label>
                      <input required type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="Votre prénom" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Numéro de téléphone</label>
                    <input required type="tel" value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all text-lg tracking-wider" placeholder="0555..." dir="ltr" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">Wilaya</label>
                      <select required value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all appearance-none cursor-pointer">
                        <option value="">Sélectionnez la wilaya</option>
                        {wilayasList.map(w => (
                          <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">Commune</label>
                      <select required disabled={!formData.wilaya} value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all appearance-none cursor-pointer disabled:opacity-50">
                        <option value="">Sélectionnez la commune</option>
                        {communesList.map((commune, idx) => (
                          <option key={idx} value={commune}>{commune}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="pt-2">
                    <label className="block text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wider">Mode de livraison</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.shippingType === 'domicile' ? 'border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800 hover:border-zinc-700 bg-black'}`}>
                        <input type="radio" name="shipping" value="domicile" checked={formData.shippingType === 'domicile'} onChange={() => setFormData({...formData, shippingType: 'domicile'})} className="hidden" />
                        <Truck className={`mr-3 ${formData.shippingType === 'domicile' ? 'text-red-500' : 'text-zinc-500'}`} size={28} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <p className="font-bold text-white text-sm">À Domicile</p>
                            <p className="font-black text-white text-xs">{homePrice} DA</p>
                          </div>
                          <p className="text-[10px] text-zinc-500 uppercase">Livraison à votre porte</p>
                        </div>
                      </label>
                      <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.shippingType === 'stop_desk' ? 'border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800 hover:border-zinc-700 bg-black'}`}>
                        <input type="radio" name="shipping" value="stop_desk" checked={formData.shippingType === 'stop_desk'} onChange={() => setFormData({...formData, shippingType: 'stop_desk'})} className="hidden" />
                        <Building2 className={`mr-3 ${formData.shippingType === 'stop_desk' ? 'text-red-500' : 'text-zinc-500'}`} size={28} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <p className="font-bold text-white text-sm">Stop Desk</p>
                            <p className="font-black text-white text-xs">{deskPrice} DA</p>
                          </div>
                          {savings > 0 ? (
                            <p className="text-[10px] text-emerald-500 font-bold uppercase italic animate-pulse">Économisez {savings} DA</p>
                          ) : (
                            <p className="text-[10px] text-zinc-500 uppercase text-xs">Récupérer au bureau</p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <button 
                    disabled={orderStatus === 'submitting' || product.stock === 0}
                    type="submit" 
                    className={`w-full font-black py-5 px-6 rounded-2xl transition-all uppercase tracking-[0.2em] text-lg mt-6 flex items-center justify-center space-x-3
                      ${orderStatus === 'submitting' 
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                        : product.stock === 0 
                        ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                  >
                    <span>
                      {orderStatus === 'submitting' 
                        ? 'Envoi...' 
                        : product.stock === 0 
                        ? 'NON DISPONIBLE' 
                        : 'CONFIRMER'
                      }
                    </span>
                    {orderStatus !== 'submitting' && product.stock > 0 && (
                      <span className="bg-black/20 px-3 py-1 rounded-lg text-sm font-bold border border-white/10 ml-2">
                        {totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DA
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Order Button */}
      {showStickyBtn && (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button 
            onClick={scrollToForm}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center space-x-3 transition-all active:scale-95 pointer-events-auto"
          >
            <span>COMMANDER MAINTENANT</span>
            <ShoppingBag size={22} className="animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
}
