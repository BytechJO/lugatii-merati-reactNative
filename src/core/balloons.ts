import { wordItems } from './games';
import type { GameConfig, WordItem } from './types';
export interface FloatingBalloon extends WordItem { id: number; offset: number; image: number; duration: number; popped: boolean }
export function balloonSettings(config: GameConfig, score: number) {
  const level = Math.floor(score / 50) + 1;
  return {
    level,
    interval: Math.max(config.spawn?.minInterval ?? 800, (config.spawn?.baseInterval ?? 1500) - level * (config.spawn?.levelFactor ?? 100)),
    duration: Math.max(2, 14 - level * 0.3) * 1000,
  };
}
export function spawnBalloon(config: GameConfig, score: number, id: number, random = Math.random): FloatingBalloon | null {
  const items = wordItems(config);
  if (!items.length) return null;
  return { ...items[Math.floor(random() * items.length)], id, offset: random(), image: Math.floor(random() * 4), duration: balloonSettings(config, score).duration, popped: false };
}
