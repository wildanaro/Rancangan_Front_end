import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../CartContext'; // Import useCart

function PesananScreen({ route, navigation }) {
  const { orders, addOrder, cancelOrder } = useCart(); // Gunakan state dan fungsi dari context
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    // Jika ada pesanan baru dari checkout, tambahkan ke daftar pesanan
    if (route.params?.order) {
      addOrder(route.params.order); // Panggil fungsi addOrder dari context

      // Hapus parameter agar tidak ditambahkan lagi saat re-render
      navigation.setParams({ order: null });
    }
  }, [route.params?.order]);

  // Jika tidak ada data pesanan, tampilkan pesan
  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Belum ada pesanan yang dibuat.</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate("Tabs", { screen: "Beranda" })}
          >
            <Text style={styles.buttonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  const cancellationReasons = [
    "Ingin mengubah detail pesanan (produk/alamat)",
    "Salah memilih produk atau varian",
    "Menemukan penawaran yang lebih baik",
    "Tidak sengaja membuat pesanan",
    "Alasan pribadi lainnya",
  ];

  /**
   * Menampilkan modal konfirmasi pembatalan untuk pesanan yang dipilih.
   */
  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setCancelModalVisible(true);
  };

  /**
   * Mengkonfirmasi pembatalan dan menghapus pesanan dari daftar.
   */
  const handleConfirmCancellation = (reason) => {
    console.log(`Pesanan ID ${orderToCancel} dibatalkan dengan alasan:`, reason);
    cancelOrder(orderToCancel); // Panggil fungsi cancelOrder dari context
    setCancelModalVisible(false); // Tutup modal
    setOrderToCancel(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderContainer}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Informasi Pemesan</Text>
              <Text style={styles.infoText}>Nama: {order.buyerName}</Text>
              <Text style={styles.infoText}>Alamat: {order.address}</Text>
              <Text style={styles.infoText}>No. WA: {order.phone}</Text>
              <Text style={styles.infoText}>Catatan: {order.note || '-'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Produk yang Dipesan</Text>
              {order.items.map(item => (
                <View key={item.cartItemId || item.id} style={styles.itemCard}>
                  <Image source={item.image} style={styles.itemImage} />
              
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {(item.size || item.type) && (
                      <View style={styles.itemOptionsContainer}>
                        {item.size && (
                          <Text style={styles.itemOptionText}>Ukuran: {item.size}</Text>
                        )}
                        {item.type && (
                          <Text style={styles.itemOptionText}>Warna: {item.type}</Text>
                        )}
                      </View>
                    )}
                    <Text style={styles.itemQty}>Jumlah: {item.qty}</Text>
                    <Text style={styles.itemPrice}>Rp {item.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
              <View style={styles.row}>
                <Text>Metode Pembayaran</Text>
                <Text style={styles.bold}>
                  {order.paymentMethod} {order.bankType ? `(${order.bankType})` : ''}
                </Text>
              </View>
              <View style={styles.row}>
                <Text>Subtotal</Text>
                <Text>Rp {order.total.toLocaleString()}</Text>
              </View>
              <View style={styles.row}>
                <Text>Ongkos Kirim ({order.shippingMethod})</Text>
                <Text>Rp {order.shippingCost.toLocaleString()}</Text>
              </View>
              <View style={styles.row}>
                <Text>Diskon</Text>
                <Text style={{ color: '#D9534F' }}>- Rp {order.discount.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.totalLabel}>Total Pembayaran</Text>
                <Text style={styles.totalPrice}>Rp {order.finalTotal.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => handleCancelOrder(order.id)}
            >
              <Ionicons name="close-circle-outline" size={20} color="#D9534F" />
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Batalkan Pesanan Ini</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate("Tabs", { screen: "Beranda" })}
        >
          <Text style={styles.buttonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL UNTUK ALASAN PEMBATALAN */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isCancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Alasan Pembatalan</Text>
            {cancellationReasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reasonButton}
                onPress={() => handleConfirmCancellation(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCancelModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#F8F9FA' },

  centered: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20 },

  orderContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
  },
  content: { 
    padding: 15 },

  card: { 
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0D1B2A' },

  infoText: { 
    fontSize: 15,
    marginBottom: 5,
    color: '#555' },

  itemCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10 },

   // Gambar produk di dalam kartu item
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  // Kontainer untuk informasi produk (nama, harga, qty)
  itemInfo: { flex: 1 },

  // Nama produk di dalam kartu item
  itemName: { fontSize: 16, fontWeight: "bold", color: '#0D1B2A' },
  
  // Kontainer untuk opsi produk (ukuran, warna)
  itemOptionsContainer: {
   flexDirection: 'row',
    marginTop: 3,
  },

  // Teks untuk setiap opsi produk
  itemOptionText: {
    fontSize: 12,
    color: '#555',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 8,
  },
  // Teks jumlah (quantity) produk
  itemQty: { color: "#666", marginTop: 4 },
  // Teks harga satuan produk
  itemPrice: { marginTop: 3, color: "#555" },

  // Teks total harga per item (harga * qty)
  itemTotalPrice: { fontSize: 16, fontWeight: "700" },

  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 },

  bold: { fontWeight: '600' },

  divider: { 
    height: 1, 
    backgroundColor: '#dedede', 
    marginVertical: 10 },

  totalLabel: { 
    fontSize: 16, 
    fontWeight: 'bold' },

  totalPrice: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#D9534F' },

  emptyText: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 20 },

  button: {
    backgroundColor: '#0D1B2A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D9534F',
    marginBottom: 10,
  },

  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    marginLeft: 8,
  },

  cancelButtonText: {
    color: '#D9534F',
  },

  // STYLES FOR CANCELLATION MODAL
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#0D1B2A',
  },
  reasonButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reasonText: {
    fontSize: 16,
    color: '#0D1B2A',
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
});

export default PesananScreen;