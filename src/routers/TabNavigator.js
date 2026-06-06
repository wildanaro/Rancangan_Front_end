import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import BerandaScreen from '../screen/BerandaScreen';
import KeranjangScreen from '../screen/KeranjangScreen';
import PesananScreen from '../screen/PesananScreen';
import AkunScreen from '../screen/AkunScreen';

import { useCart } from '../../CartContext';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { cartItemCount, orders } = useCart();
  const orderCount = orders.length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let badgeCount = 0;

          if (route.name === 'Beranda') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Keranjang') {
            iconName = focused ? 'cart' : 'cart-outline';
            badgeCount = cartItemCount;
          } else if (route.name === 'Pesanan') {
            iconName = focused ? 'receipt' : 'receipt-outline';
            badgeCount = orderCount; // Gunakan jumlah pesanan untuk badge
          } else if (route.name === 'Akun') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={size} color={color} />
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#343A40',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarShowLabel: false, // Sembunyikan label agar ikon lebih rapi
      })}
    >
      <Tab.Screen name="Beranda" component={BerandaScreen} />
      <Tab.Screen name="Keranjang" component={KeranjangScreen} />
      <Tab.Screen name="Pesanan" component={PesananScreen} />
      <Tab.Screen name="Akun" component={AkunScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    margin: 5,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#E53935',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabNavigator;