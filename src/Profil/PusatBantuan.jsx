import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  LayoutAnimation, 
  Platform, 
  UIManager,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mengaktifkan LayoutAnimation untuk Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Komponen untuk setiap item pertanyaan (FAQ) yang bisa diperluas.
 */
const FaqItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fungsi untuk toggle tampilan jawaban dengan animasi
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestionContainer} onPress={toggleExpand} activeOpacity={0.8}>
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#0D1B2A" />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Komponen layar Pusat Bantuan.
 */
function PusatBantuanScreen({ navigation }) {

  /**
   * Fungsi untuk membuka WhatsApp dengan nomor dan pesan yang telah ditentukan.
   */
  const handleWhatsAppPress = () => {
    // 🔥 GANTI NOMOR INI dengan nomor WhatsApp Anda (gunakan kode negara, misal: 62)
    const phoneNumber = '6281234567890'; 
    const message = 'Halo, saya butuh bantuan terkait aplikasi Anda.';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Gagal Membuka WhatsApp', 
        'Pastikan aplikasi WhatsApp sudah terinstal di perangkat Anda.'
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Bantuan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Pertanyaan Umum (FAQ)</Text>

        <FaqItem
          question="Bagaimana cara memesan produk?"
          answer="Anda dapat memesan produk melalui halaman 'Beranda' atau 'Log'. Klik produk yang Anda inginkan, lalu tekan tombol 'Tambah ke Keranjang' atau 'Beli Sekarang'. Ikuti langkah-langkah selanjutnya untuk memilih varian dan menyelesaikan pembayaran di halaman Checkout."
        />

        <FaqItem
          question="Apa saja metode pembayaran yang tersedia?"
          answer="Saat ini kami mendukung dua metode pembayaran: COD (Bayar di Tempat) dan Transfer Bank. Untuk Transfer Bank, Anda dapat memilih berbagai opsi e-wallet dan bank yang tersedia di halaman Checkout."
        />

        <FaqItem
          question="Bagaimana cara melacak pesanan saya?"
          answer="Setelah pesanan berhasil dibuat, Anda akan diarahkan ke halaman 'Pesanan Saya'. Halaman ini berisi semua detail transaksi Anda. Untuk status pengiriman lebih lanjut, Anda dapat menghubungi admin kami dengan menyertakan ID pesanan Anda."
        />

        <FaqItem
          question="Bisakah saya mengubah atau membatalkan pesanan?"
          answer="Pesanan yang sudah dikonfirmasi tidak dapat diubah atau dibatalkan melalui aplikasi. Jika Anda perlu melakukan perubahan, harap segera hubungi layanan pelanggan kami melalui WhatsApp sebelum pesanan dikirim."
        />

        <FaqItem
          question="Bagaimana jika saya menerima produk yang salah atau rusak?"
          answer="Kami mohon maaf atas ketidaknyamanannya. Silakan ambil foto produk yang salah atau rusak dan kirimkan ke layanan pelanggan kami beserta detail pesanan Anda. Kami akan segera membantu proses penukaran atau pengembalian dana."
        />

        {/* BAGIAN KONTAK */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Tidak menemukan jawaban?</Text>
          <Text style={styles.contactText}>
            Jika Anda memiliki pertanyaan lain, jangan ragu untuk menghubungi tim layanan pelanggan kami.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsAppPress}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Hubungi via WhatsApp</Text>
          </TouchableOpacity>
        </View>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D1B2A',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden', // Penting untuk animasi
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    marginRight: 10,
  },
  faqAnswerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
  contactSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  contactButton: {
    backgroundColor: '#25D366', // Warna WhatsApp
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default PusatBantuanScreen;