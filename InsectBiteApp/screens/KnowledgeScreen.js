import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';

const KnowledgeBaseScreen = () => {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    fetch('https://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/db/insect_bites')
      .then((response) => response.json())
      .then((json) => {
        setData(json);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error(error);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    fetchData();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {data.map((item) => (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
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
    fontWeight: '500',
    color: '#0066cc',
    marginVertical: 5,
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

export default KnowledgeBaseScreen;
