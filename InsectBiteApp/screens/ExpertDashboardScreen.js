import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";

const API_URL = "http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites"; // แก้ไข URL ให้ตรงกับเซิร์ฟเวอร์ของคุณ

const ExpertDashboardScreen = ({ navigation }) => {
  const [insects, setInsects] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // ✅ สร้าง state สำหรับรีเฟรช

  useEffect(() => {
    fetchInsects();
  }, []);

  const fetchInsects = async () => {
    try {
      setRefreshing(true); // ✅ ตั้งค่าให้เริ่มรีเฟรช
      const response = await fetch(API_URL);
      const data = await response.json();
      setInsects(data);
    } catch (error) {
      console.error("Error fetching insects:", error);
    } finally {
      setRefreshing(false); // ✅ หยุดรีเฟรชเมื่อโหลดเสร็จ
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("EditInsect", { insect: item })}>
      <Image source={{ uri: `data:image/png;base64,${item.image}` }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.nameEng}>{item.name_eng}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expert Dashboard</Text>

      {/* ปุ่มตรวจสอบประวัติการทำนาย */}
      <View style={styles.buttonContainer}>
        <Button title="ตรวจสอบประวัติการทำนาย" onPress={() => navigation.navigate("ExpertCase")} />
      </View>

      {/* ปุ่มเพิ่มข้อมูลแมลง */}
      <View style={styles.buttonContainer}>
        <Button title="เพิ่มข้อมูลแมลง" onPress={() => navigation.navigate("AddInsect")} />
      </View>

      <FlatList
        data={insects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchInsects} /> // ✅ ใช้ RefreshControl
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    marginVertical: 10, // ✅ เพิ่มระยะห่างระหว่างปุ่ม
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nameEng: {
    fontSize: 14,
    color: "gray",
  },
});

export default ExpertDashboardScreen;
