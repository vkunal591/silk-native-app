import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { CartProvider } from "./context/CartContext";

export default function RootLayout() {
  useFonts({
    "ralewayBold": require("../assets/fonts/Raleway-Bold.ttf"),
    "alewaySemiBold": require("../assets/fonts/Raleway-SemiBold.ttf"),
    "ralewayRegular": require("../assets/fonts/Raleway-Regular.ttf")


  })
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </CartProvider>
  );
}
