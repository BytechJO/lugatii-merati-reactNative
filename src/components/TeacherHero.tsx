import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { teacherHeaderLayout } from "./teacherHeaderLayout";
import { BrandHeader } from "./BrandHeader";
import { artwork } from "../data/design";

// Shared native rendering of TeacherHomePage/TeacherResources' original hero.
export function TeacherHero({
  title,
  subtitle,
  onBack,
  action,
  showTab = true,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  showTab?: boolean;
}) {
  const { width } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const phone = width < 768;
  const height = phone
    ? subtitle
      ? 280
      : 230
    : Math.max(210, (width * 222) / 900);
  return (
    <View style={[styles.hero, { minHeight: height + top, paddingTop: top, flexShrink: 0 }]}>
      <Image
        source={artwork.teacherBackground}
        resizeMode="cover"
        style={teacherHeaderLayout(width, top)}
      />
      <BrandHeader title="" variant="teacher" onBack={onBack} />
      <View
        style={[
          styles.heading,
          { top: top + (phone && subtitle ? 88 : height * 0.44) },
          phone && { left: width * 0.55, right: 12 },
        ]}
      >
        <View style={[styles.titleRow, phone && { gap: 6 }]}>
          <Image
            source={artwork.teacherSparkle}
            resizeMode="contain"
            style={[styles.sparkle, subtitle && { top: -33, left: "18%" }]}
          />
          <View style={styles.dot} />
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                fontSize: phone
                  ? action
                    ? Math.min(24, Math.max(18, width * 0.045))
                    : Math.min(18, Math.max(16, width * 0.045))
                  : action
                    ? Math.min(40, width * 0.031)
                    : Math.min(25, width * 0.022),
              },
              phone && { lineHeight: action ? 28 : 24 },
            ]}
          >
            {title}
          </Text>
          <View style={styles.dot} />
        </View>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { fontSize: phone ? 15 : Math.min(18, width * 0.016) },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {action ? (
        <View style={styles.action}>{action}</View>
      ) : showTab ? (
        <View style={styles.tab}>
          <Text style={styles.tabText}>اختر القسم الذي تريد الانتقال إليه</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", overflow: "hidden", backgroundColor: "#EEE7FF" },
  action: { position: "absolute", right: 16, bottom: 12, maxWidth: "90%" },
  heading: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    gap: 8,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontFamily: "Tajawal-Bold",
    color: "#3B2F4F",
    textAlign: "center",
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: "Tajawal",
    color: "#4E4E4E",
    textAlign: "center",
    lineHeight: 22,
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#FECB27" },
  sparkle: {
    position: "absolute",
    top: -45,
    left: "25%",
    width: 30,
    height: 35,
    pointerEvents: "none",
  },
  tab: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    maxWidth: "90%",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "white",
  },
  tabText: {
    fontFamily: "Tajawal-Medium",
    fontSize: 16,
    color: "#6E5F3B",
    textAlign: "center",
  },
});
