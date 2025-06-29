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
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  fetchUserProfile,
  fetchUserLogout,
  fetchOrders,
  API_BASE_URL,
} from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Entypo, EvilIcons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';

const Account = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('View Orders');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [visibleOrder, setVisibleOrder] = useState(null);

  const router = useRouter();

  const loadUserProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const cachedProfile = await AsyncStorage.getItem('userData');
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      } else {
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        await AsyncStorage.setItem('userData', JSON.stringify(profile));
      }
    } catch (error) {
      setError('Error loading user profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchOrders(id);
      if (!res?.success) {
        ToastAndroid.show('Order Not Available', ToastAndroid.SHORT);
        setOrders([]);
      } else {
        setOrders(res?.data?.result?.result || []);
      }
    } catch (error) {
      setError('Error loading orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchUserLogout();
      router.push('/auth/signin');
      ToastAndroid.show('Logged out successfully!', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );


  const formatDateTime = (dateString: any) => {
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const openModal = (order: any) => setVisibleOrder(order);
  const closeModal = () => setVisibleOrder(null);

  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loadingIndicator} />
      ) : (
        <>
          {/* Profile */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.profileInfo}>
              <EvilIcons name="user" size={60} style={styles.profileImage} />
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{userProfile?.name || 'No name available'}</Text>
                <Text style={styles.profileEmail}>{userProfile?.mobileNo || 'No mobile available'}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout}>
                <MaterialIcons name="logout" size={30} color={Colors.PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Orders */}
          <View style={styles.ordersContainer}>
            <Text style={styles.sectionTitle}>My Orders</Text>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'View Orders' && styles.activeTab]}
                onPress={() => {
                  setActiveTab('View Orders');
                  loadOrders(userProfile?.id);
                }}>
                <Text style={styles.tabText}>View Orders</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              orders.map((order: any, index: number) => (
                <View key={order?._id || index} style={styles.orderCard}>
                  <Text style={styles.userName}>Customer: {order.userName}</Text>
                  <Text style={styles.mobile}>Mobile: {order.mobileNo}</Text>
                  <Text style={styles.status}>Status: {order.status}</Text>
                  <Text style={styles.amount}>Date: {formatDateTime(order.createdAt)}</Text>

                  <TouchableOpacity style={styles.viewButton} onPress={() => openModal(order)}>
                    <Text style={styles.viewButtonText}>View Items</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Modal */}
          <Modal
            visible={!!visibleOrder}
            animationType="slide"
            transparent={true}
            onRequestClose={closeModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Order Items</Text>
                <ScrollView style={styles.scrollView}>
                  {visibleOrder?.items?.map((item: any, i: number) => (
                    <View key={i} style={styles.item}>
                      <Image
                        source={{ uri: `${API_BASE_URL}${item.product.images}` }}
                        style={styles.image}
                      />
                      <View style={styles.details}>
                        <Text style={styles.productName}>{item.product.name}</Text>
                        <Text>Qty: {item.quantity}</Text>
                        <Text>Price: ₹{item.product.price}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  activeTab: { backgroundColor: Colors.PRIMARY },
  tabText: { fontSize: 14, color: '#fff' },
  profileSection: { margin: 16 },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  profileDetails: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: 'bold' },
  profileEmail: { fontSize: 14, color: '#888' },
  loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  orderCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  userName: { fontWeight: 'bold', fontSize: 16 },
  mobile: { fontSize: 14 },
  status: { color: 'orange', marginTop: 5 },
  amount: { fontWeight: '600', marginBottom: 10 },
  viewButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  viewButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  scrollView: { maxHeight: 300 },
  item: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    gap: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  details: { flex: 1 },
  productName: { fontWeight: '500', fontSize: 15 },
  closeButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default Account;
