import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "../core/session";
import { colors, Loading } from "../components/ui";
import {
  useFonts,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
} from "@expo-google-fonts/tajawal";
import { Cairo_400Regular, Cairo_700Bold } from "@expo-google-fonts/cairo";
import { AmiriQuran_400Regular } from '@expo-google-fonts/amiri-quran';
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Tajawal: Tajawal_400Regular,
    "Tajawal-Medium": Tajawal_500Medium,
    "Tajawal-Bold": Tajawal_700Bold,
    "Tajawal-ExtraBold": Tajawal_800ExtraBold,
    Cairo: Cairo_400Regular,
    "Cairo-Bold": Cairo_700Bold,
    AmiriQuran: AmiriQuran_400Regular,
  });
  if (!loaded && !error)
    return (
      <Loading fullScreen fontsReady={false} />
    );
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SessionProvider>
  );
}
