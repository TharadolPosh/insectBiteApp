import React, { useState } from "react";
import { 
  View, Text, TextInput, Button, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform 
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites"; // แก้ไขให้ตรงกับเซิร์ฟเวอร์ของคุณ

const EditInsectScreen = ({ route, navigation }) => {
  const { insect } = route.params;

  const [name, setName] = useState(insect.name);
  const [nameEng, setNameEng] = useState(insect.name_eng);
  const [description, setDescription] = useState(insect.description);
  const [symptomDescription, setSymptomDescription] = useState(insect.symptom_description);
  const [firstAidMethod, setFirstAidMethod] = useState(insect.first_aid_method);
  const [image, setImage] = useState(`data:image/png;base64,${insect.image}`);
  const [woundImage, setWoundImage] = useState(`data:image/png;base64,${insect.wound_image}`);

  const pickImage = async (setImageFunction) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageFunction(`data:image/png;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/${insect.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          name_eng: nameEng,
          description,
          symptom_description: symptomDescription,
          first_aid_method: firstAidMethod,
          image: image.split(",")[1], // ส่งเฉพาะ base64 data
          wound_image: woundImage.split(",")[1], // ส่งภาพบาดแผล
        }),
      });
  
      const text = await response.text(); // ✅ อ่านค่าที่ตอบกลับมาก่อน
      console.log("Server Response:", text); // ✅ Log เพื่อตรวจสอบ
  
      let data;
      try {
        data = JSON.parse(text); // ✅ ลองแปลงเป็น JSON
      } catch (jsonError) {
        console.error("Invalid JSON:", jsonError);
        Alert.alert("ผิดพลาด", "เซิร์ฟเวอร์ตอบกลับมาไม่ใช่ JSON");
        return;
      }
  
      if (response.ok) {
        Alert.alert("บันทึกสำเร็จ!", "ข้อมูลแมลงถูกอัปเดตแล้ว", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert("ผิดพลาด", data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error updating insect:", error);
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };
  

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>แก้ไขข้อมูลแมลง</Text>

          <Text>ชื่อไทย</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text>ชื่ออังกฤษ</Text>
          <TextInput style={styles.input} value={nameEng} onChangeText={setNameEng} />

          <Text>คำอธิบาย</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

          <Text>อาการ</Text>
          <TextInput style={styles.input} value={symptomDescription} onChangeText={setSymptomDescription} multiline />

          <Text>วิธีปฐมพยาบาล</Text>
          <TextInput style={styles.input} value={firstAidMethod} onChangeText={setFirstAidMethod} multiline />

          <Text>รูปภาพแมลง</Text>
          <Image source={{ uri: image }} style={styles.image} />
          <Button title="เลือกภาพแมลงใหม่" onPress={() => pickImage(setImage)} />

          <Text>รูปภาพบาดแผล</Text>
          <Image source={{ uri: woundImage }} style={styles.image} />
          <Button title="เลือกภาพบาดแผลใหม่" onPress={() => pickImage(setWoundImage)} />

          <Button title="บันทึกการเปลี่ยนแปลง" onPress={handleSave} color="green" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
});

export default EditInsectScreen;
