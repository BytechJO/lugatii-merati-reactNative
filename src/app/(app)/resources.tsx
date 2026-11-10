import { useRef, useState } from "react";
import { Redirect, router } from "expo-router";
import { Image, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VerticalScrollView as ScrollView, type VerticalScrollViewRef } from '../../components/VerticalScrollView';
import { HeaderSafeAreaView as SafeAreaView } from "../../components/HeaderSafeAreaView";
import { useSession } from "../../core/session";
import { Notice } from "../../components/ui";
import { TeacherHero } from "../../components/TeacherHero";
import { ResourceCard, type Resource } from "../../components/ResourceCard";
import { artwork } from "../../data/design";
import resources from "../../data/resources.json";
import { errorMessage } from "../../core/api";

// Reference: frontend/src/components/TeacherResources.tsx.
const libraries = [
  {
    id: "rawad",
    title: "مكتبة الرواد",
    headerTitle: "رحلة تعليم اللغة العربية تبدأ هنا",
    description: "مواد تعليمية متنوعة ومميزة",
    image: artwork.resourceRawad,
    bg: "#F8F0FF",
    tab: "#E4CCF8",
  },
  {
    id: "miraty",
    title: "مكتبة مرآتي لغتي",
    headerTitle: "موارد المعلم",
    description: "محتوى خاص بمنهج مرآتي لغتي",
    image: artwork.resourceMirati,
    bg: "#FFF8EE",
    tab: "#F9D46B",
  },
] as const;

export default function ResourcesScreen() {
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const scroll = useRef<VerticalScrollViewRef>(null);
  const [library, setLibrary] = useState<"rawad" | "miraty" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const phone = width < 768;
  const columns = phone ? 1 : width < 1024 ? 2 : 3;
  const contentWidth = Math.min(width, 1024) - 32;
  const resourceWidth = (contentWidth - (columns - 1) * 24) / columns;
  const libraryWidth = phone
    ? contentWidth
    : Math.min(384, (contentWidth - 20) / 2);
  const selected = libraries.find((item) => item.id === library);
  const selectLibrary = (value: typeof library) => {
    setLibrary(value);
    setError(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const back = () => {
    if (library) selectLibrary(null);
    else router.replace("/home");
  };
  const download = (resource: Resource) => {
    setError(null);
    if (resource.url)
      void Linking.openURL(resource.url).catch((cause) =>
        setError(errorMessage(cause)),
      );
    else setError("الملف غير متاح للتنزيل حالياً.");
  };
  if (session?.user.role !== "teacher") return <Redirect href="/home" />;
  return (
    <SafeAreaView style={styles.page} edges={["left", "right", "bottom"]}>
      
        <TeacherHero
          title={selected?.headerTitle ?? "موارد المعلم"}
          subtitle={selected?.title ?? "رحلة تعليم اللغة العربية تبدأ هنا"}
          onBack={back}
        />
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll}>
        <View style={styles.main}>
          <Notice error={error} />
          {!library ? (
            <View
              style={[styles.libraries, phone && { flexDirection: "column" }]}
            >
              {libraries.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  onPress={() => selectLibrary(item.id)}
                  style={({ pressed }) => [
                    styles.library,
                    {
                      width: libraryWidth,
                      backgroundColor: item.bg,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.libraryTab,
                      { backgroundColor: item.tab, fontSize: phone ? 20 : 22 },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Image
                    source={item.image}
                    resizeMode="contain"
                    style={{
                      width: phone ? 170 : 240,
                      height: phone ? 124 : 170,
                      marginTop: phone ? 20 : 70,
                    }}
                  />
                  <Text
                    style={[
                      styles.description,
                      { marginTop: phone ? 24 : 50, fontSize: phone ? 18 : 20 },
                    ]}
                  >
                    {item.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.resources}>
              {resources[library].map((item) => (
                <ResourceCard
                  key={`${library}:${item.id}`}
                  resource={item}
                  width={resourceWidth}
                  phone={phone}
                  onDownload={download}
                />
              ))}
            </View>
          )}
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
    gap: 20,
  },
  libraries: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  library: {
    // backgroundColor: "#F8F0FF",
    borderRadius: 40,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  libraryTab: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: 190,
    maxWidth: "100%",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingVertical: 8,
    fontFamily: "Tajawal-Medium",
    color: "#4E4E4E",
    textAlign: "center",
  },
  description: {
    fontFamily: "Tajawal-Medium",
    color: "#4E4E4E",
    textAlign: "center",
  },
  resources: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 24 },
});
