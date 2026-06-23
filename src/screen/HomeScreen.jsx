import { useState } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { TextInput, ScrollView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import * as SecureStore from 'expo-secure-store';
import api from "../Service/api";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    navigation.navigate("WebView", {
      url: "https://accounts.google.com/login"
    });
  };

  const handleFacebookLogin = () => {
    navigation.navigate("WebView", {
      url: "https://www.facebook.com/login"
    });
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/login", {
        email: email,
        password: password,
      });

      if (response.data.success) {
        // Simpan token & data user ke SecureStore agar bisa dibaca oleh api.jsx
        await SecureStore.setItemAsync('token', response.data.data.token);
        await SecureStore.setItemAsync('name', response.data.data.name);
        await SecureStore.setItemAsync('email', response.data.data.email);

        Alert.alert("Login Berhasil", `Selamat datang, ${response.data.data.name}!`);
        navigation.navigate("Tabs");
      } else {
        Alert.alert("Login Gagal", response.data.message);
      }

    } catch (error) {
      console.log("Login Error:", error.response?.data || error.message);
      Alert.alert(
        "Login Gagal",
        error.response?.data?.message || "Tidak dapat terhubung ke server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            
            {/* HEADER */}
            <View style={styles.headerContainer}>
              <Image
                source={require("../../assets/Logo/brand-removebg-preview.png")}
                style={styles.logo}
              />
              <Text style={styles.subtitle}>Masuk untuk melanjutkan belanja.</Text>
            </View>

            {/* INPUT EMAIL */}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#ADB5BD"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            {/* INPUT PASSWORD */}
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#ADB5BD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                style={styles.passwordInput}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                <FontAwesomeIcon
                  icon={isPasswordVisible ? faEyeSlash : faEye}
                  size={20}
                  color="#ADB5BD"
                />
              </TouchableOpacity>
            </View>

            {/* LUPA SANDI */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Lupa Sandi?</Text>
            </TouchableOpacity>

            {/* TOMBOL LOGIN */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#F8F9FA" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>


            {/* LINK REGISTER */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Registrasi")} disabled={isLoading}>
                <Text style={styles.registerButtonText}>Daftar di sini</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#ADB5BD',
  },
  input: {
    height: 45,
    width: '80%',
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ADB5BD',
    color: '#343A40',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ADB5BD',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#343A40',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginRight: '11%',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#343A40',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: "#0D1B2A",
    borderRadius: 8,
    height: 45,
    width: '80%',
    justifyContent: "center",
    alignItems: 'center',
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: '#F8F9FA',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ADB5BD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  socialLoginContainer: {
    width: '80%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 45,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ADB5BD',
    marginBottom: 15,
  },
  socialButtonText: {
    color: '#343A40',
    fontWeight: '500',
    marginLeft: 10,
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#ADB5BD',
    fontSize: 14,
  },
  registerButtonText: {
    color: '#343A40',
    fontSize: 14,
    fontWeight: 'bold',
  },
});