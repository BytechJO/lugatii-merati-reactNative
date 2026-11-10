import { useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { VerticalScrollView as ScrollView } from '../components/VerticalScrollView';
import { HeaderSafeAreaView as SafeAreaView } from "../components/HeaderSafeAreaView";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, Redirect } from "expo-router";
import { Notice } from "../components/ui";
import { BrandHeader } from "../components/BrandHeader";
import { artwork } from "../data/design";
import { errorMessage, signIn } from "../core/api";
import { useSession } from "../core/session";
export default function LoginScreen() {
  const { role: value } = useLocalSearchParams<{ role: string }>();
  const role = value === "teacher" ? "teacher" : "student";
  const { width, height } = useWindowDimensions();
  const wide = width >= 768 && height >= 500;
  const phoneArtworkSize = Math.max(72, Math.min(112, width * .28, height * .16));
  const { session, login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(await signIn(email.trim(), password, role));
      router.replace("/home");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  if (session) return <Redirect href="/home" />;
  return (
    <ImageBackground
      source={
        role === "teacher"
          ? artwork.loginBackground
          : artwork.studentLoginBackground
      }
      resizeMode="cover"
      style={styles.page}
    >
      {role === "student" && (
        <LinearGradient
          colors={["#652B82C7", "#ECECED80"]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <SafeAreaView style={styles.page} headerBackground="white">
        <BrandHeader title="مرآتي لغتي" />
        <KeyboardAvoidingView
          style={styles.page}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, !wide && styles.phoneContent]}
          >
            <View
              style={[
                styles.panel,
                {
                  flexDirection: wide ? "row-reverse" : "column",
                  maxWidth: wide ? 850 : 420,
                },
              ]}
            >
              <View style={[styles.form, !wide && styles.phoneForm, { flex: wide ? 1 : undefined }]}>
                <Image
                  source={artwork.user}
                  resizeMode="contain"
                  style={[styles.user, !wide && styles.phoneUser]}
                />
                <Text style={[styles.role, !wide && styles.phoneRole]}>
                  {role === "student" ? "حساب الطالب" : "حساب المعلم"}
                </Text>
                <View style={[styles.fields, !wide && styles.phoneFields]}>
                  <LoginField
                    label="البريد الإلكتروني"
                    value={email}
                    onChangeText={setEmail}
                    email
                    compact={!wide}
                  />
                  <View>
                    <LoginField
                      label="كلمة المرور"
                      value={password}
                      onChangeText={setPassword}
                      secure={!showPassword}
                      compact={!wide}
                      submit={() => void submit()}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                      }
                      hitSlop={8}
                      onPress={() => setShowPassword((value) => !value)}
                      style={styles.eye}
                    >
                      <Text style={{ color: "#652B82", fontSize: 19 }}>
                        {showPassword ? "◉" : "◎"}
                      </Text>
                    </Pressable>
                  </View>
                  <Notice error={error} />
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy || !email.trim() || !password}
                    onPress={() => void submit()}
                  >
                    <LinearGradient
                      colors={["#652B82", "#7D3BA0"]}
                      style={[
                        styles.submit,
                        {
                          opacity:
                            busy || !email.trim() || !password ? 0.55 : 1,
                        },
                      ]}
                    >
                      <Text style={styles.submitText}>
                        {busy ? "جارٍ الدخول…" : "دخول"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

              </View>
              <View
                style={[
                  styles.illustration,
                  !wide && styles.phoneIllustration,
                  { flex: wide ? 1 : undefined, minHeight: wide ? 400 : undefined },
                ]}
              >
                <Text style={[styles.slogan, !wide && styles.phoneSlogan]}>
                  رحلة تعلم اللغة العربية{"\n"}تبدأ هنا
                </Text>
                <Image
                  source={artwork.alphabet}
                  resizeMode="contain"
                  style={{
                    width: wide ? 240 : phoneArtworkSize,
                    height: wide ? 250 : phoneArtworkSize,
                    alignSelf: wide ? "flex-end" : "center",
                    flexShrink: 0,
                  }}
                />
                {wide && (
                  <Image
                    source={artwork.loginTiger}
                    resizeMode="contain"
                    style={styles.tiger}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
function LoginField({
  label,
  value,
  onChangeText,
  email,
  secure,
  submit,
  compact,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  email?: boolean;
  secure?: boolean;
  submit?: () => void;
  compact?: boolean;
}) {
  return (
    <TextInput
      accessibilityLabel={label}
      placeholder={label}
      placeholderTextColor="#8D8793"
      value={value}
      onChangeText={onChangeText}
      keyboardType={email ? "email-address" : "default"}
      autoCapitalize="none"
      secureTextEntry={secure}
      autoComplete={email ? "email" : "current-password"}
      onSubmitEditing={submit}
      style={[styles.input, compact && styles.phoneInput]}
    />
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    paddingTop: 28,
    paddingBottom: 44,
  },
  phoneContent: { padding: 16, paddingTop: 12, paddingBottom: 24 },
  panel: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FDC333",
    boxShadow: "0px 12px 32px #35124626",
  },
  form: { backgroundColor: "white", borderRadius: 28, padding: 26, gap: 14 },
  phoneForm: { padding: 18, gap: 8 },
  user: { width: 56, height: 56, alignSelf: "center" },
  phoneUser: { width: 40, height: 40 },
  phoneRole: { fontSize: 18 },
  role: {
    fontFamily: "Tajawal-Medium",
    color: "#652B82",
    textAlign: "center",
    fontSize: 20,
  },
  fields: { gap: 22, marginTop: 20 },
  phoneFields: { gap: 14, marginTop: 12 },
  phoneInput: { fontSize: 16, minHeight: 48 },
  input: {
    fontFamily: "Tajawal",
    minHeight: 52,
    borderBottomWidth: 2,
    borderBottomColor: "#652B8251",
    textAlign: "right",
    paddingHorizontal: 10,
    paddingLeft: 36,
    fontSize: 18,
    color: "#28345F",
  },
  eye: { position: "absolute", left: 4, top: 14 },
  submit: {
    minHeight: 50,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontFamily: "Tajawal-Bold", color: "white", fontSize: 21 },
  illustration: { padding: 26, justifyContent: "space-between", gap: 20 },
  phoneIllustration: { paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  phoneSlogan: { fontSize: 18, lineHeight: 27, flex: 1, flexShrink: 1 },
  slogan: {
    fontFamily: "Tajawal-Medium",
    color: "#652B82",
    fontSize: 28,
    lineHeight: 40,
    textAlign: "right",
  },
  tiger: {
    position: "absolute",
    width: 220,
    height: 300,
    left: -12,
    bottom: 8,
  },
});
