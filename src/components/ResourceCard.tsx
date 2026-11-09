import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { artwork } from '../data/design';

export interface Resource { id: number; title: string; description: string; type: string; pages: string; size: string; icon: string; url?: string }
const icons: Record<string, number> = { cheatsheet: artwork.resourceCheatsheet, alphabet_Card: artwork.resourceAlphabet, activeties: artwork.resourceActivities, planImg: artwork.resourcePlan, wordCard: artwork.resourceWords, evaluation: artwork.resourceEvaluation };

// Matches frontend/src/components/ResourceCard.tsx, including its PDF banner.
export function ResourceCard({ resource, width, phone, onDownload }: { resource: Resource; width: number; phone: boolean; onDownload: (resource: Resource) => void }) {
  const bannerHeight = width * 157 / 500;
  return <View style={[styles.card, { width }]}>
    <View style={{ height: bannerHeight }}>
      <Image source={artwork.resourceHeader} resizeMode="contain" style={{ width, height: bannerHeight }} />
      <Text style={[styles.type, { top: bannerHeight * .5 - 14 }]}>{resource.type}</Text>
      <Text style={[styles.title, { top: bannerHeight * .68 - 12 }]}>{resource.title}</Text>
    </View>
    <Image source={icons[resource.icon]} resizeMode="contain" style={{ width: phone ? 140 : 190, height: phone ? 130 : 170, marginVertical: 14, alignSelf: 'center' }} />
    <Text style={styles.description}>{resource.description}</Text>
    <View style={styles.footer}>
      <Text style={[styles.meta, { paddingRight: 20 }]}>{resource.pages}</Text>
      <View style={styles.downloadInfo}><Text style={styles.meta}>{resource.size}</Text><Pressable accessibilityRole="button" accessibilityLabel={`تحميل ${resource.title}`} onPress={() => onDownload(resource)} style={({ pressed }) => [styles.download, pressed && { backgroundColor: '#7A3A9A' }]}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></Svg>
      </Pressable></View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#FAFAFA', borderRadius: 20, overflow: 'hidden', boxShadow: '0px 6px 18px rgba(40, 52, 95, 0.08)' },
  type: { position: 'absolute', left: 24, fontFamily: 'Tajawal-ExtraBold', fontSize: 26, color: '#4E4E4E', letterSpacing: 1 },
  title: { position: 'absolute', right: 7, maxWidth: '72%', fontFamily: 'Tajawal-Medium', fontSize: 18, lineHeight: 24, color: '#4E4E4E', textAlign: 'right' },
  description: { fontFamily: 'Tajawal-Medium', fontSize: 18, color: '#4E4E4E', textAlign: 'center', paddingHorizontal: 16 },
  footer: { minHeight: 44, marginTop: 12, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontFamily: 'Tajawal', fontSize: 13, color: '#8A8A8A' },
  downloadInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  download: { width: 52, minHeight: 44, backgroundColor: '#652B82', borderTopRightRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
