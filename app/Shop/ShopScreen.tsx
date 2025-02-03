import BannerSlider from '@/components/Banners';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import TopCategories from '@/components/TopCategories';
import { fetchProducts } from '@/services/api';
import React, { useState, useEffect } from 'react';
import { Text, ScrollView, View, StyleSheet, Alert } from 'react-native';


const ShopScreen = () => {
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    try {
      const products = await fetchProducts();

      setProducts(products.products);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);
  const item = {
    id: '1',
    title: 'Stylish Jacket',
    price: '59.99',
    rating: 4.5,
    image: 'https://via.placeholder.com/150',
  };

  const itemDatas = [
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '1',
      title: 'Stylish Jacket',
      price: '59.99',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
  ];

  const handleViewDetails = (product: { title: any; }) => {
    Alert.alert('Product Details', `You selected ${product.title}`);
  };

  const handleAddToCart = (product: { title: any; }) => {
    Alert.alert(
      'Added to Cart',
      `${product.title} has been added to your cart!`
    );
  };
  return (
    <View style={styles.container}>
      <Header Title="Shop" /> {/* Animated Slide Down */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <BannerSlider /> {/* Animated Fade In */}
        <TopCategories />
        <Section title="New Items">
          {products &&
            products?.map((product, index) => {
              return (
                <ProductCard
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
        </Section>
        <ProductGrid title="Just For You" itemData={products} />
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
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  section: { marginTop: 20, marginLeft: 10 },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  sectionButton: {
    fontSize: 14,
    fontWeight: 500,
    marginRight: 10,
    marginVertical: 7,
  },
});

export default ShopScreen;
