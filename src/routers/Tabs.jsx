import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import Screens
import Log from "../screen/Log";
import PesananScreen from "../screen/PesananScreen";
import ProfilScreen from "../screen/ProfilScreen";
import KeranjangScreen from "../screen/KeranjangScreen";

import { useCart } from "../context/CartContext";

const Tab = createBottomTabNavigator();

function Tabs() {
  const { cartItemCount, orderCount, fetchOrderCount } = useCart();

  return (
    <Tab.Navigator
      initialRouteName="Beranda"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#0D1B2A',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
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
            badgeCount = orderCount;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={size} color={color} />
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Beranda"
        component={Log}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Keranjang"
        component={KeranjangScreen}
      />
      <Tab.Screen
        name="Pesanan"
        component={PesananScreen}
        options={{ headerShown: false }}
        listeners={{
          tabPress: () => fetchOrderCount(),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilScreen}
      />
    </Tab.Navigator>
  );
}

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
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Tabs;