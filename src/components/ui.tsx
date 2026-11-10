import type { ReactNode } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions, type TextInputProps, type ImageSourcePropType } from 'react-native';
import { VerticalScrollView as ScrollView } from './VerticalScrollView';
import { HeaderSafeAreaView as SafeAreaView } from "./HeaderSafeAreaView";
import { usePathname } from "expo-router";
import { BrandHeader } from "./BrandHeader";
import { artwork } from "../data/design";
import { LinearGradient } from "expo-linear-gradient";
export { AppLoading as Loading } from './AppLoading';
export const colors = {
  purple: "#652B82",
  yellow: "#FDC333",
  ink: "#28345F",
  background: "#FFF9EF",
  pale: "#EFDDFF",
  red: "#B42318",
  green: "#17784C",
};
export function Page({
  title,
  children,
  background,
  footer,
  plain = false,
  onBack,
  headerVariant = 'default',
  scrollEnabled = true,
}: {
  title: string;
  children: ReactNode;
  background?: ImageSourcePropType;
  footer?: ReactNode;
  plain?: boolean;
  onBack?: () => void;
  headerVariant?: 'default' | 'transparent';
  scrollEnabled?: boolean;
}) {
  const { width } = useWindowDimensions();
  const path = usePathname();
  const gameBackground = path.includes("/game/memory_match")
    ? artwork.memoryBackground
    : path.includes("/game/sorting")
      ? artwork.sortingBackground
      : path.includes("/game/balloon_pop")
        ? artwork.balloonBackground
        : path.includes("/game/word_catch")
          ? artwork.catchBackground
          : undefined;
  return (
    <ImageBackground
      source={
        plain
          ? undefined
          : (background ??
            gameBackground ??
            (path.startsWith("/activity")
              ? artwork.activityBackground
              : artwork.letterBackground))
      }
      resizeMode="cover"
      style={[s.flex, plain && { backgroundColor: "white" }]}
    >
      <SafeAreaView style={s.safe} headerBackground={headerVariant === 'default' ? 'white' : undefined}>
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <BrandHeader title={title} onBack={onBack} variant={headerVariant} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            scrollEnabled={scrollEnabled}
            bounces={scrollEnabled}
            alwaysBounceVertical={scrollEnabled}
            canCancelContentTouches={scrollEnabled}
            contentContainerStyle={[
              s.content,
              { paddingHorizontal: width >= 768 ? 40 : 20 },
            ]}
          >
            <View style={s.container}>{children}</View>
          </ScrollView>
          {footer}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
export function Button({
  label,
  onPress,
  secondary,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <LinearGradient
        colors={secondary ? ["#FFD84F", "#FFC72C"] : ["#D08FF7", "#652B82"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[s.button, secondary && s.secondary]}
      >
        <Text style={[s.buttonText, secondary && { color: colors.purple }]}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
export function Label({
  children,
  big = false,
}: {
  children: ReactNode;
  big?: boolean;
}) {
  return <Text style={[s.text, big && s.title]}>{children}</Text>;
}
export function Card({ children }: { children: ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#776987"
      {...props}
      style={[s.input, props.style]}
    />
  );
}
export function Notice({
  error,
  retry,
}: {
  error?: string | null;
  retry?: () => void;
}) {
  if (!error) return null;
  return (
    <View accessibilityRole="alert" style={s.notice}>
      <Text style={[s.text, { color: colors.red }]}>{error}</Text>
      {retry && <Button label="أعد المحاولة" secondary onPress={retry} />}
    </View>
  );
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  flex: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#EADAF2",
  },
  heading: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: colors.purple,
    textAlign: "right",
  },
  content: { paddingVertical: 24, flexGrow: 1 },
  container: { width: "100%", maxWidth: 850, minWidth: 0, alignSelf: "center", gap: 18 },
  card: {
    maxWidth: '100%',
    minWidth: 0,
    backgroundColor: "white",
    borderRadius: 28,
    padding: 22,
    gap: 16,
    boxShadow: "0px 8px 24px #652B8214",
  },
  text: {
    maxWidth: '100%',
    flexShrink: 1,
    color: colors.ink,
    fontFamily: "Tajawal",
    fontSize: 20,
    lineHeight: 32,
    textAlign: "right",
    writingDirection: "rtl",
  },
  title: {
    fontSize: 30,
    lineHeight: 44,
    fontFamily: "Tajawal-Bold",
    color: colors.purple,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 6px 14px #652B8230",
  },
  secondary: { backgroundColor: colors.yellow },
  buttonText: {
    color: "white",
    fontFamily: "Tajawal-Bold",
    textAlign: "center",
    fontSize: 20,
  },
  input: {
    minWidth: 0,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: "#CDB8DA",
    backgroundColor: "white",
    borderRadius: 16,
    minHeight: 52,
    padding: 14,
    fontFamily: "Tajawal",
    fontSize: 18,
    textAlign: "right",
    color: colors.ink,
  },
  row: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 12 },
  cell: { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "25%" },
  notice: {
    padding: 16,
    backgroundColor: "#FFF0EC",
    borderRadius: 16,
    gap: 10,
  },
});
