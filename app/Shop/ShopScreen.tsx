import React, { memo, useState, useCallback } from 'react';
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
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchProducts, fetchCategory, addToCart, API_BASE_URL } from '@/services/api';
import Header from '@/components/Header';
import { Colors } from '@/contants/Colors';

const { width } = Dimensions.get('window');
const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : width >= 400 ? 2 : 2;

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string;
  description?: string;
  stock?: number;
  subCategory?: { name: string; gender: string };
  colors?: string[];
  sizes?: string[];
  createdAt?: string;
}

interface Category {
  _id: string;
  name: string;
}

const SkeletonLoader = memo(() => (
  <View style={styles.skeletonContainer}>
    {[...Array(numColumns * 2)].map((_, index) => (
      <View key={index} style={[styles.skeletonCard, { width: (width - 40) / numColumns - 10 }]}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonPrice} />
      </View>
    ))}
  </View>
));

const ShopScreen = memo(() => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const { search } = useLocalSearchParams();
  const apiBaseUrl = API_BASE_URL; // Replace with your actual API base URL

  const getProducts = useCallback(
    async (pageNum = 1, pageLimit = limit, searchQuery = '') => {
      setLoading(pageNum === 1);
      setError('');
      try {
        let query = `page=${pageNum}&limit=${pageLimit}`;
        if (search) query += `&category=${search}`;
        if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}&searchkey=name`;
        const res = await fetchProducts(query);
        if (!res?.data?.result) throw new Error('Invalid response');

        setHasMore(res.data.result.length === pageLimit);
        const newProducts = res.data.result;
        setProducts((prev) => (pageNum === 1 ? newProducts : [...prev, ...newProducts]));
      } catch (error) {
        setError('Failed to load products. Please try again.');
        console.error('Error loading products:', error);
        ToastAndroid.show('Failed to load products.', ToastAndroid.LONG);
      } finally {
        setLoading(false);
      }
    },
    [search, limit]
  );

  const getCategory = useCallback(async () => {
    try {
      const res = await fetchCategory();
      if (!res?.data?.result) throw new Error('Invalid response');
      setCategory(res.data.result);
    } catch (error) {
      console.error('Error loading categories:', error);
      ToastAndroid.show('Failed to load categories.', ToastAndroid.LONG);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      getProducts(1, limit, searchInput);
      getCategory();
    }, [getProducts, getCategory, searchInput])
  );

  const handleViewDetails = useCallback(
    (product: Product) => {
      router.push({
        pathname: '/product-details/ProductDetailsScreen',
        params: { product: JSON.stringify(product) },
      });
      ToastAndroid.show(`Viewing ${product.name}`, ToastAndroid.SHORT);
    },
    [router]
  );

  const handleAddToCart = useCallback(
    async (id: string, name: string, price: number) => {
      try {
        await addToCart(id, 1, name, price);
        ToastAndroid.show('Product added to cart', ToastAndroid.SHORT);
      } catch (error) {
        console.error('Error adding to cart:', error);
        ToastAndroid.show('Could not add to cart. Please try again.', ToastAndroid.LONG);
      }
    },
    []
  );

  const loadMoreProducts = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => {
        const nextPage = prev + 1;
        getProducts(nextPage, limit, searchInput);
        return nextPage;
      });
    }
  }, [loading, hasMore, getProducts, limit, searchInput]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await getProducts(1, limit, searchInput);
    setRefreshing(false);
  }, [getProducts, limit, searchInput]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <Pressable
        onPress={() => handleViewDetails(item)}
        accessibilityLabel={`View details for ${item.name}`}
      >
        <View style={[styles.cardContainer, { width: (width - 20) / numColumns - 10 }]}>
          <Image
            source={{
              uri: item.images.startsWith('http')
                ? item.images
                : `${apiBaseUrl}${item.images.replace(/\\/g, '/')}`,
            }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={item.name}
            defaultSource={require('../../assets/images/logo.png')}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name || 'Unknown Product'}
            </Text>
            <View style={styles.subInfoContainer}>
              <Text style={styles.price}>₹{item.price || 'N/A'}</Text>
              <Pressable
                onPress={() => handleAddToCart(item._id, item.name, item.price)}
                accessibilityLabel={`Add ${item.name} to cart`}
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
    ),
    [handleViewDetails, handleAddToCart]
  );

  const renderFooter = useCallback(() => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }, [loading, page]);

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <Header
          Title="Shop"
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearchClick={() => getProducts(1, limit, searchInput)}
        />
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <Header
              Title="Shop"
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              onSearchClick={() => getProducts(1, limit, searchInput)}
            />
          }
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          key={`grid-${numColumns}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          initialNumToRender={limit}
          maxToRenderPerBatch={limit}
          windowSize={5}
          removeClippedSubviews
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: width >= 768 ? 18 : 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: width >= 768 ? 18 : 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  listContainer: {
    padding: width >= 768 ? 15 : 10,
    margin:'auto',
  },
  cardContainer: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    margin: width >= 768 ? 8 : 5,
    padding: 0,
    alignItems: 'center',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: width >= 768 ? 200 : 150,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  infoContainer: {
    marginTop: 8,
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: width >= 768 ? 16 : 14,
    fontWeight: '600',
    color: '#333',
  },
  subInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  price: {
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: '700',
    color: '#FF6F61',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: width >= 768 ? 15 : 10,
  },
  skeletonCard: {
    margin: width >= 768 ? 8 : 5,
    borderRadius: 12,
  },
  skeletonImage: {
    width: '100%',
    height: width >= 768 ? 200 : 150,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
  skeletonText: {
    width: '80%',
    height: 20,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
    borderRadius: 4,
  },
  skeletonPrice: {
    width: '40%',
    height: 20,
    backgroundColor: '#e0e0e0',
    marginTop: 5,
    borderRadius: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default ShopScreen;