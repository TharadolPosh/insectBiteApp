import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";

const InsectDetailScreen = ({ route }) => {
  const { insect = {}, confidence, uploadedImage } = route.params || {}; // กัน undefined

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{insect?.thaiName || "ไม่พบข้อมูล"}</Text>
      <Image source={{ uri: insect?.normal || "https://via.placeholder.com/200" }} style={styles.image} />
      <Text style={styles.confidence}>ความมั่นใจ: {confidence ? `${confidence}%` : "ไม่ระบุ"}</Text>

      {/* แสดงรูปที่ผู้ใช้อัปโหลด */}
      <Text style={styles.sectionTitle}>รูปที่อัปโหลด</Text>
      {uploadedImage ? (
        <Image source={{ uri: uploadedImage }} style={styles.image} />
      ) : (
        <Text style={styles.text}>ไม่มีรูปที่อัปโหลด</Text>
      )}

      <Text style={styles.sectionTitle}>ลักษณะบาดแผล</Text>
      <Image source={{ uri: insect?.wound || "https://via.placeholder.com/200" }} style={styles.image} />

      <Text style={styles.sectionTitle}>อาการ</Text>
      <Text style={styles.text}>{insect?.symptom || "ไม่มีข้อมูล"}</Text>

      <Text style={styles.sectionTitle}>วิธีปฐมพยาบาล</Text>
      <Text style={styles.text}>{insect?.firstAid || "ไม่มีข้อมูล"}</Text>

      <Text style={styles.sectionTitle}>รายละเอียด</Text>
      <Text style={styles.text}>{insect?.description || "ไม่มีข้อมูล"}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  confidence: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    marginTop: 5,
    color: "#333",
  },
});

export default InsectDetailScreen;
