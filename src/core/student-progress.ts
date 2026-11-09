export interface StudentProgress {
  student: { id?: number; username: string; email?: string };
  stats: {
    totalActivities?: number;
    averageScore?: number;
    totalTimeSpent?: number;
    completedLetters?: string[];
    activityScores?: Record<string, number>;
  };
  recentActivities?: {
    letter: string;
    lessonName?: string;
    activityType: string;
    score: number;
    timeSpent?: number;
    completedAt: string | number;
  }[];
}

// Original report units: binary completion, four quiz answers, or game points.
export function activityPercentage(type: string, score: number): number {
  if (!Number.isFinite(score)) return 0;
  const value = ["learn", "write", "video"].includes(type)
    ? score * 100
    : ["position", "tashkeel"].includes(type)
      ? score * 25
      : type === "game"
        ? score
        : 0;
  return Math.max(0, Math.min(value, 100));
}
export function scoreColor(percentage: number): string {
  return percentage >= 90
    ? "#10B981"
    : percentage >= 75
      ? "#3B82F6"
      : percentage >= 60
        ? "#F59E0B"
        : "#EF4444";
}
