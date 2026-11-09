import { useState } from "react";
import { Image, Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { VerticalScrollView as ScrollView } from './VerticalScrollView';
import { router } from "expo-router";
import { artwork } from "../data/design";
import type { Activity } from "../core/types";
const activities: [Activity, string][] = [
  ["learn", "تعلم الحروف"],
  ["write", "اكتب الحروف"],
  ["position", "مكان الحروف"],
  ["tashkeel", "تشكيل الحروف"],
  ["video", "فيديوهات"],
  ["game", "ألعاب"],
];
export function ActivityNavigation({
  letterId,
  symbol,
  current,
}: {
  letterId: number;
  symbol: string;
  current: string;
}) {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const select = (kind: Activity) => {
    setOpen(false);
    router.replace(
      `/activity/${kind}?letterId=${letterId}&symbol=${encodeURIComponent(symbol)}`,
    );
  };
  if (width >= 1200)
    return (
      <View
        style={{
          flexDirection: "row-reverse",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {activities.map(([kind, title]) => (
          <Pressable
            key={kind}
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={() => select(kind)}
          >
            <Image
              source={artwork[`${kind}Nav`]}
              resizeMode="contain"
              style={{ width: 110, height: 110 }}
            />
          </Pressable>
        ))}
      </View>
    );
  return (
    <>
      <View style={{ padding: 12, alignItems: "flex-end" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="فتح قائمة الأنشطة"
          onPress={() => setOpen(true)}
          style={{
            flexDirection: "row-reverse",
            gap: 10,
            backgroundColor: "#652B82",
            borderWidth: 2,
            borderColor: "#FADC64",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 99,
          }}
        >
          <Text style={{ color: "white", fontSize: 20 }}>☰</Text>
          <Text
            style={{ color: "white", fontFamily: "Tajawal-Bold", fontSize: 19 }}
          >
            الأنشطة
          </Text>
        </Pressable>
      </View>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            backgroundColor: "#1C123D80",
          }}
        >
          <Pressable
            accessibilityLabel="إغلاق القائمة"
            style={{ flex: 1 }}
            onPress={() => setOpen(false)}
          />
          <View
            style={{
              width: Math.min(340, width * 0.88),
              backgroundColor: "#FFFAF2",
              padding: 20,
              paddingTop: 48,
              gap: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "#652B82",
                  fontFamily: "Tajawal-Bold",
                  fontSize: 23,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                أنشطة حرف {symbol}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="إغلاق"
              >
                <Text style={{ fontSize: 24, color: "#652B82" }}>×</Text>
              </Pressable>
            </View>
            <ScrollView>
              {activities.map(([kind, title]) => (
                <Pressable
                  key={kind}
                  accessibilityRole="button"
                  accessibilityState={{ selected: current === kind }}
                  onPress={() => select(kind)}
                  style={{
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    gap: 14,
                    backgroundColor: current === kind ? "#FFF1BB" : "white",
                    borderRadius: 20,
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={artwork[`${kind}Nav`]}
                    style={{ width: 64, height: 64 }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: "#652B82",
                      fontFamily: "Tajawal-Bold",
                      fontSize: 19,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
