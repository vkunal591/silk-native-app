import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/contants/Colors";

// Get window dimensions for responsiveness
const { width } = Dimensions.get("window");

interface HeaderProps {
  Title: string;
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  Title,
  searchInput,
  setSearchInput,
  onSearchClick,
}) => {
  const slideDown = useRef(new Animated.Value(-100)).current;
  const router = useRouter();

  // Animation on mount
  useEffect(() => {
    Animated.timing(slideDown, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [slideDown]);

  const handleSearchClick = useCallback(() => {
    if (searchInput.trim()) {
      onSearchClick();
    }
  }, [searchInput, onSearchClick]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: slideDown }] },
        ]}
      >
        <Text
          style={styles.title}
          onPress={() => {
            if (Title.toLowerCase() === "shop") {
              router.replace("/(tabs)/shop");
            }
          }}
        >
          <Ionicons
            name="storefront-outline"
            size={width >= 768 ? 36 : 30}
            color={Colors.PRIMARY}
          />
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Search"
            style={styles.searchBar}
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
            onSubmitEditing={handleSearchClick}
          />
          <TouchableOpacity onPress={handleSearchClick}>
            <Ionicons
              name="search"
              size={width >= 768 ? 30 : 25}
              style={styles.searchIcon}
              color={Colors.PRIMARY}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: "#f2f2f2",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.03,
    paddingVertical: 10,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: width >= 768 ? 28 : 22,
    fontWeight: "bold",
    width: width * 0.15,
    textAlign: "center",
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#fff",
    padding: width >= 768 ? 10 : 7,
    marginVertical: 5,
    fontSize: width >= 768 ? 18 : 16,
    borderRadius: 10,
  },
  searchIcon: {
    marginHorizontal: width >= 768 ? 15 : 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#fff",
    borderRadius: 25,
    width: width * 0.75,
    overflow: "hidden",
  },
});

export default Header;
