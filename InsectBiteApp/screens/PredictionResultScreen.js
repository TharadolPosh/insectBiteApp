import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

const INSECT_API_URL = "http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites";

function PredictionResultScreen({ route, navigation }) {
  const { prediction, uploadedImage } = route.params;
  const [insectData, setInsectData] = useState([]);
  const [insectImages, setInsectImages] = useState({});

  useEffect(() => {
    if (prediction && prediction.analysisData) {
      const groupedInsects = {};
      prediction.analysisData.forEach((item) => {
        if (!groupedInsects[item.insect_type]) {
          groupedInsects[item.insect_type] = { ...item, count: 1 };
        } else {
          groupedInsects[item.insect_type].confidence += item.confidence;
          groupedInsects[item.insect_type].count += 1;
        }
      });

      const sortedInsects = Object.values(groupedInsects)
      .map((insect) => ({
        name: insect.insect_type,
        confidence: insect.count > 0 ? (insect.confidence / insect.count).toFixed(2) : "0.00", // ป้องกันหารด้วย 0
      }))
      .sort((a, b) => b.confidence - a.confidence);


      setInsectData(sortedInsects);
    }
  }, [prediction]);

  useEffect(() => {
    const fetchInsectImages = async () => {
      try {
        const response = await axios.get(INSECT_API_URL);
        const insectMap = response.data.reduce((acc, insect) => {
          acc[insect.name_eng] = {
            normal: insect.image ? `data:image/png;base64,${insect.image}` : null,
            wound: insect.wound_image ? `data:image/png;base64,${insect.wound_image}` : null,
            thaiName: insect.name,
            description: insect.description,
            symptom: insect.symptom_description,
            firstAid: insect.first_aid_method,
          };
          return acc;
        }, {});
        setInsectImages(insectMap);
      } catch (error) {
        console.error("Error fetching insect images:", error);
      }
    };
    fetchInsectImages();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ผลการทำนาย</Text>

      {insectData.length === 0 ? (
        <View style={styles.noResultContainer}>
          <Text style={styles.noResultText}>ไม่สามารถทำนายผลจากรูปนี้ได้</Text>
          <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
        </View>
      ) : (
        <FlatList
          data={insectData}
          keyExtractor={(item, index) => `${item.name}-${index}`} // Ensure uniqueness
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                const insectDetail = insectImages[item.name] || {}; // ถ้าไม่มีให้ส่ง object ว่างๆ กัน error
                navigation.navigate("InsectDetail", { 
                  insect: insectDetail, 
                  confidence: item.confidence,
                  uploadedImage 
                });
              }}
            >

              <Image source={{ uri: insectImages[item.name]?.normal || "https://via.placeholder.com/100" }} style={styles.image} />
              <Text style={styles.insectName}>{item.name}</Text>
              <Text style={styles.confidence}>
                ความมั่นใจ: {isNaN(parseFloat(item.confidence)) ? "0.00" : item.confidence}%
              </Text>
            </TouchableOpacity>
          )}
        />


      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  noResultContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noResultText: {
    fontSize: 18,
    color: "#d32f2f",
    fontWeight: "bold",
    marginBottom: 10,
  },
  uploadedImage: {
    width: 250,
    height: 250,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#d32f2f",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  insectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  confidence: {
    fontSize: 16,
    color: "#333",
  },
});

export default PredictionResultScreen;
