import { useEffect, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Card, Label, Loading, Notice, colors } from "./ui";
import { errorMessage, request, saveProgress } from "../core/api";
import { useResource } from "../core/useResource";
import { useSession } from "../core/session";
import { lessons, type Question } from "../core/types";
import { artwork } from "../data/design";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { PositionQuestion } from './PositionQuestion';
import { PositionResult } from './PositionResult';
import { TashkeelQuestion } from './TashkeelQuestion';
export function Quiz({
  letterId,
  symbol,
  kind,
}: {
  letterId: number;
  symbol: string;
  kind: "position" | "tashkeel";
}) {
  const lesson = lessons[kind];
  const resource = useResource<{ data: Question[] }>(
    `/lessons/questions?letter_id=${letterId}&lesson_id=${lesson}`,
  );
  const teacher = useSession().session?.user.role === "teacher";
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const questions = resource.data?.data ?? [];
  const question = questions[index];
  let word = "";
  try {
    word = JSON.parse(question?.question_text ?? "{}").word ?? "";
  } catch {
    word = question?.question_text ?? "";
  }
  const persist = async (finalScore: number) => {
    setError(null);
    setBusy(true);
    try {
      await saveProgress(kind, letterId, finalScore);
      setSaved(true);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const answer = async (value: string) => {
    if (teacher || lock.current || finished || !question) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setSelected(value);
    try {
      const result = await request<{
        data: { is_correct: boolean; score: number };
      }>("/progress/student-answers/submit", {
        method: "POST",
        body: { lessons_id: lesson, question_id: question.id, answer: value },
      });
      const finalScore =
        score + (result.data.is_correct ? result.data.score : 0);
      setScore(finalScore);
      setAnswerCorrect(result.data.is_correct);
      setFeedback(
        result.data.is_correct
          ? "أحسنت! إجابة صحيحة ⭐"
          : "حاول التركيز في السؤال التالي",
      );
      if (index === questions.length - 1) {
        setFinished(true);
        await persist(finalScore);
      } else
        timer.current = setTimeout(() => {
          setIndex((n) => n + 1);
          setFeedback(null);
          setAnswerCorrect(null);
          setSelected(null);
          lock.current = false;
          setBusy(false);
        }, 900);
    } catch (cause) {
      setError(errorMessage(cause));
      lock.current = false;
      setBusy(false);
    }
  };
  const restart = () => {
    if (busy) return;
    if (timer.current) clearTimeout(timer.current);
    lock.current = false;
    setIndex(0); setScore(0); setFeedback(null); setAnswerCorrect(null); setError(null);
    setFinished(false); setSaved(false); setSelected(null);
  };
  if (resource.loading) return <Loading />;
  if (resource.error && resource.status !== 404)
    return <Notice error={resource.error} retry={resource.reload} />;
  if (!question)
    return (
      <Card>
        <Label>لم تتم إضافة أسئلة لهذا النشاط بعد.</Label>
      </Card>
    );
  if (finished) return <PositionResult score={score} total={questions.length} saved={saved} busy={busy} error={error} onRetry={() => void persist(score)} onNext={() => { if (saved && !busy && !error) router.replace(`/activity/${kind === 'position' ? 'tashkeel' : 'video'}?letterId=${letterId}&symbol=${encodeURIComponent(symbol)}`); }} />;
  return (
    <View style={{ gap: 16, width: '100%', minWidth: 0 }}>
      <Text style={{ fontFamily: 'Tajawal-Medium', fontSize: 20, lineHeight: 30, color: '#B47DDB', textAlign: 'right' }}>{kind === 'position' ? 'اختر المكان الصحيح للحرف في الكلمة' : 'اختر التشكيل الصحيح للحرف'}</Text>
      <LinearGradient colors={['#FFE68C', '#FFB600']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{
          flexDirection: "row-reverse",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderRadius: 24,
          boxShadow: '0px 6px 16px #F7A82430',
        }}
      >
        <View style={{ alignItems: 'center', gap: 6, flexShrink: 1 }}>
          {teacher ? <Pressable accessibilityRole="button" accessibilityLabel="الكلمة السابقة" disabled={index === 0} onPress={() => setIndex((n) => n - 1)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', opacity: index === 0 ? 0.4 : 1 }}><Text style={{ fontSize: 28, color: colors.ink }}>‹</Text></Pressable> : <View style={{ backgroundColor: 'white', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}><Image source={artwork.point} style={{ width: 30, height: 30 }} resizeMode="contain" /></View>}
          <Text style={{ fontFamily: 'Tajawal-Bold', color: colors.ink, fontSize: 16 }}>{teacher ? 'السابق' : `النقاط ${score}`}</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1, minWidth: 0 }}><Text style={{ fontFamily: 'Tajawal-Bold', color: colors.ink, fontSize: 22 }}>السؤال</Text><Text style={{ fontFamily: 'Tajawal-Medium', color: colors.ink, fontSize: 20 }}>{index + 1} / {questions.length}</Text></View>
        <View style={{ alignItems: 'center', gap: 6, flexShrink: 1 }}>
          {teacher ? <Pressable accessibilityRole="button" accessibilityLabel="الكلمة التالية" disabled={index === questions.length - 1} onPress={() => setIndex((n) => n + 1)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', opacity: index === questions.length - 1 ? 0.4 : 1 }}><Text style={{ fontSize: 28, color: colors.ink }}>›</Text></Pressable> : <Pressable accessibilityRole="button" accessibilityLabel="إعادة النشاط" disabled={busy} onPress={restart} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.4 : 1 }}><Image source={artwork.quizRestart} resizeMode="contain" style={{ width: 28, height: 28 }} /></Pressable>}
          <Text style={{ fontFamily: 'Tajawal-Bold', color: colors.ink, fontSize: 16 }}>{teacher ? 'التالي' : 'إعادة'}</Text>
        </View>
      </LinearGradient>
      {kind === 'position' ? <PositionQuestion symbol={symbol} word={word} selected={selected} feedback={feedback ? answerCorrect ? 'correct' : 'wrong' : null} disabled={teacher || busy} teacher={teacher} onAnswer={(value) => void answer(value)} /> : <TashkeelQuestion symbol={symbol} word={word} selected={selected} feedback={feedback ? answerCorrect ? 'correct' : 'wrong' : null} disabled={teacher || busy} teacher={teacher} onAnswer={(value) => void answer(value)} />}
      <Notice error={error} />
      {teacher && <Label>معاينة المعلم</Label>}
    </View>
  );
}
