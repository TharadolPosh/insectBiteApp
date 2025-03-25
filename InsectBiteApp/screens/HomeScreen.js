import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Button, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';
import { sendDeviceFingerprint } from '../services/deviceService';

const HomeScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    fetchImages();
    registerDevice();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites', { timeout: 5000 });
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.code === 'ECONNABORTED' ? 'Request timed out' : 'Error loading images');
    }
    setLoading(false);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchImages().finally(() => setRefreshing(false));
  }, []);

  const registerDevice = async () => {
    const result = await sendDeviceFingerprint();
    if (result) {
      setDeviceId(result.device_id);
    }
  };

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="ลองใหม่" onPress={fetchImages} color="#006A7D" />
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>ไม่พบรูปภาพในขณะนี้</Text>
        <Button title="รีเฟรช" onPress={fetchImages} color="#006A7D" />
      </View>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {deviceId && (
        <View style={styles.deviceIdContainer}>
          <Text style={styles.deviceIdText}>ID: {deviceId}</Text>
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.headerText}>ยินดีต้อนรับ</Text>
        <Text style={styles.subHeaderText}>
          แพลตฟอร์มรวบรวมรูปภาพรอยกัดแมลงจากสาธารณะ{"\n"}และระบบปัญญาประดิษฐ์เพื่อระบุชนิดแมลงกัด
        </Text>
      </View>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: `data:image/png;base64,${currentImage.image}` }} />
        <Text style={styles.imageDescription}>{currentImage.name}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="ช่วยตรวจสอบผลการทำนาย" onPress={() => navigation.navigate('Crowdsourcing')} color="#006A7D" />
        <Button title="รีเฟรช" onPress={handleRefresh} color="#FF9800" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 20 },
  textContainer: { alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 26, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subHeaderText: { fontSize: 16, color: '#555', marginTop: 8, lineHeight: 24, textAlign: 'center' },
  deviceIdContainer: { position: 'absolute', top: 20, right: 20, backgroundColor: '#f0f0f0', padding: 5, borderRadius: 5 },
  deviceIdText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  imageContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', padding: 10, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  image: { width: 320, height: 220, borderRadius: 12 },
  imageDescription: { marginTop: 15, fontSize: 18, fontWeight: '500', color: '#444', textAlign: 'center' },
  loadingText: { fontSize: 18, color: '#666' },
  errorText: { fontSize: 18, color: 'red' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { marginTop: 20, flexDirection: 'row', gap: 10 },
});

export default HomeScreen;
