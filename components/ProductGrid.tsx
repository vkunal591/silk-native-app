import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { API_BASE_URL } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';
import { router } from 'expo-router';

const ProductGrid = memo(({ title, itemData, onAddToCart, onViewDetails }: any) => {
  const handleImageError = () => {
    console.error('Image failed to load');
  };

  return (
    <Section title={title}>
      <View style={styles.gridContainer}>
        {itemData.map((item: any) => (
          <Pressable key={item._id} onPress={() => onViewDetails(item)} style={styles.cardWrapper}>
            <View style={styles.cardContainer}>
              <Image
                source={{ uri: `${API_BASE_URL}${item.images?.replace(/\\/g, '/')}` }}
                style={styles.image}
                onError={handleImageError}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.name || 'Product name not available'}
                </Text>
                <View style={styles.subInfoContainer}>
                  <Text style={styles.price}>₹{item.price}</Text>
                  <TouchableOpacity
                    style={styles.rating}
                    onPress={() => onAddToCart(item._id, item?.name, item?.price)}
                    accessible
                    accessibilityLabel="Add to cart"
                  >
                    <MaterialCommunityIcons name="cart-plus" size={30} color={Colors.PRIMARY} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Section>
  );
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={() => router.push({ pathname: '/Shop/ShopScreen' })}>
        <Text style={styles.sectionButton}>See All</Text>
      </TouchableOpacity>
    </View>
    <ScrollView>{children}</ScrollView>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginLeft: 0,
    paddingHorizontal: 10,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionButton: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
    marginVertical: 7,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 190,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  infoContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
    width: '100%',
  },
  subInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6F61',
  },
  rating: {
    fontSize: 14,
    marginLeft: 5,
    color: '#555',
  },
});

export default ProductGrid;
