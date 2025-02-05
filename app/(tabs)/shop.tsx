import BannerSlider from '@/components/Banners';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import TopCategories from '@/components/TopCategories';
import { addToCart, fetchCategory, fetchProducts } from '@/services/api';
import { router, useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, ScrollView, View, StyleSheet, RefreshControl, ToastAndroid, TouchableOpacity } from 'react-native';


const Shop = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const [searchInput, setSearchInput] = useState("")
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

    // useEffect(() => {
    //     getProducts();
    //     getCategory()
    // }, []);

    useFocusEffect(
        React.useCallback(() => {
            // console.log('CartScreen is now focused');
            getProducts();
            getCategory();
            // return () => console.log('CartScreen lost focus');
        }, [])
    );

    return (
        <View style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                <Header Title="shop" searchInput={searchInput} setSearchInput={setSearchInput} onSearchClick={() => router.push({ pathname: '/Shop/ShopScreen', params: { search: searchInput } })} />

                <BannerSlider /> {/* Animated Fade In */}
                {(category.length !== 0) && <TopCategories category={category} />}
                <Section title="New Items">
                    {(products.length !== 0) &&
                        products?.map((product, index) => {
                            return (
                                <ProductCard
                                    key={index}
                                    product={product}
                                    onViewDetails={handleViewDetails}
                                    onAddToCart={handleAddToCart}
                                />
                            );
                        })}
                </Section>
                <ProductGrid title="Just For You" itemData={products} onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCart} />
            </ScrollView>
        </View>

    );
};

const Section = ({ title, children }: any) => (
    <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <TouchableOpacity onPress={() => router.push({
                pathname: "/Shop/ShopScreen",
            })}>

                <Text style={styles.sectionButton} >See All</Text>
            </TouchableOpacity>
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

export default Shop;
