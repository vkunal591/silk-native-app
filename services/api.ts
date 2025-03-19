import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://server.silkindia.co.in'; // Replace with your actual API base URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

// Add a request interceptor for adding auth tokens
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken'); // Retrieve token from AsyncStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized: Please log in again.');
            // Optional: Handle token refresh or logout
        }
        return Promise.reject(error);
    }
);

export const fetchAuthToken = async () => {
    try {
        const authToken = await AsyncStorage.getItem('accessToken');
        console.log(authToken); // This will correctly log the token if it exists
        return authToken;
    } catch (error) {
        console.error('Error fetching auth token:', error);
    }
};

// Example: User Registration
export const fetchUserRegister = async (name: any, mobile: any, password: any, email: any, gst: any) => {
    try {
        console.log(name, email, password);
        const response = await api.post(
            'https://server.silkindia.co.in/api/auth/register',
            {
                name,
                mobile,
                password,
                email,
                gst,
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Example: User Login
export const fetchUserLogin = async (mobile: any, password: any) => {
    try {
        console.log(mobile);
        const response = await api.post(
            'https://server.silkindia.co.in/api/auth/login',
            {
                mobile,
                password,
            }
        );
        console.log(response);
        const { token, user } = response.data;
        let userData = JSON.stringify(user);

        // Store the token in AsyncStorage for future requests
        if (token) {
            await AsyncStorage.setItem('accessToken', token);
            await AsyncStorage.setItem('userData', userData);
        }

        return { token, user };
    } catch (error) {
        throw error;
    }
};

// Example: User Logout
export const fetchUserLogout = async () => {
    try {
        await AsyncStorage.removeItem('accessToken'); // Remove token from AsyncStorage
        await AsyncStorage.removeItem('userData');
        console.log('User logged out successfully.');
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};

// Example: Fetch Catyegory
export const fetchCategory = async () => {
    try {
        const response = await api.get(`/api/categories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user category:', error);
        throw error;
    }
};

// Example: Fetch Catyegory
export const fetchSubCategory = async () => {
    try {
        const response = await api.get(`/api/subcategories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user subcategory:', error);
        throw error;
    }
};

// Example: Fetch Catyegory
export const fetchProducts = async () => {
    try {
        const response = await api.get(`/api/products`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Example: Fetch Catyegory
export const fetchProductById = async (id: any) => {
    try {
        const response = await api.get(`/api/products/searchById/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Example: Fetch Catyegory
export const fetchProductSearch = async (name: any) => {
    try {
        const res = await api.get(`/api/products/search/?name=${name}`)
        if (res.status) {
            return res?.data;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const addToCart = async (productId: any, quantity: any) => {
    try {
        const authToken = await AsyncStorage.getItem('accessToken'); // Retrieve the auth token
        if (!authToken) {
            throw new Error('Authentication token is missing.');
        }

        const response = await api.post(
            'https://server.silkindia.co.in/api/cart/add',
            {
                productId,
                quantity,
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Add the token to the headers
                },
            }
        );

        console.log(response);
        return response;
    } catch (error: any) {
        console.error('Error adding to cart:', error.message);
        throw error;
    }
};

export const fetchCart = async (id?: any) => {
    try {
        // Retrieve the auth token from AsyncStorage
        const authToken = await AsyncStorage.getItem('accessToken');
        if (!authToken) {
            throw new Error('Authentication token is missing.');
        }

        console.log('Auth Token:', authToken);

        // Make the GET request
        const response = await api.get(
            'https://server.silkindia.co.in/api/cart', // API endpoint
            {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the headers
                    'Content-Type': 'application/json', // Optional: Specify JSON payload
                },
                data: { productId: id },
            }
        );

        console.log('Cart Details:', response.data);
        return response; // Return the cart details
    } catch (error: any) {
        console.error('Error fetching cart details:', error.message);
        throw error; // Rethrow the error for caller handling
    }
};

export const fetchCartItemRemove = async (productId: any) => {
    try {
        // Retrieve the auth token from AsyncStorage
        const authToken = await AsyncStorage.getItem('accessToken');
        if (!authToken) {
            throw new Error('Authentication token is missing.');
        }

        console.log('Auth Token:', authToken);

        // Make the DELETE request
        const response = await api.delete(
            'https://server.silkindia.co.in/api/cart/remove',
            {
                headers: { Authorization: `Bearer ${authToken}` },
                data: { productId },
            }
        );

        console.log('Item Deleted Successfully:', response.data);
        return response; // Return the response data
    } catch (error: any) {
        console.error('Error deleting cart item:', error.message);
        throw error; // Rethrow the error for caller handling
    }
};











// export const fetchUpdateAddress = async (address: any) => {
//     try {
//         // Retrieve the auth token from AsyncStorage
//         const authToken = await AsyncStorage.getItem('authToken');
//         if (!authToken) {
//             throw new Error('Authentication token is missing.');
//         }

//         console.log('Auth Token:', authToken);
//         console.log(address)
//         // Make the DELETE request
//         const response = await api.put(
//             'https://server.silkindia.co.in/api/auth/update-profile',
//             {
//                 headers: {
//                     Authorization: `Bearer ${authToken}`, // Include the token in the headers
//                     'Content-Type': 'application/json', // Optional: Specify JSON payload
//                 },
//                 data: { address },
//             }
//         );

//         console.log('Address Update Successfully:', response.data);
//         return response.data; // Return the response data
//     } catch (error: any) {
//         console.error('Error address faield update:', error.message);
//         throw error; // Rethrow the error for caller handling
//     }
// };

export const fetchUpdateAddress = async (address: any) => {
    try {
        // Retrieve the auth token from AsyncStorage
        const authToken = await AsyncStorage.getItem('accessToken');

        if (!authToken) {
            throw new Error('Authentication token is missing.');
        }

        console.log('Auth Token:', authToken);
        const data = JSON.stringify({ 'address': address });
        console.log(data)
        // Make the PUT request
        const response = await api.put(
            'https://server.silkindia.co.in/api/auth/update-profile',
            // The data you want to update, make sure it's structured correctly
            data,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the headers
                    'Content-Type': 'application/json', // Specify JSON payload
                },
            }
        );
        return response.data; // Return the response data

    } catch (error: any) {
        console.error('Error address update failed:', error.message);
        throw error; // Rethrow the error for caller handling
    }
};


export const fetchPlaceOrder = async () => {
    try {
        // Retrieve the auth token from AsyncStorage
        const authToken = await AsyncStorage.getItem('accessToken');
        if (!authToken) {
            throw new Error('Authentication token is missing.');
        }

        console.log('Auth Token:', authToken);

        // Make the GET request
        const response = await api.post(
            'https://server.silkindia.co.in/api/orders/place', // API endpoint
            {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the headers
                    'Content-Type': 'application/json', // Optional: Specify JSON payload
                },
                // data: { productId: id },
            }
        );

        console.log('Order Placed:', response.data);
        return response; // Return the cart details
    } catch (error: any) {
        console.error('Error placing order order:', error.message);
        throw error; // Rethrow the error for caller handling
    }
};



// Example: Fetch User Profile
export const fetchUserProfile = async () => {
    try {
        const response = await api.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};


// Example: Fetch User Profile
export const fetchCurrentUser = async () => {
    try {
        const response = await api.get('https://server.silkindia.co.in/api/auth/current-user');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Example: Fetch Orders
export const fetchOrders = async (status: any) => {
    try {
        const response = await api.get(`/orders?status=${status}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

// Example: Post Order History
export const fetchOrderHistory = async () => {
    try {
        const response = await api.get(`/order-history`);
        return response.data;
    } catch (error) {
        console.error('Error order-history:', error);
    }
};
