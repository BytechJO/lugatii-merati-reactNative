import { useCallback, useState } from "react";
import { Image, Modal, Text, View, useWindowDimensions } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Loading, Notice, Page } from "../../components/ui";
import { LetterTile } from "../../components/LetterTile";
import { LetterDecorations } from "../../components/LetterDecorations";
import { useResource } from "../../core/useResource";
import { useSession } from "../../core/session";
import type { Letter } from "../../core/types";
import { artwork } from "../../data/design";
export default function LettersScreen() {
  const letters = useResource<{ data: Letter[] }>("/letters/getAllLetter");
  const teacher = useSession().session?.user.role === "teacher";
  return (
    <Page title="الحروف العربية">
      <LettersGrid letters={letters} teacher={teacher} />
    </Page>
  );
}
function LettersGrid({
  letters,
  teacher,
}: {
  letters: ReturnType<typeof useResource<{ data: Letter[] }>>;
  teacher: boolean;
}) {
  // A separate student-only component avoids requesting student progress for teachers.
  return teacher ? (
    <Grid letters={letters} statuses={[]} />
  ) : (
    <StudentGrid letters={letters} />
  );
}
function StudentGrid({
  letters,
}: {
  letters: ReturnType<typeof useResource<{ data: Letter[] }>>;
}) {
  const status = useResource<{ letters: { id: number; status: string }[] }>(
    "/progress/user-status",
  );
  const { reload } = status;
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  if (status.loading) return <Loading />;
  if (status.error) return <Notice error={status.error} retry={reload} />;
  return <Grid letters={letters} statuses={status.data?.letters ?? []} />;
}
function Grid({
  letters,
  statuses,
}: {
  letters: ReturnType<typeof useResource<{ data: Letter[] }>>;
  statuses: { id: number; status: string }[];
}) {
  const { width } = useWindowDimensions();
  const [lockedOpen, setLockedOpen] = useState(false);
  const columns = width < 480 ? 3 : width < 768 ? 4 : width < 1024 ? 6 : 7;
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const gridWidth =
    measuredWidth ?? Math.min(width - (width >= 768 ? 80 : 40), 715);
  // Leave subpixel rounding room so Android keeps all columns on the same row.
  const cellWidth = Math.floor((gridWidth - (columns - 1) * 10) / columns);
  if (letters.loading) return <Loading />;
  if (letters.error)
    return <Notice error={letters.error} retry={letters.reload} />;
  return (
    <>
      <View
        style={{
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Image
          source={artwork.lettersSparkleRight}
          resizeMode="contain"
          style={{ width: 25, height: 30 }}
        />
        <Text
          style={{
            flexShrink: 1,
            fontFamily: "Tajawal-Bold",
            color: "#B47DDB",
            fontSize: width < 768 ? 19 : 25,
            textAlign: "center",
          }}
        >
          اختر حرفاً لتبدأ رحلة التعلم الممتعة
        </Text>
        <Image
          source={artwork.lettersSparkleLeft}
          resizeMode="contain"
          style={{ width: 25, height: 30 }}
        />
      </View>
      <View
        onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}
        style={{
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          maxWidth: 715,
          alignSelf: "center",
        }}
      >
        {(letters.data?.data ?? []).map((letter) => {
          const status = statuses.find((item) => item.id === letter.id)?.status;
          const locked = status === "locked";
          return (
            <LetterTile
              key={letter.id}
              letter={letter}
              status={status}
              size={cellWidth}
              compact={width < 768}
              onPress={() =>
                locked
                  ? setLockedOpen(true)
                  : router.push(`/letter/${letter.id}`)
              }
            />
          );
        })}
      </View>
      <LetterDecorations dashboard />
      <Modal
        visible={lockedOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLockedOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#00000070",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              width: "100%",
              maxWidth: 420,
              alignSelf: "center",
              padding: 24,
              borderRadius: 24,
              backgroundColor: "white",
              gap: 16,
              overflow: "hidden",
            }}
          >
            <Image
              source={artwork.finishDecoration}
              resizeMode="contain"
              style={{
                position: "absolute",
                left: -30,
                top: -25,
                width: 300,
                height: 100,
              }}
            />
            <Image
              source={artwork.lock}
              resizeMode="contain"
              style={{ width: 70, height: 70, alignSelf: "center" }}
            />
            <Text
              style={{
                fontFamily: "Tajawal-Bold",
                fontSize: 24,
                color: "#652B82",
                textAlign: "center",
              }}
            >
              لحظة يا بطل! 🌟
            </Text>
            <Text
              style={{
                fontFamily: "Tajawal",
                fontSize: 19,
                lineHeight: 30,
                color: "#652B82",
                textAlign: "center",
              }}
            >
              {
                "لا يمكنك فتح هذا الحرف الآن 😊\nأكمل الحرف الحالي وتعلّم كتابته\nثم ستُفتح لك باقي الحروف 🎉"
              }
            </Text>
            <Button
              secondary
              label="حسناً"
              onPress={() => setLockedOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
