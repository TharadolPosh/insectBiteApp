import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import * as Device from 'expo-device';
import CryptoJS from 'crypto-js';

const API_URL = 'http://113b-2001-44c8-6624-736e-5182-1001-a8b5-e1ce.ngrok-free.app/fingerprint/device-fingerprints';

export const getDeviceFingerprint = async () => {
    try {
        const deviceId = (await DeviceInfo.getUniqueId()) || "unknown";
        const brand = Device.brand || DeviceInfo.getBrand() || "unknown";
        const model = Device.modelName || DeviceInfo.getModel() || "unknown";
        const systemName = Device.osName || DeviceInfo.getSystemName() || "unknown";
        const systemVersion = Device.osVersion || DeviceInfo.getSystemVersion() || "unknown";
        const isEmulator = !(Device.isDevice);

        let ipAddress = "unknown";
        try {
            ipAddress = await DeviceInfo.getIpAddress();
        } catch (error) {
            console.warn("Error getting IP address:", error);
        }

        console.log("Device Data:", { deviceId, brand, model, systemName, systemVersion, isEmulator, ipAddress });

        const fingerprintData = `${deviceId}-${brand}-${model}-${systemName}-${systemVersion}-${isEmulator}-${ipAddress}`;
        const fingerprint = CryptoJS.SHA256(fingerprintData).toString();

        return { 
            fingerprint, 
            device_id: deviceId, 
            brand, 
            model, 
            system_name: systemName, 
            system_version: systemVersion, 
            is_emulator: isEmulator, 
            ip_address: ipAddress 
        };
    } catch (error) {
        console.error("Error generating device fingerprint:", error);
        return null;
    }
};

export const sendDeviceFingerprint = async (userId) => {
  try {
    const deviceData = await getDeviceFingerprint();
    if (!deviceData) {
      throw new Error('Failed to generate device fingerprint');
    }

    console.log("Sending fingerprint:", deviceData);

    const response = await axios.post(API_URL, {
      user_id: userId,
      ...deviceData,
    });

    console.log('Fingerprint saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending device fingerprint:', error);
    return null;
  }
};
