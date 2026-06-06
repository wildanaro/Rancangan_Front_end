import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionText}>{children}</Text>
  </View>
);

function SyaratdanKetentuanScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Syarat & Ketentuan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageHeader}>Syarat & Ketentuan Penggunaan</Text>
        <Text style={styles.lastUpdated}>Terakhir diperbarui: 24 Oktober 2023</Text>

        <Section title="1. Pendahuluan">
          Selamat datang di aplikasi kami. Dengan mengunduh, mengakses, atau menggunakan aplikasi ini, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak diizinkan untuk menggunakan layanan kami.
        </Section>

        <Section title="2. Akun Pengguna">
          Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda. Kami berhak menolak layanan, menghentikan akun, atau menghapus konten atas kebijakan kami sendiri.
        </Section>

        <Section title="3. Pemesanan dan Pembayaran">
          Saat Anda melakukan pemesanan, Anda setuju bahwa semua informasi yang Anda berikan adalah benar dan akurat. Semua pesanan tunduk pada ketersediaan stok dan konfirmasi harga pesanan. Harga dapat berubah tanpa pemberitahuan sebelumnya.
        </Section>

        <Section title="4. Pengiriman">
          Waktu pengiriman dapat bervariasi tergantung pada ketersediaan dan alamat tujuan. Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh jasa kurir atau keadaan kahar (force majeure).
        </Section>

        <Section title="5. Pembatalan dan Pengembalian">
          Pesanan yang telah diproses tidak dapat dibatalkan. Untuk kebijakan pengembalian produk yang rusak atau salah, silakan merujuk ke halaman 'Pusat Bantuan' atau hubungi layanan pelanggan kami dalam waktu 1x24 jam setelah barang diterima.
        </Section>

        <Section title="6. Kekayaan Intelektual">
          Semua konten yang ada di dalam aplikasi ini, termasuk teks, grafis, logo, ikon, gambar, dan perangkat lunak, adalah milik kami atau pemasok konten kami dan dilindungi oleh undang-undang hak cipta internasional.
        </Section>

        <Section title="7. Batasan Tanggung Jawab">
          Aplikasi dan layanan kami disediakan 'sebagaimana adanya'. Kami tidak menjamin bahwa aplikasi akan bebas dari kesalahan atau gangguan. Dalam keadaan apa pun, kami tidak akan bertanggung jawab atas kerugian tidak langsung atau konsekuensial yang timbul dari penggunaan aplikasi ini.
        </Section>

        <Section title="8. Perubahan Ketentuan">
          Kami berhak untuk mengubah Syarat dan Ketentuan ini kapan saja. Versi terbaru akan diposting di aplikasi dan akan berlaku segera setelah diposting. Anda disarankan untuk meninjau halaman ini secara berkala.
        </Section>

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
  pageHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D1B2A',
    marginBottom: 5,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'justify',
  },
});

export default SyaratdanKetentuanScreen;
