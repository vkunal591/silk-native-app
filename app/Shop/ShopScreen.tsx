// import Header from '@/components/Header';
// import { Colors } from '@/contants/Colors';
// import { addToCart, API_BASE_URL, fetchCategory, fetchProducts, fetchProductSearch } from '@/services/api';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { LocalRouteParamsContext } from 'expo-router/build/Route';
// import React, { useState, useEffect } from 'react';
// import { Text, ScrollView, View, StyleSheet, Alert, RefreshControl, ToastAndroid, Pressable, TouchableOpacity, FlatList, Image, Button, TextInput } from 'react-native';



// const ShopScreen = () => {
//   const router = useRouter();
//   const { search } = useLocalSearchParams()
//   const [products, setProducts] = useState([]);
//   const [category, setCategory] = useState([])
//   const [refreshing, setRefreshing] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [searchInput, setSearchInput] = useState("")
//   const [filteredData, setFilteredData] = useState(products);
//   const [filters, setFilters] = useState({
//     name: '',
//     description: '',
//     price: '',
//     stock: '',
//     subCategoryName: '',
//     subCategoryGender: '',
//     colors: '',
//     sizes: '',
//     createdAt: ''
//   });

//   const handleFilterChange = (field: any, value: any) => {
//     setFilters({ ...filters, [field]: value });
//   };


//   const filterData = () => {
//     const filtered = products.filter((item:any) => {
//       return (
//         (filters.name ? item.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
//         (filters.description ? item.description.toLowerCase().includes(filters.description.toLowerCase()) : true) &&
//         (filters.price ? item.price <= filters.price : true) &&
//         (filters.stock ? item.stock >= filters.stock : true) &&
//         (filters.subCategoryName ? item.subCategory.name.toLowerCase().includes(filters.subCategoryName.toLowerCase()) : true) &&
//         (filters.subCategoryGender ? item.subCategory.gender.toLowerCase().includes(filters.subCategoryGender.toLowerCase()) : true) &&
//         (filters.colors ? item.colors.some((color:any) => color.toLowerCase().includes(filters.colors.toLowerCase())) : true) &&
//         (filters.sizes ? item.sizes.some((size:any) => size.toLowerCase().includes(filters.sizes.toLowerCase())) : true) &&
//         (filters.createdAt ? item.createdAt.includes(filters.createdAt) : true)
//       );
//     });

//     setFilteredData(filtered);
//   };


//   const getProducts = async () => {
//     setIsLoading(true)
//     try {
//       const products = await fetchProducts();

//       setProducts(products.products);
//     } catch (error) {
//       console.error('Error loading orders:', error);
//     } finally {
//       setIsLoading(false)
//     }
//   };


//   const getCategory = async () => {
//     try {
//       setIsLoading(true)
//       const response = await fetchCategory();
//       setCategory(response.category);
//     } catch (error) {
//       console.error('Error loading categories:', error);
//     } finally {
//       setIsLoading(false)
//     }
//   };

//   const handleViewDetails = (product: any) => {
//     router.push({
//       pathname: "/product-details/ProductDetailsScreen",
//       params: { product: JSON.stringify(product) }
//     })
//     ToastAndroid.show(`View Product ${product?.name}`, 2000)
//   }
//   const handleAddToCart = async (id: string) => {
//     try {
//       await addToCart(id, 1).then(() => {
//         ToastAndroid.show('Product added to cart', 2000);
//         router.push('/(tabs)/cart');
//       })
//     } catch (error) {
//       console.error('Error adding product to cart:', error);
//       ToastAndroid.show('Could not add product to cart. Login and try again.', 2000);
//     }
//   }


//   const fetchProductList = async () => {
//     try {
//       console.log(search)
//       const res = await fetchProductSearch(searchInput || search)
//       console.log(res)
//       setProducts(res?.products || []);



//     } catch (error) {
//       console.error('Error fetching product list:', error);
//     }
//   };
//   useEffect(() => {
//     if (search) {
//       fetchProductList()
//     }
//   }, [refreshing,searchInput, search])

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchProducts
//     await getCategory()
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     getProducts();
//     getCategory()
//   }, []);

//   const renderItem = ({ item }: { item: { _id: string; images: string[]; name: string; price: number; rating?: number } }) => (
//     <Pressable
//       onPress={() => handleViewDetails(item)}
//     >
//       <View style={styles.cardContainer}>
//         {/* Product Image */}
//         <Image source={{ uri: `${API_BASE_URL}/${item.images[0]}` }} style={styles.image} />

//         {/* Product Info */}
//         <View style={styles.infoContainer}>
//           <Text style={styles.title} numberOfLines={1}>
//             {item.name}
//           </Text>

//           <View style={styles.subInfoContainer}>
//             <Text style={styles.price}>₹{item.price}</Text>

//             {/* Product Rating */}

//             <Pressable style={styles.rating} onPress={() => handleAddToCart(item?._id)} >

