import { useEffect, useRef, useState } from 'react';
import type { ViewInstance } from 'react-native';
import { getGameImage } from './useGameArtwork';
import { Animated, Image, PanResponder, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VerticalScrollView } from './VerticalScrollView';
import { shuffle } from '../core/games';
import { createSortingRound, sortingZoneAt, type DropRect } from '../core/sorting';
import type { GameConfig } from '../core/types';
import type { CatchOutcome } from '../core/word-catch';
import { artwork } from '../data/design';
import { lettersComp } from '../data/letters';

type SortingItem = ReturnType<typeof createSortingRound>['items'][number];
export function SortingBoard({ config, onEnd, active = true, onBack, symbol }: { config: GameConfig; onEnd: (outcome: CatchOutcome) => void; active?: boolean; onBack?: () => void; symbol?: string }) {
  const { width, height } = useWindowDimensions();
  const [round] = useState(() => createSortingRound(config));
  const [items] = useState(() => shuffle(round.items));
  const [stats, setStats] = useState({ placed: [] as number[], moves: 0, mistakes: 0, score: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [hover, setHover] = useState(-1); const [toast, setToast] = useState('');
  const [gridWidth, setGridWidth] = useState(width - 32);
  const root = useRef<ViewInstance | null>(null);
  const bounds = useRef<DropRect>({ x: 0, y: 0, width, height });
  const zoneRefs = useRef<[ViewInstance | null, ViewInstance | null]>([null, null]);
  const zones = useRef<[DropRect | null, DropRect | null]>([null, null]);
  const [position] = useState(() => new Animated.ValueXY());
  const letter = symbol ?? config.targetLetter ?? '';
  const name = lettersComp.find((item) => item.arabic === letter)?.name ?? letter;
  const cardSize = Math.min(96, Math.max(44, Math.floor((gridWidth - (width < 768 ? 4 : 9) * 8) / (width < 768 ? 5 : 10))));
  const overlaySize = Math.min(108, cardSize + 16);
  const measure = () => {
    root.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => { bounds.current = { x, y, width: measuredWidth, height: measuredHeight }; });
    zoneRefs.current.forEach((view, index) => view?.measureInWindow((x, y, measuredWidth, measuredHeight) => { zones.current[index] = { x, y, width: measuredWidth, height: measuredHeight }; }));
  };
  const move = (x: number, y: number) => {
    const rect = bounds.current;
    position.setValue({ x: Math.max(0, Math.min(rect.width - overlaySize, x - rect.x - overlaySize / 2)), y: Math.max(0, Math.min(rect.height - overlaySize, y - rect.y - overlaySize / 2)) });
    setHover(sortingZoneAt(zones.current, x, y));
  };
  const cancel = () => { setDragging(null); setHover(-1); };
  useEffect(() => {
    if (active) return;
    const timer = setTimeout(() => { setDragging(null); setHover(-1); }, 0);
    return () => clearTimeout(timer);
  }, [active]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 1400); return () => clearTimeout(timer); }, [toast]);
  const place = (id: number, target: boolean) => {
    if (!active) return;
    const result = round.drop(id, target);
    if (!result) return;
    setSelected(null); setStats({ placed: result.placed, moves: result.moves, mistakes: result.mistakes, score: result.score });
    if (!result.correct) setToast(`خطأ! عدد المحاولات ${result.mistakes}/${config.maxMistakes ?? 3}`);
    if (result.outcome) onEnd(result.outcome);
  };
  const activeItem = active ? items.find((item) => item.id === dragging) : undefined;
  return <View ref={root} collapsable={false} onLayout={measure} style={{ flex: 1, width: '100%', maxWidth: 1152, alignSelf: 'center', minWidth: 0, overflow: 'hidden' }}>
    <View style={{ marginHorizontal: 16, marginTop: 12, flexDirection: 'row-reverse', alignItems: 'center', padding: 8, gap: 8, backgroundColor: '#FFFFFFEB', borderRadius: 99, boxShadow: '0px 8px 20px #0000001F' }}>
      {onBack && <Pressable accessibilityRole="button" accessibilityLabel="العودة إلى الألعاب" onPress={onBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 30 }}>×</Text></Pressable>}
      <Text style={{ flex: 1, minWidth: 0, fontFamily: 'Tajawal', fontSize: width < 768 ? 15 : 20, lineHeight: 24, textAlign: 'center', color: '#28345F' }}>صنّف الكلمات، واسحب الكلمات التي تبدأ بحرف ال{name} إلى المكان الصحيح</Text>
      <LinearGradient colors={['#6B2F8E', '#C98BF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 99, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', gap: 6, alignItems: 'center' }}><Text style={{ color: 'white', fontSize: 24 }}>☆</Text><Text accessibilityLabel={`النقاط ${stats.score}`} style={{ fontFamily: 'Tajawal-Medium', fontSize: 24, color: 'white' }}>{stats.score}</Text></LinearGradient>
    </View>
    <Text accessibilityLiveRegion="polite" style={{ marginHorizontal: 28, marginTop: 4, fontFamily: 'Tajawal-Medium', fontSize: 16, textAlign: 'left', color: '#652B82' }}>حركة: {stats.moves}</Text>
    <VerticalScrollView scrollEnabled={dragging === null} onScroll={measure} scrollEventThrottle={32} contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: width < 768 ? 24 : 48 }}>
      <View onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)} style={{ width: '100%', minWidth: 0, flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {items.map((item) => <SortingDraggable key={item.id} item={item} size={cardSize} placed={stats.placed.includes(item.id)} selected={selected === item.id} hidden={dragging === item.id} active={active} onSelect={() => { if (active && !stats.placed.includes(item.id)) setSelected(item.id); }} onStart={(x, y) => { measure(); setDragging(item.id); setSelected(null); move(x, y); }} onMove={move} onCancel={cancel} onDrop={(x, y) => { const index = sortingZoneAt(zones.current, x, y); cancel(); if (index >= 0) place(item.id, index === 0); }} />)}
      </View>
      <View style={{ width: '100%', maxWidth: 820, alignSelf: 'center', minWidth: 0, flexDirection: 'row-reverse', gap: width < 768 ? 12 : 24, height: height < 500 ? 180 : Math.max(230, Math.min(340, height * 0.4)) }}>
        {[true, false].map((target, index) => <View key={String(target)} style={{ flex: 1, minWidth: 0 }}>
          <LinearGradient colors={target ? ['#FFF3B0', '#FFB800'] : ['#C98BF5', '#6B2F8E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', top: 0, zIndex: 2, alignSelf: 'center', maxWidth: '100%', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 }}><Text style={{ fontFamily: 'Tajawal-Bold', fontSize: width < 768 ? 13 : 16, color: target ? '#28345F' : 'white', textAlign: 'center' }}>{target ? `حرف ال${name} (${letter})` : 'حروف أخرى'}</Text></LinearGradient>
          <Pressable ref={(view) => { zoneRefs.current[index] = view; }} collapsable={false} onLayout={measure} accessibilityRole="button" accessibilityLabel={target ? `صندوق حرف ${letter}` : 'صندوق الحروف الأخرى'} accessibilityHint="اختر كلمة ثم اضغط لتصنيفها" disabled={!active} onPress={() => { if (selected !== null) place(selected, target); }} style={{ flex: 1, marginTop: 16, borderRadius: width < 768 ? 24 : 36, borderWidth: hover === index ? 6 : 4, borderColor: target ? '#FFC94D' : '#6B2F8E', overflow: 'hidden' }}>
            <LinearGradient colors={target ? ['#FFF6CC', '#FFE9A3'] : ['#F0D9FF', '#D9A8F5']} style={{ flex: 1, padding: width < 768 ? 6 : 10 }}>
              <VerticalScrollView nestedScrollEnabled scrollEnabled={dragging === null} style={{ backgroundColor: 'white', borderRadius: 20 }} contentContainerStyle={{ flexGrow: 1, padding: 6 }}>
                <View style={{ flexGrow: 1, minWidth: 0, borderWidth: 1.5, borderStyle: 'dotted', borderColor: target ? '#FFD877' : '#7B4A9C', borderRadius: 16, padding: 6, flexDirection: 'row-reverse', flexWrap: 'wrap', alignContent: 'flex-start', justifyContent: 'center', gap: 8 }}>
                  {stats.placed.filter((id) => round.items[id].startsWithTarget === target).map((id) => <SortingWordCard key={id} word={round.items[id].word} size={width < 768 ? 52 : 72} />)}
                </View>
              </VerticalScrollView>
            </LinearGradient>
          </Pressable>
        </View>)}
      </View>
    </VerticalScrollView>
    {!!toast && <View pointerEvents="none" accessibilityRole="alert" style={{ position: 'absolute', top: 100, alignSelf: 'center', maxWidth: '90%', zIndex: 100, padding: 12, borderWidth: 4, borderColor: '#EF4444', borderRadius: 16, backgroundColor: 'white' }}><Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 18, textAlign: 'center', color: '#EF4444' }}>{toast}</Text></View>}
    {activeItem && <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000, width: overlaySize, height: overlaySize, transform: position.getTranslateTransform() }}><SortingWordCard word={activeItem.word} size={overlaySize} /></Animated.View>}
  </View>;
}

