import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { VerticalScrollView as ScrollView } from "../../../components/VerticalScrollView";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Redirect, router } from "expo-router";
import { Field, Loading, Notice } from "../../../components/ui";
import { TeacherHero } from "../../../components/TeacherHero";
import { errorMessage, request } from "../../../core/api";
import { useResource } from "../../../core/useResource";
import { useSession } from "../../../core/session";
import type { Classroom } from "../../../core/types";
import { artwork } from "../../../data/design";

export default function ClassesScreen() {
  if (useSession().session?.user.role !== "teacher")
    return <Redirect href="/home" />;
  return <TeacherClasses />;
}

// Visual reference: StudentsManagement.tsx and ClassroomManagement.tsx in frontend.
function TeacherClasses() {
  const resource = useResource<{ data: Classroom[] }>(
    "/class/getClassByTeacherId",
  );
  const { width } = useWindowDimensions();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Classroom | null>(null);
  const close = () => {
    if (busy) return;
    setCreating(false);
    setDeleting(null);
    setName("");
    setError(null);
  };
  const create = async () => {
    if (busy || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await request("/class/createNewClass", {
        method: "POST",
        body: { name: name.trim() },
      });
      setName("");
      setCreating(false);
      resource.reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (busy || !deleting) return;
    setBusy(true);
    setError(null);
    try {
      await request(`/class/deleteClass/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      resource.reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const open = (item: Classroom) =>
    router.push(`/classes/${item.id}?name=${encodeURIComponent(item.name)}`);
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TeacherHero
          title="الصفوف"
          onBack={() => router.replace("/home")}
          action={
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setError(null);
                setCreating(true);
              }}
            >
              <LinearGradient
                colors={["#FFE066", "#FDB913"]}
                style={styles.createAction}
              >
                <Icon kind="plus" />
                <Text style={styles.createActionText}>إنشاء صف جديد</Text>
              </LinearGradient>
            </Pressable>
          }
        />
        <View style={styles.main}>
          {resource.loading ? (
            <Loading />
          ) : resource.error ? (
            <Notice error={resource.error} retry={resource.reload} />
          ) : !resource.data?.data.length ? (
            <View style={styles.empty}>
              <View style={styles.emptyCircle}>
                <Image
                  source={artwork.classroomEmpty}
                  resizeMode="contain"
                  style={{ width: 56, height: 56 }}
                />
              </View>
              <Text style={styles.emptyText}>
                لا توجد صفوف بعد، اضغط على &quot;إنشاء صف جديد&quot; للبدء
              </Text>
            </View>
          ) : (
            <ClassList
              items={resource.data.data}
              compact={width < 768}
              onOpen={open}
              onDelete={(item) => {
                setError(null);
                setDeleting(item);
              }}
            />
          )}
        </View>
      </ScrollView>
      <Modal
        visible={creating || !!deleting}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق النافذة"
              onPress={close}
              disabled={busy}
              style={StyleSheet.absoluteFill}
            />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}
            >
              {creating ? (
                <View accessibilityViewIsModal style={styles.createForm}>
                  <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>إنشاء صف جديد</Text>
                  </View>
                  <View style={styles.formBody}>
                    <Text style={styles.fieldLabel}>إسم الصف</Text>
                    <Field
                      value={name}
                      onChangeText={setName}
                      editable={!busy}
                      accessibilityLabel="إسم الصف"
                      placeholder="صف اللغة العربية - 563"
                      style={styles.nameInput}
                    />
                    <Notice error={error} />
                  </View>
                  <View style={styles.modalActions}>
                    <ModalButton
                      title={busy ? "جارٍ الإضافة…" : "إضافة"}
                      disabled={busy || !name.trim()}
                      onPress={() => void create()}
                    />
                    <ModalButton
                      title="إلغاء"
                      disabled={busy}
                      onPress={close}
                    />
                  </View>
                </View>
              ) : deleting ? (
                <View accessibilityViewIsModal style={styles.deleteForm}>
                  <Image
                    source={artwork.finishDecoration}
                    resizeMode="contain"
                    style={styles.decoration}
                  />
                  <View style={styles.warning}>
                    <Text style={{ fontSize: 32 }}>⚠️</Text>
                  </View>
                  <Text style={styles.deleteTitle}>تأكيد الحذف</Text>
                  <Text style={styles.deleteText}>
                    هل أنت متأكد من حذف الصف{"\n"}
                    {deleting.name}؟{"\n"}لا يمكن التراجع عن هذا الإجراء.
                  </Text>
                  <Notice error={error} />
                  <View style={styles.modalActions}>
                    <ModalButton
                      title="إلغاء"
                      disabled={busy}
                      onPress={close}
                    />
                    <ModalButton
                      title={busy ? "جارٍ الحذف…" : "حذف"}
                      danger
                      disabled={busy}
                      onPress={() => void remove()}
                    />
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ClassList({
  items,
  compact,
  onOpen,
  onDelete,
}: {
  items: Classroom[];
  compact: boolean;
  onOpen: (item: Classroom) => void;
  onDelete: (item: Classroom) => void;
}) {
  if (compact)
    return (
      <View style={styles.compactList}>
        <View style={styles.listHeader}>
          <Text style={styles.compactName}>الصفوف</Text>
          <Text style={styles.compactLabel}>{items.length} صف</Text>
        </View>
        {items.map((item) => (
          <View key={item.id} style={styles.compactCard}>
            <View style={styles.compactTitleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`فتح الصف ${item.name}`}
                onPress={() => onOpen(item)}
                style={[styles.iconButton, { backgroundColor: "#9B4FDB" }]}
              >
                <Icon kind="open" color="white" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`عرض طلاب ${item.name}`}
                onPress={() => onOpen(item)}
                style={{ flex: 1, minWidth: 0 }}
              >
                <Text style={styles.compactName}>{item.name}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`حذف الصف ${item.name}`}
                onPress={() => onDelete(item)}
                style={[styles.iconButton, { backgroundColor: "#E9E7EE" }]}
              >
                <Icon kind="trash" />
              </Pressable>
            </View>
            <View style={styles.compactMeta}>
              <View style={styles.compactField}>
                <Text style={styles.compactLabel}>كود الصف</Text>
                <Text
                  selectable
                  style={[
                    styles.code,
                    { maxWidth: "100%", textAlign: "center" },
                  ]}
                >
                  {item.code}
                </Text>
              </View>
              <View style={styles.compactField}>
                <Text style={styles.compactLabel}>عدد الطلاب</Text>
                <Text style={styles.compactValue}>
                  {item.students_count ?? 0} طالب
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  return (
    <View style={{ width: "100%", minWidth: 0 }}>
      <View style={styles.tableHead}>
        <View style={styles.actionCell} />
        <Text style={styles.column}>إسم الصف</Text>
        <Text style={styles.column}>كود الصف</Text>
        <Text style={styles.column}>عدد الطلاب</Text>
        <View style={styles.actionCell} />
      </View>
      {items.map((item, index) => (
        <View
          key={item.id}
          style={[styles.row, { marginTop: index === 0 ? 2 : 12 }]}
        >
          <View style={styles.actionCell}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`فتح الصف ${item.name}`}
              onPress={() => onOpen(item)}
              style={[styles.iconButton, { backgroundColor: "#9B4FDB" }]}
            >
              <Icon kind="open" color="white" />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`عرض طلاب ${item.name}`}
            onPress={() => onOpen(item)}
            style={styles.rowDetails}
          >
            <Text style={[styles.column, styles.className]}>{item.name}</Text>
            <View style={styles.columnBox}>
              <Text style={styles.code}>{item.code}</Text>
            </View>
            <Text style={styles.column}>{item.students_count ?? 0} طالب</Text>
          </Pressable>
          <View style={styles.actionCell}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`حذف الصف ${item.name}`}
              onPress={() => onDelete(item)}
              style={[styles.iconButton, { backgroundColor: "#E9E7EE" }]}
            >
              <Icon kind="trash" />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

function ModalButton({
  title,
  onPress,
  disabled,
  danger,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modalButton,
        {
          backgroundColor: danger ? "#F32525" : "#FDC333",
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.modalButtonText, danger && { color: "white" }]}>
        {title}
      </Text>
    </Pressable>
  );
}
function Icon({
  kind,
  color = "#3E3E3E",
}: {
  kind: "plus" | "open" | "trash";
  color?: string;
}) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path
        d={
          kind === "plus"
            ? "M12 5v14M5 12h14"
            : kind === "trash"
              ? "M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"
              : "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M16 3l5 5M10 14l1-5 7-7 5 5-7 7-6 1Z"
        }
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  compactList: { width: "100%", minWidth: 0, gap: 12 },
  listHeader: {
    backgroundColor: "#EBE6FB",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  compactCard: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "#F7F5FC",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  compactTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  compactName: {
    fontFamily: "Tajawal-Medium",
    fontSize: 20,
    color: "#3E3E3E",
    textAlign: "right",
    flexShrink: 1,
  },
  compactMeta: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 12 },
  compactField: {
    flexBasis: "40%",
    flexGrow: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: 6,
  },
  compactLabel: {
    fontFamily: "Tajawal",
    fontSize: 15,
    color: "#7B7B7B",
    textAlign: "right",
    flexShrink: 1,
  },
  compactValue: {
    fontFamily: "Tajawal-Medium",
    fontSize: 18,
    color: "#3E3E3E",
    textAlign: "right",
  },
  page: { flex: 1, backgroundColor: "white" },
  createAction: {
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 999,
    boxShadow: "0px 8px 16px rgba(253,185,19,0.45)",
  },
  createActionText: {
    fontFamily: "Tajawal-Medium",
    fontSize: 18,
    color: "#3E3E3E",
  },
  main: {
    width: "100%",
    maxWidth: 1024,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  empty: {
    alignItems: "center",
    gap: 20,
    backgroundColor: "#F7F5FC",
    paddingVertical: 64,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EAE6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "Tajawal",
    fontSize: 20,
    textAlign: "center",
    color: "#3E3E3E",
    lineHeight: 30,
  },
  tableHead: {
    height: 46,
    backgroundColor: "#EBE6FB",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  row: {
    minHeight: 58,
    backgroundColor: "#F7F5FC",
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  rowDetails: {
    flex: 1,
    minHeight: 58,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  actionCell: { width: 72, alignItems: "center" },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  column: {
    flex: 1,
    fontFamily: "Tajawal-Medium",
    fontSize: 16,
    textAlign: "center",
    color: "#3E3E3E",
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  columnBox: { flex: 1, alignItems: "center" },
  className: { fontSize: 18 },
  code: {
    backgroundColor: "#EAE6FA",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    fontFamily: "Tajawal-Medium",
    fontSize: 16,
    color: "#3E3E3E",
    writingDirection: "ltr",
  },
  modalSafe: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  createForm: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#F3F4F6",
    // paddingVertical: 40,
    paddingBottom: 30,
    gap: 32,
  },
  formHeader: {
    minHeight: 73,
    backgroundColor: "#652B82",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    padding: 20,
    justifyContent: "center",
  },
  formTitle: {
    fontFamily: "Tajawal-Bold",
    fontSize: 24,
    color: "white",
    textAlign: "right",
  },
  // paddingVertical: 40,
  formBody: { paddingHorizontal: 28, gap: 20, paddingVertical: 20 },
  fieldLabel: {
    fontFamily: "Tajawal-Bold",
    fontSize: 22,
    color: "#3E3E3E",
    textAlign: "right",
  },
  nameInput: { backgroundColor: "#E5E7EB", borderRadius: 0, borderWidth: 0 },
  modalActions: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
  },
  modalButton: {
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontFamily: "Tajawal-Medium",
    fontSize: 20,

    color: "#2D2D2D",
    textAlign: "center",
  },
  deleteForm: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
  },
  warning: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTitle: {
    fontFamily: "Tajawal-Medium",
    fontSize: 24,
    color: "#28345F",
    textAlign: "center",
  },
  deleteText: {
    fontFamily: "Tajawal-Medium",
    fontSize: 18,
    color: "#28345F",
    textAlign: "center",
    lineHeight: 28,
  },
  decoration: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    pointerEvents: "none",
  },
});
