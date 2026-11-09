import { Image, Modal, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Notice } from "./ui";
import { VerticalScrollView } from "./VerticalScrollView";
import { artwork } from "../data/design";

export function PositionResult({
  score,
  total,
  saved,
  busy,
  error,
  onRetry,
  onNext,
}: {
  score: number;
  total: number;
  saved: boolean;
  busy: boolean;
  error: string | null;
  onRetry: () => void;
  onNext: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#00000080" }}>
        <VerticalScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            justifyContent: "center",
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              width: "100%",
              maxWidth: 448,
              alignSelf: "center",
              backgroundColor: "white",
              borderRadius: 20,
              padding: 28,
              gap: 16,
              overflow: "hidden",
            }}
          >
            <Image
              source={artwork.finishDecoration}
              resizeMode="contain"
              style={{
                position: "absolute",
                top: -25,
                left: -15,
                width: 300,
                height: 110,
              }}
            />
            <Image
              source={artwork.badge}
              resizeMode="contain"
              style={{ width: 100, height: 100, alignSelf: "center" }}
            />
            <Text
              style={{
                fontFamily: "Tajawal-Medium",
                fontSize: 30,
                color: "#28345F",
                textAlign: "center",
              }}
            >
              ممتاز!
            </Text>
            <Text
              style={{
                fontFamily: "Tajawal-Medium",
                fontSize: 20,
                color: "#28345F",
                textAlign: "center",
              }}
            >
              نقاطك: {score} من {total}
            </Text>
            <Text
              accessibilityLiveRegion="polite"
              style={{
                fontFamily: "Tajawal",
                fontSize: 16,
                color: "#652B82",
                textAlign: "center",
              }}
            >
              {saved
                ? "تم حفظ تقدمك ✓"
                : busy
                  ? "جارٍ حفظ تقدمك…"
                  : "لم يتم حفظ التقدم بعد"}
            </Text>
            <Notice error={error} retry={onRetry} />
            <Button
              label="التالي"
              disabled={busy || !saved || !!error}
              onPress={onNext}
            />
          </View>
        </VerticalScrollView>
      </SafeAreaView>
    </Modal>
  );
}
