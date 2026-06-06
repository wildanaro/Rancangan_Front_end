import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function TentangAplikasiScreen({ navigation }) {

  const appVersion = "1.0.0";

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* LOGO FROM LOCAL FILE */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../assets/Logo/brand-removebg-preview.png")} // 🔥 GANTI SESUAI PATH KAMU
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* APP NAME */}
        <Text style={styles.appName}>WIROS App</Text>
        <Text style={styles.appVersion}>Versi {appVersion}</Text>

        {/* DESCRIPTION */}
        <Text style={styles.description}>
          WIROS adalah brand fashion yang berfokus pada kenyamanan, desain elegan, 
          dan kualitas premium. Aplikasi ini dibuat sebagai platform resmi untuk 
          mempermudah transaksi penjualan produk WIROS secara digital.
        </Text>

        <Text style={[styles.description, { marginTop: -10 }]}>
          Pelanggan dapat menjelajahi berbagai produk eksklusif, memilih varian warna 
          dan ukuran, checkout dengan cepat, dan mendapatkan informasi produk secara lengkap.
        </Text>

        {/* BRAND INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Brand Name:</Text>
          <Text style={styles.infoContent}>WIROS — Fashion & Apparel</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Bidang Usaha:</Text>
          <Text style={styles.infoContent}>Fashion (Kaos, Hoodie, Outfit Harian)</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Developer:</Text>
          <Text style={styles.infoContent}>Wildan Arosyid</Text>
        </View>

        {/* COPYRIGHT */}
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} WIROS Brand. All Rights Reserved.
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    flexGrow: 1,
    padding: 30,
    alignItems: 'center',
  },

  logoContainer: {
    marginBottom: 20,
    marginTop: 20,
  },

  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 20,
  },

  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
    marginTop: 5,
  },

  appVersion: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },

  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    paddingHorizontal: 10,
  },

  infoSection: {
    marginBottom: 25,
    alignItems: 'center',
  },

  infoTitle: {
    fontSize: 14,
    color: '#888',
  },

  infoContent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginTop: 4,
  },

  footerText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    color: '#aaa',
  },
});

export default TentangAplikasiScreen;
