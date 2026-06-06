import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

function ProfilScreen({ navigation }) {
  // State untuk data profil
  const [name, setName] = useState("Wildan Arosyid");
  const [email, setEmail] = useState("user@email.com");
  const [imageUri, setImageUri] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");

  // State untuk modal dan input sementara
  const [modalVisible, setModalVisible] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);

  // Fungsi untuk membuka galeri dan memilih gambar
  const pickImage = async () => {
    // Meminta izin untuk mengakses galeri
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Izin Diperlukan", "Anda perlu memberikan izin untuk mengakses galeri foto.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
    }
  };

  // Fungsi untuk menyimpan perubahan dari modal
  const handleSaveChanges = () => {
    setName(tempName);
    setEmail(tempEmail);
    setModalVisible(false);
  };

  // Fungsi untuk membuka modal dan mengisi data saat ini
  const openEditModal = () => {
    setTempName(name);
    setTempEmail(email);
    setModalVisible(true);
  };

  // Fungsi untuk menangani proses logout
  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari akun Anda?",
      [
        {
          text: "Tidak",
          style: "cancel",
        },
        {
          text: "Ya",
          onPress: () => {
            // Di sini Anda bisa menambahkan logika lain seperti membersihkan data sesi/token.
            // Untuk saat ini, kita hanya akan navigasi ke layar awal.
            navigation.navigate('Splash');
          },
        },
      ]
    );
  };
  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akun Saya</Text>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: imageUri }}
          style={styles.profileImage}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
          <Ionicons name="create-outline" size={22} color="#0D1B2A" />
        </TouchableOpacity>
      </View>

      {/* MENU LIST */}
      <View style={styles.menuWrapper}>
        <Text style={styles.menuTitle}>Akun</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Pesanan")}>
          <Ionicons name="document-text-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Pesanan Saya</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Keranjang")}>
          <Ionicons name="cart-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Keranjang</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuWrapper}>
        <Text style={styles.menuTitle}>Bantuan</Text>

        <TouchableOpacity onPress={() => navigation.navigate("PetunjukPengguna")}
        style={styles.menuItem }>
          <Ionicons name="book-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Petunjuk Pengguna</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("PusatBantuan")}
        style={styles.menuItem }>
          <Ionicons name="help-circle-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Pusat Bantuan</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("SyaratdanKetentuan")}
        style={styles.menuItem}>
          <Ionicons name="document-attach-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Syarat & Ketentuan</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("TentangAplikasi")}
        style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Tentang Aplikasi</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      {/* MODAL UNTUK EDIT PROFIL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profil</Text>

            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: imageUri }} style={styles.modalImage} />
              <Text style={styles.changeImageText}>Ubah Foto Profil</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Nama Lengkap"
            />
            <TextInput
              style={styles.input}
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="Alamat Email"
              keyboardType="email-address"
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveChanges}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

export default ProfilScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  header: {
    backgroundColor: "#0D1B2A",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  profileCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: -20,
    marginHorizontal: 15,
    borderRadius: 12,
    elevation: 3,
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 50,
    marginRight: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: '#0D1B2A',
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    padding: 6,
  },

  menuWrapper: {
    marginTop: 25,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0D1B2A",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#0D1B2A",
  },

  logoutButton: {
    marginTop: 25,
    marginHorizontal: 15,
    backgroundColor: "#ea120aff",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "700",
  },

  // STYLES FOR MODAL
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0D1B2A',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changeImageText: {
    color: '#0D1B2A',
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0D1B2A',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
