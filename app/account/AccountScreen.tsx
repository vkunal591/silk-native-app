import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import {
  fetchUserProfile,
  fetchUserLogout,
  fetchOrders,
} from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
// import PushNotification from 'react-native-push-notification';
// import Icon from 'react-native-vector-icons/Ionicons';
// import messaging from '@react-native-firebase/messaging';  // Import messaging for push notifications

const AccountScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);  // Corrected to hold actual order data
  const [activeTab, setActiveTab] = useState('To Pay');
  const router = useRouter();

  const loadUserProfile = async () => {
    try {
      const cachedProfile = await AsyncStorage.getItem('userProfile');
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      } else {
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadOrders = async (status: string) => {
    try {
      const orders = await fetchOrders(status);
      setOrders(orders); // Correctly update orders
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  //   const configurePushNotifications = async () => {
  //     const authStatus = await messaging().requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (enabled) {
  //       const token = await messaging().getToken();
  //       console.log('FCM Token:', token);
  //     }

  //     messaging().onMessage(async (remoteMessage: { notification: { title: any; body: any; }; }) => {
  //       console.log('Foreground Notification:', remoteMessage);
  //       PushNotification.localNotification({
  //         title: remoteMessage.notification.title,
  //         message: remoteMessage.notification.body,
  //       });
  //     });
  //   };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await fetchUserLogout();

      router.push('/auth/signin'); // Navigate back to the sign-in screen after logout
      Alert.alert('Success', 'You have successfully logged out!');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert(
        'Error',
        'An error occurred during logout. Please try again.'
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // console.log('CartScreen is now focused');
      loadUserProfile();
      loadOrders(activeTab);
      // return () => console.log('CartScreen lost focus');
    }, [activeTab])
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>Sweta</Text>
            <Text style={styles.profileEmail}>sweta@example.com</Text>
          </View>
          <TouchableOpacity
          //   onPress={() => router.push('EditProfile')}
          >
            {/* <Icon name="create-outline" size={20} color="#000" /> */}
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders Section */}
      <View style={styles.ordersContainer}>
        <Text style={styles.sectionTitle}>My Orders</Text>
        <View style={styles.tabs}>
          {['View Profile'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.orderList}>
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <Text key={index}>{order}</Text> // Dynamically render orders
            ))
          ) : (
            <Text>No orders available</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.guestButton} onPress={handleLogout}>
        <Text style={styles.guestButtonText}>Continue As Guest</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  ordersContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  tabs: { flexDirection: 'row', marginBottom: 8 },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  activeTab: { backgroundColor: '#f8a5c2' },
  tabText: { fontSize: 14 },
  orderList: { marginTop: 8 },
  profileSection: { margin: 16 },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  profileDetails: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: 'bold' },
  profileEmail: { fontSize: 14, color: '#888' },
  guestButton: {
    backgroundColor: '#F5038F',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AccountScreen;
