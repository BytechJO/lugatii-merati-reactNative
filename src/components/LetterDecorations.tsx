import { Image, View, useWindowDimensions } from 'react-native';
import { artwork } from '../data/design';

// Reserve space for the original artwork instead of positioning it over activities.
export function LetterDecorations({ dashboard = false }: { dashboard?: boolean }) {
  const { width } = useWindowDimensions();
  if (width < 768) return null;
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 170 }}>
    <Image source={artwork.dashboardTiger} resizeMode="contain" style={{ width: 150, height: 170, transform: dashboard ? [] : [{ scaleX: -1 }] }} />
    <Image source={dashboard ? artwork.pen : artwork.book} resizeMode="contain" style={{ width: 100, height: 120, transform: [{ rotate: '-6deg' }] }} />
  </View>;
}
