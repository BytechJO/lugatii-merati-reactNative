import type { GameConfig, WordItem } from './types';
export const gameTypes = ['word_catch', 'sorting', 'memory_match', 'balloon_pop'] as const;
export function availableGameTypes(records: readonly { game_type?: unknown }[]) {
  const available = new Set(records.map((record) => record.game_type));
  return gameTypes.filter((type) => available.has(type));
}
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function wordItems(config: GameConfig): WordItem[] {
  return config.items ?? config.words ?? [
    ...(config.correctWords ?? []).map((word) => ({ word, startsWithTarget: true })),
    ...(config.wrongWords ?? []).map((word) => ({ word, startsWithTarget: false })),
  ];
}
export function memoryMatch(a: { type: string; content: string }, b: { type: string; content: string }) {
  return a.type !== b.type && (a.type === 'letter' ? b.content.startsWith(a.content) : a.content.startsWith(b.content));
}
