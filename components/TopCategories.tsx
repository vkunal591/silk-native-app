// import React, { useState, useEffect } from 'react';
// import {
//     View,
//     Text,
//     ScrollView,
//     Image,
//     StyleSheet,
//     TouchableOpacity,
// } from 'react-native';
// import { API_BASE_URL } from '../services/api';
// import { useRouter } from 'expo-router';

// const TopCategories = ({ category }: any) => {
//     const router = useRouter();

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Top Products</Text>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                 {category && category.map((item: { image: any; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
//                     <TouchableOpacity key={index}
//                         onPress={() => router.push('/(tabs)/explore')}
//                     >
//                         <View style={styles.item}>
//                             <Image source={{ uri: `${API_BASE_URL}/${item.image}` }} style={styles.image} />
//                             <Text>{item.name}</Text>
//                         </View>
//                     </TouchableOpacity>
//                 ))}
//                 {/* View All Button */}
//                 <TouchableOpacity
//                     onPress={() => router.push('/(tabs)/explore')}
//                 >
//                     <View style={styles.item}>
//                         <Image source={require('../assets/images/adaptive-icon.png')} style={styles.image} />
//                         <Text>{'View All'}</Text>
//                     </View>
//                 </TouchableOpacity>
//             </ScrollView>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { marginTop: 10, margin: 10 },
//     title: { fontSize: 18, fontWeight: 'bold' },
//     item: { alignItems: 'center', marginRight: 10 },
//     image: {
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         margin: 5,
//         borderWidth: 4,
//         borderColor: '#FFF',
//     },
// });

// export default TopCategories;









import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '../services/api';
import { useRouter } from 'expo-router';

interface CategoryItem {
  image: string;
  name: string;
}

interface TopCategoriesProps {
  category: CategoryItem[];
}

const TopCategories: React.FC<TopCategoriesProps> = ({ category }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Articles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {category &&
          category.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push('/(tabs)/explore')}
              accessibilityLabel={`Go to ${item.name}`}
            >
              <View style={styles.item}>
                <Image
                  source={{ uri: `${API_BASE_URL}/${item.image}` }}
                  style={styles.image}
                  accessible={true}
                  accessibilityLabel={item.name} // Accessibility for images
                />
                <Text>{item.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        {/* View All Button */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
          <View style={styles.item}>
            <Image
              source={require('../assets/images/adaptive-icon.png')}
              style={styles.image}
              accessible={true}
              accessibilityLabel="View all categories"
            />
            <Text>View All</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10, marginHorizontal: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  item: { alignItems: 'center', marginRight: 10 },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 5,
    borderWidth: 4,
    borderColor: '#FFF',
  },
});

export default TopCategories;