//               <MaterialCommunityIcons name="cart-plus" size={30} color={Colors?.PRIMARY} />

//             </Pressable>

//           </View>
//         </View>
//       </View>
//     </Pressable>
//   );

//   return (
//     <View style={styles.container}
//     >
//       <ScrollView showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >

//         <Header Title="shop" searchInput={searchInput} setSearchInput={setSearchInput} onSearchClick={fetchProductList} />
//         <TextInput
//         placeholder="Name"
//         value={filters.name}
//         onChangeText={(text) => handleFilterChange('name', text)}
//       />
//       <TextInput
//         placeholder="Description"
//         value={filters.description}
//         onChangeText={(text) => handleFilterChange('description', text)}
//       />
//       <TextInput
//         placeholder="Max Price"
//         value={filters.price}
//         keyboardType="numeric"
//         onChangeText={(text) => handleFilterChange('price', text)}
//       />
//       <TextInput
//         placeholder="Min Stock"
//         value={filters.stock}
//         keyboardType="numeric"
//         onChangeText={(text) => handleFilterChange('stock', text)}
//       />
//       <TextInput
//         placeholder="SubCategory Name"
//         value={filters.subCategoryName}
//         onChangeText={(text) => handleFilterChange('subCategoryName', text)}
//       />
//       <TextInput
//         placeholder="SubCategory Gender"
//         value={filters.subCategoryGender}
//         onChangeText={(text) => handleFilterChange('subCategoryGender', text)}
//       />
//       <TextInput
//         placeholder="Colors"
//         value={filters.colors}
//         onChangeText={(text) => handleFilterChange('colors', text)}
//       />
//       <TextInput
//         placeholder="Sizes"
//         value={filters.sizes}
//         onChangeText={(text) => handleFilterChange('sizes', text)}
//       />
//       <TextInput
//         placeholder="Created At"
//         value={filters.createdAt}
//         onChangeText={(text) => handleFilterChange('createdAt', text)}
//       />

//       <Button title="Apply Filters" onPress={filterData} />

//         <FlatList
//           data={products}
//           renderItem={renderItem} // Changed from item.id to item._id
//           keyExtractor={(item) => item._id}
//           numColumns={2}
//           contentContainerStyle={styles.container}
//         />

//       </ScrollView>
//     </View>

//   );
// };

// const Section = ({ title, children }: any) => (
//   <View style={styles.section}>
//     <View style={styles.sectionTitleContainer}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <Text style={styles.sectionButton}>See All</Text>
//     </View>
//     <ScrollView horizontal>{children}</ScrollView>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 5,
//     paddingVertical: 5,
//   },
//   section: { marginTop: 20, marginLeft: 10 },
//   sectionTitleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   sectionButton: {
//     fontSize: 14,
//     fontWeight: '500', // Changed 500 to '500'
//     marginRight: 10,
//     marginVertical: 7,
//   },
//   cardContainer: {
//     backgroundColor: 'transparent',
//     borderRadius: 10,
//     margin: 12,
//     marginHorizontal: 4,
//     padding: 0,
//     elevation: 0,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     alignItems: 'center',
//     width: 175,
//   },
//   image: {
//     width: '100%',
//     height: 190,
//     borderRadius: 10,
//     borderWidth: 4,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     borderColor: '#FFF',
//   },
//   infoContainer: {
//     marginTop: 10,
//     width: "100%",
//     alignItems: 'flex-start', // Changed 'left' to 'flex-start'
//   },
//   title: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'left',
//     width: "100%",
//   },
//   subInfoContainer: {
//     width: "100%",
//     flexDirection: 'row',
//     justifyContent: "space-between",
//     paddingHorizontal: 10
//   },
//   price: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FF6F61',
//     marginTop: 5,
//   },
//   ratingContainer: {
//     marginTop: 5,
//   },
//   rating: {
//     fontSize: 14,
//     marginLeft: 5,
//     color: '#555',
//   },
// });

// export default ShopScreen;




import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, FlatList, Image, Pressable, TextInput, Button, RefreshControl, ToastAndroid, TouchableOpacity, Animated } from 'react-native';
import { AntDesign, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchProducts, fetchCategory, fetchProductSearch, addToCart, API_BASE_URL } from '@/services/api';
import { Colors } from '@/contants/Colors';
import Slider from '@react-native-community/slider';
import RNPickerSelect from 'react-native-picker-select';
import Header from '@/components/Header';

const ShopScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    subCategoryName: '',
    subCategoryGender: '',
    colors: '',
    sizes: '',
    createdAt: ''
  });
  const [filteredData, setFilteredData] = useState(products);
  const [filterVisible, setFilterVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-450)); // To control sliding animation
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const getProducts = async () => {
    try {
      const res = await fetchProducts();
      setProducts(res.products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const getCategory = async () => {
    try {
      const res = await fetchCategory();
      setCategory(res.category);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterData = () => {
    const filtered = products.filter((item: any) => {
      return (
        (filters.name ? item.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
        (filters.description ? item.description.toLowerCase().includes(filters.description.toLowerCase()) : true) &&
        (filters.price ? item.price <= filters.price : true) &&
        (filters.stock ? item.stock >= filters.stock : true) &&
        (filters.subCategoryName ? item.subCategory.name.toLowerCase().includes(filters.subCategoryName.toLowerCase()) : true) &&
        (filters.subCategoryGender ? item.subCategory.gender.toLowerCase().includes(filters.subCategoryGender.toLowerCase()) : true) &&
        (filters.colors ? item.colors.some((color: string) => color.toLowerCase().includes(filters.colors.toLowerCase())) : true) &&
        (filters.sizes ? item.sizes.some((size: string) => size.toLowerCase().includes(filters.sizes.toLowerCase())) : true) &&
        (filters.createdAt ? item.createdAt.includes(filters.createdAt) : true)
      );
    });
    setFilteredData(filtered);
    setFilterVisible(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      // console.log('CartScreen is now focused');
      getProducts()
      // return () => console.log('CartScreen lost focus');
    }, [])
  );

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters({ ...filters, [field]: value });
  };

  const fetchProductList = async () => {
    try {
      console.log(searchInput)
      const res = await fetchProductSearch(searchInput);
      setProducts(res.products);
    } catch (error) {
      console.error('Error fetching product list:', error);
    }
  };

  const handleViewDetails = (product: { name: any; }) => {
    router.push({ pathname: "/product-details/ProductDetailsScreen", params: { product: JSON.stringify(product) } });
    ToastAndroid.show(`View Product ${product?.name}`, 2000);
  };

  const handleAddToCart = async (id: any) => {
    try {
      await addToCart(id, 1);
      ToastAndroid.show('Product added to cart', 2000);
      router.push('/(tabs)/cart');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      ToastAndroid.show('Could not add product to cart. Login and try again.', 2000);
    }
  };

  const renderItem = ({ item }: any) => (
    <Pressable onPress={() => handleViewDetails(item)}>
      <View style={styles.cardContainer}>
        <Image source={{ uri: `${API_BASE_URL}/${item.images[0]}` }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <View style={styles.subInfoContainer}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Pressable  onPress={() => handleAddToCart(item._id)}>
              <MaterialCommunityIcons name="cart-plus" size={30} color={Colors?.PRIMARY} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getProducts();
    setRefreshing(false);
  };

  // useEffect(() => {
  //   getProducts();
  //   getCategory();
  // }, []);
  useFocusEffect(
    React.useCallback(() => {
      // console.log('CartScreen is now focused');
      getProducts();
      getCategory();
      // return () => console.log('CartScreen lost focus');
    }, [])
  );
  const toggleFilterPanel = () => {
    setFilterVisible(!filterVisible);
    Animated.timing(slideAnim, {
      toValue: filterVisible ? -550 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
         <Header Title="shop" searchInput={searchInput} setSearchInput={setSearchInput} onSearchClick={fetchProductList} />

        <MaterialCommunityIcons style={{ marginLeft: 330 }} size={28} color={Colors.PRIMARY} name='filter-variant-plus' onPress={toggleFilterPanel} />

        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item: any) => item._id}
          numColumns={2}
        />
      </ScrollView>

      {/* Filter Panel */}
      <Animated.View style={[styles.filterPanel, { transform: [{ translateX: slideAnim }] }]}>

        <View style={styles.filterClose}>
          <Text style={styles.filterTitle}>Filters</Text>
          <Text>
            <AntDesign name='close' size={25} color={Colors.PRIMARY} onPress={toggleFilterPanel} />
          </Text>
        </View>

        <TextInput placeholder="Name" value={filters.name} onChangeText={text => handleFilterChange('name', text)} />
        <TextInput placeholder="Description" value={filters.description} onChangeText={text => handleFilterChange('description', text)} />
        <Slider
          minimumValue={0}
          maximumValue={10000}
          value={filters.price}
          onValueChange={value => handleFilterChange('price', value)}
        />
        <Text>Price: ₹{filters.price}</Text>
        <Slider
          minimumValue={0}
          maximumValue={100}
          value={filters.stock}
          onValueChange={value => handleFilterChange('stock', value)}
        />
        <Text>Stock: {filters.stock}</Text>
        <RNPickerSelect
          onValueChange={value => handleFilterChange('subCategoryName', value)}
          items={category.map((c: any) => ({ label: c.name, value: c.name }))}
        />
        <Button title="Apply Filters" onPress={filterData} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  cardContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    margin: 12,
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
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  filterPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    width: "80%",
    zIndex: 100,
  },
  filterClose: { flexDirection: "row", justifyContent: "space-evenly", paddingRight: 30 },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    width: "100%",
  },
});

export default ShopScreen;
