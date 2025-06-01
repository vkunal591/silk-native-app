import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/services/api";

// Get window dimensions for responsiveness
const { width } = Dimensions.get("window");

interface CategoryItem {
  _id?: string; // Optional for flexibility
  image: string | { uri: string };
  name: string;
}

interface TopCategoriesProps {
  category: CategoryItem[];
  apiBaseUrl?: string; // Optional prop for API base URL
}

const TopCategories: React.FC<TopCategoriesProps> = ({
  category,
  apiBaseUrl = API_BASE_URL,
}) => {
  const router = useRouter();

  // Render category item
  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: CategoryItem | { name: string; image: any };
      index: number;
    }) => {
      const isViewAll = item.name === "View All";
      const imageSource = isViewAll
        ? require("../assets/images/adaptive-icon.png")
        : typeof item.image === "string"
        ? {
            uri: item.image.startsWith("http")
              ? item.image
              : `${apiBaseUrl}${item.image.replace(/\\/g, "/")}`,
          }
        : item.image;

      return (
        <TouchableOpacity
          key={isViewAll ? "view-all" : item._id || index}
          onPress={() =>
            isViewAll
              ? router.push("/(tabs)/explore")
              : router.push({
                  pathname: "/Shop/ShopScreen",
                  params: { search: item._id },
                })
          }
          accessibilityLabel={`Go to ${item.name}`}
        >
          <View style={styles.item}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
              accessible={true}
              accessibilityLabel={item.name}
              defaultSource={require("../assets/images/adaptive-icon.png")} // Fallback image
            />
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [router, apiBaseUrl]
  );

  // Combine category data with "View All" item
  const data = [
    ...(category || []),
    { name: "View All", image: require("../assets/images/adaptive-icon.png") },
  ];

  // Handle empty state
  if (!category || category.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Categories Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Articles</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item._id ? item._id : `item-${index}`)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: width >= 768 ? 15 : 10,
    marginHorizontal: width >= 768 ? 15 : 10,
  },
  title: {
    fontSize: width >= 768 ? 24 : 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 5,
  },
  item: {
    alignItems: "center",
    marginRight: width >= 768 ? 15 : 10,
  },
  image: {
    width: width >= 768 ? 80 : 60,
    height: width >= 768 ? 80 : 60,
    borderRadius: width >= 768 ? 40 : 30,
    margin: 5,
    borderWidth: 4,
    borderColor: "#FFF",
  },
  itemText: {
    fontSize: width >= 768 ? 16 : 14,
    textAlign: "center",
  },
  emptyContainer: {
    marginTop: width >= 768 ? 15 : 10,
    marginHorizontal: width >= 768 ? 15 : 10,
    alignItems: "center",
  },
  emptyText: {
    fontSize: width >= 768 ? 18 : 14,
    color: "#666",
  },
});

export default TopCategories;
