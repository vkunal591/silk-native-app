
// import React, { useState, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ImageBackground,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { useFocusEffect } from 'expo-router';
// import { API_BASE_URL } from '@/services/api';

// const { width } = Dimensions.get('window');

// // Local banner image import
// const bannerImage = require('../assets/images/banner.png');

// const slides = [
//   {
//     id: '1',
//     title: 'Big Sale',
//     desc: 'Up to 50%',
//     image: bannerImage,  // Reference directly from import
//   },
//   {
//     id: '2',
//     title: 'Mega Sale',
//     desc: 'Up to 70%',
//     image: bannerImage,
//   },
//   {
//     id: '3',
//     title: 'Today Sale',
//     desc: 'Up to 90%',
//     image: bannerImage,
//   },
// ];

// const BannerSlider = ({ data }: any) => {
//   const flatListRef = useRef<any>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   // Auto slide function that runs every 3 seconds
//   const autoSlide = useCallback(() => {
//     const nextIndex = (currentIndex + 1) % slides.length;
//     flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//     setCurrentIndex(nextIndex);
//   }, [currentIndex]);

//   useFocusEffect(
//     React.useCallback(() => {
//       const interval = setInterval(() => autoSlide(), 3000);

//       // Cleanup the interval on screen blur
//       return () => clearInterval(interval);
//     }, [autoSlide])
//   );

//   const onScroll = (event: any) => {
//     const offsetX = event.nativeEvent.contentOffset.x;
//     const index = Math.round(offsetX / width);
//     setCurrentIndex(index);
//   };

//   const goToSlide = (index: any) => {
//     flatListRef.current?.scrollToIndex({ index, animated: true });
//     setCurrentIndex(index);
//   };

//   const renderItem = ({ item }: any) => (
//     <View style={styles.slide}>
//       <ImageBackground source={{ uri: `${API_BASE_URL}${item.image.replace(/\\/g, "/")}`}} style={styles.banner}>
//         <View>
//           <Text style={styles.bigSaleText}>{item.title}</Text>
//           <Text style={styles.subtitle}>{item.description}</Text>
//         </View>
//       </ImageBackground>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={data}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onScroll={onScroll}
//       />
//       <View style={styles.pagination}>
//         {slides.map((_, index) => (
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
//     backgroundColor:'red'
//   },
//   slide: {
//     width: "90%",
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   banner: {
//     height: 200,
//     width:"100%",
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     padding: 0,
//     backgroundColor: '#ffddaa',
//     borderRadius: 10,
//     objectFit:"fill",
//     backgroundSize:"100%",
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













import React, { useState, useRef, useEffect } from 'react';
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
import { API_BASE_URL } from '@/services/api';

const { width, height } = Dimensions.get('window');

// Local banner image import
const bannerImage = require('../assets/images/banner.png');

const slides = [
  {
    id: '1',
    title: 'Big Sale',
    desc: 'Up to 50%',
    image: bannerImage, 
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

const BannerSlider = ({ data = slides }) => {
  const flatListRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState<any>(0);

  useFocusEffect(
    React.useCallback(() => {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % data.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }, 3000);

      return () => clearInterval(interval);
    }, [currentIndex, data.length])
  );

  const onScroll = (event:any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const goToSlide = (index:any) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const renderItem = ({ item }:any) => {
    const imageSource =
      typeof item.image === 'string'
        ? { uri: `${API_BASE_URL}${item?.image.replace(/\\/g, "/")}` }
        : item.image;

    return (
      <View style={styles.slide}>
      <ImageBackground source={imageSource} style={styles.banner} resizeMode="cover">
        {/* Black overlay for better text readability */}
        <View style={styles.overlay} />

        <View style={styles.textContainer}>
          <Text style={styles.bigSaleText}>{item?.title}</Text>
          <Text style={styles.subtitle}>{item?.description}</Text>
        </View>
      </ImageBackground>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={onScroll}
        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
      />
      <View style={styles.pagination}>
        {data.map((_, index) => (
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
    width: width-20,  
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow:"hidden"
  },
  slide: {
    width: width,  
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow:"hidden"

  },
  banner: {
    width: width-5,  
    height: height * 0.25,  
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
    backdropFilter:"blur"
  }, overlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire ImageBackground
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semi-transparent black
  },
  textContainer: {
    alignItems: 'center',
    position: 'absolute', // Ensures text is above the overlay
  },
  bigSaleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
  },
});

export default BannerSlider;
