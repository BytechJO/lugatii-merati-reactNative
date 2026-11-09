import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Button, Loading, Notice } from './ui';
import { LessonVideo } from './LessonVideo';
import { useResource } from '../core/useResource';
import { useSession } from '../core/session';
import { artwork } from '../data/design';

export function ActivityVideoIntro({ letterId, lesson, onContinue, onEnded }: { letterId: number; lesson: 1 | 2; onContinue: () => void; onEnded?: () => void }) {
  const videos = useResource<{ data: { id: number; youtube_url: string }[] }>(`/lessons/video-lessons/${letterId}/${lesson}`);
  const teacher = useSession().session?.user.role === 'teacher';
  const [ended, setEnded] = useState(false);
  if (videos.loading) return <Loading />;
  if (videos.error && videos.status !== 404) return <Notice error={videos.error} retry={videos.reload} />;
  const video = videos.data?.data[0];
  return <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', gap: 20 }}>
    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 8, gap: 12, boxShadow: '0px 8px 24px #652B8214' }}>
      {video ? <LessonVideo uri={video.youtube_url} showHint={false} onEnded={() => { setEnded(true); onEnded?.(); }} /> : <View style={{ padding: 24, gap: 16, alignItems: 'center' }}><Image source={artwork.activityAlphabet} resizeMode="contain" style={{ width: 120, height: 110 }} /><Text style={{ fontFamily: 'Tajawal', textAlign: 'center', color: '#652B82', fontSize: 18 }}>لا يوجد فيديو شرح لهذا الحرف حالياً.</Text></View>}
    </View>
    <Text style={{ fontFamily: 'Tajawal-Bold', color: '#B47DDB', fontSize: 20, lineHeight: 30, textAlign: 'center' }}>{lesson === 1 ? 'شاهد الفيديو ثم ابدأ التعلم التفاعلي' : 'شاهد الفيديو ثم ابدأ نشاط الرسم والتلوين'}</Text>
    {(ended || teacher || !video) && <Button label={lesson === 1 ? 'ابدأ التعلم الآن' : 'ابدأ الرسم والتلوين'} onPress={onContinue} />}
  </View>;
}
