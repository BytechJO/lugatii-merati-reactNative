import { memoryMatch } from './games';
import type { GameConfig } from './types';
export interface MemoryCard { id: number; content: string; type: 'letter' | 'word' }
export function createMemoryRound(config: GameConfig) {
  const cards: MemoryCard[] = (config.pairs ?? []).flatMap((pair, index) => [
    { id: index * 2, content: pair.letter.trim(), type: 'letter' as const },
    { id: index * 2 + 1, content: pair.word, type: 'word' as const },
  ]);
  let flipped: number[] = []; const matched = new Set<number>(); let moves = 0; let finished = false;
  const snapshot = () => ({ flipped: [...flipped], matched: Array.from(matched), moves, score: matched.size / 2 * (config.scorePerMatch ?? 10), pending: flipped.length === 2 });
  return {
    cards,
    initial: snapshot(),
    choose(id: number) {
      if (finished || flipped.length >= 2 || flipped.includes(id) || matched.has(id) || !cards.some((card) => card.id === id)) return null;
      flipped.push(id); if (flipped.length === 2) moves++;
      return snapshot();
    },
    settle() {
      if (finished || flipped.length !== 2) return null;
      const [first, second] = flipped.map((id) => cards.find((card) => card.id === id)!);
      if (memoryMatch(first, second)) { matched.add(first.id); matched.add(second.id); }
      flipped = [];
      const won = matched.size === cards.length;
      finished = won || moves >= 10;
      const state = snapshot();
      return { state, outcome: finished ? { score: state.score, mistakes: 0, moves, won } : null };
    },
  };
}
