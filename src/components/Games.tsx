import type { GameType } from '../core/types';
export { LetterGameCatalog as Games } from './LetterGameCatalog';
export const gameLabels: Record<GameType, string> = {
  word_catch: "اصطد الكلمات",
  sorting: "صنّف الكلمات",
  memory_match: "ذاكرة الحروف",
  balloon_pop: "بالونات الحروف",
};
