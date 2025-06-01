import React, { memo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  ToastAndroid,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Feather, Octicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  API_BASE_URL,
  fetchCart,
  fetchCartItemRemove,
  fetchClearCartItem,
  fetchCurrentUser,
  fetchPlaceOrder,
  fetchUpdateAddress,
} from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/contants/Colors";

const { width } = Dimensions.get("window");
const placeholderImg = require("../../assets/images/logo.png");

interface Address {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface CartItem {
  _id: string;
  items: {
    product: { _id: string; name: string; price: number; images: string };
    quantity: number;
  }[];
}

const Cart = memo(() => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [address, setAddress] = useState<Address>({
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const apiBaseUrl = API_BASE_URL; // Replace with your actual API base URL

  const getUserData = useCallback(async () => {
    try {
      const cachedProfile = await fetchCurrentUser();
      if (cachedProfile?.status) {
        setAddress(cachedProfile?.details?.user?.address || {});
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  const handleAddressChange = useCallback(
    (field: keyof Address, value: string) => {
      setAddress((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmitAddress = useCallback(async () => {
    if (Object.values(address).some((value) => !value.trim())) {
      ToastAndroid.show(
        "Please fill in all address fields.",
        ToastAndroid.LONG
      );
      return;
    }
    try {
      const response = await fetchUpdateAddress(address);
      if (response.success) {
        setIsAddressModalVisible(false);
        ToastAndroid.show("Address updated successfully", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Error updating address:", error);
      ToastAndroid.show(
        "Failed to update address. Please try again.",
        ToastAndroid.LONG
      );
    }
  }, [address]);

  const calculateTotalPrice = useCallback(() => {
    const total = cartItems.reduce((sum, cart) => {
      const item = cart.items[0];
      return sum + (item?.product?.price || 0) * (item?.quantity || 1);
    }, 0);
    setTotalPrice(total);
  }, [cartItems]);

  const fetchCartDetails = useCallback(
    async (pageNum: number, reset = false) => {
      if (isLoadingMore && !reset) return;
      setIsLoadingMore(true);
      setError("");
      try {
        const response = await fetchCart(`?page=${pageNum}&limit=${limit}`);
        const data = response.data.result || [];
        setCartItems((prev) => (reset ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
        if (data.length === 0 && reset) {
          ToastAndroid.show("No items in cart", ToastAndroid.SHORT);
        } else if (data.length !== 0) {
          ToastAndroid.show("Cart items loaded", ToastAndroid.SHORT);
        }
      } catch (error) {
        setError("Failed to load cart items. Please try again.");
        console.error("Error fetching cart details:", error);
      } finally {
        setIsLoadingMore(false);
        setIsLoading(false);
      }
    },
    [limit, isLoadingMore]
  );

  const handleRemoveItem = useCallback(async (id: string) => {
    try {
      const response = await fetchCartItemRemove(id);
      if (response.success) {
        ToastAndroid.show("Item removed successfully", ToastAndroid.SHORT);
        setCartItems((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      ToastAndroid.show("Failed to remove item", ToastAndroid.LONG);
    }
  }, []);

  const handleQuantityChange = useCallback(
    (id: string, type: "increment" | "decrement") => {
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                items: item.items.map((subItem) => ({
                  ...subItem,
                  quantity:
                    type === "increment"
                      ? subItem.quantity + 1
                      : Math.max(subItem.quantity - 1, 1),
                })),
              }
            : item
        )
      );
    },
    []
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchCartDetails(1, true);
    setRefreshing(false);
  }, [fetchCartDetails]);

  const loadMoreItems = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoadingMore]);

  const handlePlaceOrder = useCallback(async () => {
    if (!cartItems.length) {
      ToastAndroid.show("Your cart is empty", ToastAndroid.LONG);
      return;
    }
    if (!Object.values(address).every((value) => value.trim())) {
      ToastAndroid.show(
        "Please add a valid shipping address",
        ToastAndroid.LONG
      );
      return;
    }
    try {
      const items = cartItems.flatMap((cart) => cart.items);
      const response = await fetchPlaceOrder(items, totalPrice);
      if (response.success) {
        await fetchClearCartItem();
        ToastAndroid.show("Order placed successfully!", ToastAndroid.SHORT);
        router.push("/(tabs)/shop");
      } else {
        ToastAndroid.show(
          "Failed to place order. Please try again.",
          ToastAndroid.LONG
        );
      }
    } catch (error) {
      console.error("Error placing order:", error);
      ToastAndroid.show(
        "Failed to place order. Please try again.",
        ToastAndroid.LONG
      );
    }
  }, [cartItems, totalPrice, address, router]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      setPage(1);
      fetchCartDetails(1, true);
      getUserData();
    }, [fetchCartDetails, getUserData])
  );

  useEffect(() => {
    if (page > 1) {
      fetchCartDetails(page);
    }
  }, [page, fetchCartDetails]);

  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems, calculateTotalPrice]);

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.cartItem}>
        <View style={styles.cartDetails}>
          <Image
            source={
              item?.items[0]?.product?.images
                ? {
                    uri: `${apiBaseUrl}${item.items[0].product.images.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }
                : placeholderImg
            }
            style={styles.itemImage}
            resizeMode="contain"
            accessibilityLabel={
              item.items[0]?.product?.name || "Cart item image"
            }
            defaultSource={placeholderImg}
          />
          <View>
            <Text style={styles.itemTitle}>
              {item.items[0]?.product?.name || "Unknown Product"}
            </Text>
            <Text style={styles.itemPrice}>
              ₹{item.items[0]?.product?.price || "N/A"}
            </Text>
          </View>
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => handleQuantityChange(item._id, "decrement")}
            accessibilityLabel="Decrease quantity"
          >
            <Feather name="minus" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>
            {item.items[0]?.quantity || 1}
          </Text>
          <TouchableOpacity
            onPress={() => handleQuantityChange(item._id, "increment")}
            accessibilityLabel="Increase quantity"
          >
            <Feather name="plus" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveItem(item._id)}
          style={styles.deleteButton}
          accessibilityLabel="Remove item from cart"
        >
          <Octicons
            name="trash"
            size={width >= 768 ? 24 : 20}
            color="#FF0000"
          />
        </TouchableOpacity>
      </View>
    ),
    [handleQuantityChange, handleRemoveItem]
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {isLoading && !cartItems.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <FlatList
            ListHeaderComponent={
              <>
                <Text style={styles.header}>
                  Cart{" "}
                  <Text style={styles.cartCount}>({cartItems.length})</Text>
                </Text>
                <View style={styles.shippingContainer}>
                  <View style={styles.shippingSubContainer}>
                    <Text style={styles.shippingTitle}>Shipping Address</Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setIsAddressModalVisible(true)}
                      accessibilityLabel="Edit shipping address"
                    >
                      <Feather
                        name="edit-3"
                        size={width >= 768 ? 24 : 20}
                        color="#800020"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.shippingAddress}>
                    {address?.pincode
                      ? `${address.streetAddress}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`
                      : "No address added. Please add an address."}
                  </Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalPrice}>
                    ₹{totalPrice.toFixed(2)}
                  </Text>
                </View>
              </>
            }
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={loadMoreItems}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="small" color="#800020" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Your cart is empty</Text>
            }
            contentContainerStyle={styles.listContainer}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews
          />
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handlePlaceOrder}
              accessibilityLabel="Place order"
            >
              <Text style={styles.checkoutText}>
                Place Order (₹{totalPrice.toFixed(2)})
              </Text>
            </TouchableOpacity>
          </View>
          <Modal
            visible={isAddressModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsAddressModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Update Address</Text>
                {[
                  { field: "streetAddress", placeholder: "Street Address" },
                  { field: "city", placeholder: "City" },
                  { field: "state", placeholder: "State" },
                  { field: "country", placeholder: "Country" },
                  { field: "pincode", placeholder: "Pincode" },
                ].map(({ field, placeholder }, index) => (
                  <TextInput
                    key={index}
                    placeholder={placeholder}
                    value={address[field as keyof Address]}
                    onChangeText={(value) =>
                      handleAddressChange(field as keyof Address, value)
                    }
                    style={styles.input}
                    accessibilityLabel={`Enter ${placeholder.toLowerCase()}`}
                  />
                ))}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={handleSubmitAddress}
                    style={styles.submitButton}
                  >
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsAddressModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "#333",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "red",
    textAlign: "center",
  },
  emptyText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    fontSize: width >= 768 ? 28 : 24,
    fontWeight: "bold",
    margin: width >= 768 ? 20 : 16,
  },
  cartCount: {
    fontSize: width >= 768 ? 20 : 18,
    color: Colors.PRIMARY,
  },
  shippingContainer: {
    marginHorizontal: width >= 768 ? 20 : 16,
    marginBottom: 16,
  },
  shippingSubContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "95%",
    marginHorizontal: "auto",
  },
  shippingTitle: {
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: "bold",
  },
  shippingAddress: {
    fontSize: width >= 768 ? 16 : 14,
    color: "#555",
    width: "95%",
    marginHorizontal: "auto",
  },
  editButton: {
    padding: width >= 768 ? 10 : 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: width >= 768 ? 20 : 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: width >= 768 ? 20 : 16,
    marginVertical: 8,
    padding: width >= 768 ? 12 : 8,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
  },
  cartDetails: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemImage: {
    width: width >= 768 ? 60 : 50,
    height: width >= 768 ? 60 : 50,
  },
  itemTitle: {
    fontSize: width >= 768 ? 16 : 14,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: width >= 768 ? 14 : 12,
    color: Colors.PRIMARY,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityText: {
    fontSize: width >= 768 ? 16 : 14,
    fontWeight: "bold",
  },
  deleteButton: {
    padding: width >= 768 ? 10 : 8,
  },
  footer: {
    padding: width >= 768 ? 20 : 16,
    // borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  checkoutButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    paddingVertical: width >= 768 ? 12 : 10,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: {
    color: Colors.PRIMARY,
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: width >= 768 ? 30 : 24,
    borderRadius: 8,
    width: width >= 768 ? "60%" : "80%",
  },
  modalHeader: {
    fontSize: width >= 768 ? 20 : 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: width >= 768 ? 14 : 12,
    marginBottom: 8,
    borderRadius: 4,
    fontSize: width >= 768 ? 16 : 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: width >= 768 ? 14 : 12,
    paddingHorizontal: width >= 768 ? 30 : 24,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: "#DfDfDf",
    paddingVertical: width >= 768 ? 14 : 12,
    paddingHorizontal: width >= 768 ? 30 : 24,
    borderRadius: 4,
  },
  buttonText: {
    color: "#FFF",
    fontSize: width >= 768 ? 16 : 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: {
    padding: 16,
    alignItems: "center",
  },
});

export default Cart;
