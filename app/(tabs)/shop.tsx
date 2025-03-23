import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ToastAndroid, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import BannerSlider from '@/components/Banners';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import TopCategories from '@/components/TopCategories';
import { addToCart, fetchBanners, fetchCategory, fetchProducts } from '@/services/api';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [banners, setBanners] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const getProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchProducts();
            setProducts(response.data.result);
        } catch (error) {
            console.error('Error loading products:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getBanners = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchBanners();
            setBanners(response.data.result);
        } catch (error) {
            console.error('Error loading banenrs:', error);
            setError('Failed to load banenrs. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);


    const getCategory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchCategory();
            setCategory(response.data.result);
        } catch (error) {
            console.error('Error loading categories:', error);
            setError('Failed to load categories. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await getProducts();
        await getCategory();
        await getBanners();
        setRefreshing(false);
    };

    useEffect(() => {
        getProducts();
        getCategory();
        getBanners();
    }, [getProducts, getCategory]);

    const handleViewDetails = useCallback((product: any) => {
        router.push({
            pathname: "/product-details/ProductDetailsScreen",
            params: { product: JSON.stringify(product) }
        });
        ToastAndroid.show(`View Product ${product?.name}`, 2000);
    }, [router]);

    const handleAddToCart = useCallback(async (id: string,name:string,price:string) => {
        try {
            await addToCart(id, 1,name,price);
            ToastAndroid.show('Product added to cart', 2000);
            router.push('/(tabs)/cart');
        } catch (error) {
            console.error('Error adding product to cart:', error);
            setError('Could not add product to cart. Please try again.');
        }
    }, [router]);

    // Optimized Render Function
    const renderProductCard = useCallback(({ item }: any) => (
        <ProductCard
            key={item._id}
            product={item}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
        />
    ), [handleViewDetails, handleAddToCart]);

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderProductCard}
                keyExtractor={(item: any) => item._id.toString()}
                numColumns={2}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                windowSize={10}
                initialNumToRender={8}
                maxToRenderPerBatch={10}
                removeClippedSubviews={true}
                getItemLayout={(data, index) => ({
                    length: 150,
                    offset: 150 * index,
                    index
                })}
                ListHeaderComponent={
                    <>
                        <Header
                            Title="shop"
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                            onSearchClick={() => router.push({ pathname: '/Shop/ShopScreen', params: { search: searchInput } })}
                        />
                        <BannerSlider data={banners} />
                        {category.length > 0 && <TopCategories category={category} />}
                        <Text style={styles.sectionTitle}>New Items</Text>
                        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
                        {error && <Text style={styles.errorText}>{error}</Text>}

                        {/* New Items - Horizontal Scroll */}
                        <FlatList
                            data={products}
                            renderItem={renderProductCard}
                            keyExtractor={(item: any) => item._id.toString()}
                            horizontal
                            // showsHorizontalScrollIndicator={true}
                            contentContainerStyle={styles.horizontalList}
                            initialNumToRender={5}
                        />
                    </>
                }
                ListFooterComponent={
                    <ProductGrid
                        title="Just For You"
                        itemData={products}
                        onViewDetails={handleViewDetails}
                        onAddToCart={handleAddToCart}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2', padding: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
    errorText: { color: 'red', textAlign: 'center', marginVertical: 10 },
    horizontalList: { paddingLeft: 0, paddingBottom: 10 },
});

export default Shop;
