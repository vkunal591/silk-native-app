import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ToastAndroid,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import BannerSlider from "@/components/Banners";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import TopCategories from "@/components/TopCategories";
import {
  addToCart,
  fetchBanners,
  fetchCategory,
  fetchProducts,
} from "@/services/api";
import { useCart } from "../context/CartContext";

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { addToCartLocal } = useCart();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, bannersData, categoryData] = await Promise.all([
        fetchProducts(),
        fetchBanners(),
        fetchCategory(),
      ]);
      setProducts(productsData.data.result || []);
      setBanners(bannersData.data.result || []);
      setCategory(categoryData.data.result || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDetails = useCallback(
    (product: any) => {
      router.push({
        pathname: "/(tabs)/explore/ProductDetailsScreen",
        params: { product: JSON.stringify(product) },
      });
    },
    [router]
  );

  const handleAddToCart = useCallback(
    async (id: string, name: string, price: number) => {
      try {
        const cartItem = {
          _id: new Date().getTime().toString(), // temporary unique ID
          user: "guest", // or user ID if logged in
          items: [
            {
              product: { _id: id, name, price },
              quantity: 1,
            },
          ],
        };
        addToCartLocal(cartItem);
        await addToCart(id, 1, name, price);
        // ToastAndroid.show("Product added to cart", ToastAndroid.SHORT);
      } catch (error) {
        console.error("Error adding product to cart:", error);
        setError("Could not add product to cart. Please try again.");
      }
    },
    [addToCartLocal]
  );

  const renderProductCard = useCallback(
    ({ item }: any) => (
      <ProductCard
        product={item}
        onViewDetails={handleViewDetails}
        onAddToCart={handleAddToCart}
      />
    ),
    [handleViewDetails, handleAddToCart]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item: any) => item._id?.toString() || Math.random().toString()}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        windowSize={10}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        ListHeaderComponent={
          <>
            <Header
              Title="shop"
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              onSearchClick={() =>
                router.push({
                  pathname: "/(tabs)/explore/ShopScreen",
                  params: { search: searchInput },
                })
              }
            />
            {banners.length > 0 && <BannerSlider data={banners} />}
            {category.length > 0 && <TopCategories category={category} />}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Items</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: "/(tabs)/explore/ShopScreen" })
                }
              >
                <Text style={styles.linkText}>See All</Text>
              </TouchableOpacity>
            </View>
            {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </>
        }
        ListFooterComponent={
          <ProductGrid
            title="Just For You"
            itemData={products}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2", padding: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  linkText: {
    color: "#007bff",
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default Shop;
