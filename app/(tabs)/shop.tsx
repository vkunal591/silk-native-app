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
  Dimensions,
  SafeAreaView,
  ScrollView,
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
import { Colors } from "@/contants/Colors";

// Get window dimensions for responsiveness
const { width, height } = Dimensions.get("window");

// Calculate number of columns based on screen width
const getNumColumns = (screenWidth: number) => {
  if (screenWidth >= 1024) return 4; // Large tablets
  if (screenWidth >= 768) return 3; // Small tablets
  if (screenWidth >= 400) return 2; // Standard phones
  return 1; // Small devices or flip phones
};

// Skeleton Loader Component
const SkeletonLoader = ({ numColumns }: { numColumns: number }) => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Skeleton for Banner */}
      <View
        style={[styles.skeletonBanner, { height: width >= 768 ? 300 : 150 }]}
      />

      {/* Skeleton for Categories */}
      <View style={styles.skeletonCategoryContainer}>
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <View key={`category-${index}`} style={styles.skeletonCategory} />
          ))}
      </View>

      {/* Skeleton for Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.skeletonSectionTitle} />
        <View style={styles.skeletonSeeAll} />
      </View>

      {/* Skeleton for Horizontal Product List */}
      <FlatList
        data={Array(5).fill(0)}
        renderItem={() => (
          <View
            style={[
              styles.skeletonProductCard,
              { width: width / numColumns - 20 },
            ]}
          />
        )}
        keyExtractor={(_, index) => `skeleton-horizontal-${index}`}
        horizontal
        contentContainerStyle={styles.horizontalList}
      />

      {/* Skeleton for Product Grid */}
      <View style={styles.skeletonGridContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.skeletonSectionTitle} />
        </View>
        <View style={styles.skeletonGrid}>
          {Array(numColumns * 2)
            .fill(0)
            .map((_, index) => (
              <View
                key={`grid-${index}`}
                style={[
                  styles.skeletonProductCard,
                  { width: width / numColumns - 20 },
                ]}
              />
            ))}
        </View>
      </View>
    </View>
  );
};

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numColumns, setNumColumns] = useState(getNumColumns(width));
  const router = useRouter();

  // Update number of columns on dimension change
  useEffect(() => {
    const updateLayout = () => {
      const newWidth = Dimensions.get("window").width;
      setNumColumns(getNumColumns(newWidth));
    };

    const subscription = Dimensions.addEventListener("change", updateLayout);
    return () => subscription?.remove();
  }, []);

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
        pathname: "/product-details/ProductDetailsScreen",
        params: { product: JSON.stringify(product) },
      });
      ToastAndroid.show(`View Product ${product?.name}`, 2000);
    },
    [router]
  );

  const handleAddToCart = useCallback(
    async (id: string, name: string, price: string) => {
      try {
        await addToCart(id, 1, name, price);
        ToastAndroid.show("Product added to cart", ToastAndroid.SHORT);
      } catch (error) {
        console.error("Error adding product to cart:", error);
        setError("Could not add product to cart. Please try again.");
      }
    },
    []
  );

  const renderProductCard = useCallback(
    ({ item }: any) => (
      <View>
        <ProductCard
          key={item._id}
          product={item}
          onViewDetails={handleViewDetails}
          onAddToCart={handleAddToCart}
        />
      </View>
    ),
    [handleViewDetails, handleAddToCart, numColumns]
  );

  return (
    <ScrollView style={styles.safeContainer}>
      {isLoading ? (
        <SkeletonLoader numColumns={numColumns} />
      ) : (
        <>
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
          {banners.length > 0 && (
            <BannerSlider
              data={banners}
              style={{ height: width >= 768 ? 300 : 150 }}
            />
          )}
          {category.length > 0 && <TopCategories category={category} />}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Items</Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/Shop/ShopScreen" })}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item: any) => `horizontal-${item._id}`}
            horizontal
            contentContainerStyle={styles.horizontalList}
            initialNumToRender={5}
          />
          <ProductGrid
            title="Just For You"
            itemData={products}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
            numColumns={numColumns}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: width >= 768 ? 24 : 18,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: width >= 768 ? 18 : 14,
    color: Colors.PRIMARY,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
    fontSize: width >= 768 ? 18 : 14,
  },
  horizontalList: {
    paddingVertical: 10,
  },
  // Skeleton Styles
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  skeletonBanner: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
  },
  skeletonCategoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  skeletonCategory: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    width: width / 5,
    height: width / 5,
  },
  skeletonSectionTitle: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    width: "40%",
    height: 20,
  },
  skeletonSeeAll: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    width: "20%",
    height: 16,
  },
  skeletonProductCard: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    height: 200,
    margin: 10,
  },
  skeletonGridContainer: {
    marginTop: 20,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default Shop;
