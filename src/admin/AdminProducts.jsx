import { useState, useContext } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

export default function AdminProducts() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { products, addProduct, updateProduct, deleteProduct } = useContext(StoreContext);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    subCategory: '',
    images: [],
    stock: ''
  });

  const handleImageUpload = async (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      alert("Veuillez configurer VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET dans le fichier .env");
      return;
    }

    const formDataToUpload = new FormData();
    formDataToUpload.append('file', file);
    formDataToUpload.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataToUpload
      });
      
      const result = await response.json();
      if (response.ok && result.secure_url) {
        let optimizedUrl = result.secure_url;
        const transformations = "f_webp,q_auto:best,cs_srgb,w_1200,c_limit";
        
        const parts = optimizedUrl.split('/upload/');
        if (parts.length === 2) {
          let pathWithWebp = parts[1].replace(/\.[^/.]+$/, ".webp");
          optimizedUrl = `${parts[0]}/upload/${transformations}/${pathWithWebp}`;
        }

        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, optimizedUrl] 
        }));
      } else {
        console.error("Cloudinary error:", result);
        alert("Erreur: " + (result.error?.message || "Le téléchargement a échoué."));
      }
    } catch (error) {
      console.error("Upload exception:", error);
      alert("Erreur de connexion lors du téléchargement.");
    } finally {
      fileInput.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      subCategory: formData.category === 'Accessoires' ? formData.subCategory : '',
      slug: formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      price: formData.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      stock: parseInt(formData.stock) || 0
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    handleCloseForm();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price ? product.price.toString().replace(/,/g, '').replace(' DA', '').trim() : '',
      description: product.description,
      category: product.category,
      subCategory: product.subCategory || '',
      images: product.images || (product.image ? [product.image] : []),
      stock: product.stock !== undefined && product.stock !== null ? product.stock.toString() : ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
      deleteProduct(id);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', description: '', category: '', subCategory: '', images: [], stock: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Produits</h2>
          <p className="text-zinc-400 mt-1">Gérez votre inventaire de pièces et motos.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            handleCloseForm();
            setShowAddForm(true);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl transition-all shadow-lg font-medium bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
        >
          <Plus size={20} />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Low Stock Alerts */}
      {products.some(p => p.stock > 0 && p.stock < 3) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
             <Plus className="rotate-45" size={24} />
          </div>
          <div>
            <h4 className="text-amber-500 font-bold">Alerte: Stock Faible</h4>
            <p className="text-amber-500/70 text-sm">Certains produits ont moins de 3 unités en stock.</p>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={handleCloseForm}
              className="absolute top-6 right-6 p-2 bg-zinc-800/50 hover:bg-red-600 text-zinc-400 hover:text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">
              {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Text Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Nom du produit</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="Ex: Casque MT Thunder" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Prix (DA)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="Ex: 15000" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Description</label>
                    <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="Description du produit..."></textarea>
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Quantité en Stock</label>
                    <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" placeholder="Ex: 10" />
                  </div>
                </div>

                {/* Categories & Image */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Catégorie</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 appearance-none transition-all cursor-pointer"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      <option value="Motos Risol">Motos Risol</option>
                      <option value="Accessoires">Accessoires</option>
                      <option value="Casques">Casques</option>
                      <option value="Vêtements">Vêtements</option>
                    </select>
                  </div>

                  {formData.category === 'Accessoires' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                      <label className="block text-zinc-400 text-sm font-medium mb-2 text-red-500">Sous-catégorie (Accessoires)</label>
                      <select 
                        value={formData.subCategory}
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                        className="w-full bg-red-950/20 border border-red-900/30 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 appearance-none transition-all cursor-pointer"
                      >
                        <option value="">Sélectionnez une sous-catégorie</option>
                        <option value="Crash Bars">Crash Bars</option>
                        <option value="Crash Radiateur">Crash Radiateur</option>
                        <option value="Les Pots">Les Pots</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Images du produit (Upload direct)</label>
                    
                    {formData.images && formData.images.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((imgUrl, idx) => (
                            <div key={idx} className="relative border-2 border-zinc-800 rounded-xl overflow-hidden group h-32">
                              <img src={imgUrl} alt={`Preview ${idx}`} className="w-full h-full object-contain bg-[#111111]" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button 
                                  type="button"
                                  onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                                  className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full flex items-center transition-all shadow-lg"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add more images button */}
                          <label 
                            className="border-2 border-dashed border-zinc-800 rounded-xl hover:border-red-600 hover:bg-red-950/10 cursor-pointer flex items-center justify-center bg-[#111111] h-32 transition-colors group relative"
                          >
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                            <Plus size={24} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                          </label>
                        </div>
                        
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-xs flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span>{formData.images.length} image(s) uploadée(s) avec succès</span>
                        </div>
                      </div>
                    ) : (
                      <label 
                        className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-red-600 hover:bg-red-950/10 transition-all cursor-pointer bg-[#111111] group relative"
                      >
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                        <div className="w-16 h-16 bg-zinc-900 group-hover:bg-red-600/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                          <Upload size={28} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-red-400 transition-colors">Sélectionner une image</h4>
                        <p className="text-zinc-500 text-sm">Upload direct vers Cloudinary</p>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-zinc-900 gap-4">
                <button type="button" onClick={handleCloseForm} className="px-6 py-3 rounded-xl font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-600/20">
                  {editingProduct ? 'Mettre à jour' : 'Enregistrer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-black border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800">
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Nom du Produit</th>
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Catégorie</th>
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Prix</th>
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm">Stock</th>
                <th className="py-4 px-6 text-zinc-400 font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors group">
                  <td className="py-4 px-6 text-white font-medium flex items-center space-x-4">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {product.images?.[0] || product.image ? (
                        <img src={(product.images?.[0] || product.image).split('?')[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-zinc-600" />
                      )}
                    </div>
                    <span className="group-hover:text-red-400 transition-colors truncate max-w-[200px]">{product.name}</span>
                  </td>
                  <td className="py-4 px-6 text-zinc-300">
                    <div className="flex items-center space-x-2">
                      <span className="whitespace-nowrap">{product.category}</span>
                      {product.subCategory && (
                        <span className="text-red-500 bg-red-500/10 border border-red-500/20 text-[10px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">
                          {product.subCategory}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white font-semibold whitespace-nowrap">{product.price} DA</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      product.stock === 0 ? 'bg-red-500/20 text-red-500' : 
                      product.stock < 3 ? 'bg-amber-500/20 text-amber-500' : 
                      'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {product.stock === 0 ? 'Rupture' : `${product.stock} Unités`}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-zinc-900">
          {products.map((product) => (
            <div key={product.id} className="p-4 flex flex-col gap-4 bg-black/50">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {product.images?.[0] || product.image ? (
                    <img src={(product.images?.[0] || product.image).split('?')[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-lg leading-tight truncate">{product.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-zinc-400 text-sm">{product.category}</span>
                    {product.subCategory && (
                      <span className="text-red-500 bg-red-500/10 border border-red-500/20 text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                        {product.subCategory}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-red-500 font-black text-lg">{product.price} DA</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      product.stock === 0 ? 'bg-red-500/20 text-red-500' : 
                      product.stock < 3 ? 'bg-amber-500/20 text-amber-500' : 
                      'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {product.stock === 0 ? 'Rupture' : `${product.stock} en stock`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="flex items-center justify-center space-x-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all border border-zinc-800 font-bold text-sm"
                >
                  <Edit2 size={16} />
                  <span>Modifier</span>
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center justify-center space-x-2 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition-all border border-red-600/20 font-bold text-sm"
                >
                  <Trash2 size={16} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
