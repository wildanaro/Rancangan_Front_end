// Full Program Log.jsx dengan fitur diskon ala Shopee
import React, { useState, useRef, useEffect } from "react";
import {View,Text,TouchableOpacity,TextInput,Image,ScrollView,Dimensions,Linking,ImageBackground,Alert,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../CartContext";

function Log({ navigation }) {
  const products = [
    { id: 1, name: "Kaos Polos", price: 75000, image: require("../../assets/products/disply_kaos_polos.png"), category: "Kaos", rating: 4.8, location: "Bandung" },
    { id: 2, name: "Jaket Denim", price: 180000, image: require("../../assets/products/jaket_denim-removebg-preview.png"), category: "Jaket", rating: 4.5, location: "Jakarta" },
    { id: 3, name: "Sneakers Pria", price: 250000, image: require("../../assets/products/prodak_3.png"), category: "Aksesoris", rating: 4.7, location: "Surabaya" },
    { id: 4, name: "Tas Ransel", price: 210000, image: require("../../assets/products/tasransel-hitam.jpeg"), category: "Aksesoris", rating: 4.6, location: "Yogyakarta" },

    // Dengan diskon
    { id: 5, name: "Celana Jeans Slim Fit", price: 190000, image: require("../../assets/products/jens3.jpeg"), category: "Celana", rating: 4.4, location: "Bandung" },
    { id: 6, name: "Topi Baseball", price: 85000, discount: 30, image: require("../../assets/products/topi-basebal.jpeg"), category: "Aksesoris", rating: 4.9, location: "Jakarta" },
    { id: 7, name: "Jam Tangan Elegan", price: 320000, discount: 20, image: require("../../assets/products/jam-tangan.jpg"), category: "Aksesoris", rating: 4.8, location: "Surabaya" },
    { id: 8, name: "Kemeja Lengan Panjang", price: 140000, discount: 15, image: require("../../assets/products/kemeja-lenganpanjang.jpg"), category: "Kaos", rating: 4.3, location: "Bandung" },
    { id: 9, name: "Sweater Rajut", price: 175000, discount: 25, image: require("../../assets/products/switer-rajut.jpeg"), category: "Jaket", rating: 4.6, location: "Yogyakarta" },
    { id: 10, name: "Kacamata Fashion", price: 120000, image: require("../../assets/products/kacamata.jpg"), category: "Aksesoris", rating: 4.2, location: "Jakarta" },
  ];

  const specialOffers = products.slice(5, 9);
  const categoryIcons = {"Semua": "apps-outline","Kaos": "shirt-outline","Jaket": "snow-outline","Celana": "walk-outline","Aksesoris": "diamond-outline"};
  const categories = ["Semua", "Kaos", "Jaket", "Celana", "Aksesoris"];


  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isHistoryVisible, setHistoryVisible] = useState(false);

  useEffect(() => {
    let newFilteredProducts = products;
    if (activeCategory !== "Semua") newFilteredProducts = newFilteredProducts.filter((p) => p.category === activeCategory);
    if (searchQuery) newFilteredProducts = newFilteredProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredProducts(newFilteredProducts);
  }, [searchQuery, activeCategory]);

  const executeSearch = () => {
    if (searchQuery) {
      if (!searchHistory.includes(searchQuery)) setSearchHistory([searchQuery, ...searchHistory].slice(0, 5));
      const newData = filteredProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (newData.length === 0) Alert.alert("Pencarian", "Produk tidak ditemukan.");
    }
    setHistoryVisible(false);
  };

  const handleBlur = () => setTimeout(() => setHistoryVisible(false), 200);

  const getDiscountedPrice = (item) => {
    if (!item.discount) return item.price;
    const pot = item.price * (item.discount / 100);
    return item.price - pot;
  };

  const goToDetail = (item) => navigation.navigate(`DetailProduk${item.id}`, { product: item });

  const { width } = Dimensions.get("window");
  const scrollViewRef = useRef(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderItems = products.slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => {
        const next = prev === sliderItems.length - 1 ? 0 : prev + 1;
        scrollViewRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground source={require('../../assets/products/disply_kaos_polos.png')} style={{ flex: 1 }} blurRadius={20} imageStyle={{ opacity: 0.1 }}>
      <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>

        {/* HEADER */}
        <View style={{ backgroundColor: "#0D1B2A", paddingTop: 40, paddingBottom: 15, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          {/* Logo dan Nama Toko */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 }}>
            <Image 
              source={require('../../assets/Logo/LOGO-Ecomers.png')} 
              style={{ width: 40, height: 40, borderRadius: 0, resizeMode: 'contain' }} 
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>WIROS Store</Text>
              <Text style={{ color: '#E0E0E0', fontSize: 12 }}>Gaya Terbaik Untukmu</Text>
            </View>
          </View>

          {/* Bar Pencarian dan Ikon */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20 }}>

            {/* SEARCH */}
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: 10, paddingHorizontal: 12, flex: 1, height: 40 }}>
              <TextInput placeholder="Cari produk fashion..." value={searchQuery} onChangeText={setSearchQuery} onFocus={() => setHistoryVisible(true)} onBlur={handleBlur} onSubmitEditing={executeSearch} style={{ flex: 1, fontSize: 14 }} />
              <TouchableOpacity onPress={executeSearch}><Ionicons name="search" size={20} color="#0D1B2A" /></TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', marginLeft: 15 }}>
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/6287731803428`)} style={{ marginRight: 15 }}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Notifikasi", "Tidak ada notifikasi baru.")} style={{ position: 'relative' }}>
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

         {/* SLIDER */}
        <View style={{ height: 200, marginTop: 20 }}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} ref={scrollViewRef}
            style={{ width, marginHorizontal: -15 }}
          >
            {sliderItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => goToDetail(item)}
                style={{ width, paddingHorizontal: 15 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    height: 150,
                    backgroundColor: "#FFFFFF", // Latar belakang putih
                    borderRadius: 15,
                    padding: 15,
                    alignItems: "center",
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    marginLeft: 10,
                  }}
                >

          {/* DESKRIPSI */}
          <View
            style={{
              flex: 1,
              paddingRight: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ 
              fontSize: 20, 
              fontWeight: "bold", 
              color: "#0D1B2A", // Teks gelap agar kontras
              textAlign: "center"
            }}>
              {item.name}
            </Text>

            <Text style={{ 
              fontSize: 13, 
              marginTop: 5, 
              color: "#666", // Abu-abu medium
              textAlign: "center"
            }}>
              Kategori: {item.category}
            </Text>

            <Text style={{
              fontSize: 13,
              marginTop: 3,
              color: "#666", // Abu-abu medium
              textAlign: "center"
            }}>
              ⭐ {item.rating} • Terlaris Minggu Ini
            </Text>

            <Text 
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 8,
                color: "#FF8C00", // Warna aksen baru (oranye)
                textAlign: "center"
              }}
            >
              Rp {item.price.toLocaleString("id-ID")}
            </Text>

            {/* Tambahan kalimat menarik */}
            <Text 
              style={{
                fontSize: 12,
                marginTop: 6,
                color: "#FF8C00", // Warna aksen oranye
                fontWeight: "600",
                textAlign: "center"
              }}
            >
              ✨ Best Choice For You ✨
            </Text>
          </View>

          {/* GAMBAR */}
          <Image
            source={item.image}
            style={{
              width: 120,
              height: 120,
              borderRadius: 10,
              resizeMode: "contain",
            }}
          />
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>


          {/* SPECIAL OFFERS */}
          <View style={{ paddingHorizontal: 15, marginTop: -20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0D1B2A", marginBottom: 10 }}>Penawaran Spesial Untukmu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {specialOffers.map((item) => (
                <TouchableOpacity key={item.id} style={{ width: 280, height: 140, backgroundColor: "#FFFFFF", borderRadius: 15, marginRight: 15, flexDirection: "row", padding: 10, elevation: 3, borderWidth: 1, borderColor: '#EEE'}} onPress={() => goToDetail(item)}>
                  {/* BADGE DISKON */}
                  {item.discount && (
                    <View style={{ position: "absolute", top: 0, left: 0, backgroundColor: "#FF8C00", paddingVertical: 4, paddingHorizontal: 8, borderTopLeftRadius: 15, borderBottomRightRadius: 15, zIndex: 1, elevation: 5}}>
                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>{item.discount}% OFF</Text>
                    </View>
                  )}

                  <Image source={item.image} style={{ width: 120, height: 120 }} resizeMode="contain" />
                  <View style={{ flex: 1, marginLeft: 10, justifyContent: "center" }}>
                    <Text style={{ color: "#0D1B2A", fontSize: 16, fontWeight: "bold" }} numberOfLines={2}>{item.name}</Text>
                    {item.discount ? (
                      <View>
                        <Text style={{ fontSize: 12, color: "#888", textDecorationLine: "line-through" }}>Rp {item.price.toLocaleString("id-ID")}</Text>
                        <Text style={{ color: "#FF8C00", fontSize: 16, fontWeight: 'bold' }}>Rp {getDiscountedPrice(item).toLocaleString("id-ID")}</Text>
                      </View>
                    ) : (
                      <Text style={{ color: "#0D1B2A", marginTop: 5, fontSize: 16, fontWeight: 'bold' }}>Rp {item.price.toLocaleString("id-ID")}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* KATEGORI */}
          <View style={{ paddingHorizontal: 15, marginVertical: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0D1B2A", marginBottom: 10 }}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((c, i) => (
                <TouchableOpacity key={i} onPress={() => { setActiveCategory(c); setSearchQuery(""); }} style={{ flexDirection: "row", alignItems: "center", backgroundColor: activeCategory === c ? "#0D1B2A" : "#FFF", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: "#DDD" }}>
                  <Ionicons name={categoryIcons[c]} size={18} color={activeCategory === c ? "#FFF" : "#0D1B2A"} style={{ marginRight: 8 }} />
                  <Text style={{ color: activeCategory === c ? "#FFF" : "#0D1B2A", fontWeight: "600" }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* GRID PRODUK */}

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 15, marginTop: 15 }}>
            {filteredProducts.map((item) => (
              <View key={item.id} style={{ width: "48%", backgroundColor: "#FFF", borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}>

                {/* BADGE DISKON */}
                {item.discount && (
                  <View style={{ position: "absolute", top: 0, left: 0, backgroundColor: "#FF8C00", paddingVertical: 4, paddingHorizontal: 6, borderTopLeftRadius: 12, borderBottomRightRadius: 12, zIndex: 1 }}>
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>{item.discount}% OFF</Text>
                  </View>
                )}

                <TouchableOpacity onPress={() => goToDetail(item)}>
                  <Image source={item.image} resizeMode="contain" style={{ width: "100%", height: 140, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                </TouchableOpacity>

                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#0D1B2A", height: 38 }} numberOfLines={2}>{item.name}</Text>

                  {/* HARGA */}
                  {item.discount ? (
                    <View>
                      <Text style={{ fontSize: 12, color: "#888", textDecorationLine: "line-through" }}>Rp {item.price.toLocaleString("id-ID")}</Text>
                      <Text style={{ fontSize: 17, fontWeight: "bold", color: "#D9534F" }}>Rp {getDiscountedPrice(item).toLocaleString("id-ID")}</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 17, fontWeight: "bold", color: "#D9534F" }}>Rp {item.price.toLocaleString("id-ID")}</Text>
                  )}

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                        <Ionicons name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: "#666" }}>{item.rating}</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="location-outline" size={14} color="#888" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: "#666" }}>{item.location}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => goToDetail(item)}>
                      <Ionicons name="add-circle" size={28} color="#0D1B2A" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* RIWAYAT PENCARIAN */}
        {isHistoryVisible && searchHistory.length > 0 && (
          <View style={{ position: "absolute", top: 145, left: 20, right: 20, backgroundColor: "white", borderRadius: 8, elevation: 5, zIndex: 10 }}>
            {searchHistory.map((item, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", padding: 12, borderBottomWidth: 1, borderBottomColor: "#EEE" }}>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", flex: 1 }} onPress={() => { setSearchQuery(item); setTimeout(() => executeSearch(), 0); }}>
                  <Ionicons name="time-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                  <Text>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSearchHistory(searchHistory.filter((x) => x !== item))}>
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