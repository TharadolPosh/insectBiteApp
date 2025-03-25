import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

const InsectListScreen = ({ navigation }) => {
  const [insects, setInsects] = useState([]);

  useEffect(() => {
    fetch('http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites')
      .then(response => response.json())
      .then(data => setInsects(data))
      .catch(error => console.error("Error fetching insect data:", error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายการแมลง</Text>
      <FlatList
        data={insects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.image && (
              <Image 
                source={{ uri: `data:image/png;base64,${item.image}` }} 
                style={styles.image} 
              />
            )}
            <Text style={styles.name}>{item.name} ({item.name_eng})</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddInsect')}
      >
        <Text style={styles.addButtonText}>เพิ่มข้อมูลแมลง</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  image: { width: 100, height: 100, marginTop: 10 },
  addButton: { backgroundColor: '#006A7D', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default InsectListScreen;
