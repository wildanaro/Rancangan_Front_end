import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, RefreshControl,
  Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../Service/api';
import * as SecureStore from 'expo-secure-store';
import { useCart } from '../context/CartContext';

const BASE_URL = "http://10.89.16.228:8000/storage/";
const FALLBACK = require("../../assets/products/disply_kaos_polos.png");

const statusConfig = {
  pending:    { label: 'Menunggu Konfirmasi', color: '#FFA500', icon: 'time-outline' },
  processing: { label: 'Diproses',            color: '#0D6EFD', icon: 'sync-outline' },
  shipped:    { label: 'Dikirim',             color: '#6F42C1', icon: 'cube-outline' },
  delivered:  { label: 'Selesai',             color: '#28A745', icon: 'checkmark-circle-outline' },
  cancelled:  { label: 'Dibatalkan',          color: '#D9534F', icon: 'close-circle-outline' },
};

// Daftar alasan pembatalan
const CANCEL_REASONS = [
  'Salah pesan / ingin ganti produk',
  'Ingin mengubah alamat pengiriman',
  'Menemukan harga lebih murah di tempat lain',
  'Produk tidak dibutuhkan lagi',
  'Proses pengiriman terlalu lama',
  'Alasan lainnya',
];

export default function PesananScreen({ navigation }) {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState('all');

  // State untuk modal batalkan
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder]           = useState(null);
  const [selectedReason, setSelectedReason]         = useState('');
  const [isCancelling, setIsCancelling]             = useState(false);

  const { fetchOrderCount } = useCart();

  const fetchOrders = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.data);
        await fetchOrderCount();
      }
    } catch (error) {
      console.log('=== FETCH ORDERS ERROR ===', error.response?.data || error.message);
      Alert.alert('Error', 'Gagal memuat pesanan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Buka modal batalkan
  const handleCancelPress = (order) => {
    setSelectedOrder(order);
    setSelectedReason('');
    setCancelModalVisible(true);
  };

  // Konfirmasi batalkan pesanan
  const handleConfirmCancel = async () => {
    if (!selectedReason) {
      Alert.alert('Peringatan', 'Pilih alasan pembatalan terlebih dahulu.');
      return;
    }

    setIsCancelling(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await api.post(
        `/orders/${selectedOrder.id}/cancel`,
        { cancellation_reason: selectedReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCancelModalVisible(false);
        setSelectedOrder(null);
        setSelectedReason('');

        // Update state lokal tanpa perlu fetch ulang
        setOrders(prev =>
          prev.map(o =>
            o.id === selectedOrder.id
              ? { ...o, status: 'cancelled', cancellation_reason: selectedReason }
              : o
          )
        );

        await fetchOrderCount();
        Alert.alert('Berhasil', 'Pesanan berhasil dibatalkan. Stok produk telah dikembalikan.');
      }
    } catch (error) {
      console.log('=== CANCEL ORDER ERROR ===', error.response?.data || error.message);
      Alert.alert(
        'Gagal',
        error.response?.data?.message || 'Tidak dapat membatalkan pesanan.'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const getImageSource = (image) => {
    if (image) return { uri: `${BASE_URL}${image}` };
    return FALLBACK;
  };

  const tabs = [
    { key: 'all',       label: 'Semua' },
    { key: 'pending',   label: 'Diproses' },
    { key: 'shipped',   label: 'Dikirim' },
    { key: 'delivered', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ];

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const activeOrderCount = orders.filter(o =>
    ['pending', 'processing', 'shipped'].includes(o.status)
  ).length;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0D1B2A" />
        <Text style={styles.loadingText}>Memuat pesanan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Pesanan Saya</Text>
          <Text style={styles.headerSubtitle}>{orders.length} total pesanan</Text>
        </View>
        {activeOrderCount > 0 && (
          <View style={styles.headerBadge}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={styles.headerBadgeText}>{activeOrderCount} aktif</Text>
          </View>
        )}
      </View>

      {/* RINGKASAN */}
      {orders.length > 0 && (
        <View style={styles.summaryContainer}>
          {[
            { status: 'pending',   label: 'Menunggu' },
            { status: 'shipped',   label: 'Dikirim' },
            { status: 'delivered', label: 'Selesai' },
            { status: 'cancelled', label: 'Batal' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.status}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {orders.filter(o => o.status === s.status).length}
                </Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.summaryDivider} />}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* TABS */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {tabs.map(tab => {
            const count = tab.key === 'all'
              ? orders.length
              : orders.filter(o => o.status === tab.key).length;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0D1B2A']} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'all' ? 'Belum ada pesanan' : 'Tidak ada pesanan di kategori ini'}
            </Text>
            {activeTab === 'all' && (
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate("Tabs", { screen: "Beranda" })}
              >
                <Text style={styles.shopButtonText}>Mulai Belanja</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredOrders.map(order => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const canCancel = ['pending', 'processing'].includes(order.status);

            return (
              <View key={order.id} style={styles.orderCard}>

                {/* HEADER ORDER */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Pesanan #{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Ionicons name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                {/* ALASAN BATAL (jika dibatalkan) */}
                {order.status === 'cancelled' && order.cancellation_reason && (
                  <View style={styles.cancelReasonBox}>
                    <Ionicons name="information-circle-outline" size={14} color="#D9534F" />
                    <Text style={styles.cancelReasonText}>
                      Alasan: {order.cancellation_reason}
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />

                {/* JUMLAH ITEM */}
                <View style={styles.itemCountRow}>
                  <Ionicons name="cube-outline" size={14} color="#888" />
                  <Text style={styles.itemCountText}>
                    {order.order_items?.length || 0} jenis produk
                    {' · '}
                    {order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0} item
                  </Text>
                </View>

                {/* DAFTAR ITEM */}
                {order.order_items?.map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    <Image
                      source={getImageSource(item.product?.image)}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.product?.name || 'Produk'}
                      </Text>
                      {(item.size || item.color) && (
                        <View style={styles.optionsRow}>
                          {item.size  && <Text style={styles.optionBadge}>📐 {item.size}</Text>}
                          {item.color && <Text style={styles.optionBadge}>🎨 {item.color}</Text>}
                        </View>
                      )}
                      <Text style={styles.itemQty}>
                        {item.quantity}x Rp {Number(item.price).toLocaleString('id-ID')}
                      </Text>
                    </View>
                    <Text style={styles.itemSubtotal}>
                      Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                {/* TOTAL */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Pembayaran</Text>
                  <Text style={styles.totalValue}>
                    Rp {Number(order.total_price).toLocaleString('id-ID')}
                  </Text>
                </View>

                {/* INFO PENGIRIMAN */}
                <View style={styles.shippingInfo}>
                  <Ionicons name="location-outline" size={14} color="#888" />
                  <Text style={styles.shippingText} numberOfLines={1}>
                    {order.address || '-'}
                  </Text>
                </View>

                <View style={styles.shippingInfo}>
                  <Ionicons name="card-outline" size={14} color="#888" />
                  <Text style={styles.shippingText}>
                    {order.payment_method}{order.bank_type ? ` - ${order.bank_type}` : ''}
                  </Text>
                </View>

                {/* TOMBOL BATALKAN */}
                {canCancel && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelPress(order)}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#D9534F" />
                    <Text style={styles.cancelButtonText}>Batalkan Pesanan</Text>
                  </TouchableOpacity>
                )}

              </View>
            );
          })
        )}
      </ScrollView>

      {/* ══════════════════════════════════════
          MODAL BATALKAN PESANAN
      ══════════════════════════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* Handle bar */}
            <View style={styles.handleBar} />

            <Text style={styles.modalTitle}>Batalkan Pesanan</Text>
            <Text style={styles.modalSubtitle}>
              Pesanan #{selectedOrder?.id} · Pilih alasan pembatalan
            </Text>

            <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
              {CANCEL_REASONS.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason && styles.reasonItemSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View style={[
                    styles.reasonRadio,
                    selectedReason === reason && styles.reasonRadioSelected,
                  ]}>
                    {selectedReason === reason && (
                      <View style={styles.reasonRadioDot} />
                    )}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* TOMBOL AKSI */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setCancelModalVisible(false);
                  setSelectedReason('');
                }}
              >
                <Text style={styles.modalCancelText}>Kembali</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  !selectedReason && styles.modalConfirmBtnDisabled,
                ]}
                onPress={handleConfirmCancel}
                disabled={!selectedReason || isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Ya, Batalkan</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F8F9FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText:     { marginTop: 10, color: '#ADB5BD' },

  header: {
    backgroundColor: '#0D1B2A',
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerLeft:      {},
  headerTitle:     { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle:  { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E53935', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  headerBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

  summaryContainer: {
    backgroundColor: '#0D1B2A',
    flexDirection: 'row',
    paddingHorizontal: 20, paddingBottom: 15,
  },
  summaryItem:   { flex: 1, alignItems: 'center' },
  summaryNumber: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  summaryLabel:  { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  summaryDivider:{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  tabsWrapper:   { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabsContainer: { paddingHorizontal: 15, paddingVertical: 10 },
  tabButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8,
  },
  tabButtonActive:     { backgroundColor: '#0D1B2A' },
  tabText:             { color: '#555', fontSize: 13, fontWeight: '500' },
  tabTextActive:       { color: '#fff', fontWeight: '700' },
  tabBadge:            { backgroundColor: '#ccc', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 5 },
  tabBadgeActive:      { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBadgeText:        { color: '#555', fontSize: 10, fontWeight: 'bold' },
  tabBadgeTextActive:  { color: '#fff' },

  content:        { padding: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText:      { fontSize: 16, color: '#ADB5BD', marginTop: 15, textAlign: 'center' },
  shopButton:     { marginTop: 20, backgroundColor: '#0D1B2A', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  shopButtonText: { color: '#fff', fontWeight: 'bold' },

  orderCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 15, marginBottom: 15, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  orderHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId:      { fontSize: 15, fontWeight: 'bold', color: '#0D1B2A' },
  orderDate:    { fontSize: 12, color: '#ADB5BD', marginTop: 2 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:   { fontSize: 12, fontWeight: '600', marginLeft: 4 },

  cancelReasonBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF5F5', borderRadius: 8,
    padding: 8, marginTop: 8,
  },
  cancelReasonText: { fontSize: 12, color: '#D9534F', marginLeft: 6, flex: 1 },

  divider:      { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  itemCountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemCountText:{ fontSize: 12, color: '#888', marginLeft: 5 },

  itemRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemImage:   { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  itemInfo:    { flex: 1 },
  itemName:    { fontSize: 13, fontWeight: '600', color: '#0D1B2A' },
  optionsRow:  { flexDirection: 'row', marginTop: 3, flexWrap: 'wrap' },
  optionBadge: { fontSize: 10, color: '#555', backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 5, marginBottom: 3 },
  itemQty:     { fontSize: 12, color: '#888', marginTop: 3 },
  itemSubtotal:{ fontSize: 13, fontWeight: '600', color: '#0D1B2A' },

  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 14, color: '#555' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#D9534F' },

  shippingInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  shippingText: { fontSize: 12, color: '#888', marginLeft: 6, flex: 1 },

  cancelButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#D9534F', backgroundColor: '#FFF5F5',
  },
  cancelButtonText: { color: '#D9534F', fontWeight: '600', fontSize: 14, marginLeft: 6 },

  // MODAL
  modalOverlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent:  { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' },
  handleBar:     { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle:    { fontSize: 18, fontWeight: 'bold', color: '#0D1B2A', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#888', marginBottom: 16 },

  reasonsList: { maxHeight: 300 },
  reasonItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 8, backgroundColor: '#f8f8f8',
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  reasonItemSelected: { backgroundColor: '#FFF0F0', borderColor: '#D9534F' },
  reasonRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  reasonRadioSelected: { borderColor: '#D9534F' },
  reasonRadioDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D9534F' },
  reasonText:          { fontSize: 14, color: '#333', flex: 1 },
  reasonTextSelected:  { color: '#D9534F', fontWeight: '600' },

  modalButtons:      { flexDirection: 'row', marginTop: 20, gap: 10 },
  modalCancelBtn:    { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#0D1B2A', alignItems: 'center' },
  modalCancelText:   { color: '#0D1B2A', fontWeight: '600', fontSize: 15 },
  modalConfirmBtn:   { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#D9534F', alignItems: 'center' },
  modalConfirmBtnDisabled: { backgroundColor: '#ADB5BD' },
  modalConfirmText:  { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});