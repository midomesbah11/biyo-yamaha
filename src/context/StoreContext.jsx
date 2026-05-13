/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { productsData as initialProducts } from '../data/products';
import { supabase } from '../lib/supabase';

export const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!productsError && productsData && productsData.length > 0) {
          const formattedProducts = productsData.map(p => ({
            ...p,
            subCategory: p.sub_category,
            oldPrice: p.old_price,
            stock: Number(p.stock) || 0
          }));
          setProducts(formattedProducts);
        } else {
          // Fallback
          const saved = localStorage.getItem('biyo_products');
          if (saved) setProducts(JSON.parse(saved));
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData && ordersData.length > 0) {
          const formattedOrders = ordersData.map(o => ({
            ...o,
            customer: o.customer_name,
            productName: o.product_name,
            productImage: o.product_image,
            shippingType: o.shipping_type,
            rawPrice: o.raw_price,
            orderNumber: o.order_number,
            id: o.order_number
          }));
          setOrders(formattedOrders);
        } else {
          const saved = localStorage.getItem('biyo_orders');
          if (saved) setOrders(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error fetching from Supabase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('realtime-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? {
              ...p,
              ...payload.new,
              subCategory: payload.new.sub_category,
              oldPrice: payload.new.old_price,
              stock: Number(payload.new.stock) || 0
            } : p));
          } else if (payload.eventType === 'INSERT') {
            const newProd = {
              ...payload.new,
              subCategory: payload.new.sub_category,
              oldPrice: payload.new.old_price,
              stock: Number(payload.new.stock) || 0
            };
            setProducts(prev => [newProd, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const o = payload.new;
          const newOrder = {
            ...o,
            customer: o.customer_name,
            productName: o.product_name,
            productImage: o.product_image,
            shippingType: o.shipping_type,
            rawPrice: o.raw_price,
            orderNumber: o.order_number,
            id: o.order_number
          };
          // Don't add if we already added it optimistically
          setOrders(prev => {
            if (prev.find(order => order.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);


  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('biyo_products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('biyo_orders', JSON.stringify(orders));
    }
  }, [orders, isLoading]);

  // Sync state across multiple browser tabs automatically
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'biyo_products' && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
      if (e.key === 'biyo_orders' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addProduct = async (product) => {
    try {
      const dbProduct = {
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        sub_category: product.subCategory,
        images: product.images || [],
        slug: product.slug,
        badge: product.badge || null,
        rating: 5.0,
        stock: product.stock || 0
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select();

      if (data && data[0]) {
        const newProduct = { ...product, id: data[0].id };
        setProducts([newProduct, ...products]);
      } else {
        console.error("Error inserting product:", error);
        const newProduct = { ...product, id: Date.now() };
        setProducts([newProduct, ...products]);
      }
    } catch (err) {
      console.error("🚨 Unexpected error adding product:", err);
      alert(`حدث خطأ غير متوقع: ${err.message}`);
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const numericStock = Number(updatedData.stock) || 0;
      const dbProduct = {
        name: updatedData.name,
        price: updatedData.price,
        description: updatedData.description,
        category: updatedData.category,
        sub_category: updatedData.subCategory || null,
        images: updatedData.images || [],
        stock: numericStock,
        slug: updatedData.slug || '',
        badge: updatedData.badge || null
      };

      // Optimistic Update
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData, stock: numericStock } : p));

      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating product:", error);
        alert("Erreur: " + error.message);
      } else if (!data || data.length === 0) {
        console.warn("Product update silent failure. Check RLS policies.");
        alert("لم يتم التحديث فعلياً في قاعدة البيانات! يرجى التحقق من صلاحيات RLS (UPDATE) في Supabase.");
      }
    } catch (err) {
      console.error("🚨 Unexpected error updating product:", err);
      alert(`حدث خطأ غير متوقع أثناء التحديث: ${err.message}`);
    }
  };


  const deleteProduct = async (id) => {
    try {
      console.log(`Attempting to delete product ${id}...`);
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error("🚨 Error deleting product:", error);
        console.error("Details:", error.details, "Hint:", error.hint, "Code:", error.code);
        alert(`فشل الحذف! الخطأ: ${error.message}\nتأكد من عدم وجود قيود (Foreign Key) تمنع الحذف.`);
      } else if (!data || data.length === 0) {
        console.warn("🚨 Delete silent failure (RLS restriction). Product was not deleted in Supabase.");
        alert("لم يتم الحذف في قاعدة البيانات! يبدو أن هناك قيد في صلاحيات RLS (Delete) يمنع الحذف.");
        
        // Auto-refresh to sync UI with DB
        const { data: refreshData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (refreshData) setProducts(refreshData);
      } else {
        console.log("✅ Product deleted successfully:", data);
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("🚨 Unexpected error deleting product:", err);
      alert(`حدث خطأ غير متوقع أثناء الحذف: ${err.message}`);
    }
  };

  const addOrder = async (order) => {
    try {
      const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        ...order,
        id: orderNumber,
        orderNumber: orderNumber,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: Date.now(),
        status: 'En attente'
      };

      const dbOrder = {
        order_number: orderNumber,
        customer_name: order.customer,
        phone: order.phone,
        wilaya: order.wilaya,
        commune: order.commune,
        product_name: order.productName,
        product_image: order.productImage,
        quantity: order.quantity || 1,
        shipping_type: order.shippingType,
        price: order.price,
        raw_price: order.rawPrice,
        status: 'En attente'
      };


      console.log("Attempting to insert order:", dbOrder);
      let { data, error } = await supabase
        .from('orders')
        .insert([dbOrder])
        .select();

      // Fallback au cas où la colonne 'quantity' n'existe pas encore dans Supabase
      if (error && error.code === 'PGRST204' && error.message.includes('quantity')) {
        console.warn("⚠️ Colonne 'quantity' manquante dans Supabase, tentative sans la quantité...");
        const { quantity, ...dbOrderWithoutQty } = dbOrder;
        const retry = await supabase.from('orders').insert([dbOrderWithoutQty]).select();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("🚨 Error inserting order in Supabase:", error);
        console.error("Details:", error.details, "Hint:", error.hint, "Code:", error.code);
        alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.");
        return false;
      } else if (!data || data.length === 0) {
        console.warn("🚨 Order insert silent failure! Blocked by RLS policies. Admin will not see this order.");
        alert("عذراً، لا نملك صلاحية حفظ الطلب! يرجى التأكد من إعدادات RLS (Insert) في Supabase.");
        return false;
      } else {
        console.log("✅ Order successfully saved to Supabase:", data);
        // Only update local state if successfully saved in DB
        setOrders([newOrder, ...orders]);
        window.dispatchEvent(new CustomEvent('new_order', { detail: newOrder }));
        return true;
      }
    } catch (err) {
      console.error("🚨 Unexpected error adding order:", err);
      alert(`حدث خطأ غير متوقع أثناء إرسال الطلب: ${err.message}`);
      return false;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: status })
        .eq('order_number', orderId);

      if (error) console.error("Error updating order status:", error);

      // If order is confirmed, decrement stock
      if (status === 'Confirmé') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const product = products.find(p => p.name === order.productName);
          if (product && product.stock > 0) {
            const orderQty = order.quantity || 1;
            const newStock = Math.max(0, product.stock - orderQty);

            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', product.id);

            if (!stockError) {
              setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
            }
          }
        }
      }

      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error("🚨 Unexpected error updating order status:", err);
      alert(`حدث خطأ غير متوقع: ${err.message}`);
    }
  };

  return (
    <StoreContext.Provider value={{
      products, orders, addProduct, updateProduct, deleteProduct, addOrder, updateOrderStatus, isLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
}
