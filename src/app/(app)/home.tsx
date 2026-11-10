import { Redirect, router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VerticalScrollView as ScrollView } from '../../components/VerticalScrollView';
import { HeaderSafeAreaView as SafeAreaView } from "../../components/HeaderSafeAreaView";
import { useSession } from "../../core/session";
import { TeacherHero } from "../../components/TeacherHero";
import { artwork } from "../../data/design";

// Reference: frontend/src/components/TeacherHomePage.tsx and responsive.css.
const sections = [
  {
    title: "موارد المعلم",
    description: "نصائح ومصادر تعليمية",
    image: artwork.teacherBooks,
    bg: "#F0F6FD",
    tab: "#C9E3FA",
    route: "/resources",
  },
  {
    title: "الصفوف",
    description: "إدارة الصفوف والطلاب",
    image: artwork.teacherLaptop,
    bg: "#F8F0FF",
    tab: "#E4CCF8",
    route: "/classes",
  },
  {
    title: "الحروف",
    description: "تعليم الحروف العربية",
    image: artwork.teacherAlphabet,
    bg: "#FFF8EE",
    tab: "#F9D46B",
    route: "/letters",
  },
] as const;

export default function HomeScreen() {
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const phone = width < 768;
  const columns = phone ? 1 : width < 1024 ? 2 : 3;
  const contentWidth = Math.max(0, Math.min(width, 1024) - 32);
  const cardWidth = (contentWidth - (columns - 1) * 24) / columns;
  if (session?.user.role !== "teacher") return <Redirect href="/classroom" />;

  return (
    <SafeAreaView style={styles.page} edges={["left", "right", "bottom"]}>
      
        <TeacherHero title="رحلة تعليم اللغة العربية تبدأ هنا" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.main}>
          <View style={styles.grid}>
            {sections.map((item) => (
              <Pressable
                key={item.route}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}، ${item.description}`}
                onPress={() => router.push(item.route)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    width: cardWidth,
                    backgroundColor: item.bg,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Text style={[styles.cardTab, { backgroundColor: item.tab }]}>
                  {item.title}
                </Text>
                <Image
                  source={item.image}
                  resizeMode="contain"
                  style={{
                    width: phone ? 128 : 160,
                    height: phone ? 112 : 144,
                    marginTop: phone ? 16 : 55,
                  }}
                />
                <Text style={[styles.description, phone && { fontSize: 18 }]}>
                  {item.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "white" },
  scroll: { flexGrow: 1 },
  main: {
    width: "100%",
    maxWidth: 1024,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  grid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 24 },
  card: {
    position: "relative",
    borderRadius: 20,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  cardTab: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: 190,
    maxWidth: "100%",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingVertical: 6,
    fontFamily: "Tajawal-Medium",
    fontSize: 18,
    color: "#4E4E4E",
    textAlign: "center",
  },
  description: {
    marginTop: 24,
    fontFamily: "Tajawal-Medium",
    fontSize: 20,
    color: "#4E4E4E",
    textAlign: "center",
  },
});
