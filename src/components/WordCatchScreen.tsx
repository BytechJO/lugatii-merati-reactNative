import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  ImageBackground,
  Modal,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Button, Notice } from "./ui";
import { VerticalScrollView } from "./VerticalScrollView";
import { WordCatchGame } from "./WordCatchGame";
import { SortingBoard } from './SortingBoard';
import { MemoryBoard } from './MemoryBoard';
import { BalloonBoard } from './BalloonBoard';
import { useGameArtwork, getGameImage } from './useGameArtwork';
import { GameLoadingScreen } from './GameLoadingScreen';
import { artwork } from "../data/design";
import { errorMessage, saveGame } from "../core/api";
import type { Game, GameType } from "../core/types";
import type { CatchOutcome } from "../core/word-catch";

export function WordCatchScreen({
  game,
  letterId,
  loading,
  error,
  onRetry,
  onBack,
  gameType = 'word_catch',
  symbol,
}: {
  game?: Game;
  letterId: number;
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
  onBack: () => void;
  gameType?: GameType;
  symbol?: string;
}) {
  const images = useGameArtwork(gameType);
  const retry = () => { images.reload(); onRetry(); };
  if (loading || images.loading) return <GameLoadingScreen gameType={gameType} />;
  const backgrounds = {
    word_catch: [artwork.catchLoading, artwork.catchBackground],
    sorting: [artwork.sortingLoading, artwork.sortingBackground],
    memory_match: [artwork.memoryLoading, artwork.memoryBackground],
    balloon_pop: [artwork.balloonLoading, artwork.balloonBackground],
  };
  return (
    <ImageBackground
      source={getGameImage(backgrounds[gameType][1])}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {error || images.error || !game ? (
          <View
            style={{
              margin: 24,
              padding: 24,
              backgroundColor: "white",
              borderRadius: 24,
              gap: 16,
            }}
          >
            <Notice
              error={error || images.error || "محتوى اللعبة غير مكتمل لهذا الحرف."}
              retry={retry}
            />
            <Button secondary label="العودة إلى الألعاب" onPress={onBack} />
          </View>
        ) : (
          <CatchRound
            key={game.game_lesson_id}
            game={game}
            letterId={letterId}
            onBack={onBack}
            gameType={gameType}
            symbol={symbol}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

export function CatchRound({
  game,
  letterId,
  onBack,
  gameType = 'word_catch',
  symbol,
}: {
  game: Game;
  letterId: number;
  onBack: () => void;
  gameType?: GameType;
  symbol?: string;
}) {
  const [outcome, setOutcome] = useState<CatchOutcome | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === "active",
  );
  const ended = useRef(false);
  const saving = useRef(false);
  const started = useRef(0);
  const duration = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setForeground(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  const persist = async (result: CatchOutcome) => {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError(null);
    try {
      await saveGame(
        game.game_lesson_id,
        letterId,
        result.score,
        duration.current,
      );
      setSaved(true);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  const end = (result: CatchOutcome) => {
    if (ended.current) return;
    ended.current = true;
    duration.current = Math.floor((Date.now() - started.current) / 1000);
    setOutcome(result);
    if (gameType !== 'sorting' || result.won) void persist(result);
  };
  const needsSave = gameType !== 'sorting' || !!outcome?.won;
  const reset = () => {
    if ((needsSave && !saved) || busy || error) return;
    ended.current = false;
    setOutcome(null);
    setSaved(false);
    setError(null);
    started.current = Date.now();
    setRound((value) => value + 1);
  };
  const back = () => {
    if ((!needsSave || saved) && !busy && !error) onBack();
  };
  return (
    <>
      {gameType === 'balloon_pop' ? <BalloonBoard key={round} config={game.data} active={!outcome && focused && foreground} onEnd={end} onBack={onBack} symbol={symbol} /> : gameType === 'memory_match' ? <MemoryBoard key={round} config={game.data} active={!outcome && focused && foreground} onEnd={end} onBack={onBack} symbol={symbol} /> : gameType === 'sorting' ? <SortingBoard key={round} config={game.data} active={!outcome && focused && foreground} onEnd={end} onBack={onBack} symbol={symbol} /> : <WordCatchGame
        key={round}
        config={game.data}
        active={!outcome && focused && foreground}
        onEnd={end}
        onBack={onBack}
      />}
      {outcome && (
        <Modal visible transparent animationType="fade" onRequestClose={back}>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#00000080" }}>
            <VerticalScrollView
              contentContainerStyle={{
                flexGrow: 1,
                padding: 24,
                justifyContent: "center",
              }}
            >
              <View
                accessibilityViewIsModal
                style={{
                  width: "100%",
                  maxWidth: 448,
                  alignSelf: "center",
                  borderRadius: 20,
                  backgroundColor: "white",
                  padding: 28,
                  gap: 16,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={artwork.finishDecoration}
                  resizeMode="contain"
                  style={{
                    position: "absolute",
                    top: -25,
                    left: -15,
                    width: 300,
                    height: 110,
                  }}
                />
                <Image
                  source={artwork.badge}
                  resizeMode="contain"
                  style={{ width: 100, height: 100, alignSelf: "center" }}
                />
                <Text
                  style={{
                    fontFamily: "Tajawal-Medium",
                    fontSize: 30,
                    color: "#28345F",
                    textAlign: "center",
                  }}
                >
                  {gameType === 'memory_match' && outcome.won ? 'أحسنت!' : 'انتهت اللعبة'}
                </Text>
                {gameType === 'memory_match' && !outcome.won && <Text style={{ fontFamily: 'Tajawal', fontSize: 20, color: '#28345FAE', textAlign: 'center' }}>وصلت إلى الحد الأقصى من المحاولات</Text>}
                <Text
                  style={{
                    fontFamily: "Tajawal-Medium",
                    fontSize: 20,
                    color: "#28345F",
                    textAlign: "center",
                  }}
                >
                  نقاطك: {outcome.score}
                </Text>
                <Text
                  style={{
                    fontFamily: "Tajawal-Medium",
                    fontSize: 20,
                    color: "#EE0000",
                    textAlign: "center",
                  }}
                >
                  {gameType === 'memory_match' ? `عدد الحركات: ${outcome.moves ?? 0}` : `عدد الأخطاء: ${outcome.mistakes}`}
                </Text>
                <Text
                  accessibilityLiveRegion="polite"
                  style={{
                    fontFamily: "Tajawal",
                    fontSize: 16,
                    color: "#652B82",
                    textAlign: "center",
                  }}
                >
                  {!needsSave ? 'يمكنك المحاولة مرة أخرى' : saved
                    ? "تم حفظ النتيجة والتقدم ✓"
                    : busy
                      ? "جارٍ حفظ النتيجة…"
                      : "لم يتم حفظ النتيجة بعد"}
                </Text>
                <Notice error={error} retry={() => void persist(outcome)} />
                <Button
                  label="العب مرة أخرى"
                  disabled={(needsSave && !saved) || busy || !!error}
                  onPress={reset}
                />
                <Button
                  secondary
                  label="رجوع"
                  disabled={(needsSave && !saved) || busy || !!error}
                  onPress={back}
                />
              </View>
            </VerticalScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </>
  );
}
