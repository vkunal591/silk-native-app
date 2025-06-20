import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Pressable,
} from 'react-native';
import {
    API_BASE_URL,
    fetchCart,
    fetchCartItemRemove,
    fetchCurrentUser,
    fetchPlaceOrder,
    fetchUpdateAddress,
} from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Entypo, Feather, Ionicons, Octicons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';

const defaultImage = require('../../assets/images/silk.png');

interface CartItem {
    _id: string;
    items: Array<{
        product: {
            _id: string;
            name: string;
            price: number;
            images?: string;
        };
        quantity: number;
    }>;
}

interface Address {
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}

const Cart: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [address, setAddress] = useState<Address>({
        streetAddress: "",
        city: "",
        state: "",
        country: "",
        pincode: ""
    });
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(100000);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const router = useRouter();
    const isFetching = useRef(false);
    const hasFetchedOnce = useRef(false);
    const { removeFromCart, setCartItemsLocal, clearCart } = useCart();


    const fetchUserData = useCallback(async () => {
        try {
            const cachedProfile = await fetchCurrentUser();
            if (cachedProfile?.status && cachedProfile?.details?.user?.address) {
                setAddress(cachedProfile.details.user.address);
            }
        } catch (error) {
            ToastAndroid.show('Failed to load user data', ToastAndroid.SHORT);
        }
    }, []);

    const fetchCartData = useCallback(async (pageNum: number, reset = false) => {
        if (isFetching.current || (isLoading && !reset)) return;
        isFetching.current = true;
        setIsLoading(true);

        try {
            const response = await fetchCart(`page=${pageNum}&limit=${limit}`);
            const data = response.data?.result || [];
            setCartItemsLocal(data || [])
            setCartItems(prev => reset ? data : [...prev, ...data]);
            setHasMore(data.length === limit);

            if (data.length === 0 && reset) {
                ToastAndroid.show('Your cart is empty', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Failed to load cart items', ToastAndroid.SHORT);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [limit]);

    const calculateTotalPrice = useCallback(() => {
        const total = cartItems
            .filter(item => selectedItems.includes(item.items[0]?.product?._id))
            .reduce((sum, item) => sum + (item.items[0]?.product?.price * item.items[0]?.quantity), 0);
        setTotalPrice(total);
    }, [cartItems, selectedItems]);

    const toggleSelectItem = useCallback((productId: string) => {
        setSelectedItems(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    const handleAddressChange = useCallback((field: keyof Address, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmitAddress = useCallback(async () => {
        const { streetAddress, city, state, country, pincode } = address;
        if (!streetAddress || !city || !state || !country || !pincode) {
            Alert.alert('Error', 'Please fill in all address fields.');
            return;
        }

        try {
            const response = await fetchUpdateAddress(address);
            if (response.success) {
                setIsAddressModalVisible(false);
                ToastAndroid.show('Address updated successfully', ToastAndroid.SHORT);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update address. Please try again.');
        }
    }, [address]);

    const handleRemoveItem = useCallback(async (id: string) => {
        try {
            const response = await fetchCartItemRemove(id);
            if (response.success) {
                setCartItems(prev => prev.filter(item => item._id !== id));
                setSelectedItems(prev => prev.filter(itemId => itemId !== id));
                ToastAndroid.show('Item removed', ToastAndroid.SHORT);
            }
        } catch (error) {
            // ToastAndroid.show('Error removing item', ToastAndroid.SHORT);
        } finally {
            await removeFromCart(id)
        }
    }, []);

    const handleQuantityChange = useCallback((productId: string, type: 'increment' | 'decrement') => {
        setCartItems(prev => prev.map(item => {
            if (item.items[0]?.product?._id !== productId) return item;
            return {
                ...item,
                items: [{
                    ...item.items[0],
                    quantity: type === 'increment'
                        ? item.items[0].quantity + 1
                        : Math.max(item.items[0].quantity - 1, 1)
                }]
            };
        }));
    }, []);

    const handlePlaceOrder = useCallback(async () => {
        if (selectedItems.length === 0) {
            ToastAndroid.show('Please select at least one item', ToastAndroid.SHORT);
            return;
        }

        const selected = cartItems
            .filter(item => selectedItems.includes(item.items[0]?.product?._id))
            .map(item => item.items[0]);

        try {
            const response = await fetchPlaceOrder(selected, totalPrice);
            if (response.success) {
                // Remove ordered items
                const removedItemIds = cartItems
                    .filter(item => selectedItems.includes(item.items[0]?.product?._id))
                    .map(item => item._id);

                await Promise.all(removedItemIds.map(id => fetchCartItemRemove(id)));

                setCartItems(prev => prev.filter(item => !selectedItems.includes(item.items[0]?.product?._id)));
                setSelectedItems([]);
                ToastAndroid.show('Order placed successfully!', ToastAndroid.SHORT);
                router.push('/(tabs)/shop');
            } else {
                ToastAndroid.show('Failed to place order', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Error placing order. Please try again', ToastAndroid.SHORT);
        } finally {
            clearCart()
        }
    }, [cartItems, selectedItems, totalPrice, router]);

    const handleViewDetails = useCallback((product: CartItem) => {
        router.push({
            pathname: '/(tabs)/explore/ProductDetailsScreen',
            params: { product: JSON.stringify(product.items[0]?.product) }
        });
    }, [router]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        await fetchCartData(1, true);
        setSelectedItems([]);
        setRefreshing(false);
    }, [fetchCartData]);

    const loadMoreItems = useCallback(() => {
        if (hasMore && !isLoading) {
            setPage(prev => prev + 1);
        }
    }, [hasMore, isLoading]);

    useEffect(() => {
        if (page > 1) {
            fetchCartData(page);
        }
    }, [page, fetchCartData]);

    useFocusEffect(
        useCallback(() => {
            if (!hasFetchedOnce.current) {
                fetchCartData(1, true);
                fetchUserData();
                hasFetchedOnce.current = true;
            }
        }, [fetchCartData, fetchUserData])
    );

    useEffect(() => {
        calculateTotalPrice();
    }, [cartItems, selectedItems, calculateTotalPrice]);
    useEffect(() => {
        fetchCartData(1)
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Cart <Text style={styles.cartCount}>{cartItems.length}</Text>
            </Text>

            <View style={styles.shippingContainer}>
                <View style={styles.shippingSubContainer}>
                    <Text style={styles.shippingTitle}>Shipping Address</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsAddressModalVisible(true)}
                    >
                        <Feather name="edit-3" size={20} color="#800020" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.shippingAddress}>
                    {address.pincode
                        ? `${address.streetAddress}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`
                        : 'No address added.'}
                </Text>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={item => item._id}
                renderItem={({ item }) => {
                    const product = item.items[0]?.product;
                    const quantity = item.items[0]?.quantity;
                    const productId = product?._id;
                    const isSelected = selectedItems.includes(productId);

                    return (
                        <View style={styles.cartItem}>
                            <TouchableOpacity
                                onPress={() => toggleSelectItem(productId)}
                                style={styles.checkboxContainer}
                            >
                                <Ionicons
                                    name={isSelected ? "checkbox-outline" : "square-outline"}
                                    size={24}
                                    color={Colors.PRIMARY}
                                />
                            </TouchableOpacity>

                            <Pressable
                                onPress={() => handleViewDetails(item)}
                                style={styles.cartDetails}
                            >
                                <Image
                                    source={product?.images
                                        ? { uri: `${API_BASE_URL}${product.images.replace(/\\/g, "/")}` }
                                        : defaultImage
                                    }
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.itemTitle}>{product?.name}</Text>
                            </Pressable>

                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    onPress={() => handleQuantityChange(productId, 'decrement')}
                                >
                                    <Entypo name="minus" size={20} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.itemTitle}>{quantity}</Text>
                                <TouchableOpacity
                                    onPress={() => handleQuantityChange(productId, 'increment')}
                                >
                                    <Entypo name="plus" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleRemoveItem(item._id)}
                                style={styles.deleteButton}
                            >
                                <Octicons name="trash" size={20} color="#FF0000" />
                            </TouchableOpacity>
                        </View>
                    );
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={loadMoreItems}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isLoading && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="small" color="#800020" />
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                }
            />

            <View style={styles.footer}>
                {/* <Text style={styles.totalPrice}>
                    Total: ${totalPrice.toFixed(2)}
                </Text> */}
                <TouchableOpacity
                    style={[styles.checkoutButton, !selectedItems.length && styles.disabledButton]}
                    onPress={handlePlaceOrder}
                    disabled={!selectedItems.length}
                >
                    <Text style={styles.checkoutText}>
                        Place Order ({selectedItems.length})
                    </Text>
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
                        {(['streetAddress', 'city', 'state', 'country', 'pincode'] as (keyof Address)[]).map(field => (
                            <TextInput
                                key={field}
                                placeholder={`Enter your ${field}`}
                                value={address[field]}
                                onChangeText={value => handleAddressChange(field, value)}
                                style={styles.input}
                            />
                        ))}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={handleSubmitAddress}
                                style={styles.submitButton}
                            >
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16
    },
    cartCount: {
        fontSize: 18,
        color: '#800020'
    },
    shippingContainer: {
        marginHorizontal: 16,
        marginBottom: 16
    },
    shippingSubContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    shippingTitle: {
        fontWeight: 'bold',
        fontSize: 16
    },
    shippingAddress: {
        fontSize: 14,
        color: '#555',
        marginTop: 4
    },
    editButton: {
        padding: 8
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
    },
    checkboxContainer: {
        marginRight: 10
    },
    cartDetails: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    productImage: {
        width: 50,
        height: 50
    },
    itemTitle: {
        fontWeight: 'bold',
        marginHorizontal: 8
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    deleteButton: {
        paddingLeft: 10
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    checkoutButton: {
        backgroundColor: Colors.PRIMARY,
        padding: 12,
        borderRadius: 6,
        minWidth: 120,
        width: "95%",
        marginHorizontal: "auto"
    },
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.7
    },
    checkoutText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        width: '85%'
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    submitButton: {
        backgroundColor: '#800020',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5
    },
    cancelButton: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    loader: {
        padding: 16,
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#555'
    }
});

export default Cart;