import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/routers/RootStack";
import { CartProvider } from "./src/context/CartContext";
import api from "./src/Service/api";


export default function App() {
  return (
    // 1. Bungkus semua komponen dengan CartProvider
    <CartProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </CartProvider>
  );
}