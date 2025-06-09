import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Pressable,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fetchProducts, API_BASE_URL, addToCart } from "@/services/api";
import Header from "@/components/Header";
import { Colors } from "@/contants/Colors";

const { width } = Dimensions.get("window");
const numColumns = 2;

const ShopScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 99999 });

  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = `limit=100`; // Fetch enough to filter on client
      const res = await fetchProducts(query);
      const all = res?.data?.result || [];
      const filtered = all.filter(
        (p) => p.price >= priceFilter.min && p.price <= priceFilter.max
      );
      setProducts(filtered);
    } catch (err) {
      console.error("Failed to load products:", err);
      ToastAndroid.show("Failed to load products", ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  }, [priceFilter]);

  const handleAddToCart = async (id, name, price) => {
    try {
      await addToCart(id, 1, name, price);
      ToastAndroid.show("Added to cart", ToastAndroid.SHORT);
    } catch (err) {
      console.error(err);
      ToastAndroid.show("Error adding to cart", ToastAndroid.LONG);
    }
  };

  const handleViewDetails = (product) => {
    router.push({
      pathname: "/product-details/ProductDetailsScreen",
      params: { product: JSON.stringify(product) },
    });
  };

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    getProducts().then(() => setRefreshing(false));
  };

  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < products.length; i += numColumns) {
      const rowItems = products.slice(i, i + numColumns);
      rows.push(
        <View key={i} style={styles.row}>
          {rowItems.map((item) => (
            <Pressable
              key={item._id}
              onPress={() => handleViewDetails(item)}
              style={[styles.card, { width: (width - 40) / numColumns }]}
            >
              <Image
                source={{
                  uri: item.images.startsWith("http")
                    ? item.images
                    : `${API_BASE_URL}${item.images.replace(/\\/g, "/")}`,
                }}
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.title} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{item.price}</Text>
                <Pressable
                  onPress={() =>
                    handleAddToCart(item._id, item.name, item.price)
                  }
                >
                  <MaterialCommunityIcons
                    name="cart-plus"
                    size={24}
                    color={Colors.PRIMARY}
                  />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Header Title="Shop" />
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Price Range:</Text>
        <View style={styles.rangeRow}>
          <Text>Min ₹</Text>
          <Text>{priceFilter.min}</Text>
          <Text> | Max ₹</Text>
          <Text>{priceFilter.max}</Text>
        </View>
        {/* You could add slider or picker here */}
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size="large"
          color={Colors.PRIMARY}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderGrid()}
          {products.length === 0 && (
            <Text style={styles.emptyText}>
              No products found in this price range.
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    width: "100%",
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
    width:"100%"
  },
  image: {
    width: "100%",
    height: width >= 768 ? 160 : 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6F61",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f2f2f2",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
});

export default ShopScreen;
