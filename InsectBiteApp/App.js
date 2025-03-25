import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import ScanWoundScreen from './screens/ScanScreen';
import SearchScreen from './screens/SearchScreen';
import KnowledgeBaseScreen from './screens/KnowledgeScreen';
import ExpertsLoginScreen from './screens/ExpertLoginScreen';
import ExpertDashboardScreen from './screens/ExpertDashboardScreen';
import ImageGalleryScreen from './screens/ImageGallery';
import PredictionResultScreen from './screens/PredictionResultScreen';
import InsectDetailScreen from './screens/InsectDetailScreen';
import CrowdsourcingScreen from './screens/CrowdsourcingScreen';
import AddInsectScreen from './screens/AddInsectScreen';
import InsectListScreen from './screens/InsectListScreen';
import EditInsectScreen from './screens/EditInsectScreen'; // ✅ เพิ่ม EditInsectScreen
import ExpertCaseScreen from './screens/ExpertCaseScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ExpertStack = createStackNavigator();

// 🟢 HomeStack: Stack Navigator สำหรับหน้าหลัก
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeS" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ImageGallery" component={ImageGalleryScreen} options={{ title: 'แกลเลอรี่รูปภาพ' }} />
      <Stack.Screen name="PredictionResult" component={PredictionResultScreen} options={{ title: 'ผลการทำนาย' }} />
      <Stack.Screen name="InsectDetail" component={InsectDetailScreen} options={{ title: 'รายละเอียดแมลง' }} />
      <Stack.Screen name="Crowdsourcing" component={CrowdsourcingScreen} options={{ title: 'Crowdsourcing' }} />
    </Stack.Navigator>
  );
}

// 🟢 ExpertStack: Stack Navigator สำหรับผู้เชี่ยวชาญ
function ExpertNavigator() {
  return (
    <ExpertStack.Navigator>
      <ExpertStack.Screen 
        name="ExpertLogin" 
        component={ExpertsLoginScreen} 
        options={{ title: 'เข้าสู่ระบบผู้เชี่ยวชาญ' }}
      />
      <ExpertStack.Screen 
        name="ExpertDashboard" 
        component={ExpertDashboardScreen} 
        options={{ title: 'แดชบอร์ดผู้เชี่ยวชาญ' }}
      />
      <ExpertStack.Screen 
        name="ExpertCase" 
        component={ExpertCaseScreen} 
        options={{ title: 'ตรวจสอบเคส' }} // ✅ เพิ่มหน้าตรวจสอบเคส
      />
      <ExpertStack.Screen 
        name="InsectList" 
        component={InsectListScreen} 
        options={{ title: 'รายการแมลง' }}
      />
      <ExpertStack.Screen 
        name="AddInsect" 
        component={AddInsectScreen} 
        options={{ title: 'เพิ่มข้อมูลแมลง' }}
      />
      <ExpertStack.Screen 
        name="EditInsect" 
        component={EditInsectScreen} 
        options={{ title: 'แก้ไขข้อมูลแมลง' }}
      />
    </ExpertStack.Navigator>
  );
}

// 🟢 Main App
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'ScanWound':
                iconName = focused ? 'camera' : 'camera-outline';
                break;
              case 'Search':
                iconName = focused ? 'search' : 'search-outline';
                break;
              case 'KnowledgeBase':
                iconName = focused ? 'book' : 'book-outline';
                break;
              case 'Expert':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'alert-circle';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#006A7D',
          tabBarStyle: {
            backgroundColor: '#78A3D4',
            paddingBottom: 10,
            paddingTop: 10,
            height: 75,
          },
          tabBarLabelStyle: {
            textAlign: 'center',
            fontSize: 14,
            paddingBottom: 6,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ title: 'หน้าหลัก' }} />
        <Tab.Screen name="ScanWound" component={ScanWoundScreen} options={{ title: 'สแกนบาดแผล' }} />
        <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'ค้นหาแมลง' }} />
        <Tab.Screen name="KnowledgeBase" component={KnowledgeBaseScreen} options={{ title: 'ฐานความรู้' }} />
        <Tab.Screen 
          name="Expert" 
          component={ExpertNavigator} 
          options={{ 
            title: 'Expert',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            ),
          }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
