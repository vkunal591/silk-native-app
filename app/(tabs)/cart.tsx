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
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Entypo, Feather, Ionicons, Octicons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';
import {
    API_BASE_URL,
    fetchCart,
    fetchCartItemRemove,
    fetchCurrentUser,
    fetchPlaceOrder,
    fetchUpdateAddress,
} from '../../services/api';
import { useCart } from '../context/CartContext';
import { debounce } from 'lodash';

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
        streetAddress: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
    });
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const isFetching = useRef(false);
    const hasFetched = useRef(false); // Track if initial fetch has occurred
    const { removeFromCart, setCartItemsLocal, clearCart } = useCart();
    const isFocused = useIsFocused();

    const fetchUserData = useCallback(async () => {
        try {
            setError(null);
            const cachedProfile = await fetchCurrentUser();
            if (cachedProfile?.status && cachedProfile?.details?.user?.address) {
                setAddress(cachedProfile.details.user.address);
            } else {
                setError('No address found for user');
            }
        } catch (error) {
            setError('Failed to load user data: ' + (error as Error).message);
            ToastAndroid.show('Failed to load user data', ToastAndroid.SHORT);
        }
    }, []);

    const fetchCartData = useCallback(
        async (reset = false) => {
            if (isFetching.current) return;
            isFetching.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetchCart(`limit=100000`);
                const data = response.data?.result || [];
                const uniqueData = Array.from(
                    new Map(data.map((item: CartItem) => [item.items[0].product._id, item])).values()
                ) as CartItem[];
                
                setCartItemsLocal(uniqueData);
                setCartItems(reset ? uniqueData : [...cartItems, ...uniqueData]);
                setHasMore(data.length === 100000);
                if (data.length === 0 && reset) {
                    setError('Your cart is empty');
                }
            } catch (error) {
                setError('Failed to load cart items: ' + (error as Error).message);
                ToastAndroid.show('Failed to load cart items', ToastAndroid.SHORT);
            } finally {
                setIsLoading(false);
                isFetching.current = false;
            }
        },
        [cartItems, setCartItemsLocal]
    );

    const calculateTotalPrice = useCallback(() => {
        const total = cartItems
            .filter(item => selectedItems.includes(item.items[0]?.product?._id))
            .reduce((sum, item) => sum + (item.items[0]?.product?.price || 0) * (item.items[0]?.quantity || 0), 0);
        setTotalPrice(total);
    }, [cartItems, selectedItems]);

    const toggleSelectItem = useCallback((productId: string) => {
        setSelectedItems(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    }, []);

    const handleAddressChange = useCallback((field: keyof Address, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmitAddress = useCallback(async () => {
        const { streetAddress, city, state, country, pincode } = address;
        if (!streetAddress || !city || !state || !country || !pincode) {
            setError('Please fillMz in all address fields');
            Alert.alert('Error', 'Please fill in all address fields');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetchUpdateAddress(address);
            if (response.success) {
                setIsAddressModalVisible(false);
                ToastAndroid.show('Address updated successfully', ToastAndroid.SHORT);
            } else {
                throw new Error('Address update failed');
            }
        } catch (error) {
            setError('Failed to update address: ' + (error as Error).message);
            Alert.alert('Error', 'Failed to update address. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    const debouncedHandleQuantityChange = useCallback(
        debounce((productId: string, type: 'increment' | 'decrement') => {
            setCartItems(prev =>
                prev.map(item =>
                    item.items[0]?.product?._id !== productId
                        ? item
                        : {
                            ...item,
                            items: [
                                {
                                    ...item.items[0],
                                    quantity: type === 'increment' ? item.items[0].quantity + 1 : Math.max(item.items[0].quantity - 1, 1),
                                },
                            ],
                        }
                )
            );
        }, 300),
        []
    );

    const handleRemoveItem = useCallback(
        async (id: string) => {
            try {
                setIsLoading(true);
                const response = await fetchCartItemRemove(id);
                if (response.success) {
                    setCartItems(prev => prev.filter(item => item._id !== id));
                    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
                    removeFromCart(id);
                    ToastAndroid.show('Item removed', ToastAndroid.SHORT);
                } else {
                    throw new Error('Failed to remove item');
                }
            } catch (error) {
                setError('Error removing item: ' + (error as Error).message);
                ToastAndroid.show('Error removing item', ToastAndroid.SHORT);
            } finally {
                setIsLoading(false);
            }
        },
        [removeFromCart]
    );

    const handlePlaceOrder = useCallback(async () => {
        if (!selectedItems.length) {
            setError('No items selected');
            ToastAndroid.show('Please select at least one item', ToastAndroid.SHORT);
            return;
        }

        try {
            setIsLoading(true);
            const selected = cartItems
                .filter(item => selectedItems.includes(item.items[0]?.product?._id))
                .map(item => item.items[0]);

            const response = await fetchPlaceOrder(selected, totalPrice);
            if (response.success) {
                const removedItemIds = cartItems
                    .filter(item => selectedItems.includes(item.items[0]?.product?._id))
                    .map(item => item._id);
                
                await Promise.all(removedItemIds.map(id => fetchCartItemRemove(id)));
                setCartItems(prev => prev.filter(item => !selectedItems.includes(item.items[0]?.product?._id)));
                setSelectedItems([]);
                clearCart();
                ToastAndroid.show('Order placed successfully!', ToastAndroid.SHORT);
                router.push('/(tabs)/shop');
            } else {
                throw new Error('Order placement failed');
            }
        } catch (error) {
            setError('Error placing order: ' + (error as Error).message);
            ToastAndroid.show('Error placing order. Please try again', ToastAndroid.SHORT);
        } finally {
            setIsLoading(false);
        }
    }, [cartItems, selectedItems, totalPrice, router, clearCart]);

    const handleViewDetails = useCallback(
        (product: CartItem) => {
            if (!product?.items[0]?.product) {
                setError('Invalid product data');
                return;
            }
            router.push({
                pathname: '/(tabs)/explore/ProductDetailsScreen',
                params: { product: JSON.stringify(product.items[0].product) },
            });
        },
        [router]
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setError(null);
        await fetchCartData(true);
        setSelectedItems([]);
        setRefreshing(false);
    }, [fetchCartData]);

    const loadMoreItems = useCallback(() => {
        if (hasMore && !isLoading) {
            fetchCartData();
        }
    }, [hasMore, isLoading, fetchCartData]);

    useEffect(() => {
        if (isFocused && !hasFetched.current) {
            hasFetched.current = true;
            Promise.all([fetchCartData(true), fetchUserData()])
                .catch(err => {
                    setError('Failed to load initial data: ' + (err as Error).message);
                    ToastAndroid.show('Failed to load initial data', ToastAndroid.SHORT);
                });
        }
    }, [isFocused, fetchCartData, fetchUserData]);

    useEffect(() => {
        calculateTotalPrice();
    }, [cartItems, selectedItems, calculateTotalPrice]);

    useEffect(() => {
        // Reset hasFetched when component loses focus to allow refetch on next focus
        if (!isFocused) {
            hasFetched.current = false;
        }
    }, [isFocused]);

    if (error && !cartItems.length && !isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Cart <Text style={styles.cartCount}>{cartItems.length}</Text>
            </Text>

            {/* {error && (
                <Text style={styles.errorText}>{error}</Text>
            )} */}

            <View style={styles.shippingContainer}>
                <View style={styles.shippingSubContainer}>
                    <Text style={styles.shippingTitle}>Shipping Address</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsAddressModalVisible(true)}>
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
                            <TouchableOpacity onPress={() => toggleSelectItem(productId)} style={styles.checkboxContainer}>
                                <Ionicons name={isSelected ? 'checkbox-outline' : 'square-outline'} size={24} color={Colors.PRIMARY} />
                            </TouchableOpacity>
                            <Pressable onPress={() => handleViewDetails(item)} style={styles.cartDetails}>
                                <Image
                                    source={product?.images ? { uri: `${API_BASE_URL}${product.images.replace(/\\/g, '/')}` } : defaultImage}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                    onError={() => ToastAndroid.show('Failed to load image', ToastAndroid.SHORT)}
                                />
                                <Text style={styles.itemTitle}>{product?.name || 'Unknown Product'}</Text>
                            </Pressable>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity onPress={() => debouncedHandleQuantityChange(productId, 'decrement')}>
                                    <Entypo name="minus" size={20} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.itemTitle}>{quantity}</Text>
                                <TouchableOpacity onPress={() => debouncedHandleQuantityChange(productId, 'increment')}>
                                    <Entypo name="plus" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveItem(item._id)} style={styles.deleteButton}>
                                <Octicons name="trash" size={20} color="#FF0000" />
                            </TouchableOpacity>
                        </View>
                    );
                }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={loadMoreItems}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isLoading ? <View style={styles.loader}><ActivityIndicator size="small" color="#800020" /></View> : null}
                ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty</Text>}
            />

            <View style={styles.footer}>
                {/* <Text style={styles.totalPrice}>Total: ₹{totalPrice.toFixed(2)}</Text> */}
                <TouchableOpacity
                    style={[styles.checkoutButton, !selectedItems.length && styles.disabledButton]}
                    onPress={handlePlaceOrder}
                    disabled={!selectedItems.length || isLoading}
                >
                    <Text style={styles.checkoutText}>
                        {isLoading ? 'Processing...' : `Place Order (${selectedItems.length})`}
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
                                autoCapitalize={field === 'pincode' ? 'none' : 'words'}
                                keyboardType={field === 'pincode' ? 'numeric' : 'default'}
                            />
                        ))}
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                onPress={handleSubmitAddress} 
                                style={[styles.submitButton, isLoading && styles.disabledButton]}
                                disabled={isLoading}
                            >
                                <Text style={styles.buttonText}>{isLoading ? 'Submitting...' : 'Submit'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setIsAddressModalVisible(false)} 
                                style={styles.cancelButton}
                                disabled={isLoading}
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
        backgroundColor: '#FFF',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16,
    },
    cartCount: {
        fontSize: 18,
        color: '#800020',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 16,
    },
    retryButton: {
        backgroundColor: '#800020',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',
        marginTop: 10,
    },
    shippingContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    shippingSubContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shippingTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    shippingAddress: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    editButton: {
        padding: 8,
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
        backgroundColor: '#FFF',
    },
    checkboxContainer: {
        marginRight: 10,
    },
    cartDetails: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 4,
    },
    itemTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginHorizontal: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
    },
    deleteButton: {
        paddingLeft: 10,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkoutButton: {
        backgroundColor: Colors.PRIMARY,
        padding: 12,
        borderRadius: 6,
        minWidth: "90%",
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.7,
    },
    checkoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        width: '85%',
        maxWidth: 400,
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        fontSize: 14,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: '#800020',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ddd',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loader: {
        padding: 16,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#555',
    },
});

export default Cart;