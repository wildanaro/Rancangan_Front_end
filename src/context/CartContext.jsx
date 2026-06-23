import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../Service/api';

export const CartContext = createContext();

export const getProductImage = (image) => {
  if (!image) return null;
  if (typeof image !== 'string') return image;
  if (image.startsWith('http')) return { uri: image };
  return { uri: `http://10.89.16.228:8000/storage/${image}` };
};

const mapServerItem = (serverItem) => {
  const product = serverItem.product;
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: getProductImage(product.image),
    qty: serverItem.quantity,
    size: serverItem.size,
    type: serverItem.color,
    cartId: serverItem.id,
    cartItemId: `${product.id}-${serverItem.size}-${serverItem.color}`,
    selected: false,
  };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems]     = useState([]);
  const [orders, setOrders]           = useState([]);
  const [orderCount, setOrderCount]   = useState(0); // ← TAMBAHAN
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Ambil seluruh isi cart dari server
  const fetchCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;

      const response = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const mapped = response.data.data.map(mapServerItem);
        setCartItems(mapped);
      }
    } catch (error) {
      console.log('Fetch Cart Error:', error.response?.data || error.message);
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  // ── TAMBAHAN: Ambil jumlah pesanan aktif untuk badge ──
  const fetchOrderCount = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;

      const response = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const activeOrders = response.data.data.filter(o =>
          ['pending', 'processing', 'shipped'].includes(o.status)
        );
        setOrderCount(activeOrders.length);
      }
    } catch (error) {
      console.log('Fetch Order Count Error:', error.message);
    }
  }, []);

  // Fetch cart & order count saat pertama kali load
  useEffect(() => {
    fetchCart();
    fetchOrderCount(); // ← TAMBAHAN
  }, [fetchCart, fetchOrderCount]);

  // Fungsi untuk menambah item ke keranjang
  const addToCart = async (product) => {
    console.log('=== PRODUCT DIKIRIM ===', JSON.stringify(product));

    const cartItemId = `${product.id}-${product.size}-${product.color}`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, qty: item.qty + product.qty }
            : item
        );
      } else {
        return [...prevItems, { ...product, qty: product.qty, cartItemId }];
      }
    });

    try {
      const token = await SecureStore.getItemAsync('token');
      console.log('=== TOKEN ADD TO CART ===', token);

      const response = await api.post(
        '/cart',
        {
          product_id: product.id,
          quantity: product.qty,
          size: product.size,
          color: product.color,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('=== ADD TO CART SUCCESS ===', JSON.stringify(response.data));

      if (response.data.success) {
        const updatedItem = mapServerItem(response.data.data);
        setCartItems((prevItems) => {
          const filtered = prevItems.filter(
            (item) => item.cartItemId !== cartItemId
          );
          return [...filtered, updatedItem];
        });
      }
    } catch (error) {
      console.log('=== ADD TO CART ERROR ===', error.response?.status, JSON.stringify(error.response?.data) || error.message);
      fetchCart();
    }
  };

  const decreaseQty = async (cartItemId) => {
    const item = cartItems.find((i) => i.cartItemId === cartItemId);
    if (!item || item.qty <= 1) return;

    const newQty = item.qty - 1;
    setCartItems((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, qty: newQty } : i
      )
    );
    await syncUpdateQty(item.cartId, newQty);
  };

  const increaseQty = async (cartItemId) => {
    const item = cartItems.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    const newQty = item.qty + 1;
    setCartItems((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, qty: newQty } : i
      )
    );
    await syncUpdateQty(item.cartId, newQty);
  };

  const syncUpdateQty = async (cartId, quantity) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      await api.put(
        `/cart/${cartId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log('Update Qty Error:', error.response?.data || error.message);
      fetchCart();
    }
  };

  const deleteItem = async (cartItemId) => {
    const item = cartItems.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));

    try {
      const token = await SecureStore.getItemAsync('token');
      await api.delete(`/cart/${item.cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.log('Delete Item Error:', error.response?.data || error.message);
      fetchCart();
    }
  };

  const updateItem = async (oldCartItemId, newOptions) => {
    const itemToUpdate = cartItems.find(item => item.cartItemId === oldCartItemId);
    if (!itemToUpdate) return;

    const newCartItemId = `${itemToUpdate.id}-${newOptions.size}-${newOptions.color}`;

    try {
      const token = await SecureStore.getItemAsync('token');

      await api.delete(`/cart/${itemToUpdate.cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await api.post(
        '/cart',
        {
          product_id: itemToUpdate.id,
          quantity: newOptions.qty,
          size: newOptions.size,
          color: newOptions.color,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedItem = mapServerItem(response.data.data);
        setCartItems((prevItems) => {
          const filtered = prevItems.filter(
            item => item.cartItemId !== oldCartItemId && item.cartItemId !== newCartItemId
          );
          return [...filtered, updatedItem];
        });
      }
    } catch (error) {
      console.log('Update Item Error:', error.response?.data || error.message);
      fetchCart();
    }
  };

  const toggleItemSelected = (cartItemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const removeSelectedItems = async () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    setCartItems((prev) => prev.filter((item) => !item.selected));

    try {
      const token = await SecureStore.getItemAsync('token');
      await Promise.all(
        selectedItems.map((item) =>
          api.delete(`/cart/${item.cartId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
    } catch (error) {
      console.log('Remove Selected Items Error:', error.response?.data || error.message);
      fetchCart();
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decreaseQty,
        increaseQty,
        deleteItem,
        updateItem,
        cartItemCount,
        toggleItemSelected,
        removeSelectedItems,
        fetchCart,
        isLoadingCart,
        orders,
        setOrders,
        orderCount,       // ← TAMBAHAN
        fetchOrderCount,  // ← TAMBAHAN
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};