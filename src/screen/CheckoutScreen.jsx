import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Image, Alert, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from "expo-location";
import { ActivityIndicator } from 'react-native';
import api from '../Service/api';
import * as SecureStore from 'expo-secure-store';

/**
 * Komponen layar Checkout.
 * @param {object} props - Props dari React Navigation.
 * @param {object} props.route - Objek route yang berisi parameter navigasi.
 * @param {Array} props.route.params.items - Daftar item yang akan di-checkout.
 * @param {number} props.route.params.total - Total harga dari item yang dipilih.
 * @param {object} props.navigation - Objek navigasi untuk berpindah layar.
 */
function CheckoutScreen({ route, navigation }) {
  const { items, total } = route.params;

  const [shippingMethod, setShippingMethod] = useState("Reguler"); // State untuk metode pengiriman

  const [buyerName, setBuyerName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  // 🔥 PAYMENT STATES
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showBankOptions, setShowBankOptions] = useState(false);
  const [bankType, setBankType] = useState("");

  const [coords, setCoords] = useState(null); // State untuk menyimpan koordinat GPS
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kalkulasi biaya
  const shippingCost = shippingMethod === "Reguler" ? 12000 : 22000;
  const discount = 5000; 
  const finalTotal = total + shippingCost - discount;

  /**
   * Fungsi untuk mendapatkan lokasi GPS pengguna saat ini.
   * Meminta izin lokasi, mengambil koordinat, lalu mengubahnya menjadi alamat
   * menggunakan reverse geocoding dan mengisi state 'address'.
   */
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Izin Ditolak", "Aplikasi butuh akses lokasi.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setCoords(loc.coords);

    const addressInfo = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    if (addressInfo.length > 0) {
      const addr = addressInfo[0];
      const form =
        `${addr.street || ""}, ${addr.subregion || ""}, ${addr.region || ""}`;
      setAddress(form);
    }
  };

  /**
   * Fungsi yang dipicu saat tombol "Buat Pesanan" ditekan.
   * Fungsi ini melakukan validasi input, mengumpulkan semua detail pesanan,
   * menampilkan alert konfirmasi, dan kemudian menavigasi pengguna ke layar "Pesanan"
   * dengan membawa data pesanan yang baru dibuat.
   */
