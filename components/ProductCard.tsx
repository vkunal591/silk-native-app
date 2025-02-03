import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../services/api';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/contants/Colors';

const ProductCard = ({ product, onViewDetails, onAddToCart }: any) => {

    return (
        <TouchableOpacity onPress={()=>onViewDetails(product)}
        >
            <View style={styles.cardContainer}>
                {/* Product Image */}
                <Image
                    source={{ uri: `${API_BASE_URL}/${product?.images}` }}
                    style={styles.image}
                />

                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {product?.name}
                    </Text>

                    <View style={styles.subInfoContainer}>
                        <Text style={styles.price}>₹{product?.price}</Text>

                        {/* Product Rating */}
                        <View style={styles.ratingContainer}>
                            {/* <Icon name="star" size={16} color="#FFD700" /> */}
                            <TouchableOpacity style={styles.rating}
                                onPress={()=>onAddToCart(product?._id)}
                            >

                                <MaterialCommunityIcons name="cart-plus" size={30} color={Colors.PRIMARY} />

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Styles
const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        margin: 10,
        padding: 10,
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        alignItems: 'center',
        width: 155,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        borderWidth: 5,
        borderColor: '#FFF',
    },
    infoContainer: {
        marginTop: 10,
        alignItems: 'flex-start', // FIXED: 'left' is invalid
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    subInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF6F61',
        marginTop: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    rating: {
        fontSize: 14,
        padding:1,
        marginLeft: 5,
        color: '#555',
    },
});

export default ProductCard;
