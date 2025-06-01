import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "@/services/api";
import { Colors } from "@/contants/Colors";

const { width } = Dimensions.get("window");

interface Product {
  _id: string;
  name: string;
  price: string | number;
  images: string;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (id: string, name: string, price: string | number) => void;
  apiBaseUrl?: string;
}

const ProductCard = memo(
  ({
    product,
    onViewDetails,
    onAddToCart,
    apiBaseUrl = API_BASE_URL,
  }: ProductCardProps) => {
    const handleImageError = useCallback(() => {
      console.error(
        `Image failed to load for product: ${product?.name || "Unknown"}`
      );
    }, [product?.name]);

    const handleAddToCart = useCallback(() => {
      onAddToCart(product._id, product.name, product.price);
    }, [onAddToCart, product]);

    const imageSource = product?.images
      ? {
          uri: product.images.startsWith("http")
            ? product.images
            : `${apiBaseUrl}${product.images.replace(/\\/g, "/")}`,
        }
      : require("../assets/images/logo.png"); // Replace with your placeholder image

    return (
      <Pressable
        onPress={() => onViewDetails(product)}
        accessibilityLabel={`View details for ${product?.name || "product"}`}
      >
        <View style={styles.cardContainer}>
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
            defaultSource={require("../assets/images/logo.png")} // Fallback image
            accessibilityLabel={product?.name || "Product image"}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {product?.name || "Product name not available"}
            </Text>
            <View style={styles.subInfoContainer}>
              <Text style={styles.price}>₹{product?.price || "N/A"}</Text>
              <Pressable
                style={styles.cartButton}
                onPress={handleAddToCart}
                accessibilityLabel={`Add ${product?.name || "product"} to cart`}
              >
                <MaterialCommunityIcons
                  name="cart-plus"
                  size={width >= 768 ? 32 : 28}
                  color={Colors.PRIMARY}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
);

// Styles
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "transparent",
    borderRadius: 12,
    margin: width >= 768 ? 10 : 7,
    padding: 0,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
    width: width >= 768 ? width * 0.3 : width * 0.45, // Adjust width for tablets
  },
  image: {
    width: "100%",
    height: width >= 768 ? 220 : 160, // Larger image for tablets
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#FFF",
  },
  infoContainer: {
    marginTop: 8,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: width >= 768 ? 16 : 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  subInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  price: {
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: "700",
    color: "#FF6F61",
  },
  cartButton: {
    padding: 5,
  },
});

export default ProductCard;
