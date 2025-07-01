import { fetchCart } from "@/services/api";
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { ToastAndroid } from "react-native";

// Define the product and cart item structure
interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string;
}

interface CartItem {
  _id: string;
  user: string;
  items: Array<{
    product: Product;
    quantity: number;
  }>;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCartLocal: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setCartItemsLocal: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCartLocal: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  setCartItemsLocal: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItemsLocal] = useState<CartItem[]>([]);

  const addToCartLocal = (item: CartItem) => {
    setCartItemsLocal((prev) => [...prev, item]);
  };

  const removeFromCart = (itemId: string) => {
    setCartItemsLocal((prev) => prev.filter((item) => item._id !== itemId));
  };

  const clearCart = () => {
    setCartItemsLocal([]);
  };

  const fetchCartData = useCallback(async () => {
    try {
      const response = await fetchCart(`limit=100000`);
      const data = response.data?.result || [];
      setCartItemsLocal(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    //   ToastAndroid.show("Failed to load cart items", ToastAndroid.SHORT);
    }
  }, []);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCartLocal,
        removeFromCart,
        clearCart,
        setCartItemsLocal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
