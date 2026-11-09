export type Role = 'student' | 'teacher';
export interface User { id: number; username: string; role: Role }
export interface Session { token: string; user: User }
export interface Letter { id: number; symbol: string; name: string; example?: string; emoji?: string; order_index: number }
export interface Classroom { id: number; name: string; code: string; students_count?: number }
export type Activity = 'learn' | 'write' | 'position' | 'tashkeel' | 'video' | 'game';
export const lessons: Record<Activity, number> = { learn: 1, write: 2, tashkeel: 3, video: 4, game: 5, position: 12 };
export interface Question { id: number; question_text: string; correct_answer: string }
export type GameType = 'word_catch' | 'sorting' | 'memory_match' | 'balloon_pop';
export interface WordItem { word: string; startsWithTarget: boolean }
export interface GameConfig {
  title?: string; instruction?: string; targetLetter?: string;
  correctWords?: string[]; wrongWords?: string[]; items?: WordItem[]; words?: WordItem[];
  pairs?: { letter: string; word: string }[];
  maxMistakes?: number; scorePerCorrect?: number; scorePerMatch?: number;
  spawnIntervalMs?: number; minSpeed?: number; maxSpeed?: number;
  spawn?: { baseInterval: number; levelFactor: number; minInterval: number };
  speed?: { baseDuration: number; levelIncrease: number; minDuration: number };
}
export interface Game { game_lesson_id: number; letter_id: number; data: GameConfig }
