// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Alert,
//   ScrollView,
//   ToastAndroid,
// } from 'react-native';
// import {
//   fetchUserProfile,
//   fetchUserLogout,
//   fetchOrders,
// } from '../../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { Entypo, EvilIcons, MaterialIcons } from '@expo/vector-icons';
// import { Colors } from '@/contants/Colors';
// // import PushNotification from 'react-native-push-notification';
// // import Icon from 'react-native-vector-icons/Ionicons';
// // import messaging from '@react-native-firebase/messaging';  // Import messaging for push notifications

// const Account = () => {
//   const [userProfile, setUserProfile] = useState(null);
//   const [orders, setOrders] = useState([]);  // Corrected to hold actual order data
//   const [activeTab, setActiveTab] = useState('To Pay');
//   const router = useRouter();

//   const loadUserProfile = async () => {
//     try {
//       const cachedProfile = await AsyncStorage.getItem('userData');
//       if (cachedProfile) {
//         setUserProfile(JSON.parse(cachedProfile));
//         console.log(cachedProfile)
//       } else {
//         const profile = await fetchUserProfile();
//         setUserProfile(profile);
//         await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
//       }
//     } catch (error) {
//       console.error('Error loading user profile:', error);
//     }
//   };

//   const loadOrders = async (status: string) => {
//     try {
//       const orders = await fetchOrders(status);
//       setOrders(orders); // Correctly update orders
//     } catch (error) {
//       console.error('Error loading orders:', error);
//     }
//   };

// //   const configurePushNotifications = async () => {
// //     const authStatus = await messaging().requestPermission();
// //     const enabled =
// //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
// //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

// //     if (enabled) {
// //       const token = await messaging().getToken();
// //       console.log('FCM Token:', token);
// //     }

// //     messaging().onMessage(async (remoteMessage: { notification: { title: any; body: any; }; }) => {
// //       console.log('Foreground Notification:', remoteMessage);
// //       PushNotification.localNotification({
// //         title: remoteMessage.notification.title,
// //         message: remoteMessage.notification.body,
// //       });
// //     });
// //   };

//   // Handle user logout
//   const handleLogout = async () => {
//     try {
//       await fetchUserLogout();

//       router.push('/auth/signin'); // Navigate back to the sign-in screen after logout
//       ToastAndroid.show('Success', 'You have successfully logged out!');
//     } catch (error) {
//       console.error('Error during logout:', error);
//       Alert.alert(
//         'Error',
//         'An error occurred during logout. Please try again.'
//       );
//     }
//   };

//   // useEffect(() => {
//   //   loadUserProfile();
//   //   loadOrders(activeTab);
//   //   // configurePushNotifications();
//   // }, [activeTab]);


//     useFocusEffect(
//       React.useCallback(() => {
//         // console.log('CartScreen is now focused');
//         loadUserProfile();
//         loadOrders(activeTab);
//         // return () => console.log('CartScreen lost focus');
//       }, [activeTab])
//     );
//   return (
//     <ScrollView style={styles.container}>
//       {/* Profile Section */}
//       <View style={styles.profileSection}>
//         <Text style={styles.sectionTitle}>Profile</Text>
//         <View style={styles.profileInfo}>
//           <EvilIcons name='user'
//           size={60}
//             style={styles.profileImage}
//           />
//           <View style={styles.profileDetails}>
//             <Text style={styles.profileName}>{userProfile?.name}</Text>
//             <Text style={styles.profileEmail}>{userProfile?.mobile}</Text>
//           </View>
//           <TouchableOpacity 
//           >
//             <MaterialIcons name="logout" size={30} color={Colors.PRIMARY} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Orders Section */}
//       <View style={styles.ordersContainer}>
//         <Text style={styles.sectionTitle}>My Profile</Text>
//         <View style={styles.tabs}>
//           {['View Profile'].map((tab) => (
//             <TouchableOpacity
//               key={tab}
//               style={[styles.tab, activeTab === tab && styles.activeTab]}
//               onPress={() => setActiveTab(tab)}>
//               <Text style={styles.tabText}>{tab}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         {/* <View style={styles.orderList}>
//           {orders.length > 0 ? (
//             orders.map((order, index) => (
//               <Text key={index}>{order}</Text> // Dynamically render orders
//             ))
//           ) : (
//             <Text>No orders available</Text>
//           )}
//         </View> */}
//       </View>

//       {/* <TouchableOpacity style={styles.guestButton} onPress={handleLogout}>
//         <Text style={styles.guestButtonText}>Continue As Guest</Text>
//       </TouchableOpacity> */}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   ordersContainer: { padding: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
//   tabs: { flexDirection: 'row', marginBottom: 8 },
//   tab: {
//     flex: 1,
//     padding: 8,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//   },
//   activeTab: { backgroundColor: '#f8a5c2' },
//   tabText: { fontSize: 14 },
//   orderList: { marginTop: 8 },
//   profileSection: { margin: 16 },
//   profileInfo: { flexDirection: 'row', alignItems: 'center' },
//   profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
//   profileDetails: { flex: 1 },
//   profileName: { fontSize: 16, fontWeight: 'bold' },
//   profileEmail: { fontSize: 14, color: '#888' },
//   guestButton: {
//     backgroundColor: '#F5038F',
//     paddingVertical: 12,
//     borderRadius: 25,
//     alignItems: 'center',
//   },
//   guestButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// export default Account;











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
                <Text style={styles.profileEmail}>{userProfile?.mobile || 'No mobile available'}</Text>
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
              <Text style={styles.errorText}>{"No Data"}</Text> // Show error if it occurs
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





















// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ToastAndroid,
//   ActivityIndicator,
// } from 'react-native';
// import { fetchUserProfile, fetchUserLogout, fetchOrders } from '../../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { EvilIcons, MaterialIcons } from '@expo/vector-icons';
// import { Colors } from '@/contants/Colors';

// const Account = () => {
//   const [userProfile, setUserProfile] = useState<any>(null);
//   const [orders, setOrders] = useState([]);
//   const [activeTab, setActiveTab] = useState('View Profile');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const router = useRouter();

//   // Load User Profile
//   const loadUserProfile = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const cachedProfile = await AsyncStorage.getItem('userData');
//       if (cachedProfile) {
//         setUserProfile(JSON.parse(cachedProfile));
//       } else {
//         const profile = await fetchUserProfile();
//         setUserProfile(profile);
//         await AsyncStorage.setItem('userData', JSON.stringify(profile));
//       }
//     } catch (error) {
//       setError('Error loading user profile. Please try again later.');
//       console.error('Error loading user profile:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Load Orders
//   const loadOrders = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const ordersData = await fetchOrders('To Pay'); // Adjust status if needed
//       if (ordersData.length > 0) {
//         setOrders(ordersData);
//       } else {
//         setOrders([]);
//         setError('No orders available.');
//       }
//     } catch (error) {
//       setError('Could not fetch orders. Please try again.');
//       console.error('Error fetching orders:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Logout Function
//   const handleLogout = async () => {
//     try {
//       await fetchUserLogout();
//       await AsyncStorage.removeItem('userData'); // Clear stored user data
//       router.push('/auth/signin');
//       ToastAndroid.show('You have successfully logged out!', ToastAndroid.SHORT);
//     } catch (error) {
//       console.error('Error during logout:', error);
//       alert('Error logging out. Please try again.');
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadUserProfile();
//       if (activeTab === 'Orders') {
//         loadOrders();
//       }
//     }, [activeTab])
//   );

//   return (
//     <ScrollView style={styles.container}>
//       {isLoading ? (
//         <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loadingIndicator} />
//       ) : (
//         <>
//           {/* Profile Section */}
//           <View style={styles.profileSection}>
//             <Text style={styles.sectionTitle}>Profile</Text>
//             <View style={styles.profileInfo}>
//               <EvilIcons name="user" size={60} style={styles.profileImage} />
//               <View style={styles.profileDetails}>
//                 <Text style={styles.profileName}>{userProfile?.name || 'No name available'}</Text>
//                 <Text style={styles.profileEmail}>{userProfile?.mobile || 'No mobile available'}</Text>
//               </View>
//               <TouchableOpacity onPress={handleLogout}>
//                 <MaterialIcons name="logout" size={30} color={Colors.PRIMARY} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Tabs Section */}
//           <View style={styles.tabsContainer}>
//             {['View Profile', 'Orders'].map((tab) => (
//               <TouchableOpacity
//                 key={tab}
//                 style={[styles.tab, activeTab === tab && styles.activeTab]}
//                 onPress={() => setActiveTab(tab)}
//               >
//                 <Text style={styles.tabText}>{tab}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Dynamic Content */}
//           {activeTab === 'View Profile' && (
//             <View style={styles.profileDetailsSection}>
//               <Text style={styles.detailText}>📧 Email: {userProfile?.email || 'N/A'}</Text>
//               <Text style={styles.detailText}>📞 Mobile: {userProfile?.mobile || 'N/A'}</Text>
//               <Text style={styles.detailText}>📍 Address: {userProfile?.address || 'N/A'}</Text>
//             </View>
//           )}

//           {activeTab === 'Orders' && (
//             <View style={styles.ordersContainer}>
//               <Text style={styles.sectionTitle}>My Orders</Text>
//               {error ? (
//                 <Text style={styles.errorText}>{error}</Text>
//               ) : (
//                 <View style={styles.orderList}>
//                   {orders.length > 0 ? (
//                     orders.map((order, index) => <Text key={index}>{order}</Text>)
//                   ) : (
//                     <Text>No orders available</Text>
//                   )}
//                 </View>
//               )}
//             </View>
//           )}
//         </>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   profileSection: { padding: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
//   profileInfo: { flexDirection: 'row', alignItems: 'center' },
//   profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
//   profileDetails: { flex: 1 },
//   profileName: { fontSize: 16, fontWeight: 'bold' },
//   profileEmail: { fontSize: 14, color: '#888' },
//   tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
//   tab: {
//     flex: 1,
//     padding: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//   },
//   activeTab: { backgroundColor: '#f8a5c2' },
//   tabText: { fontSize: 14 },
//   profileDetailsSection: { padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8, margin: 10 },
//   detailText: { fontSize: 16, marginVertical: 4 },
//   ordersContainer: { padding: 16 },
//   orderList: { marginTop: 8 },
//   errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
//   loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
// });

// export default Account;
