import React, { createContext, useState } from 'react';

// 1. Membuat Context
export const CartContext = createContext();

// 2. Membuat Provider Komponen
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Fungsi untuk menambah item ke keranjang
  const addToCart = (product) => {
    // product sekarang berisi { id, name, ..., size, type, quantity }
    setCartItems((prevItems) => {
      // Membuat ID unik untuk varian produk
      const cartItemId = `${product.id}-${product.size}-${product.type}`;

      // Cari item yang ada berdasarkan ID unik yang baru dibuat
      const existingItem = prevItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        // Jika item yang sama persis sudah ada, tambahkan kuantitasnya
        return prevItems.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, qty: product.quantity }
            : item
        );
      } else {
        // Jika belum ada, tambahkan item baru dengan qty dari modal
        return [...prevItems, { ...product, qty: product.quantity, cartItemId: cartItemId }];
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

  // Fungsi untuk menambah qty, sekarang menggunakan cartItemId
  const increaseQty = (cartItemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // Fungsi untuk menghapus item, sekarang menggunakan cartItemId
  const deleteItem = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Fungsi untuk mengupdate item yang ada (ukuran, jenis, kuantitas)
  const updateItem = (oldCartItemId, newOptions) => {
    // newOptions akan berisi { size, type, quantity }
    setCartItems((prevItems) => {
      // Ambil data item lama
      const itemToUpdate = prevItems.find(item => item.cartItemId === oldCartItemId);
      if (!itemToUpdate) return prevItems; // Jika item tidak ditemukan, jangan lakukan apa-apa

      // Buat ID baru berdasarkan opsi yang dipilih di modal
      const newCartItemId = `${itemToUpdate.id}-${newOptions.size}-${newOptions.type}`;

      // Hapus item lama dari keranjang
      const filteredItems = prevItems.filter(item => item.cartItemId !== oldCartItemId);

      // Cek apakah varian baru (hasil editan) sudah ada di keranjang
      const existingItem = filteredItems.find(item => item.cartItemId === newCartItemId);

      if (existingItem) {
        // Jika sudah ada, update kuantitasnya saja (jangan tambahkan, tapi set)
        return filteredItems.map(item =>
          item.cartItemId === newCartItemId
            ? { ...item, qty: newOptions.quantity }
            : item
        );
      } else {
        // Jika varian baru belum ada, buat item baru dengan data yang diperbarui
        const updatedItem = { ...itemToUpdate, ...newOptions, qty: newOptions.quantity, cartItemId: newCartItemId };
        return [...filteredItems, updatedItem];
      }
    });
  };

  // Fungsi untuk menandai item (dipilih/tidak)
  const toggleItemSelected = (cartItemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  // Fungsi untuk menghapus item yang dipilih
  const removeSelectedItems = () => {
    setCartItems((prev) => prev.filter((item) => !item.selected));
  };
  // Menghitung total kuantitas semua item di keranjang
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. (Opsional) Custom Hook untuk mempermudah penggunaan context
export const useCart = () => {
    const context = React.useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}