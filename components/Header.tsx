

import { Colors } from '@/contants/Colors';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, TouchableOpacity } from 'react-native';

interface HeaderProps {
  Title: string;
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ Title, searchInput, setSearchInput, onSearchClick }) => {
  const slideDown = useRef(new Animated.Value(-100)).current; // Starts above the screen
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      // Slide down animation when screen is focused
      Animated.timing(slideDown, {
        toValue: 0, // Move back to its natural position
        duration: 800,
        useNativeDriver: true, // Optimized for better performance
      }).start();
    }, [])
  );

  const handleSearchClick = () => {
    if (searchInput.trim()) {
      onSearchClick(); // Call the search function only if the input is not empty
    } else {
      console.log("Search input is empty");
    }
  };

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        { transform: [{ translateY: slideDown }] },
      ]}
    >
      <Text
        style={styles.title}
        onPress={() => {
          if (Title === "shop") router.replace('/(tabs)/shop');
        }}
      >
        <Entypo name={Title} size={30} color={Colors.PRIMARY} />
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Search"
          style={styles.searchBar}
          value={searchInput}
          onChangeText={setSearchInput} // Use directly to update search input state
        />
        <TouchableOpacity onPress={handleSearchClick}>
          <Ionicons
            name="search"
            size={25}
            style={styles.searchIcon}
            color={Colors.PRIMARY}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    width: '100%',
    padding: 10,
    paddingHorizontal: 0,
    backgroundColor: '#f2f2f2',
    elevation: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    width: '10%',
    marginLeft: 10,
  },
  searchBar: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 7,
    margin: 5,
  },
  searchIcon: {
    marginRight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    width: '80%',
    marginRight: 10,
  },
});

export default Header;
