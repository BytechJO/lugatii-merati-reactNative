import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { useAudioPlayer } from 'expo-audio';
import { Button, Label, Notice } from './ui';
import { ActivityVideoIntro } from './ActivityVideoIntro';
import { lettersComp } from '../data/letters';
import { errorMessage, saveProgress } from '../core/api';
import { useSession } from '../core/session';
export function Learning({ symbol, letterId }: { symbol: string; letterId: number }) {
  const content = lettersComp.find((item) => item.arabic === symbol);
  const [stage, setStage] = useState(0);
  const { width } = useWindowDimensions();
  const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null); const [ended, setEnded] = useState(false);
  const teacher = useSession().session?.user.role === 'teacher';
  const player = useAudioPlayer(null);
  const playSound = (audio: number | string | undefined, text: string) => {
    void Speech.stop(); player.pause();
    if (typeof audio === 'number') { player.replace(audio); player.play(); }
    else Speech.speak(text, { language: 'ar' });
  };
  useEffect(() => () => { void Speech.stop(); }, []);
  const save = async () => {
    if (teacher || saved) return;
    try { setError(null); await saveProgress('learn', letterId); setSaved(true); } catch (cause) { setError(errorMessage(cause)); }
  };
  return <>{stage === 0 ? <ActivityVideoIntro letterId={letterId} lesson={1} onContinue={() => setStage(1)} onEnded={() => { setEnded(true); void save(); }} /> : <>
    <View style={{ backgroundColor: 'white', borderWidth: 4, borderColor: '#FAD656', borderRadius: 24, padding: width < 768 ? 16 : 28, gap: 24 }}>
      <View style={{ flexDirection: width >= 768 ? 'row-reverse' : 'column', gap: 24, alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="استمع إلى الحرف" onPress={() => playSound(content?.audio, symbol)} style={{ width: width >= 768 ? '40%' : '100%', alignItems: 'center', gap: 12 }}>
          {content?.image && <Image source={content.image} resizeMode="contain" style={{ width: '100%', height: width < 768 ? 170 : 240 }} />}
          <Text style={{ fontFamily: 'Tajawal-Bold', color: '#652B82', fontSize: 26, textAlign: 'center' }}>حرف ال{content?.name ?? symbol} 🔊</Text>
        </Pressable>
        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: width >= 768 ? '55%' : '100%' }}>
          {content?.extraImages?.map((item) => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`استمع: ${item.label}`} onPress={() => playSound(item.audio, item.label)} style={({ pressed }) => ({ width: '46%', minWidth: 0, borderRadius: 16, backgroundColor: pressed ? '#FFF5CF' : '#FFFFFF', padding: 6, alignItems: 'center', gap: 6 })}>
            <Image source={item.img} resizeMode="contain" style={{ width: '100%', height: width < 768 ? 105 : 130 }} />
            <Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 20, color: '#652B82', textAlign: 'center' }}>{item.label}</Text>
          </Pressable>)}
        </View>
      </View>
      {!content?.extraImages?.length && <Label>{content?.emoji} {content?.example}</Label>}
    </View>
    <Button label="العودة إلى الفيديو" secondary onPress={() => { player.pause(); void Speech.stop(); setStage(0); }} />
  </>}
  <Notice error={error} retry={() => void save()} />{saved && <Label>تم حفظ تقدمك ✓</Label>}
  {!teacher && ended && !saved && <Button label="حفظ التقدم" onPress={() => void save()} />}</>;
}
