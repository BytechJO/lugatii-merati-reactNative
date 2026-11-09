import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { GameConfig, GameType } from '../core/types';
import { gameCards, gameDescription } from '../data/game-cards';
import { lettersComp } from '../data/letters';

export function GamePreview({ config, gameType, symbol, onBack }: { config: GameConfig; gameType: GameType; symbol: string; onBack: () => void }) {
  const { width } = useWindowDimensions();
  const name = lettersComp.find((letter) => letter.arabic === symbol)?.name ?? symbol;
  const details = gameDescription(gameType, name);
  const card = gameCards[gameType];
  const imageWidth = Math.max(0, Math.min(width - (width >= 768 ? 160 : 88), 448));
  const items = config.items ?? config.words ?? [];
  const groups = [
    { title: 'الكلمات التي تبدأ بالحرف', words: config.correctWords ?? items.filter((item) => item.startsWithTarget).map((item) => item.word) },
    { title: 'كلمات الحروف الأخرى', words: config.wrongWords ?? items.filter((item) => !item.startsWithTarget).map((item) => item.word) },
  ];
  return <View style={{ width: '100%', minWidth: 0, gap: 24 }}>
    <Pressable accessibilityRole="button" onPress={onBack} style={{ alignSelf: 'flex-end', backgroundColor: 'white', borderRadius: 99, paddingHorizontal: 24, paddingVertical: 12 }}><Text style={styles.text}>العودة إلى الألعاب</Text></Pressable>
    <View style={{ backgroundColor: 'white', borderRadius: 24, padding: width < 768 ? 24 : 40, gap: 20, minWidth: 0, boxShadow: '0px 10px 24px #652B8218' }}>
      <Text accessibilityRole="text" style={[styles.text, { fontFamily: 'Tajawal-Bold', fontSize: 17 }]}>معاينة للمعلم فقط — اللعب متاح للطلاب</Text>
      <Text accessibilityRole="header" style={[styles.text, { fontSize: 28, fontFamily: 'Tajawal-Bold' }]}>{config.title ?? details.title}</Text>
      <Text style={styles.text}>{config.instruction ?? details.description}</Text>
      <Image source={card.image} accessibilityLabel={`صورة توضيحية: ${details.title}`} resizeMode="contain" style={{ width: imageWidth, height: imageWidth / card.ratio, maxWidth: '100%', alignSelf: 'center', borderRadius: 24 }} />
      {config.pairs ? <View style={{ gap: 12 }}>
        <Text accessibilityRole="header" style={styles.heading}>أزواج المطابقة</Text>
        <View style={styles.row}>{config.pairs.map((pair, index) => <View key={index} style={[styles.chip, { flexBasis: width >= 768 ? '46%' : '100%', flexGrow: 1 }]}><Text style={styles.text}>{pair.letter} — {pair.word}</Text></View>)}</View>
      </View> : <View style={[styles.row, { gap: 24 }]}>{groups.map((group) => <View key={group.title} style={{ flexBasis: width >= 768 ? '45%' : '100%', flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 12 }}>
        <Text accessibilityRole="header" style={styles.heading}>{group.title}</Text>
        <View style={styles.row}>{group.words.map((word, index) => <View key={index} style={styles.chip}><Text style={styles.text}>{word}</Text></View>)}</View>
      </View>)}</View>}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  text: { fontFamily: 'Tajawal', fontSize: 20, lineHeight: 30, color: '#652B82', textAlign: 'right', flexShrink: 1 },
  heading: { fontFamily: 'Tajawal-Bold', fontSize: 20, color: '#652B82', textAlign: 'right' },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, minWidth: 0, maxWidth: '100%' },
  chip: { backgroundColor: '#FAF5FF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, minWidth: 0, maxWidth: '100%' },
});
