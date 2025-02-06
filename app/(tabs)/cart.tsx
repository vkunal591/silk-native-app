// import React, { useState, useEffect } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     FlatList,
//     StyleSheet,
//     ScrollView,
//     RefreshControl,
//     Modal,
//     TextInput,
//     Alert,
//     ToastAndroid,
// } from 'react-native';
// // import Icon from 'react-native-vector-icons/Ionicons';
// import {
//     fetchCart,
//     fetchCartItemRemove,
//     fetchPlaceOrder,
//     fetchUpdateAddress,
// } from '../../services/api';
// import { useFocusEffect } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import { Entypo, Feather, Ionicons, Octicons } from '@expo/vector-icons';
// import { Colors } from '@/contants/Colors';

// const img = require('../../assets/images/silk.png');

// const Cart = () => {
//     const [cartItems, setCartItems] = useState([]);
//     const [refreshing, setRefreshing] = useState(false);
//     const [totalPrice, setTotalPrice] = useState(0);
//     const [address, setAddress] = useState({
//         streetAddress: "",
//         landMark: "",
//         city: "",
//         state: "",
//         country: "",
//         pincode: ""
//     });
//     const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
//     const [newAddress, setNewAddress] = useState('');
//     const router = useRouter()

//     const handleAddressChange = (field: string, value: string) => {
//         setAddress((prevAddress) => ({ ...prevAddress, [field]: value }));
//     };

//     const handleSubmitAddress = async () => {
//         console.log('Submitting address:', address);

//         if (!address.streetAddress || !address.landMark || !address.country || !address.city || !address.state || !address.pincode) {
//             Alert.alert('Error', 'Please fill in all address fields.');
//             return;
//         }

//         try {
//             const response = await fetchUpdateAddress(address);
//             if (response.status) {
//                 setIsAddressModalVisible(false);
//                 Alert.alert('Address', 'Address submitted successfully');
//             }
//         } catch (error) {
//             console.error('Error updating address:', error);
//             Alert.alert('Error', 'Failed to update address. Please try again.');
//         }
//     };

//     const calculateTotalPrice = () => {
//         const total = cartItems.reduce((sum: any, item: any) => sum + item?.product?.price * item.quantity, 0);
//         setTotalPrice(total);

//     };

//     const fetchCartDetails = async () => {
//         try {
//             const response = await fetchCart();
//             const data = response.data;
//             setCartItems(data?.items || []);
//         } catch (error) {
//             console.error('Error fetching cart details:', error);
//         }
//     };

//     const handleRemoveItem = async (id: any) => {
//         try {
//             const response = await fetchCartItemRemove(id);
//             if (response.status === 200) {
//                 setCartItems((prevItems) => prevItems.filter((item: any) => item?.product?._id !== id));
//             }
//         } catch (error) {
//             console.error('Error removing cart item:', error);
//         }
//     };

//     const handleQuantityChange = (id: any, type: string) => {
//         setCartItems((prevItems: any) =>
//             prevItems.map((item: any) =>
//                 item?.product?._id === id
//                     ? {
//                         ...item,
//                         quantity: type === 'increment' ? item.quantity + 1 : Math.max(item.quantity - 1, 1),
//                     }
//                     : item
//             )
//         );
//     };

//     const onRefresh = async () => {
//         setRefreshing(true);
//         await fetchCartDetails();

//         calculateTotalPrice();
//         setRefreshing(false);
//     };

//     useFocusEffect(
//         React.useCallback(() => {
//             // console.log('CartScreen is now focused');
//             fetchCartDetails();
//             // return () => console.log('CartScreen lost focus');
//         }, [])
//     );

//     useFocusEffect(
//         React.useCallback(() => {
//             // console.log('CartScreen is now focused');   
//             calculateTotalPrice();
//             // return () => console.log('CartScreen lost focus');
//         }, [cartItems])
//     );

//     useFocusEffect(
//         React.useCallback(() => {
//             // console.log('CartScreen is now focused');
//             fetchCartDetails();
//             // return () => console.log('CartScreen lost focus');
//         }, [])
//     );

//     const handlePlaceOrder = async () => {
//         // if (!address.streetAddress || !address.city || !address.state || !address.zipCode) {
//         //     Alert.alert('Address Required', 'Please add or update your shipping address before placing the order.');
//         //     return;
//         // }

//         try {


//             const res: any = await fetchPlaceOrder();
//             if (res.status) {

//                 ToastAndroid.show('Your order has been placed successfully!', 2000);
//                 router.push('/(tabs)/account')
//             } else {
//                 ToastAndroid.show('Add to cart, Plz try again!', 2000);

