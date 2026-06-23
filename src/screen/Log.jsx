import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, TextInput, Image,
  ScrollView, Dimensions, Linking, ImageBackground,
  Alert, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from 'expo-secure-store';
import api from "../Service/api";

const { width } = Dimensions.get("window");
const BASE_URL = "http://10.89.16.228:8000/storage/";

// Gambar fallback lokal (tetap pakai gambar lama kalau image di DB kosong)
const fallbackImages = {
  1:  require("../../assets/products/disply_kaos_polos.png"),
  2:  require("../../assets/products/jaket_denim-removebg-preview.png"),
  3:  require("../../assets/products/prodak_3.png"),
  4:  require("../../assets/products/tasransel-hitam.jpeg"),
  5:  require("../../assets/products/jens3.jpeg"),
  6:  require("../../assets/products/topi-basebal.jpeg"),
  7:  require("../../assets/products/jam-tangan.jpg"),
  8:  require("../../assets/products/kemeja-lenganpanjang.jpg"),
  9:  require("../../assets/products/switer-rajut.jpeg"),
  10: require("../../assets/products/kacamata.jpg"),
};

function Log({ navigation }) {

  const [allProducts,      setAllProducts]      = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [activeCategory,   setActiveCategory]   = useState("Semua");
  const [searchQuery,      setSearchQuery]      = useState("");
  const [searchHistory,    setSearchHistory]    = useState([]);
  const [isHistoryVisible, setHistoryVisible]   = useState(false);
  const [sliderIndex,      setSliderIndex]      = useState(0);

  const scrollViewRef = useRef(null);

  const categories    = ["Semua", "Kaos", "Jaket", "Celana", "Aksesoris"];
  const categoryIcons = {
    "Semua":     "apps-outline",
    "Kaos":      "shirt-outline",
    "Jaket":     "snow-outline",
    "Celana":    "walk-outline",
    "Aksesoris": "diamond-outline",
  };

  // ── FETCH PRODUK DARI DATABASE ──
const fetchProducts = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    console.log("=== TOKEN SAAT FETCH PRODUCTS ===", token);
    
    const response = await api.get("/products");
    if (response.data.success) {
      setAllProducts(response.data.data);
      setFilteredProducts(response.data.data);
    }
  } catch (err) {
    console.log("=== ERROR ===", err.response?.status, err.response?.data);
    Alert.alert("Error", "Gagal memuat produk.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // ── FILTER PRODUK ──
  useEffect(() => {
    let result = allProducts;
    if (activeCategory !== "Semua") {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [searchQuery, activeCategory, allProducts]);

  // ── AUTO SLIDER ──
  useEffect(() => {
    if (allProducts.length === 0) return;
    const sliderItems = allProducts.slice(0, 5);
    const interval = setInterval(() => {
      setSliderIndex(prev => {
        const next = prev === sliderItems.length - 1 ? 0 : prev + 1;
        scrollViewRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [allProducts]);

  // ── HELPER GAMBAR ──
  // Pakai gambar dari storage Laravel, kalau kosong pakai fallback lokal
const getImageSource = (item) => {
  if (item.image) {
    return {
      uri: item.image.startsWith('http')
        ? item.image
        : `http://10.89.16.228:8000/storage/${item.image}`
    };
  }
  return fallbackImages[item.id] || fallbackImages[1];
};

  const getDiscountedPrice = (item) => {
    if (!item.discount) return Number(item.price);
    return Number(item.price) - Number(item.price) * (item.discount / 100);
  };

  const goToDetail = (item) => {
    navigation.navigate('DetailProduk1', { product: item });
  };

  const executeSearch = () => {
    if (searchQuery) {
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev].slice(0, 5));
      }
      if (filteredProducts.length === 0) {
        Alert.alert("Pencarian", "Produk tidak ditemukan.");
      }
    }
    setHistoryVisible(false);
  };

  const handleBlur = () => setTimeout(() => setHistoryVisible(false), 200);

  const sliderItems   = allProducts.slice(0, 5);
  const specialOffers = allProducts.filter(p => p.discount > 0).slice(0, 4);

  // ── LOADING ──
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#0D1B2A" />
        <Text style={{ marginTop: 10, color: '#ADB5BD' }}>Memuat produk...</Text>
      </View>
    );
  }

  // ══════════════════════════════════════
  return (
    <ImageBackground
      source={require('../../assets/products/disply_kaos_polos.png')}
      style={{ flex: 1 }}
      blurRadius={20}
      imageStyle={{ opacity: 0.1 }}
    >
      <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>

        {/* ── HEADER ── */}
        <View style={{ backgroundColor: "#0D1B2A", paddingTop: 40, paddingBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 }}>
            <Image
              source={require('../../assets/Logo/LOGO-Ecomers.png')}
              style={{ width: 40, height: 40, resizeMode: 'contain' }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>WIROS Store</Text>
              <Text style={{ color: '#E0E0E0', fontSize: 12 }}>Gaya Terbaik Untukmu</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 10, paddingHorizontal: 12, flex: 1, height: 40 }}>
              <TextInput
                placeholder="Cari produk fashion..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setHistoryVisible(true)}
                onBlur={handleBlur}
                onSubmitEditing={executeSearch}
                style={{ flex: 1, fontSize: 14 }}
              />
              <TouchableOpacity onPress={executeSearch}>
                <Ionicons name="search" size={20} color="#0D1B2A" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', marginLeft: 15 }}>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/6287731803428`)}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Notifikasi", "Tidak ada notifikasi baru.")}>
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0D1B2A"]} />
          }
        >

          {/* ── SLIDER ── */}
          <View style={{ height: 200, marginTop: 20 }}>
            <ScrollView
              horizontal pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={scrollViewRef}
              style={{ width, marginHorizontal: -15 }}
            >
              {sliderItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToDetail(item)}
                  style={{ width, paddingHorizontal: 15 }}
                >
                  <View style={{ flexDirection: "row", width: "100%", height: 150, backgroundColor: "#FFFFFF", borderRadius: 15, padding: 15, alignItems: "center", elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, marginLeft: 10 }}>

                    {/* DESKRIPSI */}
                    <View style={{ flex: 1, paddingRight: 10, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0D1B2A", textAlign: "center" }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 13, marginTop: 5, color: "#666", textAlign: "center" }}>
                        Kategori: {item.category}
                      </Text>
                      <Text style={{ fontSize: 13, marginTop: 3, color: "#666", textAlign: "center" }}>
                        ⭐ 4.5 • Terlaris Minggu Ini
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 8, color: "#FF8C00", textAlign: "center" }}>
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </Text>
                      <Text style={{ fontSize: 12, marginTop: 6, color: "#FF8C00", fontWeight: "600", textAlign: "center" }}>
                        ✨ Best Choice For You ✨
                      </Text>
                    </View>

                    {/* GAMBAR */}
                    <Image
                      source={getImageSource(item)}
                      style={{ width: 120, height: 120, borderRadius: 10, resizeMode: "contain" }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── SPECIAL OFFERS ── */}
          {specialOffers.length > 0 && (
            <View style={{ paddingHorizontal: 15, marginTop: -20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0D1B2A", marginBottom: 10 }}>
                Penawaran Spesial Untukmu
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {specialOffers.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{ width: 280, height: 140, backgroundColor: "#FFFFFF", borderRadius: 15, marginRight: 15, flexDirection: "row", padding: 10, elevation: 3, borderWidth: 1, borderColor: '#EEE' }}
                    onPress={() => goToDetail(item)}
                  >
                    {item.discount > 0 && (
                      <View style={{ position: "absolute", top: 0, left: 0, backgroundColor: "#FF8C00", paddingVertical: 4, paddingHorizontal: 8, borderTopLeftRadius: 15, borderBottomRightRadius: 15, zIndex: 1, elevation: 5 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>{item.discount}% OFF</Text>
                      </View>
                    )}
                    <Image source={getImageSource(item)} style={{ width: 120, height: 120 }} resizeMode="contain" />
                    <View style={{ flex: 1, marginLeft: 10, justifyContent: "center" }}>
                      <Text style={{ color: "#0D1B2A", fontSize: 16, fontWeight: "bold" }} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.discount > 0 ? (
                        <View>
                          <Text style={{ fontSize: 12, color: "#888", textDecorationLine: "line-through" }}>
                            Rp {Number(item.price).toLocaleString("id-ID")}
                          </Text>
                          <Text style={{ color: "#FF8C00", fontSize: 16, fontWeight: 'bold' }}>
                            Rp {getDiscountedPrice(item).toLocaleString("id-ID")}
                          </Text>
                        </View>
                      ) : (
                        <Text style={{ color: "#0D1B2A", marginTop: 5, fontSize: 16, fontWeight: 'bold' }}>
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── KATEGORI ── */}
          <View style={{ paddingHorizontal: 15, marginVertical: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0D1B2A", marginBottom: 10 }}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => { setActiveCategory(c); setSearchQuery(""); }}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: activeCategory === c ? "#0D1B2A" : "#FFF", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: "#DDD" }}
                >
                  <Ionicons name={categoryIcons[c]} size={18} color={activeCategory === c ? "#FFF" : "#0D1B2A"} style={{ marginRight: 8 }} />
                  <Text style={{ color: activeCategory === c ? "#FFF" : "#0D1B2A", fontWeight: "600" }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── GRID PRODUK ── */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 15, marginTop: 15 }}>
            {filteredProducts.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                <Ionicons name="cube-outline" size={60} color="#ccc" />
                <Text style={{ color: '#ADB5BD', marginTop: 10 }}>Produk tidak ditemukan.</Text>
              </View>
            ) : (
              filteredProducts.map((item) => (
                <View
                  key={item.id}
                  style={{ width: "48%", backgroundColor: "#FFF", borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}
                >
                  {item.discount > 0 && (
                    <View style={{ position: "absolute", top: 0, left: 0, backgroundColor: "#FF8C00", paddingVertical: 4, paddingHorizontal: 6, borderTopLeftRadius: 12, borderBottomRightRadius: 12, zIndex: 1 }}>
                      <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>{item.discount}% OFF</Text>
                    </View>
                  )}

                  <TouchableOpacity onPress={() => goToDetail(item)}>
                    <Image
                      source={getImageSource(item)}
                      resizeMode="contain"
                      style={{ width: "100%", height: 140, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                    />
                  </TouchableOpacity>

                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#0D1B2A", height: 38 }} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {item.discount > 0 ? (
                      <View>
                        <Text style={{ fontSize: 12, color: "#888", textDecorationLine: "line-through" }}>
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </Text>
                        <Text style={{ fontSize: 17, fontWeight: "bold", color: "#D9534F" }}>
                          Rp {getDiscountedPrice(item).toLocaleString("id-ID")}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 17, fontWeight: "bold", color: "#D9534F" }}>
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </Text>
                    )}

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
                      <View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                          <Ionicons name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 12, color: "#666" }}>4.5</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons name="layers-outline" size={14} color="#888" style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 12, color: "#666" }}>Stok: {item.stock}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => goToDetail(item)}>
                        <Ionicons name="add-circle" size={28} color="#0D1B2A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

        </ScrollView>

        {/* ── RIWAYAT PENCARIAN ── */}
        {isHistoryVisible && searchHistory.length > 0 && (
          <View style={{ position: "absolute", top: 145, left: 20, right: 20, backgroundColor: "white", borderRadius: 8, elevation: 5, zIndex: 10 }}>
            {searchHistory.map((item, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", padding: 12, borderBottomWidth: 1, borderBottomColor: "#EEE" }}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                  onPress={() => { setSearchQuery(item); setTimeout(() => executeSearch(), 0); }}
                >
                  <Ionicons name="time-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                  <Text>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSearchHistory(prev => prev.filter(x => x !== item))}>
                  <Ionicons name="close-circle-outline" size={20} color="#AAA" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </View>
    </ImageBackground>
  );
}

export default Log;