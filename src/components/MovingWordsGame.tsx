import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Card, Label, colors } from './ui';
import { wordItems } from '../core/games';
import type { GameConfig, WordItem } from '../core/types';
import type { GameOutcome } from './MemoryGame';
interface MovingWord extends WordItem { id: number; x: number; duration: number }
export function MovingWordsGame({ config, balloon, active, onEnd }: { config: GameConfig; balloon: boolean; active: boolean; onEnd: (result: GameOutcome) => void }) {
  const [words, setWords] = useState<MovingWord[]>([]); const [correct, setCorrect] = useState(0); const [mistakes, setMistakes] = useState(0); const [width, setWidth] = useState(280);
  const counts = useRef({ correct: 0, mistakes: 0, finished: false }); const resolved = useRef(new Set<number>()); const id = useRef(0);
  const items = useMemo(() => wordItems(config), [config]);
  const resolve = (word: MovingWord, pressed: boolean) => {
    if (counts.current.finished || !active || resolved.current.has(word.id)) return;
    resolved.current.add(word.id); setWords((value) => value.filter((item) => item.id !== word.id));
    if (pressed && word.startsWithTarget) counts.current.correct++;
    if ((pressed && !word.startsWithTarget) || (!pressed && word.startsWithTarget)) counts.current.mistakes++;
    setCorrect(counts.current.correct); setMistakes(counts.current.mistakes);
    if (counts.current.correct >= 10 || counts.current.mistakes >= (config.maxMistakes ?? 3)) {
      counts.current.finished = true;
      onEnd({ score: counts.current.correct * (config.scorePerCorrect ?? 10), won: counts.current.correct >= 10 });
    }
  };
  useEffect(() => {
    if (!active || !items.length) return;
    const interval = balloon ? Math.max(config.spawn?.minInterval ?? 800, (config.spawn?.baseInterval ?? 1500) - correct * (config.spawn?.levelFactor ?? 100)) : config.spawnIntervalMs ?? 2000;
    const timer = setInterval(() => {
      if (counts.current.finished) return;
      const item = items[Math.floor(Math.random() * items.length)];
      const duration = balloon ? Math.max(config.speed?.minDuration ?? 2, (config.speed?.baseDuration ?? 6) - correct * (config.speed?.levelIncrease ?? .3)) * 1000 : 10000 / ((config.minSpeed ?? 2) + Math.random() * ((config.maxSpeed ?? 5) - (config.minSpeed ?? 2)));
      setWords((value) => [...value, { ...item, id: id.current++, x: Math.random() * Math.max(0, width - 94), duration }]);
    }, interval);
    return () => clearInterval(timer);
  }, [active, config, correct, width, balloon, items]);
  return <Card><Label>{config.instruction}</Label><Label>الصحيح: {correct} / 10 — الأخطاء: {mistakes} / {config.maxMistakes ?? 3}</Label><View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height: 340, overflow: 'hidden', borderRadius: 20, backgroundColor: '#F1E7FA' }}>{words.map((word) => <MovingBubble key={word.id} word={word} balloon={balloon} active={active} onResolve={(pressed) => resolve(word, pressed)} />)}</View></Card>;
}
function MovingBubble({ word, balloon, active, onResolve }: { word: MovingWord; balloon: boolean; active: boolean; onResolve: (pressed: boolean) => void }) {
  const [y] = useState(() => new Animated.Value(balloon ? 340 : -80)); const latest = useRef(onResolve);
  useEffect(() => { latest.current = onResolve; }, [onResolve]);
  useEffect(() => {
    if (!active) return;
    const animation = Animated.timing(y, { toValue: balloon ? -90 : 340, duration: word.duration, easing: Easing.linear, useNativeDriver: true });
    animation.start(({ finished }) => { if (finished) latest.current(false); });
    return () => animation.stop();
  }, [active, balloon, word.duration, y]);
  return <Animated.View style={{ position: 'absolute', left: word.x, top: 0, transform: [{ translateY: y }] }}><Pressable accessibilityRole="button" accessibilityLabel={word.word} onPress={() => latest.current(true)} style={{ width: 88, minHeight: 80, borderRadius: balloon ? 44 : 24, backgroundColor: balloon ? colors.yellow : 'white', justifyContent: 'center', alignItems: 'center', padding: 6, borderWidth: 2, borderColor: colors.purple }}><Text style={{ fontSize: 22, color: colors.ink }}>{word.word}</Text></Pressable></Animated.View>;
}
