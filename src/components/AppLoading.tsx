import { useEffect, useState } from 'react';
import { Animated, AppState, Image, ImageBackground, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { artwork } from '../data/design';

// Original reference: frontend/src/components/SplashScreen.tsx.
export function LoadingDots({ compact = false }: { compact?: boolean }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1, duration: 1400, useNativeDriver: true, isInteraction: false,
    }));
    const update = (state: string) => {
      animation.stop();
      if (state === 'active') {
        progress.setValue(0);
        animation.start();
      }
    };
    update(AppState.currentState);
    const subscription = AppState.addEventListener('change', update);
    return () => { subscription.remove(); animation.stop(); };
  }, [progress]);
  return <View accessibilityRole="progressbar" accessibilityLabel="جارٍ التحميل" accessibilityState={{ busy: true }} style={[styles.dots, compact && { gap: 4 }]}>
    {[0, 1, 2].map((index) => <Animated.View key={index} style={{
      width: compact ? 5 : 9, height: compact ? 5 : 9, borderRadius: 5, backgroundColor: '#FAD656',
      opacity: progress.interpolate({ inputRange: [0, 0.15 + index * 0.18, 0.35 + index * 0.18, 1], outputRange: [0.5, 1, 0.5, 0.5] }),
      transform: [{ scale: progress.interpolate({ inputRange: [0, 0.15 + index * 0.18, 0.35 + index * 0.18, 1], outputRange: [1, 1.5, 1, 1] }) }],
    }} />)}
  </View>;
}

export function AppLoading({ fullScreen = false, fontsReady = true }: { fullScreen?: boolean; fontsReady?: boolean }) {
  const { width, height } = useWindowDimensions();
  const tablet = width >= 768;
  const short = height < 500;
  const tigerSize = short ? 100 : tablet ? 230 : 160;
  const font = (bold = false) => fontsReady ? { fontFamily: bold ? 'Tajawal-Bold' : 'Tajawal-Medium' } : {};
  return <ImageBackground source={artwork.splashBackground} resizeMode="cover" style={[styles.panel, fullScreen && styles.fullScreen]}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <Image source={artwork.book} resizeMode="contain" style={[styles.book, { width: tablet ? 70 : 44, height: tablet ? 70 : 44 }]} />
      <Image source={artwork.splashPen} resizeMode="contain" style={[styles.pen, { width: tablet ? 70 : 44, height: tablet ? 70 : 44 }]} />
      <Image source={artwork.star} resizeMode="contain" style={styles.star} />
      <View style={styles.pinkDot} />
      <View style={styles.purpleDot} />
    </View>
    <View style={[styles.content, { paddingVertical: short ? 20 : 40, gap: short ? 12 : 20 }]}>
      <Image source={artwork.tiger} accessible={false} resizeMode="contain" style={{ width: tigerSize, height: tigerSize }} />
      <View style={styles.titleRow}>
        <View style={styles.goldDot} />
        <Text style={[styles.title, font(true), { fontSize: tablet ? 46 : 34 }]}>مرآتي لغتي</Text>
        <View style={styles.goldDot} />
      </View>
      <Text style={[styles.subtitle, font(), { fontSize: tablet ? 25 : 20 }]}>رحلة تعلم اللغة العربية</Text>
      <Text style={[styles.caption, font(), { fontSize: tablet ? 21 : 17 }]}>إستعد لمغامرة تعليمية رائعة</Text>
      <LoadingDots />
    </View>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', minWidth: 0, minHeight: 340, flexGrow: 1, justifyContent: 'center', backgroundColor: '#EEE5FF', overflow: 'hidden' },
  fullScreen: { flex: 1 },
  content: { width: '100%', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, maxWidth: '100%' },
  title: { color: '#4A1B73', textAlign: 'center', flexShrink: 1 },
  goldDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#FECB27' },
  subtitle: { color: '#9F70D2', textAlign: 'center' },
  caption: { color: '#653A92', textAlign: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingVertical: 8 },
  book: { position: 'absolute', top: 16, right: 16 },
  pen: { position: 'absolute', top: 16, left: 16 },
  star: { position: 'absolute', left: '8%', top: '48%', width: 24, height: 24 },
  pinkDot: { position: 'absolute', left: '10%', top: '25%', width: 12, height: 12, borderRadius: 6, backgroundColor: '#F5A9A0' },
  purpleDot: { position: 'absolute', right: '10%', bottom: '18%', width: 11, height: 11, borderRadius: 6, backgroundColor: '#8B5FA8' },
});
