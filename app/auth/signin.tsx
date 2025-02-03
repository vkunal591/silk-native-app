import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchUserRegister,
  fetchUserLogin,
} from '../../services/api';
import { useRouter } from 'expo-router';
import { Entypo, EvilIcons, Fontisto } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';

export default function SigninScreen() {
  const [tab, setTab] = useState('SignUp');
  const [fullName, setFullName] = useState('');
  const [gst, setGst] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(true);

  const router = useRouter();

  const toggleInputVisibility = () => {
    setIsInputVisible((prevState) => !prevState);
  };

  // Handle user registration
  const handleSignUp = async () => {
    if (!fullName.trim()) {
      ToastAndroid.show('Full Name is required.', 2000);
    } else if (!/^\d{10}$/.test(mobile)) {
      ToastAndroid.show('Phone Number must be 10 digits.', 2000);
    } else if (password.length < 6) {
      ToastAndroid.show(
        'Password must be at least 6 characters.', 2000
      );
    } else {
      try {
        await fetchUserRegister(
          fullName,
          mobile,
          password,
          '',
          gst
        ).then(async (res: any) => {
          console.log('Registration Response:', res);

          ToastAndroid.show('You have successfully signin!', 2000);
          const token = res?.token;
          const user = res?.user;
          console.log(token, user, "demo")
          const jsonValue = JSON.stringify(user);
          // Store the token in AsyncStorage for future requests
          if (token) {
            await AsyncStorage.setItem('accessToken', token);
            await AsyncStorage.setItem('userData', jsonValue);
            router.replace('/(tabs)/shop')
          }

        });
      } catch (error) {
        console.error('Error during singin:', error);
        ToastAndroid.show(
          'Please try again later.', 2000
        );
      }
    }
  };

  // Handle user login
  const handleLogin = async () => {
    if (!mobile.trim() || !password.trim()) {
      ToastAndroid.show(
        'Phone Number and Password are required.', 2000
      );
      return;
    }
    try {
      const response: any = await fetchUserLogin(mobile, password);
      console.log('Login Response:', response);
      if (response?.token) {

        ToastAndroid.show("Login Succesfull", 2000)
        // Store the token in AsyncStorage for future requests
        await AsyncStorage.setItem('accessToken', response.token);
        router.replace('/(tabs)/shop')

      } else {
        ToastAndroid.show('Error', response.message || 'Login failed.');
      }
    } catch (error: any) {
      ToastAndroid.show("Check login credential. Please try again", 3000)
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Text style={styles.subTitle}>Get great experience with Pastours</Text>

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
                value={fullName}
                onChangeText={setFullName}
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
            value={mobile}
            onChangeText={setMobile}
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

            <Entypo name={!isInputVisible ? "eye" : "eye-with-line"} size={24} color={Colors.GRAY_BLACK} />
          </TouchableOpacity>

        </View>
      </View>

      <TouchableOpacity
        style={styles.signUpButton}
        onPress={tab === 'SignUp' ? handleSignUp : handleLogin}
      >
        <Text style={styles.buttonText}>{tab}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.guestButton}
        onPress={() => router.replace('/(tabs)/shop')}
      >
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
    // alignContent: '',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7800',
    textAlign: 'left',
    marginBottom: 5,
    marginTop: 0,
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
    width: "85%"
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
