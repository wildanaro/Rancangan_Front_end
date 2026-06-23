import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from '../Service/api';
import * as SecureStore from 'expo-secure-store';
import { useIsFocused } from '@react-navigation/native';
import ConfirmationModal from '../DetailProduk/ConfirmationModal'; // Import modal

function KeranjangScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gunakan useCallback agar referensi fungsi tidak berubah setiap render
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('token');
      const response = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const mapped = response.data.data.map(item => ({
          cartId: item.id,
          cartItemId: `${item.product_id}-${item.size}-${item.color}`,
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          qty: item.quantity,
          size: item.size,
          type: item.color,
          selected: false
        }));
        setCartItems(mapped);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Kosong karena api dan SecureStore bersifat stabil

  useEffect(() => {
    if (isFocused) fetchCart();
  }, [isFocused, fetchCart]);

  // Fungsi Update Quantity
  const updateQuantity = async (cartId, newQty) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      await api.put(`/cart/${cartId}`, { quantity: newQty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      alert("Gagal update jumlah");
    }
  };

  // Fungsi Hapus Item
  const deleteItem = async (cartId) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      await api.delete(`/cart/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      alert("Gagal menghapus item");
    }
  };

  // State untuk modal edit
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [currentItemToEdit, setCurrentItemToEdit] = useState(null);

  // Hitung jumlah total jenis produk di keranjang
  const totalUniqueItems = cartItems.length;

  // Filter item yang dipilih untuk checkout
  const selectedItems = cartItems.filter(item => item.selected === true);

  // Total harga hanya dari item yang dipilih
  const totalPrice = selectedItems.reduce(
    (sum, item) => {
      const price = Number(item.price || 0);
      return sum + price * item.qty;
    },
    0
  );

  // Handler Lokal
  const toggleItemSelected = (cartItemId) => {
    setCartItems(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, selected: !item.selected } : item
    ));
  };

  // Fungsi untuk membuka modal edit
  const handleEditPress = useCallback((item) => {
    setCurrentItemToEdit(item);
    setEditModalVisible(true);
  }, []);

  // Fungsi untuk mengkonfirmasi perubahan dari modal
  const handleConfirmEdit = useCallback(async (options) => {
    if (currentItemToEdit) {
      try {
        const token = await SecureStore.getItemAsync('token');
        // Skenario Update: Hapus yang lama, tambah yang baru (sesuai logic Laravel Sanctum Anda jika ID berubah)
        await api.delete(`/cart/${currentItemToEdit.cartId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await api.post('/cart', {
          product_id: currentItemToEdit.id,
          quantity: options.qty,
          size: options.size,
          color: options.type
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCart();
      } catch (error) {
        alert("Gagal update item");
      }
    }
    setEditModalVisible(false);
    setCurrentItemToEdit(null);
  }, [currentItemToEdit, fetchCart]);

  // Fungsi untuk menangani checkout
