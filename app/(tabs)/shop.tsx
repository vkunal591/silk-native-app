// import BannerSlider from '@/components/Banners';
// import Header from '@/components/Header';
// import ProductCard from '@/components/ProductCard';
// import ProductGrid from '@/components/ProductGrid';
// import TopCategories from '@/components/TopCategories';
// import { addToCart, fetchCategory, fetchProducts } from '@/services/api';
// import { router, useFocusEffect, useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import { Text, ScrollView, View, StyleSheet, RefreshControl, ToastAndroid, TouchableOpacity } from 'react-native';


// const Shop = () => {
//     const [products, setProducts] = useState([]);
//     const [category, setCategory] = useState([])
//     const [refreshing, setRefreshing] = useState(false)
//     const [searchInput, setSearchInput] = useState("")
//     const [isLoading, setIsLoading] = useState(false)
//     const router = useRouter();
//     const getProducts = async () => {
//         setIsLoading(true)
//         try {
//             const products = await fetchProducts();

//             setProducts(products.products);
//         } catch (error) {
//             console.error('Error loading orders:', error);
//         } finally {
//             setIsLoading(false)
//         }
//     };


//     const getCategory = async () => {
//         try {
//             setIsLoading(true)
//             const response = await fetchCategory();
//             setCategory(response.category);
//         } catch (error) {
//             console.error('Error loading categories:', error);
//         } finally {
//             setIsLoading(false)
//         }
//     };

//     const handleViewDetails = (product: any) => {
//         router.push({
//             pathname: "/product-details/ProductDetailsScreen",
//             params: { product: JSON.stringify(product) }
//         })
//         ToastAndroid.show(`View Product ${product?.name}`, 2000)
//     }
//     const handleAddToCart = async (id: string) => {
//         try {
//             await addToCart(id, 1).then(() => {
//                 ToastAndroid.show('Product added to cart', 2000);
//                 router.push('/(tabs)/cart');
//             })
//         } catch (error) {
//             console.error('Error adding product to cart:', error);
//             ToastAndroid.show('Could not add product to cart. Login and try again.', 2000);
//         }
//     }

//     const onRefresh = async () => {
//         setRefreshing(true);
//         await fetchProducts
//         await getCategory()
//         setRefreshing(false);
//     };

//     // useEffect(() => {
//     //     getProducts();
//     //     getCategory()
//     // }, []);

//     useFocusEffect(
//         React.useCallback(() => {
//             // console.log('CartScreen is now focused');
//             getProducts();
//             getCategory();
//             // return () => console.log('CartScreen lost focus');
//         }, [])
//     );

//     return (
//         <View style={styles.container}
//         >
//             <ScrollView showsVerticalScrollIndicator={false}
//                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//             >

//                 <Header Title="shop" searchInput={searchInput} setSearchInput={setSearchInput} onSearchClick={() => router.push({ pathname: '/Shop/ShopScreen', params: { search: searchInput } })} />

//                 <BannerSlider /> {/* Animated Fade In */}
//                 {(category.length !== 0) && <TopCategories category={category} />}
//                 <Section title="New Items">
//                     {(products.length !== 0) &&
//                         products?.map((product, index) => {
//                             return (
//                                 <ProductCard
//                                     key={index}
//                                     product={product}
//                                     onViewDetails={handleViewDetails}
//                                     onAddToCart={handleAddToCart}
//                                 />
//                             );
//                         })}
//                 </Section>
//                 <ProductGrid title="Just For You" itemData={products} onViewDetails={handleViewDetails}
//                     onAddToCart={handleAddToCart} />
//             </ScrollView>
//         </View>

//     );
// };

// const Section = ({ title, children }: any) => (
//     <View style={styles.section}>
//         <View style={styles.sectionTitleContainer}>
//             <Text style={styles.sectionTitle}>{title}</Text>
//             <TouchableOpacity onPress={() => router.push({
//                 pathname: "/Shop/ShopScreen",
//             })}>

//                 <Text style={styles.sectionButton} >See All</Text>
//             </TouchableOpacity>
//         </View>
//         <ScrollView horizontal>{children}</ScrollView>
//     </View>
// );

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f2f2f2' },
//     section: { marginTop: 20, marginLeft: 10 },
//     sectionTitleContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//     },
//     sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//     sectionButton: {
//         fontSize: 14,
//         fontWeight: 500,
//         marginRight: 10,
//         marginVertical: 7,
//     },
// });

// export default Shop;



// import BannerSlider from '@/components/Banners';
// import Header from '@/components/Header';
// import ProductCard from '@/components/ProductCard';
// import ProductGrid from '@/components/ProductGrid';
// import TopCategories from '@/components/TopCategories';
// import { Colors } from '@/contants/Colors';
// import { addToCart, fetchCategory, fetchProducts } from '@/services/api';
// import { router, useRouter } from 'expo-router';
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Text, ScrollView, View, StyleSheet, RefreshControl, ToastAndroid, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';

// const Shop = () => {
//     const [products, setProducts] = useState([]);
//     const [category, setCategory] = useState([]);
//     const [refreshing, setRefreshing] = useState(false);
//     const [searchInput, setSearchInput] = useState("");
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<any>(null); // State for error messages
//     const router = useRouter();

//     // Memoizing callbacks to prevent unnecessary re-renders
//     const handleViewDetails = useCallback((product: any) => {
//         router.push({
//             pathname: "/product-details/ProductDetailsScreen",
//             params: { product: JSON.stringify(product) }
//         });
//         ToastAndroid.show(`View Product ${product?.name}`, 2000);
//     }, [router]);

