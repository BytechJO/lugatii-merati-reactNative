import { StudentList } from '../../../components/StudentList';
import { useEffect, useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VerticalScrollView as ScrollView } from '../../../components/VerticalScrollView';
import { HeaderSafeAreaView as SafeAreaView } from "../../../components/HeaderSafeAreaView";
import * as Clipboard from 'expo-clipboard';
import { Label, Loading, Notice, Page } from '../../../components/ui';
import { TeacherHero } from '../../../components/TeacherHero';
import { StudentIcon } from '../../../components/StudentIcon';
import { useResource } from '../../../core/useResource';
import { useSession } from '../../../core/session';
import { errorMessage } from '../../../core/api';
import type { Classroom } from '../../../core/types';

export default function StudentsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  if (useSession().session?.user.role !== 'teacher') return <Redirect href="/home" />;
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) return <Page title="الصفوف"><Label>رابط الصف غير صالح.</Label></Page>;
  return <Students key={id} id={id} name={name} />;
}

// Reference: frontend/src/components/ClassroomStudent.tsx.
function Students({ id, name }: { id: string; name?: string }) {
  const students = useResource<{ data: { id: number; username: string; email: string }[] }>(`/class/student/${id}`);
  const classroom = useResource<{ data: Classroom }>(`/class/getClassById/${id}`);
  const { width } = useWindowDimensions();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    if (!classroom.data?.data.code) return;
    try { await Clipboard.setStringAsync(classroom.data.data.code); setCopied(true); setCopyError(null); }
    catch (cause) { setCopyError(errorMessage(cause)); }
  };
  const open = (studentId: number) => router.push({ pathname: '/student/[id]', params: { id: String(studentId), classroomId: id, classroomName: classroom.data?.data.name ?? name ?? '' } });
  const list = students.data?.data ?? [];
  return <SafeAreaView style={styles.page} edges={["left", "right", "bottom"]}>
    <TeacherHero title="الصفوف" showTab={false} onBack={() => router.replace('/classes')} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.main}>
      <Notice error={classroom.error} retry={classroom.reload} />
      {students.loading ? <Loading /> : students.error ? <Notice error={students.error} retry={students.reload} /> : !list.length ? <View style={styles.empty}>
        <View style={styles.emptyIcon}><StudentIcon size={40} /></View>
        <Text style={styles.emptyTitle}>لا يوجد طلاب في هذا الصف</Text><Text style={styles.emptySubtitle}>شارك الكود مع الطلاب للانضمام</Text>
        {classroom.data?.data.code && <View style={styles.copyRow}><Text selectable style={styles.code}>{classroom.data.data.code}</Text><Pressable accessibilityRole="button" accessibilityLabel={copied ? 'تم نسخ الكود' : 'نسخ الكود'} onPress={() => void copy()} style={styles.copyButton}><StudentIcon kind={copied ? 'check' : 'copy'} color={copied ? '#10B981' : '#652B82'} /></Pressable></View>}
        <Notice error={copyError} />
      </View> : <StudentList students={list} compact={width < 768} onOpen={open} />}
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
page: { flex: 1, backgroundColor: 'white' },
main: { width: '100%', maxWidth: 1024, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 24, gap: 16 },
empty: { backgroundColor: '#F7F5FC', borderRadius: 24, padding: 20, paddingVertical: 56, alignItems: 'center', gap: 12 },
emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EAE6FA', alignItems: 'center', justifyContent: 'center' },
emptyTitle: { fontFamily: 'Tajawal', fontSize: 20, color: '#3E3E3E', textAlign: 'center' },
emptySubtitle: { fontFamily: 'Tajawal', fontSize: 16, color: '#7B7B7B', textAlign: 'center' },
copyRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
code: { backgroundColor: '#EAE6FA', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, fontFamily: 'Tajawal-Medium', fontSize: 16, color: '#3E3E3E', writingDirection: 'ltr' },
copyButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }
});
