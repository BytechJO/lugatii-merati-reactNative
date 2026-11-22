import { useState } from "react";
import { Button, Field, Loading, Notice, Page } from "../../components/ui";
import { errorMessage, request } from "../../core/api";
import { useResource } from "../../core/useResource";
import type { Classroom } from "../../core/types";
import { Redirect } from "expo-router";
import { ClassroomWelcome } from "../../components/ClassroomWelcome";
import { useSession } from "../../core/session";
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { artwork } from "../../data/design";
export default function ClassroomScreen() {
  if (useSession().session?.user.role === "teacher")
    return <Redirect href="/classes" />;
  return <StudentClassroom />;
}
function StudentClassroom() {
  const resource = useResource<{ data: Classroom | null }>(
    "/class/getMuClass/StudentClass",
  );
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const join = async () => {
    setBusy(true);
    setError(null);
    try {
      await request("/class/class/join", {
        method: "POST",
        body: { code: code.trim().toUpperCase() },
      });
      resource.reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const joined = resource.data?.data;
  return (
    <Page title="انضم إلى صفك" headerVariant="transparent" background={artwork.successBackground}>
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Notice error={resource.error} retry={resource.reload} />
      ) : joined ? (
        <ClassroomWelcome name={joined.name} />
      ) : (
        <View style={[styles.join, width >= 768 && styles.joinWide]}>
          <View style={styles.card}>
            <View style={styles.cardAccent} />
            <View style={styles.heading}>
              <View style={styles.dot} />
              <Text style={styles.title}>إستعد لمغامرة تعليمية رائعة</Text>
              <View style={styles.dot} />
            </View>
            <Text style={styles.subtitle}>
              أدخل كود الصف الذي قدمه لك المعلم
            </Text>
            <Field
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={6}
              placeholder="مثال: ABC123"
              accessibilityLabel="كود الصف"
              style={styles.codeField}
            />
            <Notice error={error} />
            <Button
              label={busy ? "جارٍ الانضمام…" : "انضم إلى الصف"}
              secondary
              disabled={busy || !code.trim()}
              onPress={() => void join()}
            />
            <View style={styles.note}>
              <Image source={artwork.star} resizeMode="contain" style={styles.noteIcon} />
              <Text style={styles.noteText}>
                ملاحظة: اطلب من معلمك كود الصف للانضمام إلى صفه الدراسي
              </Text>
            </View>
          </View>
          {width >= 768 && (
            <Image
              source={artwork.classroomTiger}
              resizeMode="contain"
              style={styles.tiger}
            />
          )}
        </View>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  join: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    paddingVertical: 12,
  },
  joinWide: { flexDirection: "row-reverse" },
  card: {
    width: "100%",
    maxWidth: 470,
    minWidth: 0,
    overflow: "hidden",
    gap: 18,
    padding: 28,
    borderRadius: 28,
    backgroundColor: "#FFFFFFF2",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#652B82",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 7,
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 130,
    height: 54,
    borderBottomLeftRadius: 42,
    backgroundColor: "#FDC333",
  },
  heading: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingTop: 6,
  },
  title: {
    flexShrink: 1,
    fontFamily: "Tajawal-Bold",
    fontSize: 27,
    color: "#652B82",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Tajawal-Medium",
    color: "#625777",
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FDC333",
  },
  codeField: {
    minHeight: 58,
    borderWidth: 2,
    borderColor: "#E0D0ED",
    borderRadius: 16,
    backgroundColor: "#F8F5FB",
    color: "#652B82",
    fontFamily: "Tajawal-Bold",
    fontSize: 22,
    letterSpacing: 3,
    textAlign: "center",
    writingDirection: "ltr",
  },
  note: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 4,
  },
  noteIcon: { width: 18, height: 18 },
  noteText: {
    flexShrink: 1,
    color: "#625777",
    fontFamily: "Tajawal",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  tiger: { width: 230, height: 260 },
});
