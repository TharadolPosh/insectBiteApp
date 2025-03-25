import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Image } from 'react-native';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/search/insect_bites/Ssearch?name=${searchTerm}`);
      const text = await response.text();
      console.log(text);  // ตรวจสอบข้อมูลดิบก่อนการแปลง
      const data = JSON.parse(text);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="ค้นหาชื่อ..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <Button title="ค้นหา" onPress={handleSearch} />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {results.map((item) => (
          <TouchableOpacity key={item.id} style={styles.item} activeOpacity={0.7}>
            <Text style={styles.title}>{item.name}</Text>
            {item.image && (
              <Image
                style={styles.image}
                source={{ uri: `data:image/png;base64,${item.image}` }}
              />
            )}
            {item.wound_image && (
              <Image
                style={styles.image}
                source={{ uri: `data:image/png;base64,${item.wound_image}` }}
              />
            )}
            <Text style={styles.titlewondEx}>ลักษณะ</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.titlewondEx}>อาการ</Text>
            <Text style={styles.symptomDescription}>{item.symptom_description}</Text>
            <Text style={styles.titlewondEx}>วิธีปฐมพยาบาลเบื้องต้น</Text>
            <Text style={styles.firstAid}>{item.first_aid_method}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 20,
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  symptomDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  firstAid: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginVertical: 5,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  titlewondEx: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066cc',
    marginVertical: 5,
    textAlign: 'center',
  },
});

export default SearchScreen;
