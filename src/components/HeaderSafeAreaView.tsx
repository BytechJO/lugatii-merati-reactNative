import type { ComponentProps } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';
import { artwork } from '../data/design';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Paint behind system icons without changing safe-area spacing or body colors.
export function HeaderSafeAreaView({
  headerBackground,
  headerArtwork,
  children,
  ...props
}: ComponentProps<typeof SafeAreaView> & { headerBackground?: string; headerArtwork?: 'progress' }) {
  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const progressHeight = width < 768 ? 200 : Math.max(180, (width * 160) / 902);
  const imageLayout = { position: 'absolute' as const, top: 0, left: 0, width: width < 768 ? (progressHeight * 1600) / 293 : width, height: progressHeight + top };
  return (
    <SafeAreaView {...props}>
      {children}
      {(headerBackground || headerArtwork) && top > 0 && (
        <View
          pointerEvents="none"
          accessible={false}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: top, backgroundColor: headerBackground, overflow: 'hidden' }}
        >
          {headerArtwork && <Image source={artwork.progressHeader} resizeMode="cover" style={imageLayout} />}
        </View>
      )}
    </SafeAreaView>
  );
}
