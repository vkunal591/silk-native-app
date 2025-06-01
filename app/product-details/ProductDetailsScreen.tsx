import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
  ToastAndroid,
  Modal,
} from "react-native";
import { addToCart, API_BASE_URL, fetchProducts } from "@/services/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Colors } from "@/contants/Colors";
import { useFocusEffect } from "expo-router";
import ImageViewer from "react-native-image-zoom-viewer";

const imgPlaceholder = require("../../assets/images/women.jpeg");

const ProductDetailsScreen = () => {
  const router = useRouter();
  const { product }: any = useLocalSearchParams();
  const data = JSON.parse(product);

  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<any>(data);
  const [productList, setProductList] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false); // State for full-screen modal

  const fetchProductList = async () => {
    setIsLoading(true);
    try {
      const res = await fetchProducts("");
      setProductList(res.data.result || []);
    } catch (error) {
      console.error("Error fetching product list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProductList();
    }, [productData?._id])
  );

  const handleQuantityIncrease = () => setQuantity(quantity + 1);
  const handleQuantityDecrease = () => setQuantity(Math.max(1, quantity - 1));

  const handleAddToCart = async (_id: any, name: string, price: string) => {
    try {
      await addToCart(_id, quantity, name, price).then(() => {
        ToastAndroid.show("Product added to cart.", ToastAndroid.SHORT);
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      ToastAndroid.show(
        "Could not add product to cart. Try again later.",
        2000
      );
    }
  };

  // Prepare image for full-screen viewer
  const images = [
    {
      url:
        productData?.images
          ? `${API_BASE_URL}${productData?.images.replace(/\\/g, "/")}`
          : Image.resolveAssetSource(imgPlaceholder).uri,
    },
  ];

  return (
    <View style={styles.box}>
      <ScrollView style={styles.container}>
        {/* Product Image with Full-Screen Trigger */}
        <TouchableOpacity onPress={() => setIsFullScreen(true)}>
          <Image
            source={
              productData?.images
                ? {
                    uri: `${API_BASE_URL}${productData?.images.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }
                : imgPlaceholder
            }
            style={styles.productImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.nameText}>
            {productData?.name || "Trendy Product"}
          </Text>
          <Text style={styles.priceText}>
            {productData?.price ? `₹ ${productData.price}` : "₹ 00.0"}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.ratingReviews}>
          <Text style={styles.sectionTitle}>Product Details:</Text>
          <Text style={styles.descriptionText}>
            {productData?.description || "No description available"}
          </Text>
        </View>

        {/* Most Popular Products */}
        <View style={styles.mostPopular}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Popular</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/Shop/ShopScreen",
                  params: { search: productData?.category },
                })
              }
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={productList}
            horizontal
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/product-details/ProductDetailsScreen",
                    params: { product: JSON.stringify(item) },
                  })
                }
              >
                <View style={styles.cardContainer}>
                  <Image
                    source={{
                      uri: `${API_BASE_URL}${item?.images.replace(/\\/g, "/")}`,
                    }}
                    style={styles.image}
                  />
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.subInfoContainer}>
                      <Text style={styles.price}>₹{item.price}</Text>
                      <TouchableOpacity
                        style={styles.rating}
                        onPress={() =>
                          handleAddToCart(item?._id, item?.name, item?.price)
                        }
                      >
                        <MaterialCommunityIcons
                          name="cart-plus"
                          size={30}
                          color={Colors.PRIMARY}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
            keyExtractor={(item) => String(item._id)}
          />
        </View>
      </ScrollView>

      {/* Full-Screen Image Viewer Modal */}
      <Modal
        visible={isFullScreen}
        transparent={true}
        onRequestClose={() => setIsFullScreen(false)}
      >
        <ImageViewer
          imageUrls={images}
          enableSwipeDown={true}
          onSwipeDown={() => setIsFullScreen(false)}
          renderIndicator={() => null} // Hide default indicator
          saveToLocalByLongPress={true}
          backgroundColor="rgba(0,0,0,0.9)"
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsFullScreen(false)}
        >
          <Ionicons name="close" size={30} color="#FFF" />
        </TouchableOpacity>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={handleQuantityDecrease}
            style={styles.quantityButton}
          >
            <Text style={styles.addButton}>
              <Entypo name="minus" size={22} />
            </Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            onPress={handleQuantityIncrease}
            style={styles.quantityButton}
          >
            <Text style={styles.addButton}>
              <Entypo name="plus" size={22} />
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() =>
            handleAddToCart(
              productData?._id,
              productData?.name,
              productData?.price
            )
          }
        >
          <Text style={styles.cartText}>Add to</Text>
          <MaterialCommunityIcons
            name="cart-plus"
            size={35}
            color={Colors.PRIMARY}
            style={styles.cart}
          />
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <Pressable style={styles.buttonStyle} onPress={() => router.back()}>
        <Feather name="arrow-left" size={35} color={Colors.PRIMARY} />
      </Pressable>
    </View>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  box: { flex: 1 },
  buttonStyle: { position: "absolute", left: 5, top: 5, padding: 5 },
  container: { flex: 1, backgroundColor: "#FFF" },
  productImage: { width: "100%", height: 450 },
  productDetails: { paddingHorizontal: 16, paddingTop: 10 },
  nameText: { fontSize: 22, fontWeight: "bold", color: "#800020" },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#800020",
    paddingLeft: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    marginVertical: 5,
    paddingHorizontal: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  ratingReviews: { padding: 16 },
  mostPopular: { paddingHorizontal: 16, marginBottom: 15 },
  sectionHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: { color: Colors.PRIMARY, fontSize: 16 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: Colors?.SHADE_WHITE,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 16,
    width: 160,
  },
  quantityButton: {
    width: 45,
    height: 45,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlignVertical: "center",
    alignSelf: "center",
    textAlign: "center",
    backgroundColor: Colors?.WHITE,
    color: "#fff",
    borderRadius: 4,
    marginHorizontal: 15,
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  addButton: { color: Colors?.PRIMARY, fontSize: 25 },
  quantity: { fontSize: 18, fontWeight: "bold" },
  cartButton: {
    width: 200,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    padding: 5,
    borderRadius: 8,
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  cart: { marginLeft: 10 },
  cartText: {
    textAlign: "center",
    color: Colors?.DARK_PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
  },
  cardContainer: {
    backgroundColor: "transparent",
    borderRadius: 10,
    margin: 10,
    marginHorizontal: 4,
    padding: 0,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: "center",
    width: 175,
  },
  image: {
    width: "100%",
    height: 190,
    borderRadius: 10,
    borderWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderColor: "#FFF",
  },
  infoContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
    width: "100%",
  },
  subInfoContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6F61",
    marginTop: 5,
  },
  rating: {
    fontSize: 14,
    marginLeft: 5,
    color: "#555",
  },
  // New style for close button in full-screen modal
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
});