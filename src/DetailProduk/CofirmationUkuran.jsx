import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfirmationUkuran = ({ visible, onClose, onAddToCart, productName, initialSize, initialType, initialQuantity }) => {
  // Contoh data, bisa diganti dengan data dinamis dari produk
  const availableSizes = ['41', '42', '43', '44', ];
  const availableTypes = ['Merah', 'Biru', 'Hitam'];

  const [selectedSize, setSelectedSize] = useState(initialSize || 'M');
  const [selectedType, setSelectedType] = useState(initialType || 'Merah');
  const [quantity, setQuantity] = useState(initialQuantity || 1);

  // useEffect untuk me-reset state ketika props berubah (modal dibuka untuk item baru)
  useEffect(() => {
    setSelectedSize(initialSize || 'M');
    setSelectedType(initialType || 'Merah');
    setQuantity(initialQuantity || 1);
  }, [visible, initialSize, initialType, initialQuantity]);

  if (!visible) {
    return null;
  }

  const handleAddToCart = () => {
    onAddToCart({ size: selectedSize, type: selectedType, qty: quantity });
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };


  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{productName}</Text>
          
          {/* Pilihan Ukuran */}
          <Text style={styles.optionLabel}>Pilih Ukuran:</Text>
          <View style={styles.optionContainer}>
            {availableSizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.optionButton, selectedSize === size && styles.optionButtonSelected]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.optionText, selectedSize === size && styles.optionTextSelected]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pilihan Jenis/Warna */}
          <Text style={styles.optionLabel}>Pilih Warna:</Text>
          <View style={styles.optionContainer}>
            {availableTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, selectedType === type && styles.optionButtonSelected]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.optionText, selectedType === type && styles.optionTextSelected]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pilihan Jumlah */}
          <Text style={styles.optionLabel}>Jumlah:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
              <Ionicons name="remove" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonAddToCart]}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart" size={20} color="white" />
            <Text style={styles.textStyle}>Tambah ke Keranjang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    marginTop: 15,
    marginBottom: 5,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#343A40',
    borderColor: '#343A40',
  },
  optionText: {
    color: '#333',
  },
  optionTextSelected: { color: '#fff' },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    width: '100%',
    marginBottom: 10,
  },
  buttonAddToCart: {
    backgroundColor: '#343A40',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#f0f0f0',
  },
  textStyle: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyleClose: {
    color: '#343A40',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 15,
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
    color: '#333',
  },
});

export default ConfirmationUkuran;