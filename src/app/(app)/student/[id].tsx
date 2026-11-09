import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { VerticalScrollView as ScrollView } from "../../../components/VerticalScrollView";
import { SafeAreaView } from "react-native-safe-area-context";
import { Label, Loading, Notice, Page } from "../../../components/ui";
import { StudentIcon } from "../../../components/StudentIcon";
import { useResource } from "../../../core/useResource";
import { useSession } from "../../../core/session";
import {
  activityPercentage,
  scoreColor,
  type StudentProgress,
} from "../../../core/student-progress";
import { artwork } from "../../../data/design";
import { lettersComp } from "../../../data/letters";

const activityStyles: Record<
  string,
  { label: string; color: string; image: number }
> = {
  learn: {
    label: "تعلم الحرف",
    color: "#10B981",
    image: artwork.progressLearn,
  },
  write: {
    label: "الكتابة والتلوين",
    color: "#3B82F6",
    image: artwork.progressWrite,
  },
  tashkeel: {
    label: "التشكيل",
    color: "#EC4899",
    image: artwork.progressTashkeel,
  },
  position: {
    label: "مكان الحرف",
    color: "#EF4444",
    image: artwork.progressPosition,
  },
  video: { label: "الفيديو", color: "#F59E0B", image: artwork.progressVideo },
  game: { label: "الألعاب", color: "#164194", image: artwork.progressGame },
};
const number = (value?: number) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;
const dateLabel = (value: string | number) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default function StudentProgressScreen() {
  const { id, classroomId, classroomName } = useLocalSearchParams<{
    id: string;
    classroomId?: string;
    classroomName?: string;
  }>();
  if (useSession().session?.user.role !== "teacher")
    return <Redirect href="/home" />;
  if (!Number.isInteger(Number(id)) || Number(id) <= 0)
    return (
      <Page title="تقدم الطالب">
        <Label>رابط الطالب غير صالح.</Label>
      </Page>
    );
  return (
    <ProgressContent
      id={id}
      classroomId={classroomId}
      classroomName={classroomName}
    />
  );
}