const handlePlaceOrder = async () => {
  if (!buyerName || !address || !phone) {
    Alert.alert("Data Belum Lengkap", "Isi semua data pengiriman.");
    return;
  }

  if (!paymentMethod) {
    Alert.alert("Pembayaran Belum Dipilih", "Pilih metode pembayaran terlebih dahulu.");
    return;
  }

  setIsSubmitting(true);

  try {
    const token = await SecureStore.getItemAsync('token');

    // cart_ids diambil dari item yang dikirim dari KeranjangScreen
    const cartIds = items.map(item => item.id || item.cartId);

    const response = await api.post('/checkout', {
      cart_ids: cartIds,
      buyer_name: buyerName,
      phone: phone,
      address: address,
      note: note,
      shipping_method: shippingMethod,
      shipping_cost: shippingCost,
      discount: discount,
      payment_method: paymentMethod,
      bank_type: bankType || null,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      Alert.alert(
        "Pesanan Dikonfirmasi",
        "Pesanan Anda telah berhasil dibuat. Lihat detailnya di halaman pesanan.",
        [{
          text: "OK",
          onPress: () => {
            navigation.navigate("Tabs", { screen: "Pesanan" });
          }
        }]
      );
    }
  } catch (error) {
    console.log('=== CHECKOUT ERROR ===', error.response?.data || error.message);
    Alert.alert(
      "Gagal",
      error.response?.data?.message || "Tidak dapat membuat pesanan."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* FORM */}
        <Text style={styles.sectionTitle}>Isi Data Pengiriman</Text>

        <TextInput 
          style={styles.input}
          placeholder="Nama Pemesan"
          value={buyerName}
          onChangeText={setBuyerName}
        />

        <TextInput 
          style={styles.input}
          placeholder="Nomor WhatsApp"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput 
          style={[styles.input, { height: 70 }]}
          placeholder="Alamat lengkap"
          multiline
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.mapButton} onPress={getLocation}>
          <Ionicons name="location-outline" size={22} color="#fff" />
          <Text style={styles.mapButtonText}>Ambil Lokasi dari Google Maps</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ALAMAT */}
        <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
        <View style={styles.addressCard}>
          <Ionicons name="location-outline" size={22} color="#0D1B2A" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.addressName}>{buyerName || "Nama belum diisi"}</Text>
            <Text style={styles.addressDetail}>{address || "Alamat belum diisi"}</Text>
            <Text style={styles.addressPhone}>{phone || "Nomor belum diisi"}</Text>

            {coords && (
              <Text style={{ marginTop: 5, fontSize: 12, color: "#555" }}>
                Koordinat: {coords.latitude}, {coords.longitude}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* DAFTAR PRODUK YANG DI-CHECKOUT */}
        {items.map(item => (
  <View key={item.cartItemId || item.id} style={styles.itemCard}>
    <Image 
      source={typeof item.image === 'string' 
        ? { uri: item.image.startsWith('http') ? item.image : `http://10.89.16.228:8000/storage/${item.image}` } 
        : item.image
      } 
      style={styles.itemImage} 
    />

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
      <Text style={styles.itemPrice}>Rp {Number (item.price).toLocaleString('id-ID')}</Text>
    </View>

    <Text style={styles.itemTotalPrice}>
      Rp {(Number(item.price) * item.qty).toLocaleString('id-ID')}
    </Text>
  </View>
))}

        <View style={styles.divider} />

        {/* CATATAN */}
        <Text style={styles.sectionTitle}>Catatan untuk Penjual</Text>
        <TextInput
          style={[styles.input, { height: 70 }]}
          placeholder="Tulis catatan (opsional)..."
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={styles.divider} />

        {/* PENGIRIMAN */}
        <Text style={styles.sectionTitle}>Opsi Pengiriman</Text>
        <TouchableOpacity 
          style={styles.shippingOption} 
          onPress={() => setShippingMethod("Reguler")}
        >
          <Ionicons 
            name={shippingMethod === "Reguler" ? "radio-button-on" : "radio-button-off"} 
            size={22} color="#0D1B2A" 
          />
          <Text style={styles.shippingText}>JNE Reguler (2–3 hari) - Rp 12.000</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shippingOption} 
          onPress={() => setShippingMethod("Cepat")}
        >
          <Ionicons 
            name={shippingMethod === "Cepat" ? "radio-button-on" : "radio-button-off"} 
            size={22} color="#0D1B2A" 
          />
          <Text style={styles.shippingText}>J&T Pengiriman Cepat (1 hari) - Rp 22.000</Text>
        </TouchableOpacity>
        

        <View style={styles.divider} />

<Text style={styles.sectionTitle}>Metode Pembayaran</Text>

{/* 1️⃣ COD */}
<TouchableOpacity 
  style={styles.optionButton}
  onPress={() => {
    setPaymentMethod("COD");
    setBankType(""); // Reset pilihan bank
    setShowBankOptions(false);
  }}
>
  <Ionicons 
    name={paymentMethod === "COD" ? "radio-button-on" : "radio-button-off"} 
    size={22} color="#0D1B2A" 
  />
  <Text style={styles.optionText}>COD (Bayar di Tempat)</Text>
</TouchableOpacity>

{/* 2️⃣ TRANSFER BANK */}
<TouchableOpacity 
  style={styles.optionButton}
  onPress={() => {
    setPaymentMethod("Transfer Bank");
    setShowBankOptions(true); // Selalu tampilkan jika transfer bank dipilih
  }}
>
  <Ionicons 
    name={paymentMethod === "Transfer Bank" ? "radio-button-on" : "radio-button-off"} 
    size={22} color="#0D1B2A" 
  />
  <Text style={styles.optionText}>Transfer Bank</Text>
</TouchableOpacity>

