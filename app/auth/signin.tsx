import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchUserRegister,
  fetchUserLogin,
} from '../../services/api';
import { useRouter } from 'expo-router';
import { Entypo, EvilIcons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';


export default function SigninScreen() {
  const [tab, setTab] = useState('SignUp');
  const [name, setName] = useState('');
  const [gst, setGst] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        router.replace('/(tabs)/shop');  // Redirect to the shop if already logged in
      }
    };
    checkLoginStatus();
  }, []);

  const toggleInputVisibility = () => {
    setIsInputVisible((prevState) => !prevState);
  };

  // // Handle user registration
  const handleSignUp = async () => {
    if (!name.trim()) {
      ToastAndroid.show('Full Name is required.', 2000);
    } else if (!/^\d{10}$/.test(mobileNo)) {
      ToastAndroid.show('Phone Number must be 10 digits.', 2000);
    } else if (password.length < 6) {
      ToastAndroid.show('Password must be at least 6 characters.', 2000);
    } else {
      setIsLoading(true); // Start loading
      try {
        const res = await fetchUserRegister(name, mobileNo, password, '', gst);
        if (res?.success) {
          ToastAndroid.show('You have successfully signed up!', 2000);
          const token = res.data.token;
          const user = res.data.user;
          const jsonValue = JSON.stringify(user);
          await AsyncStorage.setItem('accessToken', token);
          await AsyncStorage.setItem('userData', jsonValue);
          router.replace('/(tabs)/shop');
        } else {
          ToastAndroid.show('Registration failed. Please try again.', 2000);
        }
      } catch (error) {
        console.error('Sign up error:', error);
        ToastAndroid.show('An error occurred. Please try again later.', 2000);
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };

  // // Handle user login
  const handleLogin = async () => {
    if (!mobileNo.trim() || !password.trim()) {
      ToastAndroid.show('Phone Number and Password are required.', 2000);
      return;
    }
    setIsLoading(true); // Start loading
    try {
      const response: any = await fetchUserLogin(mobileNo, password);
      if (response?.token) {
        ToastAndroid.show('Login successful!', 2000);
        await AsyncStorage.setItem('accessToken', response.token);
        router.replace('/(tabs)/shop');
      } else {
        ToastAndroid.show(response.message || 'Login failed. Please try again.', 2000);
      }
    } catch (error) {
      console.error('Login error:', error);
      ToastAndroid.show('Login failed. Please check your credentials and try again.', 2000);
    } finally {
      setIsLoading(false); // End loading
    }
  };




  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Text style={styles.subTitle}>Get a great experience with Pastours</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'SignUp' && styles.activeTab]}
          onPress={() => setTab('SignUp')}>
          <Text
            style={[styles.tabText, tab === 'SignUp' && styles.activeTabText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'SignIn' && styles.activeTab]}
          onPress={() => setTab('SignIn')}>
          <Text
            style={[styles.tabText, tab === 'SignIn' && styles.activeTabText]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        {tab === 'SignUp' && (
          <>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <EvilIcons name="user" size={30} color={Colors?.GRAY_BLACK} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.label}>GST (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Entypo name="text" size={24} color={Colors.GRAY_BLACK} />
              <TextInput
                style={styles.input}
                placeholder="Enter your GST"
                value={gst}
                onChangeText={setGst}
              />
            </View>
          </>
        )}

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Entypo name="mobile" size={24} color={Colors.GRAY_BLACK} />
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            keyboardType="numeric"
            value={mobileNo}
            onChangeText={setMobileNo}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Entypo name="lock" size={24} color={Colors.GRAY_BLACK} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={isInputVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={toggleInputVisibility}>
            <Entypo name={!isInputVisible ? 'eye' : 'eye-with-line'} size={24} color={Colors.GRAY_BLACK} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.GRAY_BLACK} />
      ) : (
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={tab === 'SignUp' ? handleSignUp : handleLogin}>
          <Text style={styles.buttonText}>{tab}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.guestButton}
        onPress={() => router.replace('/(tabs)/shop')}>
        <Text style={styles.guestButtonText}>Continue As Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7F0045',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7800',
    textAlign: 'left',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 14,
    color: '#A7A9B7',
    textAlign: 'left',
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 5,
    backgroundColor: '#FFF',
    borderRadius: 30,
  },
  tab: {
    width: '48%',
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#E5007D',
    opacity: 0.9,
  },
  tabText: {
    color: '#8A004F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFF',
  },
  inputContainer: {
    marginBottom: 30,
    paddingVertical: 7,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    padding: 13,
    fontSize: 16,
    width: '85%',
  },
  signUpButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    backgroundColor: '#F5038F',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