//             }
//         } catch (error) {
//             ToastAndroid.show("Add to cart, Please try again", 2000)
//         }
//     };

//     return (
//         <ScrollView
//             contentContainerStyle={{ flex: 1 }}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         >
//             <View style={styles.container}>
//                 <Text style={styles.header}>
//                     Cart <Text style={styles.cartCount}>{cartItems.length}</Text>
//                 </Text>

//                 <View style={styles.shippingContainer}>
//                     <View style={styles.shippingSubContainer}>
//                         <Text style={styles.shippingTitle}>Shipping Address</Text>
//                         <TouchableOpacity style={styles.editButton} onPress={() => setIsAddressModalVisible(true)}>
//                             <Feather name="edit-3" size={20} color="#800020" />
//                         </TouchableOpacity>
//                     </View>
//                     <Text style={styles.shippingAddress}>
//                         {address.street ? `${address.street}, ${address.city}, ${address.state} - ${address.zipCode}` : 'No address added. Please add an address.'}
//                     </Text>
//                 </View>

//                 <FlatList
//                     data={cartItems}
//                     keyExtractor={(item: any) => item?.product?._id}
//                     renderItem={({ item }) => (
//                         <View style={styles.cartItem}>
//                             <View style={styles.cartDetails}>
//                                 <Text style={styles.itemTitle}>{item?.product?.name}</Text>
//                                 <Text style={styles.itemDetails}>Color: {item?.product?.colors}, Size: {item?.product?.sizes}</Text>
//                                 <Text style={styles.itemPrice}>{"₹ " + item?.product?.price?.toFixed(2) || 0.00}</Text>
//                             </View>
//                             <View style={styles.quantityControls}>
//                                 <TouchableOpacity onPress={() => handleQuantityChange(item?.product?._id, 'decrement')} style={styles.quantityButton}>
//                                     <Entypo name='minus' size={25} color={Colors?.PRIMARY} />
//                                 </TouchableOpacity>
//                                 <Text style={styles.quantity}>{item.quantity}</Text>
//                                 <TouchableOpacity onPress={() => handleQuantityChange(item?.product?._id, 'increment')} style={styles.quantityButton}>
//                                     <Entypo name='plus' size={25} color={Colors?.PRIMARY} />

//                                 </TouchableOpacity>
//                             </View>
//                             <TouchableOpacity onPress={() => handleRemoveItem(item?.product?._id)} style={styles.deleteButton}>
//                                 <Octicons name="trash" size={20} color="#FF0000" />
//                             </TouchableOpacity>
//                         </View>
//                     )}
//                 />

//                 <View style={styles.footer}>
//                     <Text style={styles.totalPrice}>{"Total ₹ " + totalPrice.toFixed(2) || 0}</Text>
//                     <TouchableOpacity style={styles.checkoutButton} onPress={handlePlaceOrder}>
//                         <Text style={styles.checkoutText}>Place Order</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             <Modal visible={isAddressModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAddressModalVisible(false)}>
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalContent}>
//                         <Text style={styles.modalHeader}>Update Address</Text>
//                         {['streetAddress', "landMark", 'city', 'state', 'country', 'pincode'].map((field) => (
//                             <TextInput key={field} placeholder={`Please enter your ${field}`} value={address[field]} onChangeText={(value) => handleAddressChange(field, value)} style={styles.input} />
//                         ))}
//                         <View style={styles.modalActions}>
//                             <TouchableOpacity onPress={handleSubmitAddress} style={styles.submitButton}>
//                                 <Text style={styles.buttonText} >Submit</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => setIsAddressModalVisible(false)} style={styles.cancelButton}>
//                                 <Text>Cancel</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>
//         </ScrollView>
//     );
// };

// export default Cart;



// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#FFF' },
//     header: { fontSize: 24, fontWeight: 'bold', margin: 16 },
//     cartCount: { fontSize: 18, color: '#800020' },
//     shippingContainer: {
//         backgroundColor: '#F5F5F5',
//         padding: 16,
//         marginHorizontal: 16,
//         borderRadius: 8,
//         alignItems: 'left',
//         justifyContent: 'space-between',
//     },
//     shippingSubContainer: { flexDirection: "row" },
//     shippingTitle: { fontWeight: 'bold', fontSize: 16 },
//     shippingAddress: { fontSize: 14, color: '#555', marginTop: 4 },
//     editButton: { padding: 8 },
//     cartItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginHorizontal: 16,
//         marginVertical: 8,
//         padding: 16,
//         borderWidth: 1,
//         borderColor: '#DDD',
//         borderRadius: 8,
//     },
//     cartImage: { width: 60, height: 60, borderRadius: 8 },
//     cartDetails: { flex: 1, marginLeft: 16 },
//     itemTitle: { fontWeight: 'bold', fontSize: 14 },
//     itemDetails: { fontSize: 12, color: '#555', marginVertical: 4 },
//     itemPrice: { fontWeight: 'bold', fontSize: 14, color: '#800020' },
//     quantityControls: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginLeft: 16,
//         backgroundColor: '#F5F5F5',
//         borderRadius: 5,
//         padding: 5
//     },
//     quantityButton: {
//         width: 30,
//         height: 30,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     quantity: { marginHorizontal: 8, fontSize: 14 },
//     deleteButton: {
//         padding: 8,
//         borderRadius: 8,
//         marginLeft: 8,
//     },
//     sectionHeader: { margin: 16, fontWeight: 'bold', fontSize: 18 },
//     wishlistItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginHorizontal: 16,
//         marginVertical: 8,
//     },
//     moveToCartButton: {
//         backgroundColor: '#800020',
//         padding: 8,
//         borderRadius: 8,
//     },
//     footer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 5,
//         backgroundColor: '#F5F5F5',
//         borderTopWidth: 1,
//         borderColor: '#DDD',
//     },
//     totalPrice: { fontSize: 18, fontWeight: 'bold' },
//     checkoutButton: {
//         backgroundColor: Colors.SHADE_WHITE,
//         padding: 16,
//         borderRadius: 8,
//     },
//     checkoutText: { color: Colors?.PRIMARY, fontWeight: 'bold' },
//     modalContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     },
//     modalContent: {
//         backgroundColor: '#FFF',
//         padding: 20,
//         borderRadius: 10,
//         width: '90%',
//     },
//     modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
//     input: {
//         borderWidth: 1,
//         borderColor: '#DDD',
//         borderRadius: 5,
//         marginBottom: 10,
//         padding: 10,
//     },
//     modalActions: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 20,
//     },
//     submitButton: {
//         padding: 10,
//         backgroundColor: Colors?.SHADE_WHITE,
//         color: Colors?.PRIMARY,
//         borderRadius: 8,
//         marginRight: 10,
//     },
//     buttonText: {
//         color: Colors.PRIMARY
//     },
//     cancelButton: {
//         padding: 10,
//         backgroundColor: Colors?.SHADE_WHITE,
//         borderRadius: 8,
//     },
// });







import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    ToastAndroid,
} from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
import {
    fetchCart,
    fetchCartItemRemove,
    fetchPlaceOrder,
    fetchUpdateAddress,
} from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Entypo, Feather, Ionicons, Octicons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';

