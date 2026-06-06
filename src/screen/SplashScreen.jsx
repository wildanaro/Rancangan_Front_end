import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/Logo/brand-removebg-preview.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to WIROS Store</Text>
          <Text style={styles.subtitle}>Platform belanja online terbaik untuk semua kebutuhanmu.</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.buttonText, styles.loginButtonText]}>Masuk</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => navigation.navigate('Registrasi')}
          >
            <Text style={[styles.buttonText, styles.registerButtonText]}>Daftar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#343A40',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40, // Memberi jarak dari bawah layar
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    width: '48%', // Menyesuaikan lebar agar muat berdampingan
  },
  loginButton: {
    backgroundColor: '#0D1B2A',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0D1B2A',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButtonText: {
    color: '#FFFFFF',
  },
  registerButtonText: {
    color: '#343A40',
  },
});