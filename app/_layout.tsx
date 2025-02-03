import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {
  useFonts({
    "ralewayBold": require("../assets/fonts/Raleway-Bold.ttf"),
    "alewaySemiBold": require("../assets/fonts/Raleway-SemiBold.ttf"),
    "ralewayRegular": require("../assets/fonts/Raleway-Regular.ttf")


  })
  return (
    <Stack screenOptions={{ headerShown: false }}></Stack>
  );
}
