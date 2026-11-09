import { useCallback, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { artwork } from '../data/design';

// Reference: frontend/src/components/SuccessJoin.tsx.
export function ClassroomWelcome({ name }: { name: string }) {
  const { width } = useWindowDimensions();
  const tablet = width >= 768;
  const sceneWidth = Math.max(0, Math.min(width - (tablet ? 80 : 40), 770));
  const sceneHeight = sceneWidth * 0.62;
  const portraitWidth = sceneWidth * 0.62;
  const [float] = useState(() => new Animated.Value(0));

  useFocusEffect(useCallback(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 2200, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2200, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [float]));

  const decorations = [
    { image: artwork.book, left: 0.02, top: 0.07, size: 0.15, color: '#ECC9FA' },
    { image: artwork.ain, left: 0.84, top: 0.22, size: 0.12, color: '#EFDDFF' },
    { image: artwork.lamb, left: 0.01, top: 0.65, size: 0.12, color: '#EFDDFF' },
    { image: artwork.pen, left: 0.86, top: 0.68, size: 0.12, color: '#EFDDFF' },
    { image: artwork.star, left: 0.21, top: 0.22, size: 0.055, color: 'transparent' },
    { image: artwork.star, left: 0.81, top: 0.54, size: 0.055, color: 'transparent' },
  ];

  return (
    <View style={styles.content}>
      <Text style={[styles.title, { fontSize: tablet ? 35 : 25 }]}>
        استعد لمغامرة تعليمية رائعة
      </Text>
      <Text style={styles.subtitle}>انت مسجل في صف</Text>
      <Text style={[styles.className, { fontSize: tablet ? 28 : 24 }]}>{name}</Text>
      <View style={{ width: sceneWidth, height: sceneHeight }}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={{ position: 'absolute', width: portraitWidth, height: sceneHeight, left: (sceneWidth - portraitWidth) / 2, overflow: 'hidden' }}>
            <Svg viewBox="0 0 528 475" width={portraitWidth} height={sceneHeight}>
              <Path d="M254.999 5C359.999 -10 364.999 101 450.999 149C584.999 219 534.999 348 414.999 416C306.999 495 186.999 490 95.9993 409C-27.0007 315 -19.0007 219 73.9993 162C155.999 118 160.999 10 254.999 5Z" fill="#FFBABC" />
            </Svg>
            {/* Explicit dimensions override the PNG's intrinsic size on Android. */}
            <Image source={artwork.successClass} resizeMode="contain"
              style={{ position: 'absolute', top: 0, left: 0, width: portraitWidth, height: sceneHeight }} />
          </View>
          {decorations.map((item, index) => (
            <Animated.View key={index} style={{
              position: 'absolute', left: sceneWidth * item.left, top: sceneHeight * item.top,
              width: sceneWidth * item.size, height: sceneWidth * item.size,
              borderRadius: sceneWidth * item.size / 2, backgroundColor: item.color,
              padding: sceneWidth * item.size * 0.16,
              transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, index % 2 ? -5 : 5] }) }],
            }}>
              <Image source={item.image} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
            </Animated.View>
          ))}
          <View style={[styles.dot, { left: '0%', top: '48%' }]} />
          <View style={[styles.dot, { right: '20%', bottom: '7%' }]} />
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/letters')}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}>
        <LinearGradient colors={['#FFDD55', '#FDC333']} style={styles.buttonFill}>
          <Text style={styles.buttonText}>إنضم إلى الصف</Text>
        </LinearGradient>
      </Pressable>
      {tablet && <Image source={artwork.dashboardTiger} resizeMode="contain" style={styles.tiger} accessible={false} />}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', alignItems: 'center', gap: 16, paddingTop: 8, paddingBottom: 24 },
  title: { fontFamily: 'Cairo', color: '#570A92', textAlign: 'center', flexShrink: 1 },
  subtitle: { fontFamily: 'Tajawal-Medium', fontSize: 20, color: '#A664D3', textAlign: 'center' },
  className: { fontFamily: 'Tajawal-Bold', color: '#570A92', textAlign: 'center', maxWidth: '100%' },
  dot: { position: 'absolute', width: 13, height: 13, borderRadius: 7, backgroundColor: '#BB8AE5' },
  button: { width: '100%', maxWidth: 400, borderRadius: 40, shadowColor: '#652B82', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 5 },
  buttonFill: { borderRadius: 40, paddingHorizontal: 22, paddingVertical: 12, alignItems: 'center' },
  buttonText: { fontFamily: 'Cairo-Bold', fontSize: 22, color: '#570A92', textAlign: 'center' },
  tiger: { width: 160, height: 180, alignSelf: 'flex-start', marginTop: 4 },
});
