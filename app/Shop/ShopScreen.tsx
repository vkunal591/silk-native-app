


import React, {
  useState,
  useEffect,
  useCallback,
  memo
} from "react";
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
  Button
} from "react-native";
import {
  AntDesign,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from "expo-router";
import {
  fetchProducts,
  fetchCategory,
  addToCart,
  API_BASE_URL
} from "@/services/api";
import { Colors } from "@/contants/Colors";
import RNPickerSelect from "react-native-picker-select";
import Header from "@/components/Header";

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
  const { search }: any = useLocalSearchParams();

  const getProducts = async () => {
    try {
      const query = `category=${search}`;
      const res = await fetchProducts(search ? query : "");
      if (!res || !res.data || !res.data.result) throw new Error("Invalid response");
      setProducts(res.data.result);
      setFilteredData(res.data.result);
    } catch (error) {
      console.error("Error loading products:", error);
      ToastAndroid.show("Failed to load products. Please try again.", ToastAndroid.LONG);
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
        await getProducts();
        await getCategory();
        isMounted && setLoading(false);
      };
      fetchData();
      return () => {
        isMounted = false;
      };
    }, [])
  );


  const fetchProductList = async () => {
    try {
      const res = await fetchProducts("");
      setProducts(res.data.result);
      setFilteredData(res.data.result);
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
      router.push("/(tabs)/cart");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      ToastAndroid.show("Could not add product to cart. Login and try again.", ToastAndroid.SHORT);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await getProducts();
    filterData();
    setRefreshing(false);
  };



  if (loading && !search) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text>Loading...</Text>
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

      {filteredData?.length !== 0 && (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item: any) => item?._id}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
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
});

export default memo(ShopScreen);
