import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { AppState, PanResponder, Pressable, Text, View, useWindowDimensions, type GestureResponderEvent } from 'react-native';
import Svg, { Defs, G, Image as SvgImage, Mask, Path } from 'react-native-svg';
import { Button, Card, Label, Notice, s } from './ui';
import { markCoverage, type Point } from '../core/coloring';
import { useSession } from '../core/session';
import { errorMessage, saveProgress } from '../core/api';
import masks from '../data/letter-masks.json';
import { letterImages } from '../data/letter-images';
import { ActivityVideoIntro } from './ActivityVideoIntro';
interface Stroke { color: string; points: Point[] }
type ColoringProps = { symbol: string; letterId: number; onDrawingChange?: (drawing: boolean) => void };
export function Coloring({ symbol, letterId, onDrawingChange }: ColoringProps) {
  const [ready, setReady] = useState(false);
  return ready ? <ColoringBoard symbol={symbol} letterId={letterId} onDrawingChange={onDrawingChange} /> : <ActivityVideoIntro letterId={letterId} lesson={2} onContinue={() => setReady(true)} />;
}
export function ColoringBoard({ symbol, letterId, onDrawingChange }: ColoringProps) {
  const { width: screenWidth } = useWindowDimensions();
  const teacher = useSession().session?.user.role === 'teacher';
  const samples = useMemo(() => (masks as unknown as Record<string, Point[]>)[symbol] ?? [], [symbol]);
  const image = letterImages[symbol];
  const [strokes, setStrokes] = useState<Stroke[]>([]); const [color, setColor] = useState('#fad656');
  const [percentage, setPercentage] = useState(0); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const covered = useRef(new Set<number>()); const live = useRef<Stroke | null>(null); const width = useRef(256); const saving = useRef(false);
  const state = useRef({ color, teacher, samples, onDrawingChange });
  useEffect(() => { state.current = { color, teacher, samples, onDrawingChange }; }, [color, teacher, samples, onDrawingChange]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') { live.current = null; onDrawingChange?.(false); }
    });
    return () => { subscription.remove(); onDrawingChange?.(false); };
  }, [onDrawingChange]);
  const stopDrawing = () => { live.current = null; state.current.onDrawingChange?.(false); };
  const startDrawing = () => { if (!state.current.teacher) state.current.onDrawingChange?.(true); };
  const persist = useCallback(async () => {
    if (saving.current || teacher || saved) return;
    saving.current = true; setIsSaving(true); setError(null);
    try { await saveProgress('write', letterId); setSaved(true); } catch (cause) { setError(errorMessage(cause)); } finally { saving.current = false; setIsSaving(false); }
  }, [letterId, teacher, saved]);
  const finishRef = useRef(persist);
  useEffect(() => { finishRef.current = persist; }, [persist]);
  const reset = () => {
    // Keep completed work visible until the automatic save has succeeded.
    if (teacher || strokes.length === 0 || saving.current || (!saved && samples.length > 0 && covered.current.size / samples.length >= 0.98)) return;
    live.current = null; covered.current.clear(); setStrokes([]); setPercentage(0);
  };
  const next = () => {
    if (teacher || !saved || saving.current || isSaving || error) return;
    router.replace(`/activity/position?letterId=${letterId}&symbol=${encodeURIComponent(symbol)}`);
  };
  const addPoint = (event: GestureResponderEvent) => {
    const point: Point = [event.nativeEvent.locationX * 256 / width.current, event.nativeEvent.locationY * 256 / width.current];
    if (!live.current) return;
    const previous = live.current.points.at(-1) ?? point;
    live.current.points.push(point);
    markCoverage(state.current.samples, covered.current, previous, point, 11);
    const stroke = { ...live.current, points: [...live.current.points] };
    setStrokes((value) => [...value.slice(0, -1), stroke]);
  };
  // PanResponder registers these callbacks; it does not invoke them during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => PanResponder.create({
    // Completion saves progress; it must not lock the student's drawing canvas.
    onStartShouldSetPanResponderCapture: () => !state.current.teacher,
    onMoveShouldSetPanResponderCapture: () => !state.current.teacher,
    onShouldBlockNativeResponder: () => !state.current.teacher,
    onStartShouldSetPanResponder: () => !state.current.teacher,
    onMoveShouldSetPanResponder: () => !state.current.teacher,
    onPanResponderGrant: (event) => { if (state.current.teacher) return; startDrawing(); const stroke: Stroke = { color: state.current.color, points: [] }; live.current = stroke; setStrokes((value) => [...value, stroke]); addPoint(event); },
    onPanResponderMove: addPoint,
    onPanResponderRelease: () => { stopDrawing(); const value = state.current.samples.length ? covered.current.size / state.current.samples.length * 100 : 0; setPercentage(value); if (value >= 98) void finishRef.current(); },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: stopDrawing,
    onPanResponderReject: stopDrawing,
  }));
  if (!image || !samples.length) return <Card><Label>لا يتوفر قالب لهذا الحرف.</Label></Card>;
  return <View style={{ backgroundColor: 'white', borderWidth: 4, borderColor: '#FAD656', borderRadius: 24, padding: screenWidth < 768 ? 16 : 28, gap: 20 }}><Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 20, lineHeight: 30, color: '#B47DDB', textAlign: 'center' }}>{teacher ? 'معاينة قالب الكتابة' : 'لوّن الحرف بإصبعك حتى تصل إلى 98٪'}</Text>
    <View {...responder.panHandlers} onTouchStart={startDrawing} onTouchEnd={(event) => { if (!event.nativeEvent.touches?.length) stopDrawing(); }} onTouchCancel={stopDrawing} onLayout={(event) => { width.current = event.nativeEvent.layout.width; }} style={{ width: '100%', maxWidth: screenWidth < 768 ? 340 : 420, aspectRatio: 1, alignSelf: 'center', backgroundColor: '#F8F9FA', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 24 }}>
      <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 256 256">
        <Defs><Mask id="letter"><SvgImage href={image} width={256} height={256} /></Mask></Defs>
        <G mask="url(#letter)"><Path d="M0 0H256V256H0Z" fill="#D6C5DF" />{strokes.map((stroke, index) => <Path key={index} d={stroke.points.length ? stroke.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + (stroke.points.length === 1 ? ' l.01 .01' : '') : ''} stroke={stroke.color} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}</G>
      </Svg>
    </View>
    {!teacher && <><Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 22, textAlign: 'center', color: '#652B82' }}>اختر لونك</Text><View style={[s.row, { justifyContent: 'center', gap: 10 }]}>{[['#fad656', 'أصفر'], ['#652b82', 'بنفسجي'], ['#3b82f6', 'أزرق'], ['#ef4444', 'أحمر'], ['#f97316', 'برتقالي'], ['#22c55e', 'أخضر']].map(([value, name]) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`لون ${name}`} accessibilityState={{ selected: value === color }} onPress={() => setColor(value)} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: value, borderWidth: 4, borderColor: value === color ? '#652B82' : '#FFFFFF', boxShadow: '0px 2px 6px #652B8230' }} />)}</View><Label>{Math.floor(percentage)}٪ {saved ? '— تم حفظ تقدمك ✓' : isSaving ? ' — جارٍ حفظ التقدم…' : ''}</Label><Notice error={error} retry={() => void persist()} /><Button label="إعادة التلوين" secondary disabled={strokes.length === 0 || isSaving || (percentage >= 98 && !saved)} onPress={reset} /><Button label="التالي: مكان الحرف" disabled={!saved || isSaving || !!error} onPress={next} /></>}
  </View>;
}
