import { router, useLocalSearchParams } from 'expo-router';
import { Label, Loading, Notice, Page } from '../../../components/ui';
import { GamePreview } from '../../../components/GamePreview';
import { useResource } from '../../../core/useResource';
import { useSession } from '../../../core/session';
import type { Game, GameType } from '../../../core/types';
import { gameTypes, wordItems } from '../../../core/games';
import { artwork } from '../../../data/design';
import { WordCatchScreen as StudentGameScreen } from '../../../components/WordCatchScreen';
export default function GameScreen() {
  const { type, letterId, symbol } = useLocalSearchParams<{ type: GameType; letterId: string; symbol: string }>();
  if (!gameTypes.includes(type) || !Number.isInteger(Number(letterId)) || Number(letterId) <= 0) return <Page title="الألعاب"><Label>رابط اللعبة غير صالح.</Label></Page>;
  return <GameContent key={`${letterId}:${type}`} type={type} letterId={Number(letterId)} symbol={symbol} />;
}
function GameContent({ type, symbol, letterId }: { type: GameType; symbol: string; letterId: number }) {
  const resource = useResource<{ data: Game }>(`/lessons/games-lessons/by-letter-and-type?letter=${encodeURIComponent(symbol)}&gameType=${type}`);
  const teacher = useSession().session?.user.role === 'teacher';
  const game = resource.data?.data;
  const complete = game?.data && Number.isInteger(game.game_lesson_id) && game.letter_id === letterId && (type === 'memory_match' ? !!game.data.pairs?.length : type === 'sorting' ? !!game.data.items?.length : wordItems(game.data).length > 0);
  const back = () => router.replace(`/activity/game?letterId=${letterId}&symbol=${encodeURIComponent(symbol)}`);
  if (!teacher) return <StudentGameScreen gameType={type} symbol={symbol} game={complete ? game : undefined} letterId={letterId} loading={resource.loading} error={resource.error} onRetry={resource.reload} onBack={back} />;
  return <Page background={artwork.activityBackground} headerVariant="transparent" onBack={back} title="">{resource.loading ? <Loading /> : resource.error ? <Notice error={resource.error} retry={resource.reload} /> : !complete || !game ? <Label>محتوى اللعبة غير مكتمل لهذا الحرف.</Label> : <GamePreview config={game.data} gameType={type} symbol={symbol} onBack={back} />}</Page>;
}
