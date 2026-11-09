import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from "react-native";
export function Artwork({
  source,
  style,
  label,
}: {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  label?: string;
}) {
  return (
    <Image
      source={source}
      accessibilityLabel={label}
      accessible={!!label}
      resizeMode="contain"
      style={[{ width: "100%", height: 140 }, style]}
    />
  );
}
