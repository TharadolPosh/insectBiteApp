import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DiagnosisScreen = ({ route }) => {
    const { uploadId } = route.params;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [userFingerprint, setUserFingerprint] = useState('');

    useEffect(() => {
        // โหลด fingerprint ของอุปกรณ์
        AsyncStorage.getItem('user_fingerprint').then(fingerprint => {
            if (!fingerprint) {
                const newFingerprint = Math.random().toString(36).substring(7);
                AsyncStorage.setItem('user_fingerprint', newFingerprint);
                setUserFingerprint(newFingerprint);
            } else {
                setUserFingerprint(fingerprint);
            }
        });

        // โหลดผลวินิจฉัย
        fetch(`http://localhost:5006/analysis/${uploadId}`)
            .then(response => response.json())
            .then(result => {
                setData(result);
                setLoading(false);
            })
            .catch(error => console.error(error));
    }, []);

    const submitVote = async (chosenInsect) => {
        try {
            const response = await fetch('http://localhost:5006/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_id: uploadId,
                    user_fingerprint: userFingerprint,
                    chosen_insect: chosenInsect
                })
            });

            const result = await response.json();
            Alert.alert("ผลโหวต", result.message);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>ช่วยตรวจสอบผลการทำนาย</Text>

            <Image 
                source={{ uri: data.image_url }} 
                style={{ width: 300, height: 200, marginVertical: 10, borderRadius: 10 }}
            />

            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ผลการทำนายจาก AI:</Text>
            <Text style={{ fontSize: 16, color: 'blue' }}>{data.analyses[0]?.insect_type || 'ไม่พบข้อมูล'}</Text>
            
            <Text style={{ fontSize: 14, color: 'gray' }}>
                ความมั่นใจ: {data.analyses[0]?.confidence ? `${(data.analyses[0].confidence * 100).toFixed(2)}%` : '-'}
            </Text>

            <TouchableOpacity 
                style={{ backgroundColor: 'green', padding: 10, marginTop: 10, borderRadius: 5 }}
                onPress={() => submitVote(data.analyses[0]?.insect_type)}
            >
                <Text style={{ color: 'white' }}>✅ เห็นด้วยว่าเป็น {data.analyses[0]?.insect_type}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={{ backgroundColor: 'red', padding: 10, marginTop: 10, borderRadius: 5 }}
                onPress={() => submitVote("other")}
            >
                <Text style={{ color: 'white' }}>❌ ไม่ใช่, เลือกผลลัพธ์อื่น</Text>
            </TouchableOpacity>

            <TextInput 
                style={{
                    width: '100%',
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginTop: 10,
                    paddingHorizontal: 10,
                    borderRadius: 5
                }}
                placeholder="แสดงความคิดเห็นเพิ่มเติม..."
                value={comment}
                onChangeText={setComment}
            />
        </View>
    );
};

export default DiagnosisScreen;
