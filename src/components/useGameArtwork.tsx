import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import type { ImageSourcePropType } from 'react-native';
import type { GameType } from '../core/types';
import { artwork } from '../data/design';

const images: Record<GameType, number[]> = {
  word_catch: [artwork.catchBackground],
  sorting: [artwork.sortingBackground, artwork.sortingWordCard],
  memory_match: [artwork.memoryBackground, artwork.memoryBack],
  balloon_pop: [artwork.balloonBackground, artwork.balloonRed, artwork.balloonPink, artwork.balloonYellow, artwork.balloonBlue],
};

// Download once before mounting timers/gestures, then use device-local image URIs.
export function useGameArtwork(gameType: GameType) {
  const [revision, setRevision] = useState(0);
  const key = gameType + ':' + revision;
  const [result, setResult] = useState<{ key: string; error: string | null }>({ key: '', error: null });
  useEffect(() => {
    let current = true;
    Asset.loadAsync(images[gameType]).then(() => {
      if (current) setResult({ key, error: null });
    }).catch(() => {
      if (current) setResult({ key, error: 'تعذر تحميل صور اللعبة. أعد المحاولة.' });
    });
    return () => { current = false; };
  }, [gameType, key]);
  return { loading: result.key !== key, error: result.key === key ? result.error : null, reload: () => setRevision((value) => value + 1) };
}

export function getGameImage(source: number): ImageSourcePropType {
  const asset = Asset.fromModule(source);
  return asset.localUri ? { uri: asset.localUri } : source;
}
