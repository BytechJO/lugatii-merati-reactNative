import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Label, Loading, Notice } from "./ui";
import { VerticalScrollView } from "./VerticalScrollView";
import { LessonVideo } from "./LessonVideo";
import { useResource } from "../core/useResource";
import { useSession } from "../core/session";
import { errorMessage, saveProgress } from "../core/api";
import { artwork } from "../data/design";
type Video = {
  id: number;
  title?: string;
  video_title?: string;
  description?: string;
  youtube_url: string;
};
export function Videos({ letterId }: { letterId: number }) {
  const resource = useResource<{ data: Video[] }>(
    `/lessons/video-lessons/${letterId}/4`,
  );
  const { width } = useWindowDimensions();
  const [active, setActive] = useState<Video | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const teacher = useSession().session?.user.role === "teacher";
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const complete = async () => {
    if (teacher || saved) return;
    try {
      setError(null);
      await saveProgress("video", letterId);
      setSaved(true);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };
  if (resource.loading) return <Loading />;
  if (resource.error && resource.status !== 404)
    return <Notice error={resource.error} retry={resource.reload} />;
  const columns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;
  const available =
    measuredWidth ?? Math.min(width - (width >= 768 ? 80 : 40), 850);
  return (
    <>
      <Notice error={error} retry={() => void complete()} />
      {saved && <Label>تم حفظ تقدمك ✓</Label>}
      {!resource.data?.data.length && (
        <Label>لا توجد فيديوهات لهذا الحرف حالياً.</Label>
      )}
      <View
        onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}
        style={{
          width: "100%",
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {resource.data?.data.map((video) => (
          <Pressable
            key={video.id}
            accessibilityRole="button"
            accessibilityLabel={`شغّل ${video.video_title || video.title || "الفيديو"}`}
            onPress={() => setActive(video)}
            style={({ pressed }) => ({
              width: (available - 20 * (columns - 1)) / columns,
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: "white",
              opacity: pressed ? 0.8 : 1,
              boxShadow: "0px 8px 24px #652B8214",
            })}
          >
            <View
              style={{
                height: width < 768 ? 180 : 210,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={artwork.videoCorner}
                resizeMode="contain"
                style={{
                  position: "absolute",
                  top: -25,
                  left: 0,
                  width: 300,
                  height: 100,
                }}
              />
              <LinearGradient
                colors={["#FFE68C", "#FFB600"]}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#652B82", fontSize: 34, marginLeft: 5 }}>
                  ▶
                </Text>
              </LinearGradient>
            </View>
            <View
              style={{
                padding: 20,
                gap: 8,
                borderTopWidth: 1,
                borderColor: "#F3F0F5",
              }}
            >
              <Text
                style={{
                  fontFamily: "Tajawal-Bold",
                  color: "#28345F",
                  textAlign: "right",
                  fontSize: 20,
                }}
              >
                {video.video_title || video.title || "شاهد وتعلم"}
              </Text>
              {!!video.description && (
                <Text
                  style={{
                    fontFamily: "Tajawal",
                    color: "#6B7280",
                    textAlign: "right",
                    fontSize: 16,
                    lineHeight: 24,
                  }}
                >
                  {video.description}
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>
      <Modal
        visible={!!active}
        animationType="fade"
        transparent
        onRequestClose={() => setActive(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#24142FEF" }}>
          <VerticalScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 20,
            }}
          >
            {active && (
              <View
                accessibilityViewIsModal
                style={{
                  width: "100%",
                  maxWidth: 760,
                  alignSelf: "center",
                  gap: 16,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق الفيديو"
                  onPress={() => setActive(null)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "white",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "flex-end",
                  }}
                >
                  <Text style={{ fontSize: 30, color: "#652B82" }}>×</Text>
                </Pressable>
                <Text
                  style={{
                    fontFamily: "Tajawal-Bold",
                    fontSize: 22,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {active.video_title || active.title || "شاهد وتعلم"}
                </Text>
                <LessonVideo
                  key={active.id}
                  uri={active.youtube_url}
                  showHint={false}
                  onEnded={() => void complete()}
                />
              </View>
            )}
          </VerticalScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
