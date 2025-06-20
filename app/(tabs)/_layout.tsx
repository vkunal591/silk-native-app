import { Colors } from '@/contants/Colors'
import { Entypo } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { useCart } from '../context/CartContext';


export default function TabLayout() {
    const { cartItems } = useCart();

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
            <Tabs.Screen
                name='cart'
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="shopping-cart" size={size} color={color} />
                    ),
                    tabBarLabel: "Cart",
                    tabBarActiveTintColor: Colors?.PRIMARY,
                    tabBarInactiveTintColor: 'gray',
                    tabBarStyle: { backgroundColor: Colors?.SHADE_WHITE },

                    // Badge to show number of cart items
                    tabBarBadge: cartItems?.length > 0 ? cartItems.length : null,
                    tabBarBadgeStyle: {
                        backgroundColor: Colors?.PRIMARY,
                        color: '#fff',
                        fontSize: 10,
                    },
                }}
            />

            <Tabs.Screen name='account' options={{
                tabBarIcon: ({ color, size }) => <Entypo name="user" size={size} color={color} />,
                tabBarLabel: "Account",
                tabBarActiveTintColor: Colors?.PRIMARY,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: Colors?.SHADE_WHITE },

            }} />
        </Tabs>
    )
}
