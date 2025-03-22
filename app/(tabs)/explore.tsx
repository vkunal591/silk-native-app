






import { fetchCategory, fetchSubCategory, API_BASE_URL } from '@/services/api';  // Make sure the import path is correct
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
} from 'react-native';

export default function Explore() {
    const [selectedGender, setSelectedGender] = useState('All');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);

    // Function to fetch categories
    const getCategory = async () => {
        try {
            const response = await fetchCategory();
            setCategory(response.category);  // Ensure response structure is correct
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    // Function to fetch subcategories
    const getSubCategory = async () => {
        try {
            const response = await fetchSubCategory();
            setSubCategory(response.subCategories);  // Ensure response structure is correct
        } catch (error) {
            console.error('Error loading subcategories:', error);
        }
    };

    // Use useFocusEffect to fetch data when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            getCategory();
            getSubCategory();
        }, [])
    );

    // Toggle category expansion
    const handleExpand = (categoryId: React.SetStateAction<null>) => {
        setExpandedCategory(categoryId === expandedCategory ? null : categoryId);
    };

    // Render subcategories for each category
    const renderSubcategories = (subcategories: any[]) => (
        <View style={styles.subcategoryContainer}>
            {subcategories?.map((subcategory: any, index: any) => (
                <TouchableOpacity key={index} style={styles.subcategoryButton}>
                    <Text style={styles.subcategoryText}>{subcategory?.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Render category item
    const renderCategory = ({ item }: any) => (
        <View style={styles.categoryContainer}>
            <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => handleExpand(item._id)}  // Make sure '_id' or 'id' is correct in your API
            >
                <View style={styles.categoryHeader}>
                    <Image source={{ uri: `${API_BASE_URL}${item.image.replace(/\\/g, "/")}` }} style={styles.categoryImage} />
                    <Text style={styles.categoryName}>{item.name}</Text>
                </View>
                <Ionicons
                    name={expandedCategory === item._id ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#555"
                />
            </TouchableOpacity>
            {expandedCategory === item._id && item.subcategories?.length > 0 && renderSubcategories(item.subcategories)}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>All Article</Text>
            <View style={styles.genderSelector}>
                {['All'].map((gender) => (  // Expanded gender options
                    <TouchableOpacity
                        key={gender}
                        style={[
                            styles.genderButton,
                            selectedGender === gender && styles.genderButtonSelected,
                        ]}
                        onPress={() => setSelectedGender(gender)}
                    >
                        <Text
                            style={[
                                styles.genderText,
                                selectedGender === gender && styles.genderTextSelected,
                            ]}
                        >
                            {gender}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={category}
                keyExtractor={(item: any) => String(item?._id)}  // Ensure correct key extractor
                renderItem={renderCategory}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        padding: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    genderSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    genderButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#EFEFEF',
        alignItems: 'center',
    },
    genderButtonSelected: {
        backgroundColor: '#F8E4EC',
    },
    genderText: {
        fontSize: 16,
        color: '#333',
    },
    genderTextSelected: {
        color: '#FF4081',
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 16,
    },
    categoryContainer: {
        marginBottom: 12,
    },
    categoryButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#FFF',
        elevation: 1,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryImage: {
        width: 40,
        height: 40,
        marginRight: 12,
        borderRadius: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    subcategoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        backgroundColor: '#FFF',
        padding: 8,
        borderRadius: 8,
        elevation: 1,
    },
    subcategoryButton: {
        flexBasis: '45%',
        margin: 8,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#FDECEF',
    },
    subcategoryText: {
        color: '#FF4081',
        fontWeight: 'bold',
    },
});