//     const handleAddToCart = useCallback(async (id: string) => {
//         try {
//             await addToCart(id, 1);
//             ToastAndroid.show('Product added to cart', 2000);
//             router.push('/(tabs)/cart');
//         } catch (error) {
//             console.error('Error adding product to cart:', error);
//             setError('Could not add product to cart. Please try again.');
//             ToastAndroid.show('Could not add product to cart. Please try again.', 2000);
//         }
//     }, [router]);

//     const getProducts = useCallback(async () => {
//         setIsLoading(true);
//         setError(null); // Reset error before each request
//         try {
//             const products = await fetchProducts(); // Ensure this points to production API
//             setProducts(products.products);
//         } catch (error) {
//             console.error('Error loading products:', error);
//             setError('Failed to load products. Please try again later.');
//             ToastAndroid.show('Failed to load products. Please try again later.', 2000);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     const getCategory = useCallback(async () => {
//         setIsLoading(true);
//         setError(null); // Reset error before each request
//         try {
//             const response = await fetchCategory(); // Ensure this points to production API
//             setCategory(response.category);
//         } catch (error) {
//             console.error('Error loading categories:', error);
//             setError('Failed to load categories. Please try again later.');
//             ToastAndroid.show('Failed to load categories. Please try again later.', 2000);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     const onRefresh = async () => {
//         setRefreshing(true);
//         setError(null); // Reset error before refreshing
//         try {
//             await getProducts(); // Fetch products
//             await getCategory(); // Fetch categories
//         } catch (error) {
//             console.error('Error refreshing data:', error);
//             setError('Failed to refresh data. Please try again later.');
//             ToastAndroid.show('Failed to refresh data. Please try again later.', 2000);
//         } finally {
//             setRefreshing(false);
//         }
//     };

//     useEffect(() => {
//         getProducts();
//         getCategory();
//     }, [getProducts, getCategory]);

//     const renderProductCard = useCallback(({ item }: any) => (
//         <ProductCard
//             key={item._id}
//             product={item}
//             onViewDetails={handleViewDetails}
//             onAddToCart={handleAddToCart}
//         />
//     ), [handleViewDetails, handleAddToCart]);

//     return (
//         <View style={styles.container}>
//             <ScrollView
//                 showsVerticalScrollIndicator={false}
//                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//             >
//                 <Header
//                     Title="shop"
//                     searchInput={searchInput}
//                     setSearchInput={setSearchInput}
//                     onSearchClick={() => router.push({ pathname: '/Shop/ShopScreen', params: { search: searchInput } })}
//                 />

//                 <BannerSlider /> {/* Banner Slider */}

//                 {category.length !== 0 && <TopCategories category={category} />}

//                 {/* New Items Section */}
//                 <Section title="New Items">
//                     {isLoading ? (
//                         <ActivityIndicator size="large" color={Colors.PRIMARY} />
//                     ) : error ? (
//                         <Text style={styles.errorText}>{error}</Text> // Show error message if any
//                     ) : products.length !== 0 ? (
//                         <FlatList
//                             nestedScrollEnabled={true}
//                             scrollEnabled={false}
//                             data={products}
//                             renderItem={renderProductCard}
//                             keyExtractor={(item: any) => item._id.toString()}
//                             horizontal={true}
//                         />
//                     ) : (
//                         <Text>No products found</Text>
//                     )}
//                 </Section>

//                 <ProductGrid
//                     title="Just For You"
//                     itemData={products}
//                     onViewDetails={handleViewDetails}
//                     onAddToCart={handleAddToCart}
//                 />
//             </ScrollView>
//         </View>
//     );
// };

// const Section = ({ title, children }: any) => (
//     <View style={styles.section}>
//         <View style={styles.sectionTitleContainer}>
//             <Text style={styles.sectionTitle}>{title}</Text>
//             <TouchableOpacity onPress={() => router.push({ pathname: "/Shop/ShopScreen" })}>
//                 <Text style={styles.sectionButton}>See All</Text>
//             </TouchableOpacity>
//         </View>
//         <ScrollView horizontal>{children}</ScrollView>
//     </View>
// );

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f2f2f2' },
//     section: { marginTop: 20, marginLeft: 10 },
//     sectionTitleContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//     },
//     sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//     sectionButton: {
//         fontSize: 14,
//         fontWeight: '500',
//         marginRight: 10,
//         marginVertical: 7,
//     },
//     errorText: {
//         color: 'red',
//         fontSize: 16,
//         textAlign: 'center',
//         marginTop: 20,
//     }
// });

// export default Shop;



















import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ToastAndroid, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import BannerSlider from '@/components/Banners';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import TopCategories from '@/components/TopCategories';
import { addToCart, fetchCategory, fetchProducts } from '@/services/api';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState([]);
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
            setProducts(response.products);
        } catch (error) {
            console.error('Error loading products:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getCategory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchCategory();
            setCategory(response.category);
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
        setRefreshing(false);
    };

    useEffect(() => {
        getProducts();
        getCategory();
    }, [getProducts, getCategory]);

    const handleViewDetails = useCallback((product: any) => {
        router.push({
            pathname: "/product-details/ProductDetailsScreen",
            params: { product: JSON.stringify(product) }
        });
        ToastAndroid.show(`View Product ${product?.name}`, 2000);
    }, [router]);

    const handleAddToCart = useCallback(async (id: string) => {
        try {
            await addToCart(id, 1);
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
                        <BannerSlider />
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
