import type { GameType } from '../core/types';
import { artwork } from './design';

export const gameCards = {
  word_catch: { image: artwork.catchCard, ratio: 720 / 387 },
  sorting: { image: artwork.sortCard, ratio: 715 / 387 },
  memory_match: { image: artwork.memoryCard, ratio: 715 / 387 },
  balloon_pop: { image: artwork.balloonCard, ratio: 715 / 393 },
};
export function gameDescription(type: GameType, letterName: string) {
  const descriptions = {
    word_catch: { title: `اصطد كلمات ال${letterName}`, description: `اصطد الكلمات التي تبدأ بحرف ال${letterName} قبل أن تختفي` },
    sorting: { title: `صنف كلمات ال${letterName}`, description: `اسحب الكلمات للمكان الصحيح: ${letterName} أم حروف أخرى` },
    memory_match: { title: `ذاكرة ال${letterName}`, description: `اقلب البطاقات وطابق حرف ال${letterName} مع الكلمات` },
    balloon_pop: { title: `بالونات ال${letterName}`, description: `افرقع البالونات التي تحتوي على كلمات تبدأ ب ${letterName}` },
  };
  return descriptions[type];
}
