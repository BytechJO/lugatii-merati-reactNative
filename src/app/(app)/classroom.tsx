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
import { LinearGradient } from "expo-linear-gradient";
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
    <Page title="" headerVariant="transparent" background={artwork.successBackground}>
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Notice error={resource.error} retry={resource.reload} />
      ) : joined ? (
        <ClassroomWelcome name={joined.name} />
      ) : (
        <LinearGradient colors={["#A68BB7", "#84639B"]} style={styles.join}>
          {width >= 768 && (
            <Image
              source={artwork.classroomTiger}
              resizeMode="contain"
              style={{ height: 220, width: 220 }}
            />
          )}
          <View style={{ flex: 1, gap: 22 }}>
            <Text style={[styles.title, { color: "white" }]}>
              إستعد لمغامرة تعليمية رائعة
            </Text>
            <Text style={[styles.subtitle, { color: "white" }]}>
              أدخل كود الصف الذي قدمه لك المعلم
            </Text>
            <Field
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={6}
              placeholder="مثال: ABC123"
              accessibilityLabel="كود الصف"
              style={{
                backgroundColor: "#FFFFFF6B",
                borderWidth: 0,
                color: "white",
              }}
            />
            <Notice error={error} />
            <Button
              label={busy ? "جارٍ الانضمام…" : "تسجيل"}
              secondary
              disabled={busy || !code.trim()}
              onPress={() => void join()}
            />
            <Text style={[styles.subtitle, { color: "white", fontSize: 16 }]}>
              ملاحظة: اطلب من معلمك كود الصف للانضمام إلى صفه الدراسي
            </Text>
          </View>
        </LinearGradient>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  title: {
    fontFamily: "Cairo",
    fontSize: 28,
    color: "#570A92",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Tajawal-Medium",
    color: "#A664D3",
    fontSize: 20,
    textAlign: "center",
  },
  join: {
    padding: 28,
    borderRadius: 28,
    gap: 24,
    flexDirection: "column",
    alignItems: "center",
  },
});