// Reference: frontend/src/components/StudentProgressView.tsx.
function ProgressContent({
  id,
  classroomId,
  classroomName,
}: {
  id: string;
  classroomId?: string;
  classroomName?: string;
}) {
  const resource = useResource<{ data: StudentProgress }>(
    `/progress/students/${id}/progress`,
  );
  const { width } = useWindowDimensions();
  const phone = width < 768;
  const heroHeight = phone ? 200 : Math.max(180, (width * 160) / 902);
  const progress = resource.data?.data;
  const stats = progress?.stats ?? {};
  const completed = stats.completedLetters ?? [];
  const activityEntries = Object.entries(stats.activityScores ?? {});
  const recent = progress?.recentActivities ?? [];
  const statWidth = phone ? "40%" : 160;
  const tiles = [
    {
      value: `${number(stats.averageScore)}%`,
      label: "المعدل العام",
      bg: "#F5F2FF",
    },
    { value: number(stats.totalActivities), label: "الأنشطة", bg: "#EDF8F4" },
    {
      value: Math.floor(number(stats.totalTimeSpent) / 60),
      label: "دقيقة",
      bg: "#FFF0F6",
    },
    { value: completed.length, label: "حروف", bg: "#EEF4FD" },
  ];
  const back = () => {
    if (
      classroomId &&
      Number.isInteger(Number(classroomId)) &&
      Number(classroomId) > 0
    )
      router.replace({
        pathname: "/classes/[id]",
        params: { id: classroomId, name: classroomName ?? "" },
      });
    else if (router.canGoBack()) router.back();
    else router.replace("/classes");
  };
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.hero, { height: heroHeight }]}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: heroHeight * 0.68,
              overflow: "hidden",
            }}
          >
            <Image
              source={artwork.progressHeader}
              resizeMode="cover"
              style={{
                width: phone ? (heroHeight * 1600) / 293 : width,
                height: heroHeight,
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="الرجوع إلى طلاب الصف"
            onPress={back}
            style={styles.back}
          >
            <StudentIcon kind="back" size={32} />
          </Pressable>
          <View style={[styles.classHeading, phone && { maxWidth: "55%" }]}>
            <View style={styles.dot} />
            <Text
              accessibilityRole="header"
              style={[styles.classTitle, { fontSize: phone ? 26 : 40 }]}
            >
              {classroomName || "تقدم الطالب"}
            </Text>
            <Image
              source={artwork.teacherSparkle}
              resizeMode="contain"
              style={styles.sparkle}
            />
          </View>
          <View style={styles.studentName}>
            <Image
              source={artwork.progressUser}
              resizeMode="contain"
              style={{ width: phone ? 36 : 50, height: phone ? 36 : 50 }}
            />
            <Text style={[styles.studentTitle, { fontSize: phone ? 20 : 30 }]}>
              {progress?.student.username ?? "تقدم الطالب"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.content,
            { paddingHorizontal: phone ? 12 : width < 1200 ? 36 : 100 },
          ]}
        >
          {resource.loading ? (
            <Loading />
          ) : resource.error ? (
            <Notice error={resource.error} retry={resource.reload} />
          ) : !progress ? (
            <Text style={styles.emptyText}>لا توجد بيانات لهذا الطالب</Text>
          ) : (
            <>
              <View
                style={[
                  styles.overview,
                  { flexDirection: phone ? "column" : "row-reverse" },
                ]}
              >
                <View
                  style={[
                    styles.stats,
                    {
                      width: phone ? "100%" : 160,
                      flexDirection: phone ? "row-reverse" : "column",
                      justifyContent: phone ? "center" : "flex-start",
                      columnGap: phone ? 30 : 24,
                      rowGap: phone ? 8 : 24,
                    },
                  ]}
                >
                  {tiles.map((tile) => (
                    <View
                      key={tile.label}
                      style={[
                        styles.statTile,
                        { width: statWidth, backgroundColor: tile.bg },
                      ]}
                    >
                      <Text style={styles.statValue}>{tile.value}</Text>
                      <Text style={styles.statLabel}>{tile.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.performance}>
                  {activityEntries.length ? (
                    activityEntries.map(([type, score]) => {
                      const activity = activityStyles[type];
                      const percentage = activityPercentage(
                        type,
                        number(score),
                      );
                      const color = activity?.color ?? "#164194";
                      return (
                        <View key={type} style={styles.performanceRow}>
                          {activity && (
                            <Image
                              source={activity.image}
                              resizeMode="contain"
                              style={{
                                width: phone ? 48 : 72,
                                height: phone ? 48 : 65,
                              }}
                            />
                          )}
                          <View style={{ flex: 1, gap: 8 }}>
                            <View style={styles.barLabels}>
                              <Text style={styles.activityName}>
                                {activity?.label ?? type}
                              </Text>
                              <Text style={[styles.percentage, { color }]}>
                                {Math.round(percentage)}%
                              </Text>
                            </View>
                            <ProgressBar
                              percentage={percentage}
                              color={color}
                            />
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptyPanel}>
                      <Text style={styles.emptyText}>لا توجد أنشطة بعد</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.recentCard}>
                <ImageBackground
                  source={artwork.progressActivities}
                  resizeMode="cover"
                  style={styles.recentHeader}
                >
                  <Text style={styles.sectionTitle}>النشاطات الأخيرة</Text>
                </ImageBackground>
                <View
                  style={[
                    styles.activityList,
                    { paddingHorizontal: phone ? 12 : 36 },
                  ]}
                >
                  {recent.length ? (
                    recent.map((activity, index) => {
                      const type = activity.lessonName ?? activity.activityType;
                      const percentage = activityPercentage(
                        type,
                        number(activity.score),
                      );
                      const color = scoreColor(percentage);
                      return (
                        <View
                          key={`${activity.letter}:${type}:${activity.completedAt}:${index}`}
                          style={[
                            styles.recentRow,
                            phone && {
                              flexDirection: "column",
                              alignItems: "stretch",
                            },
                          ]}
                        >
                          <View style={{ flexShrink: 1, gap: 4 }}>
                            <Text style={styles.recentTitle}>
                              {activityStyles[type]?.label ??
                                activity.activityType}{" "}
                              {activity.letter}
                            </Text>
                            <View style={styles.metadata}>
                              <Text style={styles.metaText}>
                                {dateLabel(activity.completedAt)}
                              </Text>
                              <StudentIcon
                                kind="clock"
                                size={12}
                                color="#8A8A8A"
                              />
                              <Text style={styles.metaText}>
                                {Math.ceil(number(activity.timeSpent) / 60)}{" "}
                                دقيقة
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.recentBar,
                              phone && { flex: undefined, width: "100%" },
                            ]}
                          >
                            <Text style={[styles.percentage, { color }]}>
                              {Math.round(percentage)}%
                            </Text>
                            <ProgressBar
                              percentage={percentage}
                              color={color}
                            />
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptyPanel}>
                      <Text style={styles.emptyText}>لا توجد نشاطات بعد</Text>
                    </View>
                  )}
                </View>
              </View>
              <ImageBackground
                source={artwork.progressFooter}
                resizeMode="cover"
                imageStyle={{ borderRadius: 32 }}
                style={styles.lettersCard}
              >
                {!phone && (
                  <Image
                    source={artwork.teacherBooks}
                    resizeMode="contain"
                    style={styles.books}
                  />
                )}
                <View
                  style={{
                    width: phone ? "100%" : "62%",
                    alignSelf: "flex-end",
                    gap: 12,
                  }}
                >
                  <Text style={styles.lettersTitle}>
                    الحروف المدروسة {completed.length}{" "}
                    {completed.length >= 3 && completed.length <= 10
                      ? "أحرف"
                      : "حرف"}
                  </Text>
                  <View style={styles.letters}>
                    {lettersComp.map((letter) => (
                      <View
                        key={letter.arabic}
                        accessibilityLabel={`${letter.arabic}، ${completed.includes(letter.arabic) ? "مدروس" : "غير مدروس"}`}
                        style={[
                          styles.letter,
                          {
                            backgroundColor: completed.includes(letter.arabic)
                              ? "#ACDAA9"
                              : "white",
                          },
                        ]}
                      >
                        <Text style={styles.letterText}>{letter.arabic}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ImageBackground>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressBar({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={[styles.bar, { backgroundColor: `${color}26` }]}
    >
      <View
        style={{
          width: `${percentage}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7FF" },
  hero: {
    position: "relative",
    backgroundColor: "#EAE1FF",
    overflow: "hidden",
  },
  back: {
    position: "absolute",
    top: 8,
    right: 14,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FCFCFC",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 6px rgba(138,99,240,0.25)",
  },
  classHeading: {
    position: "absolute",
    top: 64,
    right: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },
  classTitle: {
    fontFamily: "Tajawal-Bold",
    color: "#3B2F4F",
    textAlign: "right",
    flexShrink: 1,
  },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#FECB27" },
  sparkle: { position: "absolute", top: -25, left: -18, width: 24, height: 26 },
  studentName: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    minHeight: 50,
    backgroundColor: "white",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#8A63F0",
    flexDirection: "row-reverse",
    gap: 11,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  studentTitle: {
    fontFamily: "Tajawal",
    color: "#454444",
    textAlign: "right",
    flexShrink: 1,
  },
  content: {
    marginTop: 18,
    gap: 24,
    maxWidth: 1400,
    width: "100%",
    alignSelf: "center",
  },
  overview: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 16,
    gap: 24,
    boxShadow: "0px 4px 18px rgba(40,52,95,0.08)",
  },
  stats: { flexWrap: "wrap" },
  statTile: {
    height: 88,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#0000000A",
    padding: 12,
    justifyContent: "space-between",
  },
  statValue: {
    fontFamily: "Tajawal-Bold",
    fontSize: 20,
    color: "#4E4E4E",
    textAlign: "left",
  },
  statLabel: {
    fontFamily: "Tajawal",
    fontSize: 16,
    color: "#8A8A8A",
    textAlign: "right",
  },
  performance: { flex: 1, gap: 24, justifyContent: "space-between" },
  performanceRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  activityName: {
    fontFamily: "Tajawal",
    fontSize: 17,
    color: "#626262",
    flexShrink: 1,
  },
  percentage: {
    fontFamily: "Tajawal-Medium",
    fontSize: 18,
    minWidth: 42,
    textAlign: "left",
  },
  bar: {
    flex: 1,
    minHeight: 10,
    maxHeight: 10,
    borderRadius: 999,
    overflow: "hidden",
    direction: "ltr",
  },
  emptyPanel: {
    backgroundColor: "#F3F2F8",
    minHeight: 160,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "Tajawal",
    fontSize: 18,
    color: "#8A8A8A",
    textAlign: "center",
  },
  recentCard: {
    backgroundColor: "white",
    borderRadius: 32,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    overflow: "hidden",
    boxShadow: "0px 4px 18px rgba(40,52,95,0.08)",
  },
  recentHeader: { height: 100, alignItems: "center", justifyContent: "center" },
  sectionTitle: {
    fontFamily: "Tajawal-Medium",
    fontSize: 22,
    color: "#454444",
  },
  activityList: { paddingTop: 20, paddingBottom: 27, gap: 14 },
  recentRow: {
    minHeight: 64,
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E3EE",
    borderRadius: 18,
    padding: 14,
    gap: 14,
  },
  recentTitle: {
    fontFamily: "Tajawal-Medium",
    fontSize: 18,
    color: "#272626",
    textAlign: "right",
  },
  metadata: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },
  metaText: { fontFamily: "Tajawal", fontSize: 14, color: "#8A8A8A" },
  recentBar: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  lettersCard: {
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#C9B6F5",
    padding: 18,
    minHeight: 144,
  },
  books: { position: "absolute", left: 11, bottom: 0, width: 130, height: 112 },
  lettersTitle: {
    fontFamily: "Tajawal-Bold",
    fontSize: 22,
    color: "#272626",
    textAlign: "right",
  },
  letters: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 5 },
  letter: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.08)",
  },
  letterText: { fontFamily: "Tajawal", fontSize: 22, color: "#272626" },
});
