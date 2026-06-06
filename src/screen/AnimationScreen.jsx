import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, StatusBar, Animated, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AnimationScreen() {
  const navigation = useNavigation();

  // Animasi
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Animasi berjalan paralel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigasi ke SplashScreen setelah animasi selesai
    const timer = setTimeout(() => {
      navigation.replace('Splash');
    }, 2500); // Durasi navigasi disesuaikan dengan animasi

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ADB5BD" />
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }]}>
        <Image
          source={require("../../assets/Logo/brand-removebg-preview.png")}
          style={styles.logo}
        />
        <Text style={styles.titleText}>   W I R O S</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADB5BD',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 170,
    resizeMode: 'contain',
  },
  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: '#222',
    marginTop: 10,
  },
});
