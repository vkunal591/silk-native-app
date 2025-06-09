import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '@/services/api';

const bannerImage = require('../assets/images/banner.png');
const defaultSlides = [
  { id: '1', title: 'Big Sale', desc: 'Up to 50%', image: bannerImage },
  { id: '2', title: 'Mega Sale', desc: 'Up to 70%', image: bannerImage },
  { id: '3', title: 'Today Sale', desc: 'Up to 90%', image: bannerImage },
];

const { width } = Dimensions.get('window');

const BannerSlider = ({ data = defaultSlides }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!data || data.length === 0);

  useEffect(() => {
    if (!data || data.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, data]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * width, animated: true });
      setCurrentIndex(index);
    }
  };

  if (isLoading || !data || data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>
          {data?.length === 0 ? 'No Banners Available' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => {
          const imageSource =
            typeof item.image === 'string'
              ? {
                  uri: item.image.startsWith('http')
                    ? item.image
                    : `${API_BASE_URL}${item.image.replace(/\\/g, '/')}`,
                }
              : item.image;

          return (
            <ImageBackground
              key={item.id || index}
              source={imageSource}
              style={styles.slide}
              resizeMode="cover"
            >
              {/* Optional: Text overlay */}
              {/* <View style={styles.overlay} />
              <View style={styles.textContainer}>
                <Text style={styles.bigSaleText}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.desc}</Text>
              </View> */}
            </ImageBackground>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
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
    width,
    height: width >= 768 ? 300 : width * 0.5,
    position: 'relative',
    overflow: 'hidden',
    margin:'auto'
  },
  slide: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  bigSaleText: {
    fontSize: width >= 768 ? 32 : 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: width >= 768 ? 20 : 16,
    color: '#fff',
    marginTop: 5,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: width >= 768 ? 12 : 8,
    height: width >= 768 ? 12 : 8,
    borderRadius: width >= 768 ? 6 : 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: width >= 768 ? 14 : 10,
    height: width >= 768 ? 14 : 10,
    borderRadius: width >= 768 ? 7 : 5,
  },
  loadingContainer: {
    width,
    height: width >= 768 ? 300 : width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: width >= 768 ? 18 : 14,
    color: '#000',
    marginTop: 10,
  },
});

export default BannerSlider;
