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
  Animated,
  ActivityIndicator,
  Button,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { fetchProducts, fetchCategory, addToCart, API_BASE_URL } from "@/services/api";
import { Colors } from "@/contants/Colors";
import RNPickerSelect from "react-native-picker-select";
import Header from "@/components/Header";

const SkeletonLoader = () => (
  <View style={{ flexDirection: "row", gap: 25 }}><View style={styles.skeletonContainer}>
    {[...Array(6)].map((_, index) => (
      <View key={index} style={styles.skeletonCard}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonPrice} />
      </View>
    ))}
  </View><View style={styles.skeletonContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonPrice} />
        </View>
      ))}
    </View></View>
);

const ShopScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    subCategoryName: "",
    subCategoryGender: "",
    colors: "",
    sizes: "",
    createdAt: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-450));
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const { search }: any = useLocalSearchParams();

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
        setProducts((prev) => [...prev, ...res.data.result]);
        setFilteredData((prev) => [...prev, ...res.data.result]);
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
    const filtered = products.filter((item: any) =>
      (filters.name ? item.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
      (filters.description ? item.description.toLowerCase().includes(filters.description.toLowerCase()) : true) &&
      (filters.price ? item.price <= filters.price : true) &&
      (filters.stock ? item.stock >= filters.stock : true) &&
      (filters.subCategoryName ? item.subCategory.name.toLowerCase().includes(filters.subCategoryName.toLowerCase()) : true) &&
      (filters.subCategoryGender ? item.subCategory.gender.toLowerCase().includes(filters.subCategoryGender.toLowerCase()) : true) &&
      (filters.colors ? item.colors?.some((color: string) => color.toLowerCase().includes(filters.colors.toLowerCase())) : true) &&
      (filters.sizes ? item.sizes?.some((size: string) => size.toLowerCase().includes(filters.sizes.toLowerCase())) : true) &&
      (filters.createdAt ? item.createdAt.includes(filters.createdAt) : true)
    );
    setFilteredData(filtered);
    setFilterVisible(false);
  };

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
      pathname: "/product-details/ProductDetailsScreen",
      params: { product: JSON.stringify(product) },
    });
    ToastAndroid.show(`View Product ${product?.name}`, ToastAndroid.SHORT);
  };

  const handleAddToCart = async (id: any, name: string, price: string) => {
    try {
      await addToCart(id, 1, name, price);
      ToastAndroid.show("Product added to cart", ToastAndroid.SHORT);
      // router.push("/(tabs)/cart");
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
    filterData();
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
      {/* <View style={styles.paginationControls}>
        <Text>Items per page: </Text>
        <RNPickerSelect
          onValueChange={(value) => handleLimitChange(value)}
          items={[
            { label: "10", value: 10 },
            { label: "20", value: 20 },
            { label: "50", value: 50 },
          ]}
          style={pickerSelectStyles}
          value={limit}
        />
      </View> */}
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
  },
  cardContainer: {
    backgroundColor: "transparent",
    borderRadius: 10,
    margin: 10,
    padding: 0,
    alignItems: "center",
    width: 175,
  },
  image: {
    width: "100%",
    height: 190,
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
  filterPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    width: "80%",
    zIndex: 100,
  },
  filterClose: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingRight: 30,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    // flex: 1,
    width: '40%',
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  skeletonCard: {
    width: 175,
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
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
  },
});

export default memo(ShopScreen);