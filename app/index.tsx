import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';


export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const firstTime = await AsyncStorage.getItem('isFirstTime');
      const token = await AsyncStorage.getItem('accessToken');
      console.log(token)
      if (token || firstTime) {
        router.replace('/(tabs)/shop');  // Redirect to the shop if already logged in
      }
    };
    checkLoginStatus();
  }, []);


  const setFirstTimeVisitor = async () => {

    await AsyncStorage.setItem('isFirstTime', 'true'); // Mark as not first time after intro

  };



  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('../assets/images/women.jpeg')}
        style={styles.backgroundImage}
        resizeMode="cover">
        {/* Logo in the Center */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/silk.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Start Button at the Bottom */}
        <TouchableOpacity style={styles.startButton}
          onPress={() => { setFirstTimeVisitor(); router.push('/auth/signin') }}
        >
          <Text
            style={styles.startButtonText}

          >
            Shop Now
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: '40%', // Vertically centered (adjust as needed)
    left: 20, // 20 pixels from the left edge
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align content to the left
  },
  logo: {
    width: 250, // Adjust the width of the logo
    height: 250, // Adjust the height of the logo
    position: 'absolute',
    bottom: 120,
  },
  startButton: {
    width: '40%',
    backgroundColor: 'transparent', // Transparent background
    borderWidth: 2, // Border thickness
    borderColor: '#7F0045', // Border color
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 35,
    position: 'absolute',
    bottom: 70, // Position the button above the bottom of the screen
  },
  startButtonText: {
    color: '#7F0045', // Button text color
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: "ralewayBold"
  },
})