{/* 🔥 SUBMENU BANK */}
{showBankOptions && paymentMethod === "Transfer Bank" && (
  <View style={{ marginLeft: 35, marginTop: 10 }}>

    {["Dana", "GoPay", "OVO", "BRI", "BNI", "Mandiri", "BSI"].map(bank => (
      <TouchableOpacity
        key={bank}
        style={styles.bankOption}
        onPress={() => setBankType(bank)}
      >
        <Ionicons
          name={bankType === bank ? "radio-button-on" : "radio-button-off"}
          size={20}
          color="#0D1B2A"
        />
        <Text style={styles.bankText}>{bank}</Text>
      </TouchableOpacity>
    ))}

  </View>
)}


        {/* PEMBAYARAN */}
        <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
        <View style={styles.paymentRow}>
          <Text>Subtotal</Text>
          <Text>Rp {total.toLocaleString()}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text>Ongkos Kirim</Text>
          <Text>Rp {shippingCost.toLocaleString()}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text>Diskon</Text>
          <Text style={{ color: "#D9534F" }}>- Rp {discount.toLocaleString()}</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalText}>Total Pembayaran</Text>
          <Text style={styles.totalPrice}>Rp {finalTotal.toLocaleString()}</Text>
        </View>

        <TouchableOpacity 
  style={[styles.placeOrderButton, isSubmitting && { opacity: 0.6 }]} 
  onPress={handlePlaceOrder}
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.placeOrderText}>Buat Pesanan</Text>
  )}
</TouchableOpacity>
      </View>

    </View>
  );
}

export default CheckoutScreen;


const styles = StyleSheet.create({
  // Container utama yang membungkus seluruh layar
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header di bagian atas layar
  header: {
    backgroundColor: "#0D1B2A",
    paddingTop: 40, paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  // Tombol kembali (panah) di header
  backButton: { marginRight: 10 },
  // Judul di header
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  // Styling untuk content di dalam ScrollView, memberikan padding
  content: { padding: 15 },

  // Input field untuk teks (Nama, Alamat, dll)
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  // Tombol untuk mengambil lokasi dari peta
  mapButton: {
    backgroundColor: "#0D1B2A",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  // Teks di dalam tombol peta
  mapButtonText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },

  // Judul untuk setiap seksi (misal: "Alamat Pengiriman")
  sectionTitle: { 
    fontSize: 18, fontWeight: '700', 
    marginBottom: 10, color: '#0D1B2A' 
  },

  // Garis pemisah antar seksi
  divider: { 
    height: 1, 
    backgroundColor: '#dedede', 
    marginVertical: 20 
  },

  // Kartu yang menampilkan ringkasan alamat pengiriman
  addressCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  // Nama penerima di kartu alamat
  addressName: { fontSize: 16, fontWeight: "600", color: '#0D1B2A' },
  // Detail alamat di kartu alamat
  addressDetail: { color: "#555", marginTop: 2 },
  // Nomor telepon di kartu alamat
  addressPhone: { marginTop: 2, color: "#333" },

  // Kartu untuk setiap item produk di checkout
  itemCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },

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
  itemTotalPrice: { fontSize: 16, fontWeight: "700", color: '#0D1B2A' },

  // Baris pilihan untuk metode pengiriman
  shippingOption: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  // Teks di dalam pilihan metode pengiriman
  shippingText: { marginLeft: 10, fontSize: 16 },

  // Tombol pilihan umum (misal: untuk metode pembayaran)
  optionButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  // Teks di dalam tombol pilihan umum
  optionText: {
    marginLeft: 10,
    fontSize: 16
  },

  // Tombol pilihan untuk setiap jenis bank
  bankOption: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center"
  },

  // Teks nama bank
  bankText: {
    marginLeft: 10,
    fontSize: 15
  },

  // Baris untuk rincian pembayaran (Subtotal, Ongkir, dll)
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  // Footer di bagian bawah layar
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    paddingBottom: 45,
  },

  // Teks label "Total Pembayaran" di footer
  totalText: { 
    fontSize: 14, 
    color: "#888" },

  // Teks harga total akhir di footer
  totalPrice: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#D9534F" },

  // Tombol untuk membuat pesanan
  placeOrderButton: {
    backgroundColor: "#0D1B2A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },

  // Teks di dalam tombol "Buat Pesanan"
  placeOrderText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
