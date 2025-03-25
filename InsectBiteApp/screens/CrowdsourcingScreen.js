import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ActivityIndicator, StyleSheet, FlatList, Button, RefreshControl, TextInput } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import DeviceInfo from 'react-native-device-info';

const CrowdsourcingScreen = () => {
  const [data, setData] = useState([]);
  const [insectList, setInsectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [comments, setComments] = useState({});
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    DeviceInfo.getUniqueId().then(uniqueId => {
      setDeviceFingerprint(uniqueId);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [deviceFingerprint]);

  const fetchData = async () => {
    if (!deviceFingerprint) return; // รอให้ fingerprint โหลดก่อน

    setLoading(true);
    setError(null);

    try {
        const [analysisRes, imageRes, insectRes] = await Promise.all([
            axios.get(`http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/crowd/api/analysis?fingerprint=${deviceFingerprint}`),
            axios.get('http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/crowd/api/images'),
            axios.get('http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites')
        ]);

        const imageMap = Object.fromEntries(imageRes.data.map(img => [img.upload_id, img.image_url]));

        const groupedData = analysisRes.data.reduce((acc, item) => {
            if (!acc[item.upload_id]) {
                acc[item.upload_id] = {
                    upload_id: item.upload_id,
                    image_url: imageMap[item.upload_id] || '',
                    predictions: [],
                };
            }
            acc[item.upload_id].predictions.push({
                insect_type: item.insect_type,
                avg_confidence: item.avg_confidence !== null ? parseFloat(item.avg_confidence).toFixed(2) : "0.00",
            });
            return acc;
        }, {});

        setData(Object.values(groupedData));
        setInsectList(insectRes.data);
    } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError('Error loading data');
    }

    setLoading(false);
    setRefreshing(false);
};


  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.upload_id.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <ImageBackground source={{ uri: item.image_url }} style={styles.image} resizeMode="cover">
          </ImageBackground>
          <Text style={styles.subtitle}>ผลการทำนาย:</Text>
          {item.predictions.map((pred, index) => (
            <Text key={index} style={styles.predictionText}>
              {pred.insect_type} ({pred.avg_confidence}%)
            </Text>
          ))}
          <Text style={styles.subtitle}> </Text>
          <Text style={[styles.subtitle, { color: 'red' }]}>
            เลือกชนิดของแมลงที่ทำให้เกิดบาดแผลนี้:
          </Text>
          <Picker
            selectedValue={selectedVotes[item.upload_id] || ""}
            onValueChange={(value) => setSelectedVotes(prev => ({ ...prev, [item.upload_id]: value }))}
            style={styles.picker}
          >
            <Picker.Item label="เลือกชนิดของแมลง" value="" />
            {insectList.map(insect => (
              <Picker.Item key={insect.name_eng} label={insect.name_eng} value={insect.name_eng} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="เพิ่มความคิดเห็น (ถ้ามี)"
            value={comments[item.upload_id] || ""}
            onChangeText={(text) => setComments(prev => ({ ...prev, [item.upload_id]: text }))}
          />

          <Button
            title={`ยืนยันที่จะเลือก "${selectedVotes[item.upload_id] || 'เลือกแมลง'}"`}
            onPress={() => {
              if (!selectedVotes[item.upload_id]) {
                alert("กรุณาเลือกชนิดของแมลงก่อนยืนยัน");
                return;
              }

              const payload = {
                image_id: item.upload_id,
                user_fingerprint: deviceFingerprint,
                chosen_insect: selectedVotes[item.upload_id],
                user_comment: comments[item.upload_id] || "",
              };

              console.log("📩 Sending vote data:", payload); // ✅ Debug ก่อนส่ง API

              axios.post('http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/crowd/api/vote', payload)
                .then(() => {
                  alert(`ยืนยันสำเร็จ: ${selectedVotes[item.upload_id]}`);
                  fetchData();
                })
                .catch(error => {
                  console.error('❌ Error saving vote:', error);
                  alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
                });
            }}
            disabled={!selectedVotes[item.upload_id]}
            color="#4CAF50"
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#666' },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFF', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 5 },
  predictionText: { fontSize: 14, color: '#444', marginTop: 3 },
  picker: { marginTop: 10, height: 50, width: '100%' },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
});

export default CrowdsourcingScreen;