const handleCheckout = () => {
  const selectedItems = cartItems.filter(item => item.selected);
  if (selectedItems.length === 0) {
    Alert.alert("Peringatan", "Pilih minimal 1 produk untuk checkout.");
    return;
  }
  
  const itemsForCheckout = selectedItems.map(item => ({
    id: item.cartId, // PENTING: id baris cart di database
    name: item.name,
    price: item.price,
    image: item.image,
    qty: item.qty,
    size: item.size,
    type: item.type,
  }));
  
  navigation.navigate('Checkout', { items: itemsForCheckout, total: totalPrice });
};

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0D1B2A" />
        </View>
      )}

      {/* KONTEN */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Notifikasi Jumlah Produk */}
        {totalUniqueItems > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Anda memiliki {totalUniqueItems} jenis produk di keranjang.
            </Text>
          </View>
        )}
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={90} color="#ccc" />
            <Text style={styles.emptyText}>Keranjang masih kosong</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate("Tabs", { screen: "Beranda" })}
            >
              <Text style={styles.shopButtonText}>Mulai Belanja</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.cartItemId} style={styles.itemCard}>
              {/* CHECKBOX SELEKSI */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleItemSelected(item.cartItemId)}
              >
                <Ionicons 
                  name={item.selected ? "checkbox" : "checkbox-outline"} 
                  size={24} 
                  color={item.selected ? "#343A40" : "#aaa"} />
              </TouchableOpacity>
              {/* Mendukung gambar lokal (require) dan gambar string (uri) */}
              <Image
                source={
                  typeof item.image === 'string'
                    ? { uri: item.image.startsWith('http') ? item.image : `http://10.89.16.228:8000/storage/${item.image}` }
                    : item.image
                }
                style={styles.itemImage} 
              />

              <View style={styles.itemInfo}> 
                {/* Mengubah format harga dari string "Rp 120.000" menjadi angka */}
                <Text style={styles.itemName}>{item.name}</Text>
                
                {/* Tampilkan Ukuran dan Jenis jika ada */}
                {item.size && item.type && (
                  <View style={styles.itemOptionsContainer}>
                    <Text style={styles.itemOptionText}>Ukuran: {item.size}</Text>
                    <Text style={styles.itemOptionText}>Jenis: {item.type}</Text>
                  </View>
                )}

                <Text style={styles.itemPrice}>Rp {Number(item.price || 0).toLocaleString('id-ID')}</Text>

                {/* QTY */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => item.qty > 1 && updateQuantity(item.cartId, item.qty - 1)}
                  >
                    <Ionicons name="remove" size={14} color="#000" />
                  </TouchableOpacity>

                  <Text style={styles.qtyValue}>{item.qty}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.cartId, item.qty + 1)}
                  >
                    <Ionicons name="add" size={14} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tombol Aksi (Hapus & Edit) */}
              <View style={styles.actionsContainer}>
                {/* DELETE BUTTON */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => deleteItem(item.cartId)}
                >
                  <Ionicons name="trash-outline" size={16} color="red" />
                </TouchableOpacity>
                {/* EDIT BUTTON */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleEditPress(item)}>
                  <Ionicons name="pencil" size={14} color="#343A40" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FOOTER TOTAL */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <View>
              <Text style={styles.totalText}>Total ({selectedItems.length} item)</Text>
              <Text style={styles.totalPrice}>
                Rp {totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL EDIT */}
      {currentItemToEdit && (
        <ConfirmationModal
          visible={isEditModalVisible}
          productName={currentItemToEdit.name}
          initialSize={currentItemToEdit.size}
          initialType={currentItemToEdit.type}
          initialQuantity={currentItemToEdit.qty}
          onClose={() => setEditModalVisible(false)}
          onAddToCart={handleConfirmEdit}
        />
      )}
    </View>
  );
}

export default KeranjangScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8ff", // Disesuaikan dengan tema
  },

  content: {
    padding: 15,
    flexGrow: 1, // Memastikan konten bisa scroll dan mengisi ruang
  },

  // NOTIFIKASI JUMLAH PRODUK
  summaryContainer: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#0D1B2A',
  },

  summaryText: {
    fontSize: 14,
    color: '#0D1B2A',
  },

  // EMPTY STATE
  emptyCart: {
    marginTop: 100,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    marginTop: 15,
    color: "#777",
  },

  shopButton: {
    marginTop: 20,
    backgroundColor: "#0D1B2A", // Disesuaikan dengan tema
    padding: 12,
    borderRadius: 8,
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ITEM CARD
  itemCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 6,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    minHeight: 90, // Menetapkan tinggi minimum untuk semua kartu
    elevation: 1,
  },

  checkboxContainer: {
    padding: 5,
  },

  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 13,
    fontWeight: "bold",
  },

  itemOptionsContainer: {
    flexDirection: 'row',
    marginTop: 3,
  },

  itemOptionText: {
    fontSize: 9,
    color: '#555',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 8,
  },

  itemPrice: {
    marginTop: 5,
    fontSize: 12,
    color: "#e70000ff",
    fontWeight: "600",
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  qtyBtn: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 1,
    borderRadius: 5,
  },

  qtyValue: {
    marginHorizontal: 8,
    fontSize: 12,
  },

  actionsContainer: {
    justifyContent: 'flex-start', // Mengatur posisi tombol ke atas
    paddingVertical: 5, // Memberi sedikit padding vertikal
  },

  actionBtn: {
    padding: 4,
    marginBottom: 15, // Memberi jarak antar tombol aksi
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 10,
  },

  totalContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  totalText: {
    fontSize: 14,
    color: "#888",
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e70000ff",
  },

  checkoutButton: {
    backgroundColor: "#343A40", // Disesuaikan dengan tema
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    borderRadius: 8,
  },

  checkoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
