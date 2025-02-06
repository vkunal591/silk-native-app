// import { useFocusEffect } from 'expo-router';
// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ImageBackground,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// const bannerImage = require('../assets/images/banner.png');

// const { width } = Dimensions.get('window');

// const slides = [
//   {
//     id: '1',
//     title: 'Big Sale',
//     desc: 'Up to 50%',
//     image: '../../assets/banner.png',
//   },
//   {
//     id: '2',
//     title: 'Mega Sale',
//     desc: 'Up to 70%',
//     image: '../../assets/banner.png',
//   },
//   {
//     id: '3',
//     title: 'Today Sale',
//     desc: 'Up to 90%',
//     image: '../../assets/banner.png',
//   },
// ];

// const BannerSlider = () => {
//   const flatListRef = useRef(null);
//   const [currentIndex, setCurrentIndex] = useState(0);

  
//   useFocusEffect(
//     React.useCallback(() => {
//       // console.log('CartScreen is now focused');
//       const autoSlide = setInterval(() => {
//         let nextIndex = (currentIndex + 1) % slides.length;
//         flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//         setCurrentIndex(nextIndex);
//       }, 3000);
    
//       return () => clearInterval(autoSlide);
//       // return () => console.log('CartScreen lost focus');
//     }, [currentIndex])
//   );

//   const onScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
//     const offsetX = event.nativeEvent.contentOffset.x;
//     const index = Math.round(offsetX / width);
//     setCurrentIndex(index);
//   };

//   const goToSlide = (index: React.SetStateAction<number>) => {
//     flatListRef.current?.scrollToIndex({ index, animated: true });
//     setCurrentIndex(index);
//   };

//   const renderItem = ({ item }:any) => (
//     <View style={styles.slide}>
//       <ImageBackground
//         source={bannerImage} // Replace with actual banner image URL
//         style={styles.banner}>
//         <View>
//           <Text style={styles.bigSaleText}>{item?.title}</Text>
//           <Text style={styles.subtitle}>{item?.desc} </Text>
//         </View>
//       </ImageBackground>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={slides}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onScroll={onScroll}
//       />
//       <View style={styles.pagination}>
//         {slides?.map((_, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[styles.dot, currentIndex === index && styles.activeDot]}
//             onPress={() => goToSlide(index)}
//           />
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   slide: {
//     width: width,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   banner: {
//     height: 200,
//     width: 370,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//     padding: 15,
//     backgroundColor: '#ffddaa',
//     borderRadius: 10,
//     marginHorizontal: 12,
//     overflow: 'hidden',
//   },
//   bigSaleText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
//   subtitle: { fontSize: 18, color: '#fff', marginTop: 5 },
//   pagination: {
//     flexDirection: 'row',
//     position: 'absolute',
//     bottom: 10,
//     alignSelf: 'center',
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#ccc',
//     margin: 5,
//   },
//   activeDot: {
//     backgroundColor: '#333',
//   },
// });

// export default BannerSlider;



import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

// Local banner image import
const bannerImage = require('../assets/images/banner.png');

const slides = [
  {
    id: '1',
    title: 'Big Sale',
    desc: 'Up to 50%',
    image: bannerImage,  // Reference directly from import
  },
  {
    id: '2',
    title: 'Mega Sale',
    desc: 'Up to 70%',
    image: bannerImage,
  },
  {
    id: '3',
    title: 'Today Sale',
    desc: 'Up to 90%',
    image: bannerImage,
  },
];

const BannerSlider = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto slide function that runs every 3 seconds
  const autoSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  }, [currentIndex]);

  useFocusEffect(
    React.useCallback(() => {
      const interval = setInterval(() => autoSlide(), 3000);
      
      // Cleanup the interval on screen blur
      return () => clearInterval(interval);
    }, [autoSlide])
  );

  const onScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const goToSlide = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <ImageBackground source={item.image} style={styles.banner}>
        <View>
          <Text style={styles.bigSaleText}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.desc}</Text>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
      />
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    height: 200,
    width: 370,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#ffddaa',
    borderRadius: 10,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bigSaleText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 18, color: '#fff', marginTop: 5 },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    margin: 5,
  },
  activeDot: {
    backgroundColor: '#333',
  },
});

export default BannerSlider;
