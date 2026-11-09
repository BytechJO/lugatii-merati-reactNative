import { useState } from 'react';
import { ImageBackground, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { artwork } from '../data/design';
import { lettersComp } from '../data/letters';

const options = [
  { value: 'fatha', label: 'فتحة', mark: 'َ' },
  { value: 'damma', label: 'ضمة', mark: 'ُ' },
  { value: 'kasra', label: 'كسرة', mark: 'ِ' },
  { value: 'sukun', label: 'سكون', mark: 'ْ' },
] as const;

export function TashkeelQuestion({ symbol, word, selected, feedback, disabled, teacher, onAnswer }: {
  symbol: string; word: string; selected: string | null; feedback: 'correct' | 'wrong' | null;
  disabled: boolean; teacher: boolean; onAnswer: (value: string) => void;
}) {
  const { width } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const name = lettersComp.find((letter) => letter.arabic === symbol)?.name ?? symbol;
  const columns = width < 768 ? 2 : 4;
  const gap = 12;
  const gridWidth = measuredWidth ?? Math.min(width - (width >= 768 ? 80 : 40), 850);
  const cellWidth = Math.max(0, Math.floor((gridWidth - gap * (columns - 1)) / columns));
  const rows = Array.from({ length: Math.ceil(options.length / columns) }, (_, index) => options.slice(index * columns, (index + 1) * columns));
  return <View style={{ width: '100%', minWidth: 0, gap: 16 }}>
    <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 200 }}>
      <Text style={{ fontFamily: 'Tajawal-Medium', color: '#28345F', fontSize: width < 768 ? 18 : 20, lineHeight: 30, textAlign: 'center' }}>ما هو تشكيل حرف ال{name} في هذه الكلمة؟</Text>
      <ImageBackground source={artwork.questionBubble} resizeMode="cover" style={{ width: 165, maxWidth: '100%', height: 100, backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0px 10px 24px #28345F20' }}>
        <Text style={{ fontFamily: 'Tajawal-Bold', fontSize: width < 768 ? 44 : 52, lineHeight: 72, color: '#28345F', textAlign: 'center' }}>{word}</Text>
      </ImageBackground>
      {feedback && <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={{ position: 'absolute', inset: 0, zIndex: 1, borderRadius: 24, backgroundColor: feedback === 'correct' ? '#FFB600' : '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: feedback === 'correct' ? '#652B82' : '#EF4444', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 38 }}>{feedback === 'correct' ? '✓' : '×'}</Text></View>
        <Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 24, color: feedback === 'correct' ? '#652B82' : '#DC2626', textAlign: 'center' }}>{feedback === 'correct' ? 'أحسنت!' : 'حاول مرة أخرى'}</Text>
      </View>}
    </View>
    <View onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)} style={{ width: '100%', minWidth: 0, gap }}>
      {rows.map((row, index) => <View key={index} style={{ width: '100%', minWidth: 0, flexDirection: 'row-reverse', justifyContent: 'center', gap }}>
        {row.map(({ value, label, mark }) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, selected: selected === value }} disabled={disabled} onPress={() => onAnswer(value)} style={({ pressed }) => ({ width: cellWidth, maxWidth: '100%', minWidth: 0, flexShrink: 1, borderRadius: 16, opacity: teacher ? 0.6 : pressed ? 0.8 : 1, boxShadow: selected === value ? '0px 12px 24px #F7A82459' : '0px 8px 18px #28345F1A' })}>
          <LinearGradient colors={selected === value ? ['#FFE68C', '#FFB600'] : ['#FFFFFF', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 96, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, gap: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Tajawal-Medium', fontSize: width < 768 ? 16 : 20, color: '#28345F', textAlign: 'center' }}>{label}</Text>
            <Text style={{ fontSize: width < 768 ? 28 : 34, lineHeight: 44, color: '#28345F', textAlign: 'center' }}>{symbol === 'أ' && value === 'kasra' ? 'إِ' : symbol + mark}</Text>
          </LinearGradient>
        </Pressable>)}
      </View>)}
    </View>
  </View>;
}
