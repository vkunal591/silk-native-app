


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
    fetchClearCartItem,
    fetchCurrentUser,
    fetchPlaceOrder,
    fetchUpdateAddress,
} from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Entypo, Feather, Ionicons, Octicons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const img = require('../../assets/images/silk.png');

const Cart = () => {
    const [cartItems, setCartItems] = useState<any>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [address, setAddress] = useState<any>({
        streetAddress: "",
        city: "",
        state: "",
        country: "",
        pincode: ""
    });
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const router = useRouter();
    const getUserData = async () => {
        const cachedProfile: any = await fetchCurrentUser()
        if (cachedProfile?.status) {
            setAddress(cachedProfile?.details?.user?.address);
        }
    }

    const handleAddressChange = (field: string, value: string) => {
        setAddress((prevAddress: any) => ({ ...prevAddress, [field]: value }));
    };

    const handleSubmitAddress = async () => {

        if (!address.streetAddress || !address.country || !address.city || !address.state || !address.pincode) {
            Alert.alert('Error', 'Please fill in all address fields.');
            return;
        }

        try {
            const response = await fetchUpdateAddress(address);
            if (response.success) {
                setIsAddressModalVisible(false);
                Alert.alert('Address', 'Address submitted successfully');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            Alert.alert('Error', 'Failed to update address. Please try again.');
        }
    };

    const calculateTotalPrice = () => {
        const items = extractItemsArray(cartItems);

        const total = items.reduce((sum: any, item: any) => sum + item?.product?.price * item?.quantity, 0);
        console.log(total)
        setTotalPrice(total);
    };

    const fetchCartDetails = async () => {
        try {
            const response = await fetchCart();
            const data = response.data.result;
            setCartItems(data || []);
            if (data.length !== 0) {
                ToastAndroid.show('cart items', 2000);

            }
            else {
                ToastAndroid.show('No item in cart', 2000);

            }
        } catch (error) {
            console.error('Error fetching cart details:', error);
        }
    };

    const handleRemoveItem = async (id: any) => {
        try {
            const response: any = await fetchCartItemRemove(id);
            if (response.success) {
                ToastAndroid.show("Item removed successfully", 1000);
                setCartItems((prevItems: any) => prevItems.filter((item: any) => item?._id !== id));
            }
        } catch (error) {
            console.error('Error removing cart item:', error);
        }
    };

    const handleQuantityChange = (id: any, type: string) => {
        setCartItems((prevItems: any) =>
            prevItems.map((item: any) =>
                item?.product === id
                    ? {
                        ...item,
                        quantity: type === 'increment' ? item.quantity + 1 : Math.max(item?.quantity - 1, 1),
                    }
                    : item
            )
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCartDetails();
        await calculateTotalPrice();
        setRefreshing(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchCartDetails();
            getUserData()
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            calculateTotalPrice();
        }, [cartItems])
    );

    const extractItemsArray = (carts: any) => {
        return carts.map((cart: any) => cart.items[0]);
    }

    const totalAmountCalcutalte = (cart: any) => {
        console.log(cart)
        return cart?.reduce((sum: any, item: any) => sum + (item.price * item?.quantity), 0);
    }

    const handlePlaceOrder = async () => {
        const cart = extractItemsArray(cartItems);
        const items = extractItemsArray(cartItems);
        const totalAmount = totalAmountCalcutalte(cart);
        try {
            const res: any = await fetchPlaceOrder(items,totalAmount);
            if (res.success) {
                const res:any= await fetchClearCartItem()
                console.log(res.data,"dfjksfkjdsk")
                ToastAndroid.show('Your order has been placed successfully!', 2000);
                router.push('/(tabs)/shop');
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
                        {address?.pincode ? `${address.streetAddress}, ${address.state}, ${address?.country} - ${address.pincode}` : 'No address added. Please add an address.'}
                    </Text>
                </View>

                <FlatList
                    data={cartItems}
                    keyExtractor={(item: any) => item?._id}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <View style={styles.cartDetails}>
                                <Text style={styles.itemTitle}>{item?.items[0]?.name}</Text>
                            </View>
                            <View style={{ marginRight: 20 }} >
                                <Text style={styles.itemTitle}>{item?.items[0]?.quantity}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveItem(item?._id)} style={styles.deleteButton}>
                                <Octicons name="trash" size={20} color="#FF0000" />
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handlePlaceOrder}>
                        <Text style={styles.checkoutText}>Place Order</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={isAddressModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAddressModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Update Address</Text>
                        {['streetAddress', 'city', 'state', 'country', 'pincode'].map((field: any, index: any) => (
                            <TextInput key={index} placeholder={`Please enter your ${field}`} value={address[field]} onChangeText={(value) => handleAddressChange(field, value)} style={styles.input} />
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

const styles: any = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { fontSize: 24, fontWeight: 'bold', margin: 16 },
    cartCount: { fontSize: 18, color: '#800020' },
    shippingSubContainer: { flexDirection: "row", width:"95%", marginHorizontal:"auto" },
    shippingTitle: { fontWeight: 'bold', fontSize: 16 },
    shippingAddress: { fontSize: 14, color: '#555', marginTop: 0, width:"95%", marginHorizontal:"auto" },
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
    footer: { flexDirection: "row", justifyContent: "center", alignContent: "center", margin: 16, alignItems: 'flex-end' },
    totalPrice: { fontSize: 18, fontWeight: 'bold' },
    checkoutButton: {
        backgroundColor: '#fff',
        color: Colors.PRIMARY,
        paddingVertical: 5,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Colors.PRIMARY,
        textAlign: "center",
        width: "98%"

    },
    checkoutText: { color: Colors.PRIMARY, fontWeight: 'bold', textAlign: "center", fontSize: 16 },
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
