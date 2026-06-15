import { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Truck, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { wilayasData, algeriaData, getShippingFee, shippingFees } from '../data/algeriaCities';
import { sendMetaEvent } from '../lib/metaCapi';
import { sendTelegramNotification } from '../lib/telegramApi';

export default function ProductPage() {
  const { id } = useParams();
  const { products, addOrder } = useContext(StoreContext);
  const product = products.find(p => p.id === parseInt(id));

  const thumbnails = product?.images?.length > 0 
    ? product.images 
    : (product?.image ? [product.image] : []);

  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  
  const [selectedImage, setSelectedImage] = useState(() => {
    if (!product) return '';
    return thumbnails.length > 0 ? thumbnails[0] : '';
  });

  useEffect(() => {
    if (thumbnails.length > 1) {
      const timer = setInterval(() => {
        setCurrentImgIdx((prev) => (prev + 1) % thumbnails.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [thumbnails.length]);

  useEffect(() => {
    if (thumbnails.length > 0) {
      setSelectedImage(thumbnails[currentImgIdx]);
    }
  }, [currentImgIdx, thumbnails]);

  const handleNextImg = () => setCurrentImgIdx((prev) => (prev + 1) % thumbnails.length);
  const handlePrevImg = () => setCurrentImgIdx((prev) => (prev - 1 + thumbnails.length) % thumbnails.length);
  
  const [formData, setFormData] = useState({ 
    nom: '', 
    prenom: '', 
    tel: '', 
    wilaya: '', 
    commune: '',
    shippingType: 'domicile' 
  });
  const [formError, setFormError] = useState('');
  const [orderStatus, setOrderStatus] = useState('idle');
  const [quantity, setQuantity] = useState(1);
  
  const handleIncQuantity = () => {
    if (product && quantity < Number(product.stock)) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };
  
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
  const totalPrice = (productRawPrice * quantity) + currentShippingCost;

  useEffect(() => {
    // Send ViewContent Event to Meta CAPI
    if (product) {
      sendMetaEvent('ViewContent', {}, {
        content_name: product.name,
        content_ids: [product.id.toString()],
        value: productRawPrice,
        content_category: product.category || 'Motorcycles/Parts',
      });
    }

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



  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.wilaya) {
      setFormError('يرجى اختيار الولاية أولاً');
      return;
    }

    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    if (!phoneRegex.test(formData.tel)) {
      setFormError('يرجى إدخال رقم هاتف صحيح (10 أرقام)');
      return;
    }

    setOrderStatus('submitting');
    
    const wilayaName = wilayasData[formData.wilaya] || formData.wilaya;

    // 1. Add to global state and Database first!
    const isSuccess = await addOrder({
      customer: `${formData.nom} ${formData.prenom}`,
      phone: formData.tel,
      wilaya: wilayaName,
      commune: formData.commune,
      productName: product.name,
      productImage: product.images?.[0] || product.image,
      price: totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " DA",
      rawPrice: totalPrice,
      quantity: quantity,
      shippingType: formData.shippingType,
      shippingCost: currentShippingCost
    });

    if (isSuccess) {
      setOrderStatus('success');
      
      // 2. Send Tracking and Notifications in the background (no await so it doesn't block the UI)
      sendMetaEvent('Purchase', {
        firstName: formData.prenom,
        lastName: formData.nom,
        phone: formData.tel,
        city: formData.commune
      }, {
        value: totalPrice,
        content_name: product.name,
        content_ids: [product.id.toString()],
        content_category: product.category || 'Motorcycles/Parts',
        num_items: quantity
      }).catch(err => console.error("Tracking Error:", err));

      sendTelegramNotification({
        customer: `${formData.nom} ${formData.prenom}`,
        phone: formData.tel,
        wilaya: wilayaName,
        commune: formData.commune,
        shippingType: formData.shippingType,
        productName: product.name,
        quantity: quantity,
        productPrice: productRawPrice,
        shippingCost: currentShippingCost,
        totalPrice: totalPrice,
        productImage: new URL(selectedImage || product.image, window.location.origin).href
      }).catch(err => console.error("Telegram Error:", err));

    } else {
      setOrderStatus('idle');
      setFormError('حدث خطأ أثناء إرسال الطلب، تأكد من اتصالك بالإنترنت ومن صلاحيات قاعدة البيانات.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-20 animate-in fade-in duration-500">
      <Breadcrumbs />
      
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl group border border-zinc-800 relative bg-[#111111] aspect-square flex items-center justify-center shadow-2xl">
            {thumbnails.length > 1 && (
              <>
                <button onClick={handlePrevImg} className="absolute left-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-all border border-white/10">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={handleNextImg} className="absolute right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-all border border-white/10">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            <img 
              src={selectedImage} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-all duration-500 ease-out ${Number(product.stock) <= 0 ? 'grayscale contrast-75 opacity-50' : ''}`}
            />
            {Number(product.stock) <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-red-600 text-white font-black px-6 py-3 rounded-xl text-xl rotate-[-5deg] shadow-2xl border-4 border-white/20 uppercase tracking-tighter">
                  نفذت الكمية
                </span>
              </div>
            )}
          </div>
          {thumbnails.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center mt-4">
              {thumbnails.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentImgIdx(idx)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 overflow-hidden flex-shrink-0 bg-[#111111] transition-all ${
                    currentImgIdx === idx 
                      ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-105' 
                      : 'border-zinc-800 hover:border-zinc-500 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.split('?')[0]} alt={`Vue ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Form */}
        <div className="flex flex-col text-right" dir="rtl">
          <div className="mb-8 font-['Cairo',_sans-serif]">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight w-full">
              {product.name}
            </h1>
            
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-zinc-300 text-xl leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="mb-8 flex flex-col items-start">
              <p className="text-red-600 font-black text-5xl flex items-baseline">
                <span>{totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span> <span className="text-2xl font-bold text-red-600/70 mr-2">DA</span>
              </p>
            </div>
          </div>

          {/* Order Form */}
          <div ref={formRef} className="bg-[#111111] border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mt-auto font-['Cairo',_sans-serif]" dir="rtl">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-red-600 to-red-900"></div>
            
            {orderStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-2xl font-black mb-3 text-white">Commande Réussie !</h4>
                <p className="text-emerald-400 font-medium text-lg">شكراً لثقتكم، سنتصل بكم لإتمام الطلب في أقرب وقت.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-wider flex items-center">
                  اطلب الآن
                </h3>
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 mb-6 font-bold text-sm flex items-center">
                    <span className="mr-2">⚠️</span> {formError}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">اللقب (Nom)</label>
                      <input required type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full bg-black border-2 border-zinc-800 hover:border-zinc-700 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="اللقب" />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">الاسم (Prénom)</label>
                      <input required type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full bg-black border-2 border-zinc-800 hover:border-zinc-700 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="الاسم" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">رقم الهاتف (Téléphone)</label>
                    <input 
                      required 
                      type="tel" 
                      maxLength="10"
                      value={formData.tel} 
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({...formData, tel: val});
                      }} 
                      className="w-full bg-black border-2 border-zinc-800 hover:border-zinc-700 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all text-lg tracking-wider" 
                      placeholder="0555 55 55 55" 
                      dir="ltr" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">الولاية (Wilaya)</label>
                      <select required value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})} className="w-full bg-black border-2 border-zinc-800 hover:border-zinc-700 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all appearance-none cursor-pointer">
                        <option value="">اختر الولاية</option>
                        {wilayasList.map(w => (
                          <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm font-medium mb-2">البلدية (Commune)</label>
                      <select required disabled={!formData.wilaya} value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} className="w-full bg-black border-2 border-zinc-800 hover:border-zinc-700 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all appearance-none cursor-pointer disabled:opacity-50">
                        <option value="">اختر البلدية</option>
                        {communesList.map((commune, idx) => (
                          <option key={idx} value={commune}>{commune}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="pt-2">
                    <label className="block text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wider">طريقة التوصيل (Livraison)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.shippingType === 'domicile' ? 'border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800 hover:border-zinc-700 bg-black'}`}>
                        <input type="radio" name="shipping" value="domicile" checked={formData.shippingType === 'domicile'} onChange={() => setFormData({...formData, shippingType: 'domicile'})} className="hidden" />
                        <Truck className={`mr-3 ${formData.shippingType === 'domicile' ? 'text-red-500' : 'text-zinc-500'}`} size={28} />
                        <div className="flex-1 text-right">
                          <div className="flex justify-between items-center mb-0.5">
                            <p className="font-black text-white text-xs">{homePrice} DA</p>
                            <p className="font-bold text-white text-sm">توصيل للمنزل</p>
                          </div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">À Domicile</p>
                        </div>
                      </label>
                      <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.shippingType === 'stop_desk' ? 'border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800 hover:border-zinc-700 bg-black'}`}>
                        <input type="radio" name="shipping" value="stop_desk" checked={formData.shippingType === 'stop_desk'} onChange={() => setFormData({...formData, shippingType: 'stop_desk'})} className="hidden" />
                        <Building2 className={`mr-3 ${formData.shippingType === 'stop_desk' ? 'text-red-500' : 'text-zinc-500'}`} size={28} />
                        <div className="flex-1 text-right">
                          <div className="flex justify-between items-center mb-0.5">
                            <p className="font-black text-white text-xs">{deskPrice} DA</p>
                            <p className="font-bold text-white text-sm">توصيل للمكتب</p>
                          </div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Stop Desk</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="pt-2">
                    <label className="block text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wider">الكمية (Quantité)</label>
                    <div className="flex items-center justify-between bg-black border-2 border-zinc-800 rounded-2xl p-2 w-full max-w-[200px] mx-auto md:mx-0">
                      <button 
                        type="button" 
                        onClick={handleDecQuantity}
                        disabled={quantity <= 1}
                        className="w-12 h-12 flex items-center justify-center text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="text-2xl font-bold">-</span>
                      </button>
                      <span className="text-2xl font-black text-white w-16 text-center">{quantity}</span>
                      <button 
                        type="button" 
                        onClick={handleIncQuantity}
                        disabled={!product || quantity >= Number(product.stock)}
                        className="w-12 h-12 flex items-center justify-center text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="text-2xl font-bold">+</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    disabled={orderStatus === 'submitting' || Number(product.stock) <= 0}
                    type="submit" 
                    className={`w-full font-black py-5 px-6 rounded-2xl transition-all uppercase tracking-[0.2em] text-lg mt-6 flex items-center justify-center space-x-3
                      ${orderStatus === 'submitting' 
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                        : Number(product.stock) <= 0 
                        ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                  >
                    <span>
                      {orderStatus === 'submitting' 
                        ? 'جاري الإرسال...' 
                        : Number(product.stock) <= 0 
                        ? 'غير متوفر حالياً' 
                        : 'إتمام الطلب'
                      }
                    </span>
                    {orderStatus !== 'submitting' && Number(product.stock) > 0 && (
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
            <span>اشتري الآن</span>
            <ShoppingBag size={22} className="animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
}
