import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { VerticalScrollView } from "./VerticalScrollView";
import { createMemoryRound, type MemoryCard } from "../core/memory";
import { shuffle } from "../core/games";
import type { GameConfig } from "../core/types";
import type { CatchOutcome } from "../core/word-catch";
import { artwork } from "../data/design";
import { getGameImage } from "./useGameArtwork";
import { lettersComp } from "../data/letters";

export interface GameOutcome {
  score: number;
  won: boolean;
}
export function MemoryBoard({
  config,
  onEnd,
  active = true,
  onBack,
  symbol,
}: {
  config: GameConfig;
  onEnd: (result: CatchOutcome) => void;
  active?: boolean;
  onBack?: () => void;
  symbol?: string;
}) {
  const { width, height } = useWindowDimensions();
  const [round] = useState(() => createMemoryRound(config));
  const [cards] = useState(() => shuffle(round.cards));
  const [state, setState] = useState(round.initial);
  const [toast, setToast] = useState(false);
  const [field, setField] = useState({
    width,
    height: Math.max(100, height - 140),
  });
  const finish = useRef(onEnd);
  useEffect(() => {
    finish.current = onEnd;
  }, [onEnd]);
  useEffect(() => {
    if (!state.pending || !active) return;
    const timer = setTimeout(() => {
      const result = round.settle();
      if (!result) return;
      setState(result.state);
      if (result.outcome) finish.current(result.outcome);
    }, 1000);
    return () => clearTimeout(timer);
  }, [round, state.pending, active]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 1200);
    return () => clearTimeout(timer);
  }, [toast, state.moves]);
  const flip = (id: number) => {
    if (!active) return;
    const next = round.choose(id);
    if (!next) return;
    setState(next);
    if (next.pending) setToast(true);
  };
  const name =
    lettersComp.find((letter) => letter.arabic === symbol)?.name ??
    symbol ??
    config.targetLetter ??
    "";
  const columns = Math.min(4, Math.max(1, cards.length));
  const rows = Math.ceil(cards.length / columns);
  const gap =
    width < 1200 ? 8 : Math.max(14, Math.min(34, Math.round(width * 0.028)));
  const widthLimit = Math.max(
    1,
    Math.floor((field.width - 32 - gap * (columns - 1)) / columns),
  );
  const heightLimit = Math.max(
    44,
    Math.floor((field.height - 32 - gap * (rows - 1)) / Math.max(1, rows)),
  );
  const preferredSize =
    width < 1200
      ? 160
      : Math.max(100, Math.min(200, width * 0.135, height * 0.21));
  const size = Math.floor(Math.min(widthLimit, heightLimit, preferredSize));
  if (!cards.length)
    return (
      <Text
        style={{ fontFamily: "Tajawal", color: "#652B82", textAlign: "center" }}
      >
        لا توجد بطاقات لهذه اللعبة.
      </Text>
    );
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        maxWidth: 1152,
        alignSelf: "center",
        minWidth: 0,
      }}
    >
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: "#FFFFFFEB",
          borderRadius: 99,
          padding: 8,
          gap: 8,
          boxShadow: "0px 8px 20px #0000001F",
        }}
      >
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="العودة إلى الألعاب"
            onPress={onBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "red",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 30 }}>×</Text>
          </Pressable>
        )}
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: "Tajawal",
            fontSize: width < 768 ? 16 : 20,
            lineHeight: 25,
            textAlign: "center",
            color: "#28345F",
          }}
        >
          اقلب البطاقات وطابق ال{name} مع الكلمات
        </Text>
        <LinearGradient
          colors={["#6B2F8E", "#C98BF5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 99,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text style={{ color: "white", fontSize: 24 }}>☆</Text>
          <Text
            accessibilityLabel={`النقاط ${state.score}`}
            style={{
              fontFamily: "Tajawal-Medium",
              fontSize: 24,
              color: "white",
            }}
          >
            {state.score}
          </Text>
        </LinearGradient>
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={{
          fontFamily: "Tajawal-Medium",
          fontSize: 16,
          color: "#652B82",
          textAlign: "left",
          marginHorizontal: 28,
          marginTop: 4,
        }}
      >
        حركة: {state.moves}/10
      </Text>
      <View
        onLayout={(event) =>
          setField({
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height,
          })
        }
        style={{ flex: 1, minHeight: 0, width: "100%" }}
      >
        <VerticalScrollView
          contentContainerStyle={{ padding: 16, gap, alignItems: "center" }}
        >
          {Array.from({ length: rows }, (_, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row-reverse",
                justifyContent: "center",
                gap,
                maxWidth: "100%",
              }}
            >
              {cards
                .slice(index * columns, (index + 1) * columns)
                .map((card) => (
                  <MemoryFlipCard
                    key={card.id}
                    card={card}
                    size={size}
                    matched={state.matched.includes(card.id)}
                    visible={
                      state.flipped.includes(card.id) ||
                      state.matched.includes(card.id)
                    }
                    disabled={
                      !active ||
                      state.pending ||
                      state.flipped.includes(card.id) ||
                      state.matched.includes(card.id)
                    }
                    onPress={() => flip(card.id)}
                  />
                ))}
            </View>
          ))}
        </VerticalScrollView>
      </View>
      {toast && active && (
        <View
          pointerEvents="none"
          accessibilityRole="alert"
          style={{
            position: "absolute",
            top: 110,
            alignSelf: "center",
            maxWidth: "90%",
            zIndex: 100,
            backgroundColor: "white",
            borderWidth: 4,
            borderColor: "#652B82",
            borderRadius: 16,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{ fontFamily: "Tajawal", fontSize: 20, color: "#652B82" }}
          >
            حركة: {state.moves} / 10
          </Text>
        </View>
      )}
    </View>
  );
}

