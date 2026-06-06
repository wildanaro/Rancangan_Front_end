import React from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function WebViewScreen({ route }) {
  // Ambil URL dari parameter navigasi
  const { url } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{ uri: url }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});