const img = require('../../assets/images/silk.png');

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [address, setAddress] = useState({
        streetAddress: "",
        landMark: "",
        city: "",
        state: "",
        country: "",
        pincode: ""
    });
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const router = useRouter();

    const handleAddressChange = (field: string, value: string) => {
        setAddress((prevAddress) => ({ ...prevAddress, [field]: value }));
    };

    const handleSubmitAddress = async () => {
        console.log('Submitting address:', address);

        if (!address.streetAddress || !address.landMark || !address.country || !address.city || !address.state || !address.pincode) {
            Alert.alert('Error', 'Please fill in all address fields.');
            return;
        }

        try {
            const response = await fetchUpdateAddress(address);
            if (response.status) {
                setIsAddressModalVisible(false);
                Alert.alert('Address', 'Address submitted successfully');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            Alert.alert('Error', 'Failed to update address. Please try again.');
        }
    };

    const calculateTotalPrice = () => {
        const total = cartItems.reduce((sum: any, item: any) => sum + item?.product?.price * item.quantity, 0);
        setTotalPrice(total);
    };

    const fetchCartDetails = async () => {
        try {
            const response = await fetchCart();
            const data = response.data;
            setCartItems(data?.items || []);
        } catch (error) {
            console.error('Error fetching cart details:', error);
        }
    };

    const handleRemoveItem = async (id: any) => {
        try {
            const response = await fetchCartItemRemove(id);
            if (response.status === 200) {
                setCartItems((prevItems) => prevItems.filter((item: any) => item?.product?._id !== id));
            }
        } catch (error) {
            console.error('Error removing cart item:', error);
        }
    };

    const handleQuantityChange = (id: any, type: string) => {
        setCartItems((prevItems: any) =>
            prevItems.map((item: any) =>
                item?.product?._id === id
                    ? {
                        ...item,
                        quantity: type === 'increment' ? item.quantity + 1 : Math.max(item.quantity - 1, 1),
                    }
                    : item
            )
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCartDetails();
        calculateTotalPrice();
        setRefreshing(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchCartDetails();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            calculateTotalPrice();
        }, [cartItems])
    );

    const handlePlaceOrder = async () => {
        try {
            const res: any = await fetchPlaceOrder();
            if (res.status) {
                ToastAndroid.show('Your order has been placed successfully!', 2000);
                router.push('/(tabs)/account');
            } else {
                ToastAndroid.show('Add to cart, Plz try again!', 2000);
            }
        } catch (error) {
            ToastAndroid.show("Add to cart, Please try again", 2000);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.container}>
                <Text style={styles.header}>
                    Cart <Text style={styles.cartCount}>{cartItems.length}</Text>
                </Text>

                <View style={styles.shippingContainer}>
                    <View style={styles.shippingSubContainer}>
                        <Text style={styles.shippingTitle}>Shipping Address</Text>
                        <TouchableOpacity style={styles.editButton} onPress={() => setIsAddressModalVisible(true)}>
                            <Feather name="edit-3" size={20} color="#800020" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.shippingAddress}>
                        {address.street ? `${address.street}, ${address.city}, ${address.state} - ${address.zipCode}` : 'No address added. Please add an address.'}
                    </Text>
                </View>

                <FlatList
                    data={cartItems}
                    keyExtractor={(item: any) => item?.product?._id}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <View style={styles.cartDetails}>
                                <Text style={styles.itemTitle}>{item?.product?.name}</Text>
                                <Text style={styles.itemDetails}>Color: {item?.product?.colors}, Size: {item?.product?.sizes}</Text>
                                <Text style={styles.itemPrice}>{"₹ " + item?.product?.price?.toFixed(2) || 0.00}</Text>
                            </View>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity onPress={() => handleQuantityChange(item?.product?._id, 'decrement')} style={styles.quantityButton}>
                                    <Entypo name='minus' size={25} color={Colors?.PRIMARY} />
                                </TouchableOpacity>
                                <Text style={styles.quantity}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => handleQuantityChange(item?.product?._id, 'increment')} style={styles.quantityButton}>
                                    <Entypo name='plus' size={25} color={Colors?.PRIMARY} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveItem(item?.product?._id)} style={styles.deleteButton}>
                                <Octicons name="trash" size={20} color="#FF0000" />
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <View style={styles.footer}>
                    <Text style={styles.totalPrice}>{"Total ₹ " + totalPrice.toFixed(2) || 0}</Text>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handlePlaceOrder}>
                        <Text style={styles.checkoutText}>Place Order</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={isAddressModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAddressModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Update Address</Text>
                        {['streetAddress', "landMark", 'city', 'state', 'country', 'pincode'].map((field) => (
                            <TextInput key={field} placeholder={`Please enter your ${field}`} value={address[field]} onChangeText={(value) => handleAddressChange(field, value)} style={styles.input} />
                        ))}
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={handleSubmitAddress} style={styles.submitButton}>
                                <Text style={styles.buttonText} >Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsAddressModalVisible(false)} style={styles.cancelButton}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default Cart;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { fontSize: 24, fontWeight: 'bold', margin: 16 },
    cartCount: { fontSize: 18, color: '#800020' },
    shippingContainer: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 8,
        alignItems: 'left',
        justifyContent: 'space-between',
    },
    shippingSubContainer: { flexDirection: "row" },
    shippingTitle: { fontWeight: 'bold', fontSize: 16 },
    shippingAddress: { fontSize: 14, color: '#555', marginTop: 4 },
    editButton: { padding: 8 },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
    },
    cartDetails: { flex: 1, marginLeft: 16 },
    itemTitle: { fontWeight: 'bold' },
    itemDetails: { fontSize: 12, color: '#555' },
    itemPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
    quantityControls: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: { padding: 8 },
    quantity: { fontSize: 16, marginHorizontal: 8 },
    deleteButton: { padding: 8 },
    footer: {flexDirection:"row",justifyContent:"space-between",alignContent:"center", margin: 16, alignItems: 'flex-end' },
    totalPrice: { fontSize: 18, fontWeight: 'bold' },
    checkoutButton: {
        backgroundColor: '#fff',
        color:Colors.PRIMARY,
        paddingVertical: 5,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginTop: 8,
    },
    checkoutText: { color: Colors.PRIMARY, fontWeight: 'bold', fontSize: 16 },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 8,
        width: '80%',
    },
    modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#DDD', padding: 12, marginBottom: 8, borderRadius: 4 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    submitButton: { backgroundColor: '#800020', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 4 },
    cancelButton: { backgroundColor: '#DDD', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 4 },
    buttonText: { color: '#FFF', fontWeight: 'bold' },
});
