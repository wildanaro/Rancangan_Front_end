import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screen/HomeScreen"; // Impor dari screen
import Tabs from "./Tabs"; // Impor dari routers
import RegistrasiScreen from "../screen/RegistrasiScreen"; // Impor layar registrasi
import ForgotPasswordScreen from "../screen/ForgotPasswordScreen"; // Impor layar Lupa Sandi
import WebViewScreen from "../screen/WebViewScreen"; // Impor layar WebView
import SplashScreen from "../screen/SplashScreen"; // Impor layar Splash
import DetailProduk1 from "../DetailProduk/DetailProduk1";
import DetailProduk2 from "../DetailProduk/DetailProduk2";
import DetailProduk3 from "../DetailProduk/DetailProduk3";
import DetailProduk4 from "../DetailProduk/DetailProduk4";
import DetailProduk5 from "../DetailProduk/DetailProduk5";
import DetailProduk6 from "../DetailProduk/DetailProduk6";
import DetailProduk7 from "../DetailProduk/DetailProduk7";
import DetailProduk8 from "../DetailProduk/DetailProduk8";  
import DetailProduk9 from "../DetailProduk/DetailProduk9";
import DetailProduk10 from "../DetailProduk/DetailProduk10";
import KeranjangScreen from "../screen/KeranjangScreen"; 
import CheckoutScreen from "../screen/CheckoutScreen";
import PetunjukPenggunaScreen from "../Profil/PetunjukPengguna";
import PusatBantuanScreen from "../Profil/PusatBantuan";
import SyaratdanKetentuanScreen from "../Profil/SyaratdanKetentuan";
import TentangAplikasiScreen from "../Profil/TentangAplikasi";
import AnimationScreen from "../screen/AnimationScreen";



const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Animation" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Animation" component={AnimationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Registrasi" component={RegistrasiScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="WebView" component={WebViewScreen} options={{ headerShown: true, title: 'Login' }} />
      <Stack.Screen name="DetailProduk1" component={DetailProduk1} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk2" component={DetailProduk2} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk3" component={DetailProduk3} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk4" component={DetailProduk4} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk5" component={DetailProduk5} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk6" component={DetailProduk6} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk7" component={DetailProduk7} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk8" component={DetailProduk8} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk9" component={DetailProduk9} options={{ headerShown: false }} />
      <Stack.Screen name="DetailProduk10" component={DetailProduk10} options={{ headerShown: false }} />
      <Stack.Screen name="Keranjang" component={KeranjangScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PetunjukPengguna" component={PetunjukPenggunaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PusatBantuan" component={PusatBantuanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SyaratdanKetentuan" component={SyaratdanKetentuanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TentangAplikasi" component={TentangAplikasiScreen} options={{ headerShown: false }} />

    
      <Stack.Screen name="Tabs" component={Tabs} />
    </Stack.Navigator>
  );
}

export default RootStack;