// Header.js
import { Colors } from '@/contants/Colors';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, TouchableOpacity } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';

const Header = ({ Title, searchInput, setSearchInput, onSearchClick }: any) => {
  const slideDown = useRef(new Animated.Value(-100)).current; // Starts above the screen

  
  useFocusEffect(
    React.useCallback(() => {
      // console.log('CartScreen is now focused');
      Animated.timing(slideDown, {
        toValue: 0, // Move back to its natural position
        duration: 800,
        useNativeDriver: true, // Optimized for better performance
      }).start();
      // return () => console.log('CartScreen lost focus');
    }, [])
  );

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        { transform: [{ translateY: slideDown }] },
      ]}>
      <Text style={styles.title} onPress={()=>{if(Title==="shop")router.replace('/(tabs)/shop')}}><Entypo name={Title} size={30} color={Colors.PRIMARY} /></Text>
      <View style={styles.inputWrapper}>
        {/* <Icon name="search" size={20} color="gray" style={styles.icon} /> */}
        <TextInput placeholder="Search"
          style={styles.searchBar}
          value={searchInput}
          onChangeText={(value) => setSearchInput(value)} />
        <TouchableOpacity onPress={onSearchClick}>
          <Ionicons name='search' size={25} style={styles.searchIcon} color={Colors?.PRIMARY} />
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
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', width: '10%', marginLeft: 10 },
  searchBar: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 7,
    margin: 5,
  },
  searchIcon: {
    marginRight: 20
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
  icon: {
    marginRight: 0,
  },
});

export default Header;
