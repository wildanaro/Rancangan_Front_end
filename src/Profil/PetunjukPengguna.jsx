import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GuideItem = ({ icon, title, children }) => (
  <View style={styles.guideItem}>
    <Ionicons name={icon} size={22} color="#0D1B2A" style={styles.guideIcon} />
    <View style={styles.guideTextContainer}>
      <Text style={styles.guideTitle}>{title}</Text>
      <Text style={styles.guideDescription}>{children}</Text>
    </View>
  </View>
);

function PetunjukPenggunaScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Petunjuk Pengguna</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>Panduan Dasar Aplikasi</Text>

        <GuideItem icon="search-outline" title="Mencari & Melihat Produk">
          Jelajahi berbagai produk yang tersedia di halaman 'Beranda'. Klik pada gambar produk untuk melihat detail lengkap, termasuk deskripsi, harga, dan galeri foto.
        </GuideItem>

        <GuideItem icon="cart-outline" title="Menambah Produk ke Keranjang">
          Di halaman detail produk, tekan ikon 'Keranjang' di bagian bawah. Sebuah jendela akan muncul untuk Anda memilih varian (ukuran, warna) dan jumlah. Tekan 'Tambah ke Keranjang' untuk menyimpannya.
        </GuideItem>

        <GuideItem icon="flash-outline" title="Fitur 'Beli Sekarang'">
          Gunakan tombol 'Beli Sekarang' untuk proses yang lebih cepat. Anda akan diminta memilih varian, dan setelah konfirmasi, Anda akan langsung diarahkan ke halaman Checkout untuk satu produk tersebut.
        </GuideItem>

        <GuideItem icon="options-outline" title="Mengelola Keranjang Belanja">
          Akses keranjang Anda melalui tab 'Keranjang'. Di sini Anda bisa:
          {'\n'}- Memilih produk mana yang akan di-checkout dengan mencentang kotak.
          {'\n'}- Mengubah jumlah produk dengan tombol (+) dan (-).
          {'\n'}- Mengedit varian (ukuran/warna) dengan menekan ikon pensil.
          {'\n'}- Menghapus produk dari keranjang dengan ikon tempat sampah.
        </GuideItem>

        <GuideItem icon="card-outline" title="Proses Checkout">
          Setelah menekan 'Checkout', Anda akan masuk ke halaman pembayaran.
          {'\n'}1. Isi data pengiriman (nama, alamat, No. WA). Gunakan tombol 'Ambil Lokasi' untuk mengisi alamat secara otomatis.
          {'\n'}2. Pilih Opsi Pengiriman (Reguler atau Cepat).
          {'\n'}3. Pilih Metode Pembayaran (COD atau Transfer Bank).
          {'\n'}4. Tekan 'Buat Pesanan' untuk menyelesaikan.
        </GuideItem>

        <GuideItem icon="document-text-outline" title="Melihat Detail Pesanan">
          Setelah pesanan berhasil dibuat, Anda akan diarahkan ke halaman 'Pesanan' yang berisi ringkasan lengkap dari transaksi Anda, termasuk rincian produk, alamat, dan total pembayaran.
        </GuideItem>

        <GuideItem icon="person-circle-outline" title="Mengelola Akun Anda">
          Di halaman 'Akun Saya', Anda dapat melihat riwayat pesanan, mengakses keranjang, dan menemukan menu bantuan lainnya.
        </GuideItem>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0D1B2A',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D1B2A',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  guideItem: {
    flexDirection: 'row',
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  guideIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  guideTextContainer: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 5,
  },
  guideDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
});

export default PetunjukPenggunaScreen;