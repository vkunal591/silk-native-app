import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { API_BASE_URL } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';
import { router } from 'expo-router';



const ProductGrid = ({
  title,
  itemData,
  onAddToCart,
  onViewDetails
}: {
  title: string;
  itemData: { _id: string; images: string[]; name: string; price: number; rating?: number }[];
  onAddToCart: (id: string) => void;
  onViewDetails: (data: any) => void;
}) => {

  const renderItem = ({ item }: { item: { _id: string; images: string[]; name: string; price: number; rating?: number } }) => (
    <Pressable
      onPress={() => onViewDetails(item)}
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

            <TouchableOpacity style={styles.rating} onPress={() => onAddToCart(item?._id)} >

              <MaterialCommunityIcons name="cart-plus" size={30} color={Colors.PRIMARY} />

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
        keyExtractor={(item) => item._id} // Changed from item.id to item._id
        numColumns={2}
        contentContainerStyle={styles.container}
      />
    </Section>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={() => router.push({
        pathname: "/Shop/ShopScreen",
      })}>

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

export default ProductGrid;
