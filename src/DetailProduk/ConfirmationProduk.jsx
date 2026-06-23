import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfirmationProduk = ({
  visible, onClose, onAddToCart,
  productName, initialSize, initialColor,
  initialQuantity, actionType, sizes, colors, maxStock,
}) => {
  const availableSizes  = sizes  || ['S', 'M', 'L', 'XL'];
  const availableColors = colors || ['Merah', 'Biru', 'Hitam'];

  const [selectedSize,  setSelectedSize]  = useState(initialSize  || availableSizes[0]);
  const [selectedColor, setSelectedColor] = useState(initialColor || availableColors[0]);
  const [quantity,      setQuantity]      = useState(initialQuantity || 1);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    setSelectedSize(initialSize   || availableSizes[0]);
    setSelectedColor(initialColor || availableColors[0]);
    setQuantity(initialQuantity   || 1);
  }, [visible, initialSize, initialColor, initialQuantity]);

  if (!visible) return null;

  const handleConfirm = async () => {
  console.log('=== HANDLE CONFIRM DIPANGGIL ===');
  setLoading(true);
  await onAddToCart({
    size:  selectedSize,
    color: selectedColor,
    qty:   quantity,
  });
  setLoading(false);
};

  const increaseQuantity = () => {
    if (maxStock && quantity >= maxStock) return;
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>

          {/* JUDUL */}
          <Text style={styles.modalTitle} numberOfLines={2}>{productName}</Text>

          {/* PILIH UKURAN */}
          <Text style={styles.optionLabel}>Pilih Ukuran:</Text>
          <View style={styles.optionContainer}>
            {availableSizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.optionButton, selectedSize === size && styles.optionButtonSelected]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.optionText, selectedSize === size && styles.optionTextSelected]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PILIH WARNA */}
          <Text style={styles.optionLabel}>Pilih Warna:</Text>
          <View style={styles.optionContainer}>
            {availableColors.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.optionButton, selectedColor === color && styles.optionButtonSelected]}
                onPress={() => setSelectedColor(color)}
              >
                <Text style={[styles.optionText, selectedColor === color && styles.optionTextSelected]}>
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* JUMLAH */}
          <Text style={styles.optionLabel}>Jumlah:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
              <Ionicons name="remove" size={20} color="#0D1B2A" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
              <Ionicons name="add" size={20} color="#0D1B2A" />
            </TouchableOpacity>
          </View>

          {/* INFO STOK */}
          {maxStock !== undefined && (
            <Text style={styles.stockInfo}>Stok tersedia: {maxStock}</Text>
          )}

          {/* TOMBOL KONFIRMASI */}
          <TouchableOpacity
            style={[styles.button, styles.buttonAddToCart]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                {actionType === 'addToCart' && <Ionicons name="cart" size={20} color="white" />}
                <Text style={styles.textStyle}>
                  {actionType === 'addToCart' ? 'Tambah ke Keranjang' : 'Beli Sekarang'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* TOMBOL BATAL */}
          <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
            <Text style={styles.textStyleClose}>Batal</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end', // Muncul dari bawah
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0D1B2A',
    marginBottom: 5,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 15,
    marginBottom: 8,
    color: '#0D1B2A',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#0D1B2A',
    borderColor: '#0D1B2A',
  },
  optionText: { color: '#333' },
  optionTextSelected: { color: '#fff' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    color: '#0D1B2A',
  },
  stockInfo: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#5cb85c',
    marginBottom: 5,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  buttonAddToCart: {
    backgroundColor: '#0D1B2A',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonClose: { backgroundColor: '#f0f0f0' },
  textStyle: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
  textStyleClose: { color: '#0D1B2A', fontWeight: 'bold', fontSize: 15 },
});

export default ConfirmationProduk;