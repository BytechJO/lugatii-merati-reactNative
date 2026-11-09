import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router, usePathname } from "expo-router";
import { artwork } from "../data/design";
import { useSession } from "../core/session";
import { errorMessage } from "../core/api";
import { LoadingDots } from './AppLoading';
export function BrandHeader({
  title,
  onBack,
  variant = "default",
}: {
  title: string;
  onBack?: () => void;
  variant?: "default" | "teacher" | "transparent";
}) {
  const { session, logout } = useSession();
  const path = usePathname();
  const { width } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const home = session
    ? session.user.role === "teacher"
      ? "/home"
      : "/classroom"
    : "/";
  // Mirror AppHeader/TeacherHeader usage in the original frontend pages.
  const teacherHome = path === "/home";
  const classroom = path === "/classroom";
  const letters = path === "/letters";
  const publicPage = path === "/" || path === "/login";
  const activity = path.startsWith("/activity/") || path.startsWith("/game/");
  const showUserInfo = !!session && !publicPage && !activity;
  const showLogout = showUserInfo;
  const showHome = path === "/login" || letters;
  const showBack = !publicPage && !teacherHome && !classroom && !letters;
  const compact = width < 768;
  const leave = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await logout();
      router.replace("/");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const heading = title ? (
    <View style={[styles.titleGroup, compact && styles.compactTitle]}>
      <View style={[styles.dot, compact && styles.smallDot]} />
      <Text
        accessibilityRole="header"
        style={[
          styles.title,
          {
            fontSize: compact
              ? Math.min(28, width * 0.055)
              : width < 1200
                ? 34
                : 45,
          },
        ]}
      >
        {title}
      </Text>
      <View style={[styles.dot, compact && styles.smallDot]} />
    </View>
  ) : null;
  return (
    <View style={styles.outer}>
      <View style={[styles.bar, compact && styles.compactBar, variant !== "default" && styles.teacherBar]}>
        <View
          style={[styles.side, compact && styles.compactSide, styles.account]}
        >
          {showUserInfo && (
            <>
              <Image
                source={artwork.accountUser}
                resizeMode="contain"
                style={{ width: compact ? 32 : 45, height: compact ? 32 : 45 }}
              />
              <Text
                numberOfLines={2}
                style={[styles.username, { fontSize: compact ? 12 : 20 }]}
              >
                {session.user.username}
              </Text>
              {showLogout && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="تسجيل الخروج"
                  accessibilityState={{ disabled: busy, busy }}
                  disabled={busy}
                  onPress={() => void leave()}
                  style={styles.button}
                >
                  {busy ? (
                    <LoadingDots compact />
                  ) : (
                    <Image
                      source={artwork.logout}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                  )}
                </Pressable>
              )}
            </>
          )}
        </View>
        {!compact && heading}
        <View
          style={[
            styles.side,
            styles.navigation,
            compact && styles.compactSide,
          ]}
        >
          {showBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="رجوع"
              disabled={busy}
              onPress={
                onBack ??
                (() =>
                  router.canGoBack() ? router.back() : router.replace(home))
              }
              style={styles.button}
            >
              <Image
                source={artwork.back}
                style={styles.icon}
                resizeMode="contain"
              />
            </Pressable>
          )}
          {showHome && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الصفحة الرئيسية"
              disabled={busy}
              onPress={() => router.replace(home)}
              style={styles.button}
            >
              <Image
                source={artwork.home}
                style={styles.icon}
                resizeMode="contain"
              />
            </Pressable>
          )}
        </View>
        {compact && heading}
      </View>
      {variant === "default" && <Image
        source={artwork.headerDrops}
        resizeMode="stretch"
        style={styles.wave}
      />}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  outer: { zIndex: 5 },
  teacherBar: { backgroundColor: "transparent" },
  bar: {
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  compactBar: { flexWrap: "wrap", rowGap: 4 },
  side: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  compactSide: { flexBasis: "45%" },
  account: { justifyContent: "flex-start" },
  navigation: { flexDirection: "row", justifyContent: "flex-start" },
  button: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { width: 40, height: 40 },
  username: {
    fontFamily: "Tajawal",
    color: "#652B82",
    textAlign: "right",
    flexShrink: 1,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexShrink: 1,
    maxWidth: "60%",
  },
  compactTitle: { flexBasis: "100%", maxWidth: "100%" },
  title: {
    fontFamily: "Tajawal-Bold",
    color: "#652B82",
    textAlign: "center",
    paddingTop: 5,
    flexShrink: 1,
  },
  dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FDC333" },
  smallDot: { width: 14, height: 14, borderRadius: 7 },
  wave: { width: "100%", height: 48, marginTop: -1 },
  error: {
    backgroundColor: "#FFF0EC",
    color: "#B42318",
    fontFamily: "Tajawal",
    textAlign: "center",
    padding: 10,
  },
});
