import { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import { Animated, ImageBackground, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VerticalScrollView as ScrollView } from '../components/VerticalScrollView';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSession } from "../core/session";
import { Loading } from "../components/ui";
import { artwork } from "../data/design";

// Design reference: frontend/src/components/ChooseAccountType.tsx,
// ChooseAccountType.css and the account rules in styles/responsive.css.
export default function AccountScreen() {
  const { ready, session } = useSession();
  const { width, height } = useWindowDimensions();
  const phone = width < 768;
  const cardWidth = phone
    ? Math.min(width - 64, 210, Math.max(150, (height - 200) / 2.8))
    : Math.min((width - 72) / 2, 436);
  const tigerWidth =
    width < 1200 ? Math.min(180, Math.max(110, width * 0.17)) : 250;
  if (!ready) return <Loading fullScreen />;
  if (session) return <Redirect href="/home" />;
  return (
    <ImageBackground
      source={artwork.accountBackground}
      resizeMode="cover"
      style={styles.page}
    >
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              padding: phone ? 16 : 24,
              paddingTop: phone ? 20 : 24,
              justifyContent: phone ? "flex-start" : "center",
            },
          ]}
        >
          <View style={[styles.heading, phone && styles.phoneHeading]}>
            <View style={styles.brand}>
              <View style={[styles.dot, phone && styles.phoneDot]} />
              <Text
                accessibilityRole="header"
                style={[styles.title, { fontSize: phone ? 30 : 50 }]}
              >
                مرآتي لغتي
              </Text>
              <View style={[styles.dot, phone && styles.phoneDot]} />
            </View>
            <Text style={[styles.subtitle, phone && styles.phoneSubtitle]}>
              رحلة تعلم اللغة العربية تبدأ هنا!
            </Text>
          </View>
          <View
            style={[
              styles.cards,
              {
                flexDirection: phone ? "column" : "row-reverse",
                gap: phone ? 20 : 24,
                maxWidth: phone ? 400 : 896,
              },
            ]}
          >
            <AccountCard role="teacher" width={cardWidth} phone={phone} />
            <AccountCard role="student" width={cardWidth} phone={phone} />
          </View>
        </ScrollView>
        {!phone && (
          <Image
            source={artwork.tiger}
            resizeMode="contain"
            style={[
              styles.tiger,
              {
                width: tigerWidth,
                height: (tigerWidth * 892) / 700,
                left: width < 1200 ? 16 : "0%",
                top: "48%",
              },
            ]}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

function AccountCard({
  role,
  width,
  phone,
}: {
  role: "teacher" | "student";
  width: number;
  phone: boolean;
}) {
  const teacher = role === "teacher";
  const portraitWidth = phone ? Math.min(width * 1.5, 300) : width;
  const [arrow] = useState(() => new Animated.Value(-3));
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrow, {
          toValue: 3,
          duration: 750,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(arrow, {
          toValue: -3,
          duration: 750,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [arrow]);
  const arrowCircle = (
    <View style={[styles.arrowCircle, phone && styles.phoneArrowCircle]}>
      <Animated.Image
        source={teacher ? artwork.accountArrowRight : artwork.accountArrowLeft}
        resizeMode="contain"
        style={{ width: 23, height: 20, transform: [{ translateX: arrow }] }}
      />
    </View>
  );
  const label = (
    <Text style={[styles.joinText, { fontSize: phone ? width < 190 ? 16 : 18 : 24 }]}>
      إنضم إلى الصف
    </Text>
  );
  return (
    <View style={[styles.card, { width }]}>
      <Image
        source={teacher ? artwork.accountTeacher : artwork.accountStudent}
        accessibilityLabel={teacher ? "معلم" : "طالب"}
        resizeMode="contain"
        style={{
          width: portraitWidth,
          height: portraitWidth * (teacher ? 592 / 540 : 591 / 540),
          transform: [{ scale: phone ? 1 : 1.1 }],
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={teacher ? "الدخول كـمعلم" : "الدخول كـطالب"}
        onPress={() => router.push(`/login?role=${role}`)}
        style={({ pressed }) => [
          styles.buttonWrapper,
          {
            // marginTop: phone ? 6 : -90,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <LinearGradient
          colors={["#FFD84F", "#FFC72C"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.joinButton, phone && styles.phoneJoinButton]}
        >
          {teacher ? (
            <>
              {arrowCircle}
              {label}
            </>
          ) : (
            <>
              {label}
              {arrowCircle}
            </>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, alignItems: "center", paddingBottom: 32 },
  heading: { alignItems: "center", gap: 20 },
  phoneHeading: { gap: 8, marginBottom: 12 },
  brand: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "#FDC333",
  },
  title: {
    color: "#4A1B73",
    fontFamily: "Tajawal-Bold",
    textAlign: "center",
    marginBottom: 12,
    paddingTop: 8,
  },
  phoneDot: { width: 18, height: 18, borderRadius: 9 },
  phoneSubtitle: { fontSize: 20, lineHeight: 28 },
  subtitle: {
    color: "#9F72E1",
    fontFamily: "Tajawal-Medium",
    fontSize: 30,
    textAlign: "center",
  },
  cards: { width: "100%", alignItems: "center", justifyContent: "center" },
  card: { alignItems: "center" },
  buttonWrapper: {
    width: "100%",
    // maxWidth: 300,
    alignSelf: "flex-end",
    zIndex: 1,
  },
  joinButton: {
    height: 90,
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    boxShadow: "0px 12px 28px rgba(140, 100, 210, 0.28)",
  },
  joinText: {
    flex: 1,
    color: "#4B1A7A",
    fontFamily: "Tajawal-ExtraBold",
    textAlign: "center",
  },
  phoneJoinButton: { height: "auto", minHeight: 56, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderRadius: 30 },
  phoneArrowCircle: { width: 42, height: 36 },
  arrowCircle: {
    width: 66,
    height: 55,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  tiger: {
    pointerEvents: "none",
    position: "absolute",
    transform: [{ rotate: "5deg" }],
    zIndex: 2,
  },
});
