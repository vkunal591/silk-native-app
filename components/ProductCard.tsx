
import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../services/api';
import { Colors } from '@/contants/Colors';

const ProductCard = memo(({ product, onViewDetails, onAddToCart }: any) => {
    // Handle image load error
    const handleImageError = () => {
        // Set a placeholder image or handle the error case
        console.error('Image failed to load');
    };

    return (
        <Pressable onPress={() => onViewDetails(product)}>
            <View style={styles.cardContainer}>
                {/* Image with error handling */}
                <Image
                    source={{ uri: `${API_BASE_URL}${product?.images.replace(/\\/g, "/")}` }}
                    style={styles.image}
                    onError={handleImageError} // Handle any image loading errors
                />
                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {product?.name || 'Product name not available'}
                    </Text>
                    <View style={styles.subInfoContainer}>
                        <Text style={styles.price}>₹{product?.price || 'N/A'}</Text>
                        <View style={styles.ratingContainer}>
                            <Pressable 
                                style={styles.rating} 
                                onPress={() => onAddToCart(product?._id)}
                            >
                                <MaterialCommunityIcons 
                                    name="cart-plus" 
                                    size={30} 
                                    color={Colors.PRIMARY} 
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
});

// Styles
const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        margin: 7,
        padding: 0,
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        alignItems: 'center',
        width: 170,

    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        borderWidth: 5,
        borderColor: '#FFF',
    },
    infoContainer: {
        marginTop: 10,
        alignItems: 'flex-start',
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
        padding: 1,
        marginLeft: 5,
        color: '#555',
    },
});

export default memo(ProductCard);
