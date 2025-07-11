import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';
import { router } from 'expo-router';


const { width, height } = Dimensions.get("screen")

const ProductGrid = memo(({ title, itemData, onAddToCart, onViewDetails }: any) => {
  // Error handling for image load failure
  const handleImageError = () => {
    console.error('Image failed to load');
  };

  const renderItem = ({ item, index }: { index: any, item: { _id: string; images: string; name: string; price: number; rating?: number } }) => (
    <Pressable key={index} onPress={() => onViewDetails(item)}>
      <View style={styles.cardContainer}>
        {/* Product Image with Error Handling */}
        <Image
          source={{ uri: `${API_BASE_URL}${item.images?.replace(/\\/g, "/")}` }}
          style={styles.image}
          onError={handleImageError} // Fallback in case of error
        />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name || 'Product name not available'}
          </Text>

          <View style={styles.subInfoContainer}>
            <Text style={styles.price}>₹{item.price}</Text>

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={styles.rating}
              onPress={() => onAddToCart(item._id, item?.name, item?.price)} // Stable function reference
              accessible
              accessibilityLabel="Add to cart"
            >
              <MaterialCommunityIcons
                name="cart-plus"
                size={30}
                color={Colors.PRIMARY}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Section title={title}>
      <FlatList
        data={itemData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id} // Key based on _id
        numColumns={2}
        contentContainerStyle={styles.container}
      />
    </Section>
  );
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(tabs)/explore/ShopScreen' })}
      >
        <Text style={styles.sectionButton}>See All</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    paddingVertical: 20,
    marginHorizontal: "auto"
  },
  section: { marginTop: 20, marginLeft: 0, marginHorizontal: "auto" },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  sectionButton: {
    fontSize: 14,
    fontWeight: '500',
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
    width: width * 0.46,

  },
  image: {
    width: '100%',
    height: height * 0.3,
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
    width: width * 0.45,
    alignItems: 'flex-start',

  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
    // width: '100%',
  },
  subInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,

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

export default ProductGrid;
