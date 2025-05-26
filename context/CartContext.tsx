// context/CartContext.tsx
import { fetchCart } from '@/services/api';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastAndroid } from 'react-native';

type CartItem = any; // Replace with your CartItem type if available

interface CartContextProps {
  cartItems: CartItem[];
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextProps>({
  cartItems: [],
  refreshCart: async () => {},
  loading: false,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCart(`page=1&limit=${limit}`);
      const data = response.data.result || [];
      setCartItems(data);

      ToastAndroid.show(data.length === 0 ? 'No item in cart' : 'Cart items loaded', ToastAndroid.SHORT);
    } catch (err) {
      console.error('Error loading cart:', err);
      ToastAndroid.show('Failed to load cart items', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, refreshCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
