import type { Activity, Role, Session } from './types';
import { lessons } from './types';

const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://arabic-learning-web-app.onrender.com').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
let sessionToken: string | null = null;
export const setApiToken = (token: string | null) => { sessionToken = token; };
export async function request<T>(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 45000);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok || json.success === false) throw new ApiError(json.message || 'تعذر إتمام الطلب', response.status);
    return json as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw error;
    throw new Error(controller.signal.aborted ? 'انتهت مهلة الاتصال. أعد المحاولة.' : 'تعذر الاتصال بالخادم. تحقق من الإنترنت.');
  } finally { clearTimeout(timeout); options.signal?.removeEventListener('abort', abort); }
}
export async function signIn(email: string, password: string, role: Role): Promise<Session> {
  const data = await request<{ token: string; userId: number; role: number; username: string }>('/users/login', { method: 'POST', body: { email, password } });
  const actualRole = Number(data.role) === 2 ? 'student' : Number(data.role) === 3 ? 'teacher' : null;
  if (!actualRole || !data.userId || !data.token) throw new Error('استجابة تسجيل الدخول غير مكتملة.');
  if (role !== actualRole) throw new Error(`هذا الحساب مسجل كـ${actualRole === 'student' ? 'طالب' : 'معلم'}.`);
  return { token: data.token, user: { id: data.userId, username: data.username, role: actualRole } };
}
export function saveProgress(activity: Activity, letterId: number, score = 1) {
  return request('/progress/upsertProgress', { method: 'POST', body: { letter_id: letterId, lesson_id: lessons[activity], lesson_type: activity, score, completed: true } });
}
export async function saveGame(gameId: number, letterId: number, score: number, duration: number) {
  await request('/lessons/saveGameResult', { method: 'POST', body: { games_lessons_id: gameId, score, duration } });
  const progress = await request<{ totalGames: number; playedGamesCount: number }>(`/lessons/${letterId}/games/progress`);
  if (progress.totalGames > 0 && progress.totalGames === progress.playedGamesCount) await saveProgress('game', letterId);
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'حدث خطأ. أعد المحاولة.';
