import { router, useLocalSearchParams } from 'expo-router';
import { Label, Page } from '../../../components/ui';
import { Learning } from '../../../components/Learning';
import { Coloring } from '../../../components/Coloring';
import { Quiz } from '../../../components/Quiz';
import { Videos } from '../../../components/Videos';
import { Games } from '../../../components/Games';
import { ActivityNavigation } from '../../../components/ActivityNavigation';
import { lettersComp } from '../../../data/letters';
import { LetterDecorations } from '../../../components/LetterDecorations';
export default function ActivityScreen() {
  const { kind, letterId: value, symbol } = useLocalSearchParams<{ kind: string; letterId: string; symbol: string }>();
  const letterId = Number(value);
  const name = lettersComp.find((letter) => letter.arabic === symbol)?.name ?? symbol;
  const labels: Record<string, string> = { learn: `مرحباً بك في درس حرف ال${name}`, write: 'مرحباً بك في نشاط الرسم والتلوين', position: `حدد مكان حرف ال${name}`, tashkeel: `تشكيل حرف ال${name}`, video: `فيديوهات حرف ال${name}`, game: `ألعاب حرف ال${name}` };
  const valid = Number.isInteger(letterId) && letterId > 0 && !!symbol && kind in labels;
  return <Page headerVariant="transparent" onBack={valid ? () => router.replace(`/letter/${letterId}`) : undefined} footer={valid ? <ActivityNavigation letterId={letterId} symbol={symbol} current={kind} /> : undefined} title={labels[kind] ?? 'نشاط'}>{!valid ? <Label>رابط النشاط غير صالح.</Label> : kind === 'learn' ? <Learning key={letterId} letterId={letterId} symbol={symbol} /> : kind === 'write' ? <Coloring key={letterId} letterId={letterId} symbol={symbol} /> : kind === 'position' || kind === 'tashkeel' ? <Quiz key={`${letterId}:${kind}`} letterId={letterId} symbol={symbol} kind={kind} /> : kind === 'video' ? <Videos key={letterId} letterId={letterId} /> : <Games key={letterId} letterId={letterId} symbol={symbol} />}{valid && <LetterDecorations />}</Page>;
}
