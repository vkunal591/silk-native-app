import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '@/services/api';

const { width, height } = Dimensions.get('window');

// Local banner image import
const bannerImage = require('../assets/images/banner.png');

// Default slides data
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // If no data, handle it with loading state
  useEffect(() => {
    if (data?.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [data]);

  // Handle scrolling to the next slide
  useEffect(() => {
    if (data?.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      if (flatListRef.current) {
        try {
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          setCurrentIndex(nextIndex);
        } catch (error) {
          console.error('Error scrolling to index:', error);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, data]);

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    if (index < 0 || index >= data.length) return;

    if (flatListRef.current) {
      try {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setCurrentIndex(index);
      } catch (error) {
        console.error('Error scrolling to index:', error);
      }
    }
  };

  const renderItem = ({ item }: any) => {
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
            <Text style={styles.subtitle}>{item?.desc}</Text>
          </View>
        </ImageBackground>
      </View>
    );
  };

  // Show loading indicator when data is being loaded
  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No Banners Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item,index) =>index}
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
    // width: width - 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 'auto',
  },
  slide: {
    // width: width - 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  banner: {
    width: width - 25,
    height: height * 0.25,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlay: {
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
    display: "none",
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: "#000"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BannerSlider;
