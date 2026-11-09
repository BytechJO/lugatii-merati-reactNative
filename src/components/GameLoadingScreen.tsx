import { useEffect, useState } from 'react';
import { Animated, Easing, Image, ImageBackground, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { VerticalScrollView } from './VerticalScrollView';
import { artwork } from '../data/design';
import type { GameType } from '../core/types';

// Match WordCatchWelcom.tsx and loading-screens.css in the original frontend.
export function GameLoadingScreen({ gameType }: { gameType: GameType }) {
  const { width, height } = useWindowDimensions();
  const images = { word_catch: artwork.catchLoading, sorting: artwork.sortingLoading, memory_match: artwork.memoryLoading, balloon_pop: artwork.balloonLoading };
  const source = images[gameType];
  const image = Image.resolveAssetSource(source);
  const [panelWidth, setPanelWidth] = useState(Math.min(720, Math.max(0, width - 32)));
  const [dots, setDots] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));
  const landscape = width > height && height < 500;
  const innerWidth = Math.max(0, Math.min(panelWidth, width - 32, 720) - 2);
  const artWidth = landscape ? innerWidth * 1.35 / 2.35 : innerWidth;
  const statusWidth = landscape ? innerWidth - artWidth : innerWidth;
  const barWidth = Math.max(0, Math.min(260, statusWidth - (landscape ? 32 : 48)));
  const fontSize = Math.max(16, Math.min(22, width * 0.025));
  useEffect(() => {
    const timer = setInterval(() => setDots((value) => (value + 1) % 4), 450);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false, isInteraction: false }),
      Animated.timing(progress, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false, isInteraction: false }),
    ]));
    animation.start(); return () => animation.stop();
  }, [progress]);
  return <ImageBackground source={source} resizeMode="cover" blurRadius={18} style={{ flex: 1, backgroundColor: '#E6DBFF' }}>
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: '#EEE4FFA6' }} />
    <SafeAreaView style={{ flex: 1 }}>
      <VerticalScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: landscape ? 12 : 20 }}>
        <View onLayout={(event) => setPanelWidth(event.nativeEvent.layout.width)} style={{ width: '100%', maxWidth: 720, minWidth: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#FFFFFFD9', borderRadius: landscape ? 22 : 28, overflow: 'hidden', boxShadow: '0px 20px 60px #4B1A7A33' }}>
          <View style={{ flexDirection: landscape ? 'row' : 'column', alignItems: 'center', width: '100%', minWidth: 0 }}>
            <Image source={source} accessible={false} resizeMode="contain" style={{ width: artWidth, height: artWidth * image.height / image.width, maxWidth: '100%' }} />
            <LinearGradient colors={['#FFFFFF', '#FAF5FF']} style={{ width: statusWidth, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', paddingTop: landscape ? 16 : 22, paddingHorizontal: landscape ? 16 : 24, paddingBottom: landscape ? 16 : 26, gap: landscape ? 10 : 14 }}>
              <Text style={{ fontFamily: 'Tajawal-Medium', fontSize: 14, color: '#9466B5', textAlign: 'center' }}>هيا نلعب ونتعلم</Text>
              <Text accessibilityRole="text" style={{ fontFamily: 'Tajawal-Bold', fontSize, lineHeight: fontSize * 1.5, color: '#652B82', textAlign: 'center' }}>جاري تحميل اللعبة{'.'.repeat(dots)}</Text>
              <View accessibilityRole="progressbar" accessibilityLabel="جاري تحميل اللعبة" accessibilityState={{ busy: true }} style={{ width: barWidth, maxWidth: '100%', height: 10, borderRadius: 99, backgroundColor: '#FFFFFFA6', overflow: 'hidden', boxShadow: '0px 1px 4px #00000026' }}>
                <Animated.View style={{ height: 10, width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, barWidth] }), borderRadius: 99, overflow: 'hidden' }}><LinearGradient colors={['#7C3AED', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: barWidth, height: 10 }} /></Animated.View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </VerticalScrollView>
    </SafeAreaView>
  </ImageBackground>;
}
