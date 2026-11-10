import {
  ImageBackground,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { artwork } from "../data/design";
import { lettersComp } from "../data/letters";

const options = [
  ["start", "البداية"],
  ["middle", "الوسط"],
  ["end", "النهاية"],
] as const;
export function PositionQuestion({
  symbol,
  word,
  selected,
  feedback,
  disabled,
  teacher,
  onAnswer,
}: {
  symbol: string;
  word: string;
  selected: string | null;
  feedback: "correct" | "wrong" | null;
  disabled: boolean;
  teacher: boolean;
  onAnswer: (value: string) => void;
}) {
  const { width } = useWindowDimensions();
  const name =
    lettersComp.find((letter) => letter.arabic === symbol)?.name ?? symbol;
  return (
    <View style={{ width: "100%", minWidth: 0, gap: 16 }}>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          minHeight: 200,
        }}
      >
        <Text
          style={{
            fontFamily: "Tajawal-Medium",
            color: "#28345F",
            fontSize: width < 768 ? 18 : 20,
            lineHeight: 30,
            textAlign: "center",
          }}
        >
          أين يقع حرف ال{name} في هذه الكلمة؟
        </Text>
        <ImageBackground
          source={artwork.questionBubble}
          resizeMode="cover"
          style={{
            width: 165,
            maxWidth: "100%",
            height: 100,
            backgroundColor: "white",
            borderRadius: 24,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0px 10px 24px #28345F20",
          }}
        >
          <Text
            style={{
              fontFamily: "Tajawal-Bold",
              fontSize: width < 768 ? 44 : 52,
              lineHeight: 72,
              color: "#28345F",
              textAlign: "center",
            }}
          >
            {word}
          </Text>
        </ImageBackground>
        {feedback && (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              borderRadius: 24,
              backgroundColor: feedback === "correct" ? "#FFC534" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: 24,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: feedback === "correct" ? "#652B82" : "#EF4444",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 38 }}>
                {feedback === "correct" ? "✓" : "×"}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Tajawal-Bold",
                fontSize: 24,
                color: feedback === "correct" ? "#652B82" : "#DC2626",
                textAlign: "center",
              }}
            >
              {feedback === "correct" ? "أحسنت!" : "حاول مرة أخرى"}
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: width < 768 ? "column" : "row-reverse",
          gap: 16,
        }}
      >
        {options.map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled, selected: selected === value }}
            disabled={disabled}
            onPress={() => onAnswer(value)}
            style={({ pressed }) => ({
              flex: width >= 768 ? 1 : undefined,
              width: width < 768 ? "100%" : undefined,
              minWidth: 0,
              borderRadius: 16,
              opacity: teacher ? 0.6 : pressed ? 0.8 : 1,
              boxShadow:
                selected === value
                  ? "0px 12px 24px #F7A82459"
                  : "0px 8px 18px #28345F1A",
            })}
          >
            <LinearGradient
              colors={
                selected === value
                  ? ["#FFE68C", "#FFB600"]
                  : ["#FFFFFF", "#FFFFFF"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                minHeight: 60,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Tajawal-Medium",
                  fontSize: width < 768 ? 20 : 24,
                  color: "#28345F",
                  textAlign: "center",
                }}
              >
                {label}
              </Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
