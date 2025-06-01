import React, { memo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ToastAndroid,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import {
  fetchUserProfile,
  fetchUserLogout,
  fetchOrders,
} from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { Colors } from "@/contants/Colors";

const { width } = Dimensions.get("window");

interface UserProfile {
  name?: string;
  mobile?: string;
}

interface Order {
  id: string;
  // Add other order properties as needed
}

const Account = memo(() => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("To Pay");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const cachedProfile = await AsyncStorage.getItem("userData");
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      } else {
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      }
    } catch (error) {
      setError("Error loading user profile. Please try again later.");
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (status: string) => {
    setIsLoading(true);
    setError("");
    try {
      const ordersData = await fetchOrders(status);
      setOrders(ordersData);
    } catch (error) {
      setError("Error loading orders. Please try again later.");
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetchUserLogout();
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("userProfile");
      router.push("/auth/signin");
      ToastAndroid.show(
        "You have successfully logged out!",
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.error("Error during logout:", error);
      ToastAndroid.show(
        "Error during logout. Please try again.",
        ToastAndroid.LONG
      );
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadOrders(activeTab);
    }, [activeTab, loadUserProfile, loadOrders])
  );

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => (
      <View style={styles.orderItem}>
        <Text style={styles.orderText}>Order ID: {item.id}</Text>
      </View>
    ),
    []
  );

  const tabs = [""]; // Updated tabs

  return (
    <SafeAreaView style={styles.safeContainer}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.profileSection}>
                <Text style={styles.sectionTitle}>Profile</Text>
                <View style={styles.profileInfo}>
                  <EvilIcons
                    name="user"
                    size={width >= 768 ? 80 : 60}
                    style={styles.profileImage}
                  />
                  <View style={styles.profileDetails}>
                    <Text style={styles.profileName}>
                      {userProfile?.name || "No name available"}
                    </Text>
                    <Text style={styles.profileEmail}>
                      {userProfile?.mobile || "No mobile available"}
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleLogout}
                    accessibilityLabel="Log out"
                  >
                    <MaterialIcons
                      name="logout"
                      size={width >= 768 ? 36 : 30}
                      color={Colors.PRIMARY}
                    />
                  </Pressable>
                </View>
              </View>
              {/* <View style={styles.ordersContainer}>
                <Text style={styles.sectionTitle}>My Orders</Text>
                <View style={styles.tabs}>
                  {tabs.map((tab) => (
                    <Pressable
                      key={tab}
                      style={[styles.tab, activeTab === tab && styles.activeTab]}
                      onPress={() => setActiveTab(tab)}
                      accessibilityLabel={`View ${tab} orders`}
                    >
                      <Text style={styles.tabText}>{tab}</Text>
                    </Pressable>
                  ))}
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View> */}
            </>
          }
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}></Text>}
          contentContainerStyle={styles.listContainer}
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
    backgroundColor: "#fff",
  },
  listContainer: {
    paddingBottom: 20,
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
  profileSection: {
    margin: width >= 768 ? 20 : 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    marginRight: width >= 768 ? 20 : 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: width >= 768 ? 20 : 16,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: width >= 768 ? 16 : 14,
    color: "#888",
  },
  ordersContainer: {
    padding: width >= 768 ? 20 : 16,
  },
  sectionTitle: {
    fontSize: width >= 768 ? 22 : 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    padding: width >= 768 ? 12 : 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#f8a5c2",
  },
  tabText: {
    fontSize: width >= 768 ? 16 : 14,
  },
  orderItem: {
    padding: width >= 768 ? 15 : 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderText: {
    fontSize: width >= 768 ? 16 : 14,
    color: "#333",
  },
  emptyText: {
    fontSize: width >= 768 ? 16 : 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  errorText: {
    fontSize: width >= 768 ? 16 : 14,
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default Account;
