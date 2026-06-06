import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import Screens
import Log from "../screen/Log"; // Impor dari screen
import PesananScreen from "../screen/PesananScreen"; // Impor dari screen
import ProfilScreen from "../screen/ProfilScreen"; // Impor dari screen
import KeranjangScreen from "../screen/KeranjangScreen";

// Import CartContext untuk mendapatkan jumlah item
import { useCart } from "../../CartContext";

const Tab = createBottomTabNavigator();

// Komponen kustom untuk ikon keranjang dengan badge
const CartIconWithBadge = ({ focused, color, size }) => {
  const { cartItemCount } = useCart();

  return (
    <View style={{ width: 24, height: 24, margin: 5 }}>
      <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
      {cartItemCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -3,
            backgroundColor: 'red',
            borderRadius: 8,
            width: 16,
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {cartItemCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// Komponen kustom untuk ikon pesanan dengan badge
const OrderIconWithBadge = ({ focused, color, size }) => {
  const { orders } = useCart();
  const orderCount = orders.length;

  return (
    <View style={{ width: 24, height: 24, margin: 5 }}>
      <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
      {orderCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -3,
            backgroundColor: 'red',
            borderRadius: 8,
            width: 16,
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {orderCount}
          </Text>
        </View>
      )}
    </View>
  );
};

function Tabs() {
  return (
    <Tab.Navigator initialRouteName="Beranda" screenOptions={{
      tabBarActiveTintColor: '#0D1B2A',
      tabBarInactiveTintColor: 'gray',
      tabBarShowLabel: true, // Tampilkan kembali label teks pada tab
    }}>
      <Tab.Screen
        name="Beranda"
        component={Log} // Menggunakan komponen Log sebagai tab Home
        options={{
          headerShown: false, // Sembunyikan header untuk tab Beranda
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
       <Tab.Screen
        name="Keranjang"
        component={KeranjangScreen}
        options={{
          tabBarIcon: (props) => <CartIconWithBadge {...props} />,
        }}
      />
      <Tab.Screen
        name="Pesanan"
        component={PesananScreen}
        options={{
          tabBarIcon: (props) => <OrderIconWithBadge {...props} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default Tabs;