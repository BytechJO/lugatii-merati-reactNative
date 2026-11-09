import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Label, Notice } from './ui';
export function LessonVideo({ uri, onEnded, showHint = true }: { uri: string; onEnded?: () => void; showHint?: boolean }) {
  const player = useVideoPlayer(uri);
  const [error, setError] = useState<string | null>(null);
  useEventListener(player, 'playToEnd', () => onEnded?.());
  useEventListener(player, 'statusChange', ({ error: failure }) => { setError(failure ? 'تعذر تشغيل الفيديو. تحقق من الرابط أو الاتصال.' : null); });
  return <><VideoView player={player} nativeControls style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#24142F', borderRadius: 16 }} /><Notice error={error} />{showHint && <Label>شاهد الشرح ثم أكمل النشاط.</Label>}</>;
}
