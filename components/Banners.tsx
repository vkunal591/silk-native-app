import { API_BASE_URL } from "@/services/api";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";

// Default slides data
const bannerImage = require("../assets/images/banner.png");
const defaultSlides = [
  { id: "1", title: "Big Sale", desc: "Up to 50%", image: bannerImage },
  { id: "2", title: "Mega Sale", desc: "Up to 70%", image: bannerImage },
  { id: "3", title: "Today Sale", desc: "Up to 90%", image: bannerImage },
];

// Get window dimensions for responsiveness
const { width } = Dimensions.get("window");

const BannerSlider = ({ data = defaultSlides }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!data || data.length === 0);

  // Auto-scroll effect
  useEffect(() => {
    if (!data || data.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, data]);

  // Handle scroll event
  const onScroll = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      setCurrentIndex(index);
    },
    [width]
  );

  // Navigate to specific slide
  const goToSlide = useCallback(
    (index) => {
      if (index < 0 || index >= data.length || !flatListRef.current) return;
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    },
    [data]
  );

  // Render individual banner
  const renderItem = useCallback(({ item }) => {
    const imageSource =
      typeof item.image === "string"
        ? {
            uri: item.image.startsWith("http")
              ? item.image
              : `${API_BASE_URL}${item.image.replace(/\\/g, "/")}`,
          }
        : item.image;

    return (
      <View style={styles.slide}>
        <ImageBackground
          source={imageSource}
          style={styles.banner}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.textContainer}>
            <Text style={styles.bigSaleText}>{item?.title}</Text>
            <Text style={styles.subtitle}>{item?.desc}</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }, []);

  // Combined loading and empty state
  if (isLoading || !data || data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>
          {data?.length === 0 ? "No Banners Available" : "Loading..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={onScroll}
        initialNumToRender={1}
        maxToRenderPerBatch={3}
        removeClippedSubviews
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
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
    width: width * 0.95,
    margin: "auto",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  banner: {
    width,
    height: width >= 768 ? 300 : width * 0.5, // Larger height for tablets
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Darker overlay for better contrast
  },
  textContainer: {
    alignItems: "center",
    position: "absolute",
  },
  bigSaleText: {
    fontSize: width >= 768 ? 32 : 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: width >= 768 ? 20 : 16,
    color: "#fff",
    marginTop: 5,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dot: {
    width: width >= 768 ? 12 : 8,
    height: width >= 768 ? 12 : 8,
    borderRadius: width >= 768 ? 6 : 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: width >= 768 ? 6 : 4,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: width >= 768 ? 14 : 10,
    height: width >= 768 ? 14 : 10,
    borderRadius: width >= 768 ? 7 : 5,
  },
  loadingContainer: {
    width,
    height: width >= 768 ? 300 : width * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "#000",
    marginTop: 10,
  },
});

export default BannerSlider;
