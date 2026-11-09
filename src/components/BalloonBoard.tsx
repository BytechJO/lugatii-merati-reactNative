import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer } from 'expo-audio';
import { artwork } from '../data/design';
import { lettersComp } from '../data/letters';
import { balloonSettings, spawnBalloon, type FloatingBalloon } from '../core/balloons';
import { createCatchRound, type CatchOutcome } from '../core/word-catch';
import type { GameConfig } from '../core/types';

const balloonImages = [artwork.balloonRed, artwork.balloonPink, artwork.balloonYellow, artwork.balloonBlue];
export function BalloonBoard({ config, active, onEnd, onBack, symbol }: { config: GameConfig; active: boolean; onEnd: (outcome: CatchOutcome) => void; onBack: () => void; symbol?: string }) {
  const { width } = useWindowDimensions();
  const [balloons, setBalloons] = useState<FloatingBalloon[]>([]);
  const [stats, setStats] = useState({ score: 0, correct: 0, mistakes: 0 });
  const [field, setField] = useState({ width: 0, height: 0 });
  const [toast, setToast] = useState('');
  const [round] = useState(() => createCatchRound(config));
  const nextId = useRef(0); const finished = useRef(false); const audible = useRef(active);
  const player = useAudioPlayer(artwork.balloonPopSound);
  useEffect(() => {
    // AudioPlayer is a native SharedObject; Expo exposes volume as a writable property.
    // eslint-disable-next-line react-hooks/immutability
    player.volume = 0.5;
  }, [player]);
  useEffect(() => { audible.current = active; if (!active) player.pause(); }, [active, player]);
  const settings = balloonSettings(config, stats.score);
  const maxMistakes = config.maxMistakes ?? 3;
  useEffect(() => {
    if (!active || field.width <= 0 || field.height <= 0) return;
    const spawn = () => {
      if (finished.current) return;
      const balloon = spawnBalloon(config, stats.score, nextId.current++);
      if (balloon) setBalloons((items) => [...items, balloon]);
    };
    const first = setTimeout(spawn, 0);
    const interval = setInterval(spawn, settings.interval);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [active, config, field.width, field.height, settings.interval, stats.score]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 1200); return () => clearTimeout(timer); }, [toast]);
  const resolve = (balloon: FloatingBalloon, pressed: boolean) => {
    if (!active) return;
    const result = round.resolve(balloon, pressed);
    if (!result) return;
    setStats({ score: result.score, correct: result.correct, mistakes: result.mistakes });
    if (pressed) {
      void player.seekTo(0).then(() => { if (audible.current) player.play(); }).catch(() => {});
      setBalloons((items) => items.map((item) => item.id === balloon.id ? { ...item, popped: true } : item));
    } else setBalloons((items) => items.filter((item) => item.id !== balloon.id));
    if (result.mistakes > stats.mistakes) setToast(`خطأ ❌ ${result.mistakes} / ${maxMistakes}`);
    if (result.outcome) { finished.current = true; onEnd(result.outcome); }
  };
  const name = lettersComp.find((letter) => letter.arabic === symbol)?.name ?? symbol ?? config.targetLetter ?? '';
  return <View style={{ flex: 1, width: '100%', maxWidth: 1152, alignSelf: 'center', minWidth: 0 }}>
    <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFFFFEB', borderRadius: 99, padding: 8, flexDirection: 'row-reverse', gap: 8, alignItems: 'center', boxShadow: '0px 8px 20px #0000001F' }}>
      <Pressable accessibilityRole="button" accessibilityLabel="العودة إلى الألعاب" onPress={onBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 30 }}>×</Text></Pressable>
      <Text style={{ flex: 1, minWidth: 0, fontFamily: 'Tajawal', fontSize: width < 768 ? 16 : 20, lineHeight: 25, color: '#28345F', textAlign: 'center' }}>افرقع البالونات التي تحتوي على كلمات تبدأ بحرف ال{name}</Text>
      <LinearGradient colors={['#6B2F8E', '#C98BF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 99, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={{ color: 'white', fontSize: 24 }}>☆</Text><Text accessibilityLabel={`النقاط ${stats.score}`} style={{ fontFamily: 'Tajawal-Medium', fontSize: 24, color: 'white' }}>{stats.score}</Text></LinearGradient>
    </View>
    <View style={{ marginHorizontal: 28, marginTop: 12, flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
      <Text accessibilityLiveRegion="polite" style={{ fontFamily: 'Tajawal-Medium', fontSize: 18, color: '#652B82' }}>المستوى {settings.level}</Text>
      <View accessible accessibilityLabel={`المحاولات المتبقية ${Math.max(0, maxMistakes - stats.mistakes)} من ${maxMistakes}`} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxWidth: '100%' }}>{Array.from({ length: maxMistakes }, (_, index) => <View key={index} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: index < maxMistakes - stats.mistakes ? '#FC4637' : '#D1D5DB' }} />)}</View>
    </View>
    <View onLayout={(event) => setField({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })} style={{ flex: 1, minHeight: 0, marginHorizontal: width < 768 ? 24 : 40, marginTop: 8, marginBottom: 24, overflow: 'hidden' }}>
      {balloons.map((balloon) => <FloatingBalloonCard key={balloon.id} balloon={balloon} field={field} active={active} onResolve={(pressed) => resolve(balloon, pressed)} onRemoved={() => setBalloons((items) => items.filter((item) => item.id !== balloon.id))} />)}
    </View>
    {!!toast && active && <View pointerEvents="none" accessibilityRole="alert" style={{ position: 'absolute', top: 130, alignSelf: 'center', maxWidth: '90%', zIndex: 100, borderWidth: 4, borderColor: '#EF4444', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'white' }}><Text style={{ fontFamily: 'Tajawal', fontSize: 20, color: '#EF4444' }}>{toast}</Text></View>}
  </View>;
}

