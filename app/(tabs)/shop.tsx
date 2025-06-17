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

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, bannersData, categoryData] = await Promise.all([
        fetchProducts(),
        fetchBanners(),
        fetchCategory(),
      ]);
      setProducts(productsData.data.result);
      setBanners(bannersData.data.result);
      setCategory(categoryData.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      // ToastAndroid.show(`View Product ${product?.name}`, ToastAndroid.SHORT);
    },
    [router]
  );

  const handleAddToCart = useCallback(
    async (id: string, name: string, price: string) => {
      try {
        await addToCart(id, 1, name, price);
        ToastAndroid.show("Product added to cart", 500);
        // router.push("/(tabs)/cart");
      } catch (error) {
        console.error("Error adding product to cart:", error);
        setError("Could not add product to cart. Please try again.");
      }
    },
    [router]
  );

  const renderProductCard = useCallback(
    ({ item }: any) => (
      <ProductCard
        key={item._id}
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
        keyExtractor={(item: any, index: any) => index}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        windowSize={10}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        getItemLayout={(data, index) => ({
          length: 150,
          offset: 150 * index,
          index,
        })}
        ListHeaderComponent={
          <>
            <Header
              Title="shop"
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              onSearchClick={() =>
                router.push({
                  pathname: "/Shop/ShopScreen",
                  params: { search: searchInput },
                })
              }
            />
            {/* {banners.length > 0 && <BannerSlider data={banners} />} */}
            {category.length > 0 && <TopCategories category={category} />}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 }} >
              <Text style={styles.sectionTitle}>New Items</Text> <TouchableOpacity
                onPress={() => router.push({ pathname: '/Shop/ShopScreen' })}
              ><Text>See All</Text></TouchableOpacity>
            </View>
            {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* New Items - Horizontal Scroll */}
            <FlatList
              data={products}
              renderItem={renderProductCard}
              keyExtractor={(item: any) => item._id.toString()}
              horizontal
              contentContainerStyle={styles.horizontalList}
              initialNumToRender={5}
            />
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
  errorText: { color: "blue", textAlign: "center", marginVertical: 10 },
  horizontalList: { paddingLeft: 0, paddingBottom: 10 },
});

export default Shop;
