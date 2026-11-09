import { wordItems } from './games';
import type { GameConfig, WordItem } from './types';

export interface FallingWord extends WordItem { id: number; lane: number; lanes: number; offset: number; duration: number }
export interface CatchOutcome { score: number; won: boolean; mistakes: number; moves?: number }

export function catchBatch(config: GameConfig, correct: number, nextId: number, random = Math.random): FallingWord[] {
  const items = wordItems(config);
  if (!items.length) return [];
  const count = Math.floor(random() * 3) + 1;
  const multiplier = correct < 3 ? 1 : correct < 6 ? 1.2 : correct < 9 ? 1.4 : 1.6;
  return Array.from({ length: count }, (_, lane) => ({
    ...items[Math.floor(random() * items.length)],
    id: nextId + lane, lane, lanes: count, offset: random(),
    duration: ((config.minSpeed ?? 2) + random() * ((config.maxSpeed ?? 5) - (config.minSpeed ?? 2))) * 5000 / multiplier,
  }));
}

export function createCatchRound(config: GameConfig) {
  let correct = 0; let mistakes = 0; let finished = false;
  const resolved = new Set<number>();
  return {
    resolve(word: Pick<FallingWord, 'id' | 'startsWithTarget'>, pressed: boolean) {
      if (finished || resolved.has(word.id)) return null;
      resolved.add(word.id);
      if (pressed && word.startsWithTarget) correct++;
      if ((pressed && !word.startsWithTarget) || (!pressed && word.startsWithTarget)) mistakes++;
      const score = correct * (config.scorePerCorrect ?? 10);
      finished = correct >= 10 || mistakes >= (config.maxMistakes ?? 3);
      return { correct, mistakes, score, outcome: finished ? { score, mistakes, won: correct >= 10 } : null };
    },
  };
}
