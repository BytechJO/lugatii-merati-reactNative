import { useEffect, useState } from 'react';
import { Animated, useWindowDimensions } from 'react-native';
export function Mascot() {
  const { width } = useWindowDimensions();
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -8, duration: 1400, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 1400, useNativeDriver: true }),
    ]));
    if (width >= 768) animation.start();
    return () => animation.stop();
  }, [y, width]);
  if (width < 768) return null;
  return <Animated.Image source={require('../../assets/tiger.png')} accessibilityIgnoresInvertColors resizeMode="contain" style={{ height: 160, width: 180, alignSelf: 'center', transform: [{ translateY: y }] }} />;
}
