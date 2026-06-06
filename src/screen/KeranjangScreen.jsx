import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from '../../CartContext'; // Path sudah benar jika CartContext di root
import ConfirmationModal from '../DetailProduk/ConfirmationModal'; // Import modal

function KeranjangScreen({ navigation }) {
  // Ambil semua data dan fungsi dari CartContext
  const { 
    cartItems, 
    increaseQty, 
    decreaseQty, 
    deleteItem,
    updateItem,
    toggleItemSelected,
  } = useCart(); 

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
      // Ubah harga dari string (misal: "Rp 75.000") menjadi angka (75000) sebelum kalkulasi
      const priceString = String(item.price || '0'); // Pastikan item.price adalah string
      const priceAsNumber = parseInt(priceString.replace(/[^0-9]/g, ''), 10);
      // Jika parsing gagal (misal, string kosong), default ke 0
      if (isNaN(priceAsNumber)) return sum;
      return sum + priceAsNumber * item.qty; // Kalkulasi sudah benar, hanya sumber datanya yang diubah
    },
    0
  );

  // Fungsi untuk membuka modal edit
  const handleEditPress = useCallback((item) => {
    setCurrentItemToEdit(item);
    setEditModalVisible(true);
  }, []);

  // Fungsi untuk mengkonfirmasi perubahan dari modal
  const handleConfirmEdit = useCallback((options) => {
    if (currentItemToEdit) {
      updateItem(currentItemToEdit.cartItemId, options);
    }
    setEditModalVisible(false);
    setCurrentItemToEdit(null);
  }, [currentItemToEdit, updateItem]);

  // Fungsi untuk menangani checkout
  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      // Navigasi ke halaman Checkout dengan membawa data item yang dipilih
      // Penghapusan item sebaiknya dilakukan setelah checkout berhasil, bukan di sini.
      navigation.navigate('Checkout', { items: selectedItems, total: totalPrice });
    }
  };

  return (
    <View style={styles.container}>
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
              {/* Menggunakan source={item.image} untuk gambar lokal dari 'require' */}
              <Image source={item.image} style={styles.itemImage} />

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

                <Text style={styles.itemPrice}>Rp {parseInt(String(item.price || '0').replace(/[^0-9]/g, ''), 10).toLocaleString()}</Text>

                {/* QTY */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => decreaseQty(item.cartItemId)}
                  >
                    <Ionicons name="remove" size={14} color="#000" />
                  </TouchableOpacity>

                  <Text style={styles.qtyValue}>{item.qty}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => increaseQty(item.cartItemId)}
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
                  onPress={() => deleteItem(item.cartItemId)}
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