export function FloatingBalloonCard({ balloon, field, active, onResolve, onRemoved }: { balloon: FloatingBalloon; field: { width: number; height: number }; active: boolean; onResolve: (pressed: boolean) => void; onRemoved: () => void }) {
  const [rise] = useState(() => new Animated.Value(0));
  const [pop] = useState(() => new Animated.Value(0));
  const [sway] = useState(() => new Animated.Value(0));
  const fraction = useRef(0); const latest = useRef({ onResolve, onRemoved });
  useEffect(() => { latest.current = { onResolve, onRemoved }; }, [onResolve, onRemoved]);
  useEffect(() => {
    if (!active || balloon.popped) return;
    let mounted = true;
    const animation = Animated.timing(rise, { toValue: 1, duration: Math.max(1, balloon.duration * (1 - fraction.current)), easing: Easing.linear, useNativeDriver: true, isInteraction: false });
    animation.start(({ finished }) => { if (mounted && finished) latest.current.onResolve(false); });
    return () => { mounted = false; animation.stop(); rise.stopAnimation((value) => { fraction.current = value; }); };
  }, [active, balloon.popped, balloon.duration, rise]);
  useEffect(() => {
    if (!active || balloon.popped) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(sway, { toValue: -1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start(); return () => animation.stop();
  }, [active, balloon.popped, sway]);
  useEffect(() => {
    if (!balloon.popped || !active) return;
    let mounted = true;
    const animation = Animated.timing(pop, { toValue: 1, duration: 400, useNativeDriver: true, isInteraction: false });
    animation.start(({ finished }) => { if (mounted && finished) latest.current.onRemoved(); });
    return () => { mounted = false; animation.stop(); };
  }, [balloon.popped, active, pop]);
  const size = Math.min(170, Math.max(1, Math.min(field.width - 16, field.width < 600 ? 110 : field.width * 0.12)));
  const left = 8 + balloon.offset * Math.max(0, field.width - size - 16);
  return <Animated.View style={{ position: 'absolute', top: 0, left, width: size, height: size, opacity: pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }), transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [field.height + size, -size] }) }, { translateX: sway.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] }) }, { scale: pop.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 1.3, 0] }) }] }}>
    <Pressable accessibilityRole="button" accessibilityLabel={balloon.word} accessibilityState={{ disabled: !active || balloon.popped }} disabled={!active || balloon.popped} onPress={() => latest.current.onResolve(true)} style={{ width: size, height: size }}>
      <Image source={balloonImages[balloon.image]} resizeMode="contain" style={{ width: size, height: size }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: '20%', left: '25%', right: '25%', height: '24%', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: 'Tajawal-Medium', fontSize: size > 130 ? 28 : 20, color: 'white', textAlign: 'center', textShadowColor: '#00000059', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 4 }} numberOfLines={1} adjustsFontSizeToFit>{balloon.word}</Text></View>
      {balloon.popped && Array.from({ length: 10 }, (_, index) => <Animated.View key={index} pointerEvents="none" style={{ position: 'absolute', top: '32%', left: '50%', width: 8, height: 8, borderRadius: 4, backgroundColor: ['#FFFFFF', '#FFD93D', '#FF6B6B', '#6BCB77'][index % 4], opacity: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateX: pop.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(index * Math.PI / 5) * size * 0.6] }) }, { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(index * Math.PI / 5) * size * 0.6] }) }] }} />)}
    </Pressable>
  </Animated.View>;
}
