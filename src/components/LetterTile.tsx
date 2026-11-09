import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { artwork } from "../data/design";
import type { Letter } from "../core/types";

export function LetterTile({
  letter,
  status,
  size,
  compact,
  onPress,
}: {
  letter: Letter;
  status?: string;
  size: number;
  compact: boolean;
  onPress: () => void;
}) {
  const locked = status === "locked";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${letter.name}${locked ? "، مقفل" : ""}`}
      onPress={onPress}
      style={{
        width: size,
        aspectRatio: 1,
        borderRadius: compact ? 8 : 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F3F0F5",
        boxShadow: "0px 2px 5px #0000000D",
      }}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={pressed ? ["#FAD656", "#F5C842"] : ["#FFFFFF", "#FFFFFF"]}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            opacity: locked ? 0.65 : 1,
          }}
        >
          <Text
            style={{
              fontFamily: "Tajawal-Bold",
              fontSize: compact ? 28 : 36,
              color: "#652B82",
              lineHeight: compact ? 36 : 46,
            }}
          >
            {letter.symbol}
          </Text>
          <Text
            style={{
              fontFamily: "AmiriQuran",
              fontSize: compact ? 20 : 22,
              lineHeight: compact ? 30 : 36,
              color: "#652B82",
            }}
          >
            {letter.name}
          </Text>
          {(locked || status === "completed") && (
            <View style={{ position: "absolute", top: 4, left: 4 }}>
              <Image
                source={locked ? artwork.lock : artwork.check}
                resizeMode="contain"
                style={{ width: compact ? 18 : 22, height: compact ? 18 : 22 }}
              />
            </View>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}
