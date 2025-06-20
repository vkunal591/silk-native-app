// CartContext.tsx
import { fetchCart } from "@/services/api";
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { ToastAndroid } from "react-native";

interface CartContextType {
    cartItems: any[];
    addToCartLocal: (item: any) => void;
    removeFromCart: (itemId: any) => void;
    clearCart: () => void;
    setCartItemsLocal: any
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCartLocal: () => { },
    removeFromCart: () => { },
    clearCart: () => { },
    setCartItemsLocal: () => { }
});

export const CartProvider = ({ children }: any) => {
    const [cartItems, setCartItemsLocal] = useState<any>([]);

    const addToCartLocal = (item: any) => {
        console.log(item)
        setCartItemsLocal((prev: any) => [...prev, item]);
    };

    const removeFromCart = () => {
        setCartItemsLocal((prev: any[]) => {
            if (prev.length === 0) return prev;
            return prev.slice(0, -1); // removes the last item
        });
    };

    const clearCart: any = (item: any) => setCartItemsLocal(item);


    const fetchCartData = useCallback(async (pageNum: number, reset = false) => {


        try {
            const response = await fetchCart(`page=${pageNum}&limit=100000`);
            const data = response.data?.result || [];
            setCartItemsLocal(data)

        } catch (error) {
            ToastAndroid.show('Failed to load cart items', ToastAndroid.SHORT);
        }
    }, []);

    useEffect(() => {
        fetchCartData(1)
    }, [])


    return (
        <CartContext.Provider value={{ cartItems, addToCartLocal, removeFromCart, clearCart, setCartItemsLocal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
