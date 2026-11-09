import type { GameConfig } from './types';
export interface DropRect { x: number; y: number; width: number; height: number }
export function sortingZoneAt(zones: readonly (DropRect | null)[], x: number, y: number) {
  return zones.findIndex((rect) => rect && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height);
}
export function createSortingRound(config: GameConfig) {
  const items = (config.items ?? []).slice(0, 10).map((item, id) => ({ ...item, id }));
  const placed = new Set<number>(); let mistakes = 0; let moves = 0; let finished = false;
  return {
    items,
    drop(id: number, target: boolean) {
      const item = items.find((value) => value.id === id);
      if (!item || placed.has(id) || finished) return null;
      moves++;
      const correct = item.startsWithTarget === target;
      if (correct) placed.add(id); else mistakes++;
      const won = placed.size === items.length;
      finished = won || mistakes >= (config.maxMistakes ?? 3);
      const score = placed.size * (config.scorePerCorrect ?? 10);
      return { correct, placed: Array.from(placed), moves, mistakes, score, outcome: finished ? { score, mistakes, won } : null };
    },
  };
}
