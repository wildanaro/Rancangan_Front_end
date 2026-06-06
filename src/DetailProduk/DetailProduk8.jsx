import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Linking,
  Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../CartContext'; // Path diperbaiki
import * as ImagePicker from 'expo-image-picker'; // Import Image Picker

import ConfirmationModal from './ConfirmationProduk';  // Path diperbaiki

const { width, height } = Dimensions.get("window");

function DetailProduk8({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart(); // Ambil fungsi addToCart dari context

  // State untuk mengontrol visibilitas modal
  const [isModalVisible, setModalVisible] = useState(false);

  const getDiscountedPrice = (item) => {
    if (!item.discount) return item.price;
    const discountAmount = item.price * (item.discount / 100);
    return item.price - discountAmount;
  };

  // Data statis untuk rating dan ulasan produk
  const productRating = {
    average: 4.8,
    count: 152,
    sold: 578,
    reviews: [
      { id: 1, user: 'Budi S.', rating: 5, comment: 'Kualitas kaosnya mantap, bahan adem dan nyaman dipakai. Sablon juga rapi. Recommended!' },
      { id: 2, user: 'Citra A.', rating: 4, comment: 'Bagus, sesuai harga. Pengiriman juga cepat. Mungkin pilihan warnanya bisa ditambah lagi.' },
      { id: 3, user: 'Rian D.', rating: 5, comment: 'Sudah beli kedua kalinya di sini, selalu puas. Ukurannya pas dan bahannya tidak mengecewakan.' },
    ]
  };

  // State untuk membedakan aksi (tambah ke keranjang atau beli sekarang)
  const [modalAction, setModalAction] = useState(null);

  // State untuk fitur ulasan pengguna
  const [allReviews, setAllReviews] = useState(productRating.reviews);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [reviewMediaUris, setReviewMediaUris] = useState([]); // State untuk menyimpan URI media (sebagai array)

  const [currentSlide, setCurrentSlide] = useState(0);

  // SLIDER GAMBAR
  const images = [
    require("../../assets/products/kaos_polos_3.jpg"),
    require("../../assets/products/kaos_polos_2.jpeg"),
    require("../../assets/products/kaos_polos_1.jpeg"),
  ];

  const onScrollSlide = (e) => {
    const slideIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

 
  // NOMOR WHATSAPP TUJUAN (GANTI)
  const whatsappNumber = "6287731803428"; 
  const openWhatsApp = () => {
    const message = `Halo, saya ingin bertanya tentang produk ${product.name}`;
    Linking.openURL(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
  };

  // Fungsi untuk menangani penambahan ke keranjang
  const handleAddToCartClick = () => {
    setModalAction('addToCart'); // Atur aksi ke 'addToCart'
    setModalVisible(true); // Hanya tampilkan modal pilihan
  };

  // Fungsi untuk menangani klik "Beli Sekarang"
  const handleBuyNowClick = () => {
    setModalAction('buyNow'); // Atur aksi ke 'buyNow'
    setModalVisible(true); // Tampilkan modal pilihan
  };

  // Fungsi yang dipanggil dari modal setelah user mengonfirmasi pilihan
  const handleConfirmSelection = (options) => {
    setModalVisible(false); // Tutup modal setelah ditambahkan

    if (modalAction === 'addToCart') {
      const finalPrice = getDiscountedPrice(product);
      const productWithOptions = { ...product, ...options, price: finalPrice };
      addToCart(productWithOptions);
    } else if (modalAction === 'buyNow') {
      // Siapkan item yang akan di-checkout dengan harga diskon
      const finalPrice = getDiscountedPrice(product);
      const itemToCheckout = { ...product, ...options, price: finalPrice };
      const total = itemToCheckout.price * itemToCheckout.qty;
      navigation.navigate('Checkout', { items: [itemToCheckout], total: total });
    }
  };

  // Fungsi untuk memilih media (foto/video) dari galeri
  const pickMedia = async () => {
    // Meminta izin untuk mengakses galeri
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Anda perlu memberikan izin untuk mengakses galeri!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Hanya izinkan gambar
      allowsMultipleSelection: true, // Izinkan pemilihan beberapa file
      quality: 1,
    });

    if (!result.canceled) {
      // Tambahkan URI gambar yang baru dipilih ke dalam array state
      const newUris = result.assets.map(asset => asset.uri);
      setReviewMediaUris(prevUris => [...prevUris, ...newUris]);
    }
  };

  // Fungsi untuk menangani pengiriman ulasan baru
  const handleReviewSubmit = () => {
    if (userRating === 0) {
      alert('Silakan berikan rating bintang terlebih dahulu.');
      return;
    }
    const newReview = {
      id: Date.now(), // ID unik untuk ulasan baru
      user: 'Pengguna Baru', // Nama pengguna (bisa diganti dengan data user login)
      rating: userRating,
      comment: userComment,
      media: reviewMediaUris, // Tambahkan array media ke objek ulasan
    };
    setAllReviews([newReview, ...allReviews]); // Tambahkan ulasan baru di awal daftar
    setReviewModalVisible(false); // Tutup modal
    setUserRating(0); // Reset rating
    setUserComment(''); // Reset komentar
    setReviewMediaUris([]); // Reset media
  };

  // Fungsi untuk merender bintang rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FFD700" />);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.headerTitle}>
          {product.name}
        </Text>
      </View>

      <ScrollView>

        {/* SLIDER GAMBAR */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScrollSlide}
            scrollEventThrottle={16}
            style={styles.sliderContainer}
          >
            {images.map((img, index) => (
              <Image key={index} source={img} style={styles.sliderImage} />
            ))}
          </ScrollView>

          {/* BADGE DISKON */}
          {product.discount && (
            <View style={[styles.discountBadge, { backgroundColor: '#FF8C00' }]}>
              <Text style={styles.discountBadgeText}>{product.discount}%</Text>
              <Text style={styles.discountBadgeTextSmall}>OFF</Text>
            </View>
          )}

          {/* DOT INDICATOR */}
          <View style={styles.dotContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentSlide === index && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* DETAIL PRODUK */}
        <View style={styles.detailsCard}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.discount ? (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.originalPrice}>
                Rp {product.price.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.productPrice}>
                Rp {getDiscountedPrice(product).toLocaleString('id-ID')}
              </Text>
            </View>
          ) : (
            <Text style={styles.productPrice}>Rp {product.price.toLocaleString('id-ID')}</Text>
          )}
          <Text style={styles.productDescription}>
            Ini adalah deskripsi detail dari produk: {product.name}. 
            Kamu bisa menuliskan informasi lengkap seperti bahan, ukuran, 
            kualitas, dan detail lainnya sesuai kebutuhanmu.
          </Text>

          {/* --- BAGIAN RATING (DIPINDAHKAN) --- */}
          <View style={styles.ratingSummaryContainer}>
            <View style={styles.starContainer}>
              {renderStars(productRating.average)}
            </View>
            <Text style={styles.ratingText}>{productRating.average}</Text>
            <View style={styles.ratingSeparator} />
            <Text style={styles.ratingText}>{productRating.count} Ulasan</Text>
            <View style={styles.ratingSeparator} />
            <Text style={styles.ratingText}>{productRating.sold} Terjual</Text>
          </View>
          {/* --- AKHIR BAGIAN RATING --- */}
        </View>

        {/* --- PENAMBAHAN KARTU ULASAN PRODUK --- */}
        <View style={styles.reviewsCard}>
          <Text style={styles.cardTitle}>Penilaian Produk</Text>
          {allReviews.map(review => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                <View style={styles.starContainer}>
                  {renderStars(review.rating)}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              {/* Tampilkan media jika ada */}
              {review.media && review.media.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewMediaContainer}>
                  {review.media.map((uri, index) => (
                    <Image key={index} source={{ uri: uri }} style={styles.reviewMedia} />
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
          {/* Tombol untuk menulis ulasan */}
          <TouchableOpacity style={styles.writeReviewButton} onPress={() => setReviewModalVisible(true)}>
            <Ionicons name="pencil-outline" size={18} color="#fff" />
            <Text style={styles.writeReviewButtonText}>Tulis Ulasan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Lihat Semua Ulasan ({productRating.count})</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>

        {/* CHAT WHATSAPP */}
        <TouchableOpacity onPress={openWhatsApp} style={styles.footerIconContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#0D1B2A" />
          <Text style={styles.footerIconText}>Chat</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* KERANJANG */}
        <TouchableOpacity
          onPress={handleAddToCartClick} // Buka modal pilihan untuk keranjang
          style={styles.footerIconContainer}
        >
          <Ionicons name="cart-outline" size={24} color="#0D1B2A" />
          <Text style={styles.footerIconText}>Keranjang</Text>
        </TouchableOpacity>

        {/* BELI SEKARANG */}
        <TouchableOpacity
          onPress={handleBuyNowClick} // Buka modal pilihan untuk beli sekarang
          style={styles.orderButton}>
          <Text style={styles.orderButtonText}>Beli Sekarang</Text>
        </TouchableOpacity>

      </View>

      {/* MODAL KONFIRMASI */}
      <ConfirmationModal
        visible={isModalVisible}
        productName={product.name}
        onClose={() => setModalVisible(false)}
        onAddToCart={handleConfirmSelection}
        actionType={modalAction}
      />

      {/* MODAL UNTUK MENULIS ULASAN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tulis Ulasan Anda</Text>
            
            {/* Input Rating Bintang */}
            <View style={styles.modalStarContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons 
                    name={star <= userRating ? "star" : "star-outline"} 
                    size={32} 
                    color="#FFD700" 
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Komentar */}
            <TextInput
              style={styles.commentInput}
              placeholder="Bagikan pengalaman Anda mengenai produk ini..."
              multiline
              value={userComment}
              onChangeText={setUserComment}
            />

            {/* Tombol untuk menambah media dan pratinjau */}
            <View style={styles.mediaPickerContainer}>
              <TouchableOpacity style={styles.mediaPickerButton} onPress={pickMedia}>
                <Ionicons name="camera-outline" size={22} color="#0D1B2A" />
                <Text style={styles.mediaPickerText}>Tambah Foto/Video</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {reviewMediaUris.map((uri, index) => (
                  <View key={index} style={styles.mediaPreviewContainer}>
                    <Image source={{ uri: uri }} style={styles.mediaPreview} />
                    <TouchableOpacity 
                      style={styles.removeMediaButton} 
                      onPress={() => {
                        setReviewMediaUris(prevUris => prevUris.filter(item => item !== uri));
                      }}
                    >
                      <Ionicons name="close-circle" size={24} color="#D9534F" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Tombol Aksi */}
            <TouchableOpacity style={styles.submitButton} onPress={handleReviewSubmit}>
              <Text style={styles.submitButtonText}>Kirim Ulasan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container utama yang membungkus seluruh layar
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  // Header di bagian atas layar
  header: {
    backgroundColor: '#0D1B2A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40, // Sesuaikan untuk status bar
    paddingBottom: 15,
    paddingHorizontal: 15,
  },

  // Tombol kembali (panah) di header
  backButton: { marginRight: 10 },

  // Judul produk di header
  headerTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    maxWidth: width * 0.7, // Batasi lebar agar tidak tumpang tindih
  },

  // Container untuk slider gambar produk
  sliderContainer: { width: width, height: height * 0.45 },

  // Masing-masing gambar di dalam slider
  sliderImage: {
    width: width,
    height: height * 0.45,
    resizeMode: "cover",
  },

  // Container untuk titik-titik indikator slider
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 15,
  },

  // Titik indikator slider (kondisi tidak aktif)
  dot: {
    width: 8, 
    height: 8, 
    backgroundColor: "#ccc",
    borderRadius: 10, 
    marginHorizontal: 4,
  },

  // Titik indikator slider (kondisi aktif)
  dotActive: {
    backgroundColor: "#0D1B2A",
    width: 10,
    height: 10,
  },

  // Kartu putih yang berisi detail informasi produk
  detailsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20, // Membuat sudut atas melengkung
    borderTopRightRadius: 20,
  },

  // Teks nama produk
  productName: { fontSize: 26, fontWeight: 'bold', color: '#0D1B2A' },

  // Teks harga produk
  productPrice: { 
    fontSize: 22,
    color: '#D9534F', 
    fontWeight: '700'
  },
  originalPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
    fontWeight: 'normal',
  },

  // Teks deskripsi produk
  productDescription: { 
    fontSize: 16, 
    color: '#555', 
    marginTop: 10,
    lineHeight: 22, // Jarak antar baris
  },

  // --- STYLE UNTUK RATING & ULASAN ---
  ratingSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 5,
  },
  starContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  ratingSeparator: {
    height: 15,
    width: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  reviewsCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  seeAllButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  writeReviewButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewMediaContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  reviewMedia: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  // --- AKHIR STYLE ---

  // Footer di bagian bawah layar
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    paddingBottom: 30, // Padding bawah untuk area aman (misal: iPhone)
    paddingTop: 10,
  },

  // Container untuk ikon di footer (Chat & Keranjang)
  footerIconContainer: { 
    padding: 12, 
    alignItems: 'center',
    width: 70,
  },

  // Teks kecil di bawah ikon footer
  footerIconText: { fontSize: 10, marginTop: 5 },

  // Garis vertikal pemisah di footer
  separator: { 
    height: '60%', 
    width: 1, 
    backgroundColor: '#e0e0e0' 
  },

  // Tombol "Beli Sekarang"
  orderButton: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 12,
    borderRadius: 8,
  },

  // Teks di dalam tombol "Beli Sekarang"
  orderButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  // --- STYLE UNTUK MODAL ULASAN ---
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalStarContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#0D1B2A',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  mediaPickerContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  mediaPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  mediaPickerText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#0D1B2A',
  },
  mediaPreviewContainer: {
    marginTop: 10,
    marginRight: 10,
    position: 'relative',
  },
  mediaPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },

  // Style untuk badge diskon
  discountBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#FF8C00', // Warna oranye aksen
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5, // Efek bayangan untuk Android
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountBadgeTextSmall: {
    color: '#fff',
    fontSize: 12,
  },
});

export default DetailProduk8;
