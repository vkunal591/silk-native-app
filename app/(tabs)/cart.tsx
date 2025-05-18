import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    ToastAndroid,
    Image,
    ActivityIndicator,
} from 'react-native';
import {
    API_BASE_URL,
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
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // Number of items per page
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();

    const getUserData = async () => {
        const cachedProfile: any = await fetchCurrentUser();
        if (cachedProfile?.status) {
            setAddress(cachedProfile?.details?.user?.address);
        }
    };

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
        setTotalPrice(total);
    };

    const fetchCartDetails = async (pageNum: number, reset = false) => {
        if (isLoadingMore && !reset) return;
        setIsLoadingMore(true);
        try {
            const response = await fetchCart(`page=${pageNum}&limit=${limit}`);
            const data = response.data.result || [];
            if (reset) {
                setCartItems(data);
            } else {
                setCartItems((prevItems: any) => [...prevItems, ...data]);
            }
            setHasMore(data.length === limit); // If less than limit, no more items
            if (data.length === 0 && reset) {
                ToastAndroid.show('No item in cart', 2000);
            } 

            if (data.length !== 0) {
                ToastAndroid.show('Cart items loaded', 2000);
            }
        } catch (error) {
            console.error('Error fetching cart details:', error);
            ToastAndroid.show('Failed to load cart items', 2000);
        } finally {
            setIsLoadingMore(false);
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
        setPage(1);
        await fetchCartDetails(1, true);
        await calculateTotalPrice();
        setRefreshing(false);
    };

    const loadMoreItems = () => {
        if (hasMore && !isLoadingMore) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        if (page > 1) {
            fetchCartDetails(page);
        }
    }, [page]);

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            fetchCartDetails(1, true);
            getUserData();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            calculateTotalPrice();
        }, [cartItems])
    );

    const extractItemsArray = (carts: any) => {
        return carts.map((cart: any) => cart.items[0]);
    };

    const totalAmountCalcutalte = (cart: any) => {
        return cart?.reduce((sum: any, item: any) => sum + (item.price * item?.quantity), 0);
    };

    const handlePlaceOrder = async () => {
        const cart = extractItemsArray(cartItems);
        const items = extractItemsArray(cartItems);
        const totalAmount = totalAmountCalcutalte(cart);
        try {
            const res: any = await fetchPlaceOrder(items, totalAmount);
            if (res.success) {
                await fetchClearCartItem();
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
                            <Image
                                source={
                                    item?.items[0]?.product?.images
                                        ? {
                                              uri: `${API_BASE_URL}${item?.items[0]?.product?.images.replace(/\\/g, "/")}`,
                                          }
                                        : img
                                }
                                style={{ width: 50, height: 50 }}
                                resizeMode="contain"
                            />
                            <Text style={styles.itemTitle}>{item?.items[0].product?.name}</Text>
                        </View>
                        <View style={{ marginRight: 20 }}>
                            <Text style={styles.itemTitle}>{item?.items[0]?.quantity}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveItem(item?._id)} style={styles.deleteButton}>
                            <Octicons name="trash" size={20} color="#FF0000" />
                        </TouchableOpacity>
                    </View>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={loadMoreItems}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="small" color="#800020" />
                        </View>
                    ) : null
                }
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.checkoutButton} onPress={handlePlaceOrder}>
                    <Text style={styles.checkoutText}>Place Order</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={isAddressModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddressModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Update Address</Text>
                        {['streetAddress', 'city', 'state', 'country', 'pincode'].map((field: any, index: any) => (
                            <TextInput
                                key={index}
                                placeholder={`Please enter your ${field}`}
                                value={address[field]}
                                onChangeText={(value) => handleAddressChange(field, value)}
                                style={styles.input}
                            />
                        ))}
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={handleSubmitAddress} style={styles.submitButton}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsAddressModalVisible(false)}
                                style={styles.cancelButton}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Cart;

const styles: any = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { fontSize: 24, fontWeight: 'bold', margin: 16 },
    cartCount: { fontSize: 18, color: '#800020' },
    shippingContainer: { marginHorizontal: 16, marginBottom: 16 },
    shippingSubContainer: { flexDirection: "row", width: "95%", marginHorizontal: "auto" },
    shippingTitle: { fontWeight: 'bold', fontSize: 16 },
    shippingAddress: { fontSize: 14, color: '#555', marginTop: 0, width: "95%", marginHorizontal: "auto" },
    editButton: { padding: 8 },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
    },
    cartDetails: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 16 },
    itemTitle: { fontWeight: 'bold' },
    deleteButton: { padding: 8 },
    footer: { flexDirection: "row", justifyContent: "center", alignContent: "center", margin: 16, alignItems: 'flex-end' },
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
    loader: { padding: 16, alignItems: 'center' },
});