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
import api from '../Service/api';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

import ConfirmationModal from './ConfirmationProduk';

const { width, height } = Dimensions.get("window");

function DetailProduk1({ route, navigation }) {
  const { product } = route.params;

  const [isModalVisible, setModalVisible] = useState(false);

  const getDiscountedPrice = (item) => {
    if (!item.discount) return item.price;
    const discountAmount = item.price * (item.discount / 100);
    return item.price - discountAmount;
  };

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

  const [modalAction, setModalAction] = useState(null);
  const [allReviews, setAllReviews] = useState(productRating.reviews);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [reviewMediaUris, setReviewMediaUris] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCartNotifVisible, setCartNotifVisible] = useState(false);

  const images = [
    require("../../assets/products/kaos_polos_3.jpg"),
    require("../../assets/products/kaos_polos_2.jpeg"),
    require("../../assets/products/kaos_polos_1.jpeg"),
  ];

  const onScrollSlide = (e) => {
    const slideIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const whatsappNumber = "6287731803428"; 
  const openWhatsApp = () => {
    const message = `Halo, saya ingin bertanya tentang produk ${product.name}`;
    Linking.openURL(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
  };

  const handleAddToCartClick = () => {
    setModalAction('addToCart');
    setModalVisible(true);
  };

  const handleBuyNowClick = () => {
    setModalAction('buyNow');
    setModalVisible(true);
  };

  // ── INI BAGIAN YANG DIPERBAIKI ──
  const handleConfirmSelection = async (options) => {
    console.log('=== OPTIONS DARI MODAL DP1 ===', JSON.stringify(options));
    setModalVisible(false);

    if (modalAction === 'addToCart') {
      try {
        const token = await SecureStore.getItemAsync('token');
        console.log('=== TOKEN DP1 ===', token);

        const payload = {
          product_id: product.id,
          quantity: options.qty,
          size: options.size,
          color: options.color, // FIX: sebelumnya options.type (selalu undefined)
        };
        console.log('=== PAYLOAD DP1 ===', JSON.stringify(payload));

        const response = await api.post('/cart', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('=== SUCCESS DP1 ===', JSON.stringify(response.data));
        setCartNotifVisible(true);
      } catch (error) {
        console.log('=== ERROR DP1 ===', error.response?.status, JSON.stringify(error.response?.data) || error.message);
        alert("Gagal menambahkan ke keranjang");
      }
    } else if (modalAction === 'buyNow') {
      const finalPrice = getDiscountedPrice(product);
      const itemToCheckout = { ...product, ...options, price: finalPrice };
      const total = itemToCheckout.price * itemToCheckout.qty;
      navigation.navigate('Checkout', { items: [itemToCheckout], total: total });
    }
  };

  const handleGoToCart = () => {
    setCartNotifVisible(false);
    navigation.navigate('Tabs', { screen: 'Keranjang' });
  };

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Anda perlu memberikan izin untuk mengakses galeri!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setReviewMediaUris(prevUris => [...prevUris, ...newUris]);
    }
  };

  const handleReviewSubmit = () => {
    if (userRating === 0) {
      alert('Silakan berikan rating bintang terlebih dahulu.');
      return;
    }
    const newReview = {
      id: Date.now(),
      user: 'Pengguna Baru',
      rating: userRating,
      comment: userComment,
      media: reviewMediaUris,
    };
    setAllReviews([newReview, ...allReviews]);
    setReviewModalVisible(false);
    setUserRating(0);
    setUserComment('');
    setReviewMediaUris([]);
  };

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
          <Text style={styles.productPrice}>Rp {Number(product.price).toLocaleString('id-ID')}</Text>

          <Text style={styles.productDescription}>
            {product.description || `Ini adalah deskripsi detail dari produk: ${product.name}. Kamu bisa menuliskan informasi lengkap seperti bahan, ukuran, kualitas, dan detail lainnya sesuai kebutuhanmu.`}
          </Text>

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
        </View>

        {/* ULASAN */}
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
              {review.media && review.media.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewMediaContainer}>
                  {review.media.map((uri, index) => (
                    <Image key={index} source={{ uri: uri }} style={styles.reviewMedia} />
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
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
        <TouchableOpacity onPress={openWhatsApp} style={styles.footerIconContainer}> 
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#0D1B2A" />
          <Text style={styles.footerIconText}>Chat</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          onPress={handleAddToCartClick}
          style={styles.footerIconContainer}
        >
          <Ionicons name="cart-outline" size={24} color="#0D1B2A" />
          <Text style={styles.footerIconText}>Keranjang</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBuyNowClick}
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
        maxStock={product.stock}
      />

      {/* MODAL ULASAN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tulis Ulasan Anda</Text>
            
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

            <TextInput
              style={styles.commentInput}
              placeholder="Bagikan pengalaman Anda mengenai produk ini..."
              multiline
              value={userComment}
              onChangeText={setUserComment}
            />

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

            <TouchableOpacity style={styles.submitButton} onPress={handleReviewSubmit}>
              <Text style={styles.submitButtonText}>Kirim Ulasan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL NOTIFIKASI TAMBAH KERANJANG */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isCartNotifVisible}
        onRequestClose={() => setCartNotifVisible(false)}
      >
        <View style={styles.notifOverlay}>
          <View style={styles.notifContent}>
            <View style={styles.notifIconContainer}>
              <Ionicons name="checkmark-circle" size={50} color="#28A745" />
            </View>
            <Text style={styles.notifTitle}>Berhasil!</Text>
            <Text style={styles.notifMessage}>
              Produk telah ditambahkan ke keranjang
            </Text>

            <View style={styles.notifButtonContainer}>
              <TouchableOpacity
                style={styles.notifSecondaryButton}
                onPress={() => setCartNotifVisible(false)}
              >
                <Text style={styles.notifSecondaryButtonText}>Lanjut Belanja</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.notifPrimaryButton}
                onPress={handleGoToCart}
              >
                <Text style={styles.notifPrimaryButtonText}>Lihat Keranjang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#0D1B2A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: { marginRight: 10 },
  headerTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    maxWidth: width * 0.7,
  },
  sliderContainer: { width: width, height: height * 0.45 },
  sliderImage: {
    width: width,
    height: height * 0.45,
    resizeMode: "cover",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  dot: {
    width: 8, 
    height: 8, 
    backgroundColor: "#ccc",
    borderRadius: 10, 
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#0D1B2A",
    width: 10,
    height: 10,
  },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  productName: { fontSize: 26, fontWeight: 'bold', color: '#0D1B2A' },
  productPrice: { 
    fontSize: 22, 
    color: '#D9534F', 
    fontWeight: '700', 
    marginTop: 10 
  },
  productDescription: { 
    fontSize: 16, 
    color: '#555', 
    marginTop: 10,
    lineHeight: 22,
  },
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
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 10,
  },
  footerIconContainer: { 
    padding: 12, 
    alignItems: 'center',
    width: 70,
  },
  footerIconText: { fontSize: 10, marginTop: 5 },
  separator: { 
    height: '60%', 
    width: 1, 
    backgroundColor: '#e0e0e0' 
  },
  orderButton: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  orderButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
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
  notifOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 30,
  },
  notifContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  notifIconContainer: {
    marginBottom: 10,
  },
  notifTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B2A',
    marginBottom: 5,
  },
  notifMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  notifButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  notifSecondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0D1B2A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  notifSecondaryButtonText: {
    color: '#0D1B2A',
    fontWeight: '600',
    fontSize: 14,
  },
  notifPrimaryButton: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  notifPrimaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DetailProduk1;