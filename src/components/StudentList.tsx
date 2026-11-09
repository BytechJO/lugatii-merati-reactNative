import { Pressable, StyleSheet, Text, View } from "react-native";
import { StudentIcon } from "./StudentIcon";

export function StudentList({
  students,
  compact,
  onOpen,
}: {
  students: { id: number; username: string; email: string }[];
  compact: boolean;
  onOpen: (id: number) => void;
}) {
  if (compact)
    return (
      <View style={styles.compactList}>
        <View style={styles.listHeader}>
          <Text style={styles.emptyTitle}>طلاب الصف</Text>
          <Text style={styles.emptySubtitle}>{students.length} طالب</Text>
        </View>
        {students.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`عرض تقدم الطالب ${student.username}`}
              onPress={() => onOpen(student.id)}
              style={styles.studentCardHeading}
            >
              <View style={styles.studentIcon}>
                <StudentIcon size={24} color="white" />
              </View>
              <Text style={styles.studentCardName}>{student.username}</Text>
            </Pressable>
            <Text style={styles.emailLabel}>ايميل الطالب</Text>
            <Text selectable style={styles.compactEmail}>
              {student.email}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`عرض تقدم الطالب ${student.username}`}
              onPress={() => onOpen(student.id)}
              style={styles.progressButton}
            >
              <Text style={styles.progressButtonText}>عرض تقدم الطالب</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  return (
    <View style={{ width: "100%", minWidth: 0 }}>
      <View style={styles.head}>
        <View style={styles.iconCell} />
        <Text style={styles.name}>إسم الطالب</Text>
        <Text style={styles.emailCell}>ايميل الطالب</Text>
        <Text style={styles.count}>{students.length} طالب</Text>
      </View>
      {students.map((student, index) => (
        <Pressable
          key={student.id}
          accessibilityRole="button"
          accessibilityLabel={`عرض تقدم الطالب ${student.username}`}
          onPress={() => onOpen(student.id)}
          style={({ pressed }) => [
            styles.row,
            { marginTop: index === 0 ? 2 : 14, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <View style={styles.iconCell}>
            <View style={styles.studentIcon}>
              <StudentIcon size={24} color="white" />
            </View>
          </View>
          <Text style={[styles.name, { color: "#7B7B7B" }]}>
            {student.username}
          </Text>
          <View style={styles.emailCell}>
            <Text style={[styles.email, { maxWidth: "100%" }]}>
              {student.email}
            </Text>
          </View>
          <View style={styles.count} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  compactList: { width: "100%", minWidth: 0, gap: 14 },
  listHeader: {
    backgroundColor: "#EBE6FB",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  studentCard: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "#F7F5FC",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  studentCardHeading: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  studentCardName: {
    flex: 1,
    minWidth: 0,
    fontFamily: "Tajawal",
    fontSize: 20,
    color: "#7B7B7B",
    textAlign: "right",
  },
  emailLabel: {
    fontFamily: "Tajawal",
    fontSize: 15,
    color: "#7B7B7B",
    textAlign: "right",
  },
  compactEmail: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Tajawal",
    fontSize: 16,
    color: "#3E3E3E",
    textAlign: "left",
    writingDirection: "ltr",
  },
  progressButton: {
    width: "100%",
    minHeight: 48,
    backgroundColor: "#9B4FDB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  progressButtonText: {
    fontFamily: "Tajawal-Medium",
    fontSize: 18,
    color: "white",
    textAlign: "center",
    flexShrink: 1,
  },
  emptyTitle: {
    fontFamily: "Tajawal",
    fontSize: 20,
    color: "#3E3E3E",
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "Tajawal",
    fontSize: 16,
    color: "#7B7B7B",
    textAlign: "center",
  },
  head: {
    height: 56,
    backgroundColor: "#EBE6FB",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  row: {
    minHeight: 70,
    backgroundColor: "#F7F5FC",
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 6,
  },
  iconCell: { width: 90, alignItems: "center" },
  studentIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#9B4FDB",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    width: 150,
    paddingHorizontal: 8,
    fontFamily: "Tajawal",
    fontSize: 18,
    color: "#3E3E3E",
    textAlign: "center",
  },
  emailCell: {
    flex: 1,
    alignItems: "center",
    fontFamily: "Tajawal",
    fontSize: 18,
    color: "#3E3E3E",
    textAlign: "center",
  },
  email: {
    width: 220,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    fontFamily: "Tajawal",
    fontSize: 16,
    color: "#3E3E3E",
    textAlign: "center",
    writingDirection: "ltr",
  },
  count: {
    width: 130,
    textAlign: "center",
    fontFamily: "Tajawal",
    fontSize: 18,
    color: "#3E3E3E",
  },
});
