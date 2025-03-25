import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "@react-navigation/native";
import { sendDeviceFingerprint } from '../services/deviceService';

const API_URL = "https://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/upload"; // เปลี่ยนเป็น IP เซิร์ฟเวอร์ของคุณ

function ScanScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setImageUri(null);
    }, [])
  );

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus.status !== "granted" || libraryStatus.status !== "granted") {
      alert("จำเป็นต้องขอสิทธิ์ในการเข้าถึงกล้องและแกลเลอรี");
      return false;
    }
    return true;
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error("ไฟล์ไม่พบ");
  
      const fingerprintData = await sendDeviceFingerprint();
      if (!fingerprintData) throw new Error("ไม่สามารถดึงข้อมูลอุปกรณ์ได้");
  
      const formData = new FormData();
      formData.append("image", {
        uri: fileInfo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });
      formData.append("user_id", "12345"); // ใส่ user_id ตามต้องการ
      formData.append("fingerprint", fingerprintData.fingerprint);
  
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
  
      const result = await response.json();
      if (response.ok) {
        Alert.alert("สำเร็จ", "อัปโหลดรูปภาพสำเร็จ");
  
        const imageUrl = result?.uploadData?.image_url || result?.data?.image_url || "";
        if (!imageUrl) {
          Alert.alert("ผิดพลาด", "ไม่พบ URL ของรูปภาพ");
          return;
        }
  
        // ✅ ส่งค่า `imageUri` ไปด้วย
        navigation.navigate("PredictionResult", { prediction: result, uploadedImage: uri });
  
      } else {
        Alert.alert("ผิดพลาด", result.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploading(false);
    }
  };
  

  const openCamera = async () => {
    if (!(await requestPermissions())) return;
    try {
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.Images, quality: 1 });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await uploadImage(uri);
      }
    } catch (error) {
      console.error("Error launching camera: ", error);
    }
  };

  const openGallery = async () => {
    if (!(await requestPermissions())) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.Images, quality: 1 });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await uploadImage(uri);
      }
    } catch (error) {
      console.error("Error launching gallery: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>สแกนบาดแผล</Text>
      <TouchableOpacity style={styles.button} onPress={openCamera} disabled={uploading}>
        <Text style={styles.buttonText}>{uploading ? "กำลังอัปโหลด..." : "เปิดกล้อง"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={openGallery} disabled={uploading}>
        <Text style={styles.buttonText}>{uploading ? "กำลังอัปโหลด..." : "เลือกภาพจากแกลเลอรี"}</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#4caf50",
  },
});

export default ScanScreen;