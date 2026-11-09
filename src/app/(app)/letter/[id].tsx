import { router, useLocalSearchParams } from 'expo-router';
import { Label, Loading, Notice, Page } from '../../../components/ui';
import { useResource } from '../../../core/useResource';
import type { Letter, Activity } from '../../../core/types';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { artwork, letterArtwork } from '../../../data/design';
import { lettersComp } from '../../../data/letters';
import { LetterDecorations } from '../../../components/LetterDecorations';
import { useState } from 'react';
const activityLabels: [Activity, string][] = [['learn', 'تعلم الحرف'], ['write', 'اكتب الحرف'], ['position', 'مكان الحرف'], ['tashkeel', 'تشكيل الحرف'], ['video', 'شاهد وتعلم'], ['game', 'العب وتعلم']];
export default function LetterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resource = useResource<{ data: Letter[] }>('/letters/getAllLetter');
  const letter = resource.data?.data.find((item) => item.id === Number(id));
  const { width } = useWindowDimensions();
  const art = letterArtwork[lettersComp.findIndex((item) => item.arabic === letter?.symbol)];
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const gridWidth = measuredWidth ?? Math.min(width - (width >= 768 ? 80 : 40), 660);
  const columns = width >= 768 ? 3 : 2;
  const gap = width >= 768 ? 24 : 16;
  const cellWidth = Math.max(0, Math.floor((gridWidth - gap * (columns - 1)) / columns));
  const cardWidth = Math.floor(Math.min(cellWidth, 220) * 0.95);
  const cardHeight = Math.round(cardWidth * 498 / 500);
  const rows = Array.from({ length: Math.ceil(activityLabels.length / columns) }, (_, index) => activityLabels.slice(index * columns, (index + 1) * columns));
  return <Page title="" headerVariant="transparent" onBack={() => router.replace('/letters')}>{resource.loading ? <Loading /> : resource.error ? <Notice error={resource.error} retry={resource.reload} /> : !letter ? <Label>الحرف غير موجود.</Label> : <>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Image source={artwork.star} resizeMode="contain" style={{ width: 32, height: 40 }} />
      <View accessibilityLabel={`حرف ${letter.name}`} style={{ width: width < 768 ? 130 : 165, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={artwork.letterContainer} resizeMode="contain" style={{ position: 'absolute', width: '100%', height: '100%' }} />
        {art ? <Image source={art} resizeMode="contain" style={{ width: 80, height: width < 768 ? 72 : 90 }} /> : <Text style={{ fontSize: 60, color: '#652B82' }}>{letter.symbol}</Text>}
      </View>
      <Image source={artwork.star} resizeMode="contain" style={{ width: 32, height: 40, transform: [{ rotate: '20deg' }] }} />
    </View>
    <View onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)} style={{ width: '100%', maxWidth: 660, minWidth: 0, alignSelf: 'center', gap, marginTop: 10 }}>
      {rows.map((row, index) => <View key={index} style={{ width: '100%', minWidth: 0, flexDirection: 'row-reverse', justifyContent: 'center', gap }}>
        {row.map(([kind, label]) => <View key={kind} style={{ width: cellWidth, minWidth: 0, flexShrink: 1, alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => router.push(`/activity/${kind}?letterId=${letter.id}&symbol=${encodeURIComponent(letter.symbol)}`)} style={({ pressed }) => ({ width: cardWidth, height: cardHeight, maxWidth: '100%', opacity: pressed ? .8 : 1 })}>
            <Image source={artwork[kind]} resizeMode="contain" style={{ width: cardWidth, height: cardHeight, maxWidth: '100%' }} />
          </Pressable>
        </View>)}
      </View>)}
    </View>
    <LetterDecorations />
  </>}</Page>;
}
