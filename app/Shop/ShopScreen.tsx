import Header from '@/components/Header';
import { Colors } from '@/contants/Colors';
import { addToCart, API_BASE_URL, fetchCategory, fetchProducts } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Text, ScrollView, View, StyleSheet, Alert, RefreshControl, ToastAndroid, Pressable, TouchableOpacity, FlatList, Image } from 'react-native';



const ShopScreen = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const getProducts = async () => {
    setIsLoading(true)
    try {
      const products = await fetchProducts();

      setProducts(products.products);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false)
    }
  };


  const getCategory = async () => {
    try {
      setIsLoading(true)
      const response = await fetchCategory();
      setCategory(response.category);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false)
    }
  };

  const handleViewDetails = (product: any) => {
    router.push({
      pathname: "/product-details/ProductDetailsScreen",
      params: { product: JSON.stringify(product) }
    })
    ToastAndroid.show(`View Product ${product?.name}`, 2000)
  }
  const handleAddToCart = async (id: string) => {
    try {
      await addToCart(id, 1).then(() => {
        ToastAndroid.show('Product added to cart', 2000);
        router.push('/(tabs)/cart');
      })
    } catch (error) {
      console.error('Error adding product to cart:', error);
      ToastAndroid.show('Could not add product to cart. Login and try again.', 2000);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts
    await getCategory()
    setRefreshing(false);
  };

  useEffect(() => {
    getProducts();
    getCategory()
  }, []);

  const renderItem = ({ item }: { item: { _id: string; images: string[]; name: string; price: number; rating?: number } }) => (
    <Pressable
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.cardContainer}>
        {/* Product Image */}
        <Image source={{ uri: `${API_BASE_URL}/${item.images[0]}` }} style={styles.image} />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.subInfoContainer}>
            <Text style={styles.price}>₹{item.price}</Text>

            {/* Product Rating */}

            <Pressable style={styles.rating} onPress={() => handleAddToCart(item?._id)} >

              <MaterialCommunityIcons name="cart-plus" size={30} color={Colors?.PRIMARY} />

            </Pressable>

          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        <Header Title="Shop" /> {/* Animated Slide Down */}

        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item._id} // Changed from item.id to item._id
          numColumns={2}
          contentContainerStyle={styles.container}
        />

      </ScrollView>
    </View>

  );
};

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionButton}>See All</Text>
    </View>
    <ScrollView horizontal>{children}</ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    paddingVertical: 20,
  },
  section: { marginTop: 20, marginLeft: 10 },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  sectionButton: {
    fontSize: 14,
    fontWeight: '500', // Changed 500 to '500'
    marginRight: 10,
    marginVertical: 7,
  },
  cardContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    margin: 10,
    marginHorizontal: 4,
    padding: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',
    width: 175,
  },
  image: {
    width: '100%',
    height: 190,
    borderRadius: 10,
    borderWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderColor: '#FFF',
  },
  infoContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: 'flex-start', // Changed 'left' to 'flex-start'
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
    width: "100%",
  },
  subInfoContainer: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingHorizontal: 10
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6F61',
    marginTop: 5,
  },
  ratingContainer: {
    marginTop: 5,
  },
  rating: {
    fontSize: 14,
    marginLeft: 5,
    color: '#555',
  },
});

export default ShopScreen;
