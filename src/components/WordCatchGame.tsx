import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { GameConfig } from '../core/types';
import { catchBatch, createCatchRound, type CatchOutcome, type FallingWord } from '../core/word-catch';

const bubbleColors = ['#FDB813', '#4FC3F7', '#8BC34A', '#EF5350', '#5C6BC0'];
export function WordCatchGame({ config, active, onEnd, onBack }: { config: GameConfig; active: boolean; onEnd: (outcome: CatchOutcome) => void; onBack: () => void }) {
  const [words, setWords] = useState<FallingWord[]>([]);
  const [stats, setStats] = useState({ correct: 0, mistakes: 0, score: 0 });
  const [field, setField] = useState({ width: 0, height: 0 });
  const [round] = useState(() => createCatchRound(config));
  const nextId = useRef(0); const finished = useRef(false);
  const resolve = (word: FallingWord, pressed: boolean) => {
    if (!active) return;
    const result = round.resolve(word, pressed);
    if (!result) return;
    setWords((items) => items.filter((item) => item.id !== word.id));
    setStats({ correct: result.correct, mistakes: result.mistakes, score: result.score });
    if (result.outcome) { finished.current = true; onEnd(result.outcome); }
  };
  useEffect(() => {
    if (!active || field.width <= 0 || field.height <= 0) return;
    const timer = setInterval(() => {
      if (finished.current) return;
      const batch = catchBatch(config, stats.correct, nextId.current);
      nextId.current += batch.length;
      setWords((items) => [...items, ...batch]);
    }, config.spawnIntervalMs ?? 2000);
    return () => clearInterval(timer);
  }, [active, config, field.width, field.height, stats.correct]);
  return <View style={{ flex: 1, width: '100%', maxWidth: 1152, alignSelf: 'center', minWidth: 0 }}>
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: 'white', borderRadius: 40, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginTop: 12, boxShadow: '0px 14px 30px #28345F29', zIndex: 2 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="العودة إلى الألعاب" onPress={onBack} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF0A12', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 34, lineHeight: 40 }}>×</Text></Pressable>
      <Text style={{ flex: 1, minWidth: 0, fontFamily: 'Tajawal-Bold', fontSize: 17, lineHeight: 25, color: '#28345F', textAlign: 'center' }}>{config.instruction}</Text>
      <LinearGradient colors={['#7C3AED', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text accessibilityLabel={`النقاط ${stats.score}`} style={{ color: '#F9F9F9', fontFamily: 'Tajawal-Bold', fontSize: 20 }}>{stats.score}</Text><Text style={{ color: 'white', fontSize: 28 }}>☆</Text>
      </LinearGradient>
    </View>
    <Text accessibilityLiveRegion="polite" style={{ marginHorizontal: 28, marginTop: 12, fontFamily: 'Tajawal-Bold', fontSize: 18, color: '#EE0000', textAlign: 'left' }}>أخطاء {stats.mistakes}/{config.maxMistakes ?? 3}</Text>
    <View onLayout={(event) => setField({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })} style={{ flex: 1, marginHorizontal: 16, marginTop: 8, marginBottom: 24, overflow: 'hidden', minHeight: 0 }}>
      {words.map((word) => <CatchBubble key={word.id} word={word} active={active} field={field} onResolve={(pressed) => resolve(word, pressed)} />)}
    </View>
  </View>;
}

function CatchBubble({ word, active, field, onResolve }: { word: FallingWord; active: boolean; field: { width: number; height: number }; onResolve: (pressed: boolean) => void }) {
  const [progress] = useState(() => new Animated.Value(0));
  const fraction = useRef(0); const latest = useRef(onResolve);
  useEffect(() => { latest.current = onResolve; }, [onResolve]);
  useEffect(() => {
    if (!active) return;
    let mounted = true;
    const animation = Animated.timing(progress, { toValue: 1, duration: Math.max(1, word.duration * (1 - fraction.current)), easing: Easing.linear, useNativeDriver: true, isInteraction: false });
    animation.start(({ finished }) => { if (mounted && finished) latest.current(false); });
    return () => { mounted = false; animation.stop(); progress.stopAnimation((value) => { fraction.current = value; }); };
  }, [active, progress, word.duration]);
  const size = Math.min(90, Math.max(32, field.width / 3 - 8));
  const laneWidth = field.width / word.lanes;
  const left = word.lane * laneWidth + word.offset * Math.max(0, laneWidth - size);
  return <Animated.View style={{ position: 'absolute', left, top: 0, width: size, height: size, opacity: progress.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-size, field.height + size] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }] }}>
    <Pressable accessibilityRole="button" accessibilityLabel={word.word} disabled={!active} onPress={() => latest.current(true)} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: 'white', borderWidth: 2, borderStyle: 'dashed', borderColor: bubbleColors[word.id % bubbleColors.length], alignItems: 'center', justifyContent: 'center', padding: 8, boxShadow: '0px 6px 14px #00000014' }}>
      <Text style={{ fontFamily: 'Tajawal-Medium', fontSize: 21, color: '#28345F', textAlign: 'center' }}>{word.word}</Text>
    </Pressable>
  </Animated.View>;
}
