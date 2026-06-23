import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ScrollView, Modal, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from "@react-navigation/native";
import api from '../Service/api';

const BASE_URL = "http://10.89.16.228:8000/storage/";
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function ProfilScreen({ navigation }) {
  const [profile, setProfile]         = useState({ name: '', email: '', photo: null });
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [tempName, setTempName]         = useState('');
  const [tempEmail, setTempEmail]       = useState('');
  const [tempImageUri, setTempImageUri] = useState(null); // URI lokal sementara
  const [newImageFile, setNewImageFile] = useState(null); // File untuk diupload

  // ── FETCH PROFIL ──
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('token');
      const response = await api.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        // Sesuaikan field dengan response Laravel kamu
        const data = response.data.data ?? response.data;
        setProfile({
          name:  data.name  || '',
          email: data.email || '',
          photo: data.photo || data.image || null,
        });
      }
    } catch (error) {
      console.log('Fetch profile error:', error.response?.data || error.message);
      Alert.alert('Error', 'Gagal memuat data profil.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchProfile(); }, [])
  );

  // ── BUKA MODAL EDIT ──
  const openEditModal = () => {
    setTempName(profile.name);
    setTempEmail(profile.email);
    setTempImageUri(null);
    setNewImageFile(null);
    setModalVisible(true);
  };

  // ── PILIH GAMBAR ──
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Berikan izin untuk mengakses galeri.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setTempImageUri(asset.uri);
      setNewImageFile(asset);
    }
  };

  // ── SIMPAN PERUBAHAN ──
  const handleSaveChanges = async () => {
    if (!tempName.trim()) {
      Alert.alert('Peringatan', 'Nama tidak boleh kosong.');
      return;
    }

    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('token');

      // 1. Update nama & email
      await api.put('/user', 
        { name: tempName, email: tempEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Upload foto jika ada foto baru
      if (newImageFile) {
        const formData = new FormData();
        formData.append('photo', {
          uri:  newImageFile.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });

        await api.post('/user/photo', formData, {
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // 3. Refresh data dari server
      await fetchProfile();
      setModalVisible(false);
      Alert.alert('Berhasil', 'Profil berhasil diperbarui.');

    } catch (error) {
      console.log('Save profile error:', error.response?.data || error.message);
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  // ── LOGOUT ──
  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            await SecureStore.deleteItemAsync('token');
            navigation.replace('Splash'); // ganti ke nama screen login kamu
          },
        },
      ]
    );
  };

  // ── HELPER GAMBAR PROFIL ──
  const getProfileImage = () => {
    // Prioritas: foto baru (lokal) → foto dari DB → default avatar
    if (tempImageUri) return { uri: tempImageUri };
    if (profile.photo) {
      return {
        uri: profile.photo.startsWith('http')
          ? profile.photo
          : `${BASE_URL}${profile.photo}`,
      };
    }
    return { uri: DEFAULT_AVATAR };
  };

  // ── LOADING ──
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D1B2A" />
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akun Saya</Text>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <Image source={getProfileImage()} style={styles.profileImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile.name || '-'}</Text>
          <Text style={styles.profileEmail}>{profile.email || '-'}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
          <Ionicons name="create-outline" size={22} color="#0D1B2A" />
        </TouchableOpacity>
      </View>

      {/* MENU */}
      <View style={styles.menuWrapper}>
        <Text style={styles.menuTitle}>Akun</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Pesanan')}>
          <Ionicons name="document-text-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Pesanan Saya</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Keranjang')}>
          <Ionicons name="cart-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Keranjang</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuWrapper}>
        <Text style={styles.menuTitle}>Bantuan</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PetunjukPengguna')}>
          <Ionicons name="book-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Petunjuk Pengguna</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PusatBantuan')}>
          <Ionicons name="help-circle-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Pusat Bantuan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SyaratdanKetentuan')}>
          <Ionicons name="document-attach-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Syarat & Ketentuan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('TentangAplikasi')}>
          <Ionicons name="information-circle-outline" size={22} color="#0D1B2A" />
          <Text style={styles.menuText}>Tentang Aplikasi</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      {/* MODAL EDIT PROFIL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profil</Text>

            {/* FOTO */}
            <TouchableOpacity onPress={pickImage} style={styles.photoWrapper}>
              <Image source={getProfileImage()} style={styles.modalImage} />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changeImageText}>Ketuk foto untuk mengubah</Text>

            {/* INPUT */}
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
              autoCapitalize="none"
            />

            {/* TOMBOL */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveButtonText}>Simpan</Text>
                }
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
  container:        { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText:      { marginTop: 10, color: '#ADB5BD' },

  header:      { backgroundColor: '#0D1B2A', paddingVertical: 40, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  profileCard:  { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: -20, marginHorizontal: 15, borderRadius: 12, elevation: 3 },
  profileImage: { width: 65, height: 65, borderRadius: 50, marginRight: 15 },
  profileName:  { fontSize: 18, fontWeight: '700', color: '#0D1B2A' },
  profileEmail: { fontSize: 14, color: '#666' },
  editButton:   { padding: 6 },

  menuWrapper: { marginTop: 25, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 15 },
  menuTitle:   { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0D1B2A' },
  menuItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuText:    { marginLeft: 12, fontSize: 15, color: '#0D1B2A' },

  logoutButton: { marginTop: 25, marginHorizontal: 15, marginBottom: 40, backgroundColor: '#ea120a', paddingVertical: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  logoutText:   { color: '#fff', fontSize: 16, marginLeft: 10, fontWeight: '700' },

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent:   { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle:     { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#0D1B2A' },

  photoWrapper:     { position: 'relative' },
  modalImage:       { width: 100, height: 100, borderRadius: 50, marginBottom: 6 },
  cameraIcon:       { position: 'absolute', bottom: 6, right: 0, backgroundColor: '#0D1B2A', borderRadius: 12, padding: 4 },
  changeImageText:  { color: '#888', fontSize: 13, marginBottom: 20 },

  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 15, fontSize: 16 },

  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  modalButton:          { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton:         { backgroundColor: '#f0f0f0', marginRight: 10 },
  cancelButtonText:     { color: '#0D1B2A', fontWeight: 'bold', fontSize: 16 },
  saveButton:           { backgroundColor: '#0D1B2A' },
  saveButtonText:       { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});