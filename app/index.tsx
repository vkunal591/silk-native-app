import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("screen");

export default function Index() {
  const router = useRouter();

  // useEffect(() => {
  //   const checkLoginStatus = async () => {
  //     try {
  //       const firstTime = await AsyncStorage.getItem('isFirstTime');
  //       const token = await AsyncStorage.getItem('accessToken');

  //       console.log("Token:", token);
  //       console.log("First Time:", firstTime);

  //       if (token || firstTime === 'true') {
  //         router.replace('/(tabs)/shop');  // Redirect to the shop if already logged in
  //       }
  //     } catch (error) {
  //       console.error("Error checking login status:", error);
  //     }
  //   };

  //   checkLoginStatus();
  // }, [router]); // Added router as a dependency

  const setFirstTimeVisitor = async () => {
    try {
      await AsyncStorage.setItem("isFirstTime", "true"); // Mark as visited
      router.push("/auth/signin"); // Navigate after setting the flag
    } catch (error) {
      console.error("Error setting first time visitor:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require("../assets/images/start.jpeg")}
        style={styles.backgroundImage}
        resizeMode="stretch" // Ensure the image fits within the screen
      >
        {/* Start Button at the Bottom */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={setFirstTimeVisitor} // Directly call function
        >
          <Text style={styles.startButtonText}>Shop Now</Text>
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
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "cover",
  },
  startButton: {
    width: "40%",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#7F0045",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 35,
    position: "absolute",
    bottom: height * 0.15,
  },
  startButtonText: {
    color: "#7F0045",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "ralewayBold", // Ensure font is loaded in your project
    textAlign: "center",
  },
});
