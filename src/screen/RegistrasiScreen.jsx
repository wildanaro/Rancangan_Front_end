import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import api from "../Service/api";

export default function RegistrasiScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleGoogleLogin = () => {
    navigation.navigate("WebView", { url: "https://accounts.google.com/login" });
  };

  const handleFacebookLogin = () => {
    navigation.navigate("WebView", { url: "https://www.facebook.com/login" });
  };

  const handleRegister = async () => {
    // Validasi frontend
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Semua kolom harus diisi.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password dan konfirmasi password tidak cocok.");
      return;
    }

    try {
      const response = await api.post("/register", {
        name: name,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
      });

      Alert.alert(
        "Registrasi Berhasil",
        response.data.message || "Akun berhasil dibuat."
      );

      navigation.navigate("Home");

    } catch (error) {
      console.log("Register Error:", error.response?.data || error.message);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        let pesan = "";
        Object.keys(errors).forEach((key) => {
          pesan += errors[key][0] + "\n";
        });
        Alert.alert("Registrasi Gagal", pesan.trim());
      } else {
        Alert.alert(
          "Registrasi Gagal",
          error.response?.data?.message || "Tidak dapat terhubung ke server."
        );
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Buat Akun Baru</Text>
        <Text style={styles.subtitle}>Isi detail di bawah untuk mendaftar.</Text>
      </View>

      <View style={styles.inputContainer}>

        {/* NAME */}
        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          placeholderTextColor="#ADB5BD"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* EMAIL */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ADB5BD"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* PASSWORD */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#ADB5BD"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
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

        {/* KONFIRMASI PASSWORD */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Konfirmasi Password"
            placeholderTextColor="#ADB5BD"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            style={styles.eyeIcon}
          >
            <FontAwesomeIcon
              icon={isConfirmPasswordVisible ? faEyeSlash : faEye}
              size={20}
              color="#ADB5BD"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Daftar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>atau</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
          <FontAwesomeIcon icon={faGoogle} size={20} color="#db4437" />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
          <FontAwesomeIcon icon={faFacebook} size={20} color="#4267B2" />
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Sudah punya akun? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.loginButtonText}>Masuk di sini</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ADB5BD',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 45,
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
    width: '90%',
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ADB5BD',
  },
  passwordInput: {
    flex: 1,
    color: '#343A40',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    width: '90%',
    height: 45,
    backgroundColor: '#343A40',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#F8F9FA',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
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
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 45,
    width: '48%',
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#ADB5BD',
    fontSize: 14,
  },
  loginButtonText: {
    color: '#343A40',
    fontSize: 14,
    fontWeight: 'bold',
  },
});