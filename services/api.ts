


import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://server.silkindia.co.in'  // "http://192.168.232.28:5000";  // Replace with your actual API base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000, // Set timeout to 5 seconds
});

// Request Interceptor for Authorization Token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (!error.response) {
      // Network error or timeout
      console.error('Network Error: Please check your connection or try again later.');
    } else if (error.response.status === 401) {
      console.error('Unauthorized: Please log in again.');
    } else {
      console.error('Error:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to fetch auth token
export const fetchAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error: any) {
    console.error('Error fetching auth token:', error);
  }
};

// Register User
export const fetchUserRegister = async (name: string, mobileNo: string, password: string, email: string, gst: string) => {
  try {
    const response = await api.post('/api/auth/register', { name, mobileNo, password, email, gst });
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// User Login
export const fetchUserLogin = async (mobileNo: string, password: string) => {
  try {
    const response = await api.post('/api/auth/admin/login', { mobileNo, password });
    const { token, user } = response.data.data;
    if (token) {
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    }
    return { token, user };
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// User Logout
export const fetchUserLogout = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('userData');
    console.log('User logged out successfully.');
  } catch (error: any) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// Fetch Categories
export const fetchCategory = async () => {
  try {
    const response = await api.get('/api/category');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch Subcategories
export const fetchSubCategory = async () => {
  try {
    const response = await api.get('/api/subcategories');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

// Fetch Products with Filter
export const fetchProducts = async (filter?: string | undefined) => {
  try {
    const response = await api.get(`/api/product${filter ? `?${filter}` : ''}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductByI = async (filter?: string | undefined) => {
  try {
    const response = await api.get(`/api/product${filter ? `?${filter}` : ''}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch Banners
export const fetchBanners = async () => {
  try {
    const response = await api.get('/api/banner');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};

// Fetch Product By ID
export const fetchProductById = async (id: any) => {
  try {
    const response = await api.get(`/api/product/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// Add Item to Cart
export const addToCart = async (product: string, quantity: number, name: string, price: string) => {
  try {
    const authToken = await AsyncStorage.getItem('accessToken');
    const cachedProfile = await AsyncStorage.getItem('userData');
    if (!authToken || !cachedProfile) {
      throw new Error('Authentication token or user data missing.');
    }
    const userData = JSON.parse(cachedProfile);
    const response = await api.post('/api/cart', {
      user: userData.id,
      items: { name, product, quantity, price },
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response;
  } catch (error: any) {
    console.error('Error adding to cart:', error.message);
    throw error;
  }
};

// Fetch Cart
export const fetchCart = async (userId: any, query?: any) => {
  try {
    const authToken = await AsyncStorage.getItem('accessToken');
    const cachedProfile: any = await AsyncStorage.getItem('userData');
    console.log(JSON.parse(cachedProfile)?.id)
    if (!authToken) {
      throw new Error('Authentication token is missing.');
    }
    const response = await api.get(`/api/cart/get-cart/${JSON.parse(cachedProfile)?.id}?${query}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart:', error.message);
    throw error;
  }
};

// Remove Item from Cart
export const fetchCartItemRemove = async (id: any) => {
  try {
    const authToken = await AsyncStorage.getItem('accessToken');
    if (!authToken) {
      throw new Error('Authentication token is missing.');
    }
    const response = await api.delete(`/api/cart/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Item Deleted Successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting cart item:', error.message);
    throw error;
  }
};

// Clear Cart
export const fetchClearCartItem = async () => {
  try {
    const authToken = await AsyncStorage.getItem('accessToken');
    const cachedProfile = await AsyncStorage.getItem('userData');
    if (!authToken || !cachedProfile) {
      throw new Error('Authentication token or user data missing.');
    }
    const userData = JSON.parse(cachedProfile);
    const response = await api.delete(`/api/cart/clear/${userData.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Items Removed Successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting cart items:', error.message);
    throw error;
  }
};

// Update User Address
export const fetchUpdateAddress = async (address: { street: string; city: string; state: string; zipCode: string; }) => {
  try {
    const authToken = await AsyncStorage.getItem('accessToken');
    const cachedProfile = await AsyncStorage.getItem('userData');
    if (!authToken || !cachedProfile) {
      throw new Error('Authentication token or user data missing.');
    }
    const userData = JSON.parse(cachedProfile);
    const response = await api.put(`/api/auth/user/${userData.id}`, address, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating address:', error.message);
    throw error;
  }
};

// Place Order
export const fetchPlaceOrder = async (items: any, totalAmount: any) => {
  try {
    const authToken = await AsyncStorage.getItem('accessToken');
    const cachedProfile = await AsyncStorage.getItem('userData');
    if (!authToken || !cachedProfile) {
      throw new Error('Authentication token or user data missing.');
    }
    const userData = JSON.parse(cachedProfile);
    const response = await api.post('/api/order', { user: userData.id, items, totalAmount }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Order Placed:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error placing order:', error.message);
    throw error;
  }
};

// Fetch Orders
export const fetchOrders = async (status: any) => {
  try {
    const response = await api.get(`/api/orders?status=${status}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch User Profile
export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