export function MemoryFlipCard({
  card,
  size,
  visible,
  matched,
  disabled,
  onPress,
}: {
  card: MemoryCard;
  size: number;
  visible: boolean;
  matched: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const [flip] = useState(() => new Animated.Value(visible ? 1 : 0));
  useEffect(() => {
    const animation = Animated.spring(flip, {
      toValue: visible ? 1 : 0,
      stiffness: 120,
      damping: 15,
      mass: 1,
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [visible, flip]);
  const radius = Math.min(24, Math.max(14, size * 0.12));
  const length = card.content.trim().length;
  const fontSize = Math.min(
    length <= 3 ? 46 : length <= 6 ? 38 : length <= 9 ? 30 : 24,
    size * (length <= 3 ? 0.36 : length <= 6 ? 0.3 : 0.23),
  );
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={
        visible
          ? `${card.content}${matched ? "، تمت المطابقة" : ""}`
          : "بطاقة مقلوبة"
      }
      accessibilityState={{ disabled, selected: visible }}
      disabled={disabled}
      onPress={onPress}
      style={{ width: size, height: size, maxWidth: "100%" }}
    >
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: radius,
          opacity: flip.interpolate({
            inputRange: [0, 0.49, 0.5, 1],
            outputRange: [1, 1, 0, 0],
          }),
          boxShadow: "0px 6px 12px #0000002E",
          transform: [
            { perspective: 800 },
            {
              rotateY: flip.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              }),
            },
          ],
        }}
      >
        <Image
          source={getGameImage(artwork.memoryBack)}
          resizeMode="stretch"
          style={{ width: size, height: size, borderRadius: radius }}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: radius,
          opacity: flip.interpolate({
            inputRange: [0, 0.49, 0.5, 1],
            outputRange: [0, 0, 1, 1],
          }),
          backgroundColor: "white",
          borderWidth: 3,
          borderColor: matched ? "#FAD656" : "#E6D9EF",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
          boxShadow: "0px 6px 12px #0000002E",
          transform: [
            { perspective: 800 },
            {
              rotateY: flip.interpolate({
                inputRange: [0, 1],
                outputRange: ["180deg", "360deg"],
              }),
            },
          ],
        }}
      >
        <Text
          style={{
            fontFamily: "Tajawal-Bold",
            color: "#652B82",
            textAlign: "center",
            fontSize,
          }}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {card.content}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