export function SortingWordCard({ word, size }: { word: string; size: number }) {
  return <View style={{ width: size, height: size, maxWidth: '100%', alignItems: 'center', justifyContent: 'center' }}><Image pointerEvents="none" accessible={false} source={getGameImage(artwork.sortingWordCard)} resizeMode="stretch" style={{ position: 'absolute', top: 0, left: 0, width: size, height: size }} /><Text style={{ fontFamily: 'Tajawal-Medium', fontSize: size < 75 ? 14 : 20, color: '#28345F', textAlign: 'center', marginTop: size * 0.04 }} numberOfLines={1} adjustsFontSizeToFit>{word}</Text></View>;
}

export function SortingDraggable({ item, size, placed, selected, hidden, active, onSelect, onStart, onMove, onDrop, onCancel }: { item: SortingItem; size: number; placed: boolean; selected: boolean; hidden: boolean; active: boolean; onSelect: () => void; onStart: (x: number, y: number) => void; onMove: (x: number, y: number) => void; onDrop: (x: number, y: number) => void; onCancel: () => void }) {
  const latest = useRef({ placed, active, onSelect, onStart, onMove, onDrop, onCancel }); const moved = useRef(false);
  useEffect(() => { latest.current = { placed, active, onSelect, onStart, onMove, onDrop, onCancel }; }, [placed, active, onSelect, onStart, onMove, onDrop, onCancel]);
  // Responder callbacks run during gestures, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => PanResponder.create({
    onStartShouldSetPanResponder: () => latest.current.active && !latest.current.placed,
    onPanResponderGrant: () => { moved.current = false; },
    onPanResponderMove: (_, gesture) => {
      if (!latest.current.active) { latest.current.onCancel(); return; }
      if (!moved.current && Math.hypot(gesture.dx, gesture.dy) >= 8) { moved.current = true; latest.current.onStart(gesture.moveX, gesture.moveY); }
      if (moved.current) latest.current.onMove(gesture.moveX, gesture.moveY);
    },
    onPanResponderRelease: (_, gesture) => { if (!latest.current.active) latest.current.onCancel(); else if (moved.current) latest.current.onDrop(gesture.moveX, gesture.moveY); else latest.current.onSelect(); },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: () => { moved.current = false; latest.current.onCancel(); },
  }));
  return <View {...responder.panHandlers} accessible accessibilityRole="button" accessibilityLabel={item.word} accessibilityState={{ disabled: placed || !active, selected }} accessibilityHint="اسحب الكلمة إلى الصندوق، أو اخترها ثم اضغط الصندوق" onAccessibilityTap={() => { if (active && !placed) onSelect(); }} style={{ width: size, height: size, maxWidth: '100%', opacity: hidden ? 0 : placed ? 0.4 : 1, borderRadius: 12, borderWidth: selected ? 2 : 0, borderColor: '#652B82' }}><SortingWordCard word={item.word} size={size} /></View>;
}
