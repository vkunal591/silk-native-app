import React, { memo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { API_BASE_URL, fetchCategory, fetchSubCategory } from "@/services/api";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Category {
  _id: string;
  name: string;
  image: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  _id: string;
  name: string;
}

const Explore = memo(() => {
  const [selectedGender, setSelectedGender] = useState("All");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [category, setCategory] = useState<Category[]>([]);
  const [subCategory, setSubCategory] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const getCategory = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetchCategory();
      setCategory(response.data.result || []);
    } catch (error) {
      setError("Error loading categories. Please try again.");
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  //   const getSubCategory = useCallback(async () => {
  //     setIsLoading(true);
  //     setError('');
  //     try {
  //       const response = await fetchSubCategory();
  //       setSubCategory(response.subCategories || []);
  //     } catch (error) {
  //       setError('Error loading subcategories. Please try again.');
  //       console.error('Error loading subcategories:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, []);

  useFocusEffect(
    useCallback(() => {
      getCategory();
      //   getSubCategory();
    }, [getCategory])
  );

  const handleExpand = useCallback(
    (categoryId: string) => {
      setExpandedCategory(categoryId === expandedCategory ? null : categoryId);
    },
    [expandedCategory]
  );

  const handleSearchByCategory = useCallback(
    (categoryId: string) => {
      router.push({
        pathname: "/Shop/ShopScreen",
        params: { search: categoryId },
      });
    },
    [router]
  );

  const renderSubcategories = useCallback(
    (subcategories: SubCategory[]) => (
      <View style={styles.subcategoryContainer}>
        {subcategories?.map((subcategory, index) => (
          <TouchableOpacity
            key={subcategory._id || index}
            style={styles.subcategoryButton}
            onPress={() => handleSearchByCategory(subcategory._id)}
            accessibilityLabel={`View ${subcategory.name} subcategory`}
          >
            <Text style={styles.subcategoryText}>{subcategory.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
    [handleSearchByCategory]
  );

  const renderCategory = useCallback(
    ({ item }: { item: Category }) => (
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => {
            handleSearchByCategory(item._id);
            handleExpand(item._id);
          }}
          accessibilityLabel={`View ${item.name} category`}
        >
          <View style={styles.categoryHeader}>
            <Image
              source={{
                uri: item.image.startsWith("http")
                  ? item.image
                  : `${API_BASE_URL}${item.image.replace(/\\/g, "/")}`,
              }}
              style={styles.categoryImage}
              resizeMode="cover"
              defaultSource={require("../../assets/images/logo.png")}
              accessibilityLabel={item.name}
            />
            <Text style={styles.categoryName}>{item.name}</Text>
          </View>
        </TouchableOpacity>
        {/* {expandedCategory === item._id &&
          item?.subcategories?.length > 0 &&
          renderSubcategories(item?.subcategories)} */}
      </View>
    ),
    [expandedCategory, handleSearchByCategory, renderSubcategories]
  );

  const genderOptions = ["All"];

  return (
    <SafeAreaView style={styles.safeContainer}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              <Text style={styles.headerText}>All Articles</Text>
              <View style={styles.genderSelector}>
                {genderOptions.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      selectedGender === gender && styles.genderButtonSelected,
                    ]}
                    onPress={() => setSelectedGender(gender)}
                    accessibilityLabel={`Select ${gender} category`}
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
            </>
          }
          data={category}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No categories available</Text>
          }
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "#333",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "red",
    textAlign: "center",
  },
  emptyText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  container: {
    flex: 1,
    padding: width >= 768 ? 20 : 16,
  },
  headerText: {
    fontSize: width >= 768 ? 16 : 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  genderSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    marginHorizontal: width >= 768 ? 6 : 4,
    paddingVertical: width >= 768 ? 12 : 10,
    borderRadius: 8,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
  },
  genderButtonSelected: {
    backgroundColor: "#F8E4EC",
  },
  genderText: {
    fontSize: width >= 768 ? 18 : 16,
    color: "#333",
  },
  genderTextSelected: {
    color: "#FF4081",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 16,
  },
  categoryContainer: {
    marginBottom: width >= 768 ? 16 : 12,
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: width >= 768 ? 16 : 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryImage: {
    width: width >= 768 ? 48 : 40,
    height: width >= 768 ? 48 : 40,
    marginRight: width >= 768 ? 16 : 12,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: "bold",
    color: "#333",
  },
  subcategoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 8,
    elevation: 1,
  },
  subcategoryButton: {
    flexBasis: width >= 768 ? "30%" : "45%",
    margin: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#FDECEF",
  },
  subcategoryText: {
    fontSize: width >= 768 ? 16 : 14,
    color: "#FF4081",
    fontWeight: "bold",
  },
});

export default Explore;
