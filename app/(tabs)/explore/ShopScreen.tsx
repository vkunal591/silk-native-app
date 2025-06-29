import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ToastAndroid,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { fetchProducts, fetchCategory, addToCart, API_BASE_URL } from "@/services/api";
import { Colors } from "@/contants/Colors";
import Header from "@/components/Header";
import { useCart } from "@/app/context/CartContext";

const { width, height } = Dimensions.get("screen");

const SkeletonLoader = () => (
  <View style={{ flexDirection: "row", gap: 25 }}>
    <View style={styles.skeletonContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonPrice} />
        </View>
      ))}
    </View>
    <View style={styles.skeletonContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonPrice} />
        </View>
      ))}
    </View>
  </View>
);

const ShopScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any>([]);
  const [category, setCategory] = useState<any>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [filteredData, setFilteredData] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const { search }: any = useLocalSearchParams();
  const { addToCartLocal, cartItems } = useCart();

  const getProducts = async (pageNum = 1, pageLimit = limit, searchQuery = "") => {
    try {
      setLoading(true);
      let query = `page=${pageNum}&limit=${pageLimit}`;
      if (search) query += `&category=${search}`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}&searchkey=name`;
      const res = await fetchProducts(query);
      if (!res || !res.data || !res.data.result) throw new Error("Invalid response");

      setHasMore(res.data.result.length === pageLimit);

      if (pageNum === 1) {
        setProducts(res.data.result);
        setFilteredData(res.data.result);
      } else {
        setProducts((prev: any) => [...prev, ...res.data.result]);
        setFilteredData((prev: any) => [...prev, ...res.data.result]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      ToastAndroid.show("Failed to load products. Please try again.", ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const getCategory = async () => {
    try {
      const res = await fetchCategory();
      if (!res || !res.data || !res.data.result) throw new Error("Invalid response");
      setCategory(res.data.result);
    } catch (error) {
      console.error("Error loading categories:", error);
      ToastAndroid.show("Failed to load categories. Please try again.", ToastAndroid.LONG);
    }
  };

  const filterData = () => {
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;

    const filtered = products.filter((item: any) => {
      const price = parseFloat(item.price);
      return price >= minPrice && price <= maxPrice;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData();
  }, [priceRange, products]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchData = async () => {
        setLoading(true);
        await getProducts(1, limit, searchInput);
        await getCategory();
        isMounted && setLoading(false);
      };
      fetchData();
      return () => {
        isMounted = false;
      };
    }, [limit, searchInput])
  );

  const fetchProductList = async () => {
    try {
      const res = await fetchProducts(`page=1&limit=${limit}${searchInput ? `&search=${encodeURIComponent(searchInput)}&searchkey=name` : ""}`);
      setProducts(res.data.result);
      setFilteredData(res.data.result);
      setPage(1);
      setHasMore(res.data.result.length === limit);
    } catch (error) {
      console.error("Error fetching product list:", error);
      ToastAndroid.show("Error fetching products", ToastAndroid.LONG);
    }
  };

  const handleViewDetails = (product: any) => {
    router.push({
      pathname: "/(tabs)/explore/ProductDetailsScreen",
      params: { product: JSON.stringify(product) },
    });
    ToastAndroid.show(`View Product ${product?.name}`, ToastAndroid.SHORT);
  };

  const handleAddToCart = async (id: any, name: string, price: string) => {
    try {
      await addToCartLocal({ _id: id, name, price })
      await addToCart(id, 1, name, price);
      // ToastAndroid.show("Product added to cart", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      ToastAndroid.show("Could not add product to cart. Login and try again.", ToastAndroid.SHORT);
    }
  };

  const loadMoreProducts = () => {
    if (!loading && hasMore) {
      setPage((prev) => {
        const nextPage = prev + 1;
        getProducts(nextPage, limit, searchInput);
        return nextPage;
      });
    }
  };

  const renderItem = ({ item }: any) => (
    <Pressable onPress={() => handleViewDetails(item)}>
      <View style={styles.cardContainer}>
        <Image
          source={{ uri: `${API_BASE_URL}${item?.images.replace(/\\/g, "/")}` }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <View style={styles.subInfoContainer}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Pressable onPress={() => handleAddToCart(item._id, item.name, item.price)}>
              <MaterialCommunityIcons name="cart-plus" size={30} color={Colors?.PRIMARY} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await getProducts(1, limit, searchInput);
    setRefreshing(false);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    getProducts(1, newLimit, searchInput);
  };

  if (loading && page === 1 && !search) {
    return (
      <View style={styles.container}>
        <Header
          Title="shop"
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearchClick={fetchProductList}
        />
        <SkeletonLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        Title="shop"
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearchClick={fetchProductList}
      />
      <View style={styles.priceFilterContainer}>
        <Text style={styles.filterLabel}>Price Range:</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="Min Price"
          keyboardType="numeric"
          value={priceRange.min}
          onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
        />
        <Text style={styles.filterLabel}>to</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="Max Price"
          keyboardType="numeric"
          value={priceRange.max}
          onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
        />
      </View>
      {filteredData?.length !== 0 && (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item: any) => item?._id}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          initialNumToRender={limit}
          maxToRenderPerBatch={limit}
          windowSize={5}
          removeClippedSubviews={true}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    marginHorizontal: "auto",
  },
  cardContainer: {
    backgroundColor: "transparent",
    borderRadius: 10,
    margin: 7,
    padding: 0,
    alignItems: "center",
    width: width * 0.45,
  },
  image: {
    width: "100%",
    height: height * 0.3,
    borderRadius: 10,
    borderWidth: 4,
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
  priceFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  filterLabel: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  priceInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  skeletonContainer: {
    width: "40%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  skeletonCard: {
    width: width * 0.46,
    margin: 10,
    borderRadius: 10,
  },
  skeletonImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  skeletonText: {
    width: "80%",
    height: 20,
    backgroundColor: "#e0e0e0",
    marginTop: 10,
    borderRadius: 4,
  },
  skeletonPrice: {
    width: "40%",
    height: 20,
    backgroundColor: "#e0e0e0",
    marginTop: 5,
    borderRadius: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default memo(ShopScreen);