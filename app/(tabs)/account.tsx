






import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,  // Added for loading spinner
} from 'react-native';
import {
  fetchUserProfile,
  fetchUserLogout,
  fetchOrders,
} from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Entypo, EvilIcons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';

const Account = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState([]); 
  const [activeTab, setActiveTab] = useState('To Pay');
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [error, setError] = useState(''); // New state for handling errors
  const router = useRouter();

  const loadUserProfile = async () => {
    setIsLoading(true); // Set loading to true before fetching
    setError(''); // Reset error state before fetching
    try {
      const cachedProfile = await AsyncStorage.getItem('userData');
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      } else {
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      }
    } catch (error) {
      setError('Error loading user profile. Please try again later.');
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  };

  const loadOrders = async (status: string) => {
    setIsLoading(true); // Set loading to true before fetching
    setError(''); // Reset error state before fetching
    try {
      const orders = await fetchOrders(status);
      setOrders(orders);
    } catch (error) {
      setError('Error loading orders. Please try again later.');
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  };

  const handleLogout = async () => {
    try {
      await fetchUserLogout();
      router.push('/auth/signin');
      ToastAndroid.show('You have successfully logged out!', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert(
        'Error',
        'An error occurred during logout. Please try again.'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadOrders(activeTab);
    }, [activeTab])
  );

  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loadingIndicator} />
      ) : (
        <>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.profileInfo}>
              <EvilIcons name='user' size={60} style={styles.profileImage} />
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{userProfile?.name || 'No name available'}</Text>
                <Text style={styles.profileEmail}>{userProfile?.mobileNo || 'No mobile available'}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout}>
                <MaterialIcons name="logout" size={30} color={Colors.PRIMARY} />
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
            {error ? (
              <Text style={styles.errorText}>{""}</Text> // Show error if it occurs
            ) : (
              <View style={styles.orderList}>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <Text key={index}>{order}</Text>
                  ))
                ) : (
                  <Text>No orders available</Text>
                )}
              </View>
            )}
          </View>
        </>
      )}
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
  loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
});

export default Account;


