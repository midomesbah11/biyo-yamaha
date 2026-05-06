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
            stock: p.stock ?? 0
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
  };

  const updateProduct = async (id, updatedData) => {
    const dbProduct = {
      name: updatedData.name,
      price: updatedData.price,
      description: updatedData.description,
      category: updatedData.category,
      sub_category: updatedData.subCategory,
      images: updatedData.images,
      stock: updatedData.stock,
      slug: updatedData.slug,
      badge: updatedData.badge
    };

    const { error } = await supabase
      .from('products')
      .update(dbProduct)
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    } else {
      console.error("Error updating product:", error);
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      console.error("Error deleting product:", error);
    }
  };

  const addOrder = async (order) => {
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
      price: order.price,
      raw_price: order.rawPrice,
      status: 'En attente'
    };

    const { error } = await supabase
      .from('orders')
      .insert([dbOrder]);

    if (error) console.error("Error inserting order:", error);

    setOrders([newOrder, ...orders]);
    window.dispatchEvent(new CustomEvent('new_order', { detail: newOrder }));
  };

  const updateOrderStatus = async (orderId, status) => {
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
          const newStock = product.stock - 1;
          
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
  };

  return (
    <StoreContext.Provider value={{ 
      products, orders, addProduct, updateProduct, deleteProduct, addOrder, updateOrderStatus, isLoading 
    }}>
      {children}
    </StoreContext.Provider>
  );
}
