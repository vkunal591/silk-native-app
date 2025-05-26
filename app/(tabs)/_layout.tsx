import { Colors } from '@/contants/Colors'
import { Entypo } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { useFocusEffect, useNavigationState } from '@react-navigation/native'
import { fetchCart } from '@/services/api'

export default function TabLayout() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 1000;

    const navigationState = useNavigationState(state => state);
    const currentTab = navigationState.routes[1]; // Default to 'shop' if no tab is selected
    const fetchCartDetails = async (pageNum: number, reset = false) => {
        if (isLoadingMore && !reset) return;
        setIsLoadingMore(true);
        try {
            const response = await fetchCart(`?page=${pageNum}&limit=${limit}`);
            const data = response.data.result || [];
            console.log('Fetched cart items:', data.length);
            if (reset) {
                setCartItems(data);
            } else {
                setCartItems((prevItems: any) => [...prevItems, ...data]);
            }
            setHasMore(data.length === limit);

            if (data.length === 0 && reset) {
                ToastAndroid.show('No item in cart', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('Cart items loaded', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error fetching cart details:', error);
            ToastAndroid.show('Failed to load cart items', ToastAndroid.SHORT);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // // Fetch cart data when the cart screen is focused
    // useFocusEffect(
    //     useCallback(() => {
    //         fetchCartDetails(1, true);
    //     }, [])
    // );

    useEffect(() => {
        // if (currentTab === 'cart') {
        fetchCartDetails(1, true);
        // }
    }, [currentTab]);
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name='shop' options={{
                tabBarIcon: ({ color, size }) => <Entypo name="shop" size={size} color={color} />,
                tabBarLabel: "Home",
                tabBarActiveTintColor: Colors?.PRIMARY,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: Colors?.SHADE_WHITE },
            }} />
            <Tabs.Screen name='explore' options={{
                tabBarIcon: ({ color, size }) => <Entypo name="list" size={size} color={color} />,
                tabBarLabel: "Explore",
                tabBarActiveTintColor: Colors?.PRIMARY,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: Colors?.SHADE_WHITE },
            }} />
            <Tabs.Screen name='cart' options={{
                tabBarIcon: ({ color, size }) => <Entypo name="shopping-cart" size={size} color={color} />,
                tabBarLabel: "Cart",
                tabBarActiveTintColor: Colors?.PRIMARY,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: Colors?.SHADE_WHITE },
                tabBarBadge: cartItems.length > 0 ? cartItems.length : undefined,
                tabBarBadgeStyle: { backgroundColor: "#fff", color: Colors?.PRIMARY, borderWidth: 1, borderColor: Colors?.PRIMARY, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',borderRadius: 15, fontSize: 10, padding: 0 },
            }} />
            <Tabs.Screen name='account' options={{
                tabBarIcon: ({ color, size }) => <Entypo name="user" size={size} color={color} />,
                tabBarLabel: "Account",
                tabBarActiveTintColor: Colors?.PRIMARY,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: Colors?.SHADE_WHITE },
            }} />
        </Tabs>
    );
}



