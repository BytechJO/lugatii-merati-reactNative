import { useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Loading, Notice } from './ui';
import { useResource } from '../core/useResource';
import { useSession } from '../core/session';
import { availableGameTypes, gameTypes } from '../core/games';
import { gameCards, gameDescription } from '../data/game-cards';
import { lettersComp } from '../data/letters';
import { artwork } from '../data/design';

export function LetterGameCatalog({ letterId, symbol }: { letterId: number; symbol: string }) {
  const teacher = useSession().session?.user.role === 'teacher';
  const { width } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const resource = useResource<{ data: { game_type?: unknown }[] }>(`/lessons/game-lesson/${letterId}/letter-id`);
  const name = lettersComp.find((letter) => letter.arabic === symbol)?.name ?? symbol;
  const available = availableGameTypes(Array.isArray(resource.data?.data) ? resource.data.data : []);
  const columns = width >= 768 ? 2 : 1;
  const gridWidth = measuredWidth ?? Math.min(width - (width >= 768 ? 80 : 40), 850);
  const cardWidth = Math.max(0, Math.floor((gridWidth - (columns - 1) * 20) / columns));
  const rows = Array.from({ length: Math.ceil(gameTypes.length / columns) }, (_, index) => gameTypes.slice(index * columns, (index + 1) * columns));
  if (resource.loading) return <Loading />;
  if (resource.error && resource.status !== 404) return <Notice error={resource.error} retry={resource.reload} />;
  return <View style={{ gap: 24, width: '100%', minWidth: 0 }}>
    <Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 20, lineHeight: 30, color: '#9830B7', textAlign: 'center' }}>{teacher ? `اختر لعبة لمعاينة محتواها لحرف ال${name}` : `اختر لعبة للبدء في التعلم والمرح مع حرف ال${name}`}</Text>
    <View onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)} style={{ width: '100%', minWidth: 0, gap: 20 }}>
      {rows.map((row, index) => <View key={index} style={{ width: '100%', flexDirection: 'row-reverse', justifyContent: 'center', gap: 20 }}>
        {row.map((type) => {
          const enabled = available.includes(type);
          const card = gameCards[type];
          const details = gameDescription(type, name);
          const height = Math.round(cardWidth / card.ratio);
          return <Pressable key={type} accessibilityRole="button" accessibilityLabel={`${details.title}: ${details.description}`} accessibilityState={{ disabled: !enabled }} disabled={!enabled} onPress={() => { if (enabled) router.push(`/game/${type}?letterId=${letterId}&symbol=${encodeURIComponent(symbol)}`); }} style={({ pressed }) => ({ width: cardWidth, height, maxWidth: '100%', minWidth: 0, flexShrink: 1, borderRadius: 28, overflow: 'hidden', opacity: !enabled ? 0.45 : pressed ? 0.8 : 1 })}>
            <Image source={card.image} resizeMode="contain" style={{ width: cardWidth, height, maxWidth: '100%' }} />
            <View pointerEvents="none" style={{ position: 'absolute', top: '6%', left: '5%', right: '5%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ minWidth: 0, flexShrink: 1, color: '#6D2181', fontFamily: 'Tajawal-Bold', fontSize: width < 768 ? 20 : 24, textAlign: 'right' }}>{details.title}</Text>
              {teacher ? <View style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 99, backgroundColor: '#652B82', maxWidth: '48%' }}><Text style={{ color: 'white', fontFamily: 'Tajawal-Bold', fontSize: 14, textAlign: 'center' }}>معاينة اللعبة</Text></View> : <Image source={artwork.gameStart} resizeMode="contain" style={{ width: 90, height: 44, maxWidth: '45%' }} />}
            </View>
            {!enabled && <Text style={{ position: 'absolute', bottom: 8, alignSelf: 'center', backgroundColor: 'white', color: '#652B82', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, fontFamily: 'Tajawal-Bold' }}>غير متاحة لهذا الحرف حالياً</Text>}
          </Pressable>;
        })}
      </View>)}
    </View>
  </View>;
}
