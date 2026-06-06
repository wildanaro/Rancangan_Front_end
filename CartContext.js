import React, { createContext, useState, useContext } from 'react';

// 1. Membuat Context
export const CartContext = createContext();

// 2. Membuat Provider Komponen
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fungsi untuk menambah item ke keranjang
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Cari item yang sama persis (ID, Ukuran, dan Jenis)
      const existingItem = prevItems.find(
        (item) =>
          item.id === product.id &&
          item.size === product.size &&
          item.type === product.type
      );

      if (existingItem) {
        // Jika sudah ada, tambahkan qty dari produk yang ditambahkan
        return prevItems.map((item) =>
          item.cartItemId === existingItem.cartItemId 
            // Perbarui qty dan juga harga (untuk kasus diskon)
            ? { ...item, qty: item.qty + (product.qty || 1), price: product.price } 
            : item
        );
      } else {
        // Jika belum ada, tambahkan item baru dengan qty dan cartItemId unik
        const newCartItem = {
          ...product,
          qty: product.qty || 1, // Gunakan qty dari produk, atau default ke 1
          cartItemId: `cart-${Date.now()}-${Math.random()}`, // ID unik untuk item di keranjang
          selected: true, // Item baru otomatis terpilih secara default
        };
        return [...prevItems, newCartItem];
      }
    });
  };

  // Fungsi untuk mengurangi qty
  const decreaseQty = (cartItemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  // Fungsi untuk menambah qty
  const increaseQty = (cartItemId) => {
    setCartItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  // Fungsi untuk menghapus item
  const deleteItem = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Fungsi untuk mengupdate opsi item (size, type)
  const updateItem = (cartItemId, newOptions) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? 
          (() => {
            // Salin newOptions agar kita bisa memodifikasinya
            const updatedOptions = { ...newOptions };
            // Jika ada 'quantity' di opsi baru, ubah namanya menjadi 'qty'
            if (updatedOptions.hasOwnProperty('quantity')) {
              updatedOptions.qty = updatedOptions.quantity;
              delete updatedOptions.quantity; // Hapus properti 'quantity' yang lama
            }
            return { ...item, ...updatedOptions }; // Gabungkan item lama dengan opsi yang sudah disesuaikan
          })() : item
      )
    );
  };

  // Fungsi untuk toggle status item (terpilih/tidak)
  const toggleItemSelected = (cartItemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Fungsi untuk menghapus semua item yang terpilih
  const deleteSelectedItems = () => {
    setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
  };

  // Fungsi untuk mengosongkan keranjang (setelah checkout)
  const clearCart = () => {
    setCartItems([]);
  };

  // Fungsi untuk menambah pesanan baru
  const addOrder = (newOrder) => {
    const orderWithId = { ...newOrder, id: `order-${Date.now()}` };
    setOrders(prevOrders => [orderWithId, ...prevOrders]);
    // Setelah pesanan berhasil dibuat, kosongkan item yang terpilih dari keranjang
    setCartItems(prevItems => prevItems.filter(item => !item.selected));
  };

  // Fungsi untuk membatalkan/menghapus pesanan
  const cancelOrder = (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  // Menghitung total item unik di keranjang
  const cartItemCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        addOrder,
        cancelOrder,
        addToCart,
        decreaseQty,
        increaseQty,
        deleteItem,
        cartItemCount,
        updateItem,
        toggleItemSelected,
        deleteSelectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. Custom Hook untuk mempermudah penggunaan context
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}