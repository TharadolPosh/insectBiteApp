import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AddInsectScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [nameEng, setNameEng] = useState('');
  const [description, setDescription] = useState('');
  const [symptom, setSymptom] = useState('');
  const [firstAid, setFirstAid] = useState('');
  const [insectImage, setInsectImage] = useState(null);
  const [woundImage, setWoundImage] = useState(null);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('สิทธิ์ถูกปฏิเสธ', 'กรุณาให้สิทธิ์เข้าถึงแกลเลอรี่เพื่อเลือกรูปภาพ');
      return false;
    }
    return true;
  };

  const pickImage = async (setImage) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.IMAGE,  // แก้ให้ถูกต้อง
      allowsEditing: true,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          name_eng: nameEng,
          description,
          symptom_description: symptom,
          first_aid_method: firstAid,
          image: insectImage,
          wound_image: woundImage,
        }),
      });

      if (response.ok) {
        Alert.alert('สำเร็จ', 'เพิ่มข้อมูลสำเร็จ!');
        navigation.goBack();
      } else {
        Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (error) {
      console.error('Error adding insect:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดปัญหาในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>เพิ่มข้อมูลแมลง</Text>
        <TextInput style={styles.input} placeholder="ชื่อแมลง" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="ชื่อภาษาอังกฤษ" value={nameEng} onChangeText={setNameEng} />
        <TextInput style={styles.input} placeholder="รายละเอียด" value={description} onChangeText={setDescription} multiline />
        <TextInput style={styles.input} placeholder="อาการ" value={symptom} onChangeText={setSymptom} multiline />
        <TextInput style={styles.input} placeholder="วิธีปฐมพยาบาล" value={firstAid} onChangeText={setFirstAid} multiline />

        {/* ปุ่มเลือกรูปแมลง */}
        <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setInsectImage)}>
          <Text style={styles.imagePickerText}>เลือกรูปแมลง</Text>
        </TouchableOpacity>
        {insectImage && <Image source={{ uri: insectImage }} style={styles.previewImage} />}

        {/* ปุ่มเลือกรูปบาดแผล */}
        <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setWoundImage)}>
          <Text style={styles.imagePickerText}>เลือกรูปบาดแผล</Text>
        </TouchableOpacity>
        {woundImage && <Image source={{ uri: woundImage }} style={styles.previewImage} />}

        <Button title="บันทึก" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20 },
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  imagePicker: { backgroundColor: '#006A7D', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  imagePickerText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  previewImage: { width: 100, height: 100, marginTop: 10, alignSelf: 'center' },
});

export default AddInsectScreen;
