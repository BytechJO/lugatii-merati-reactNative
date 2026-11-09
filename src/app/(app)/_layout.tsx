import { Redirect, Stack } from "expo-router";
import { useSession } from "../../core/session";
import { Loading } from "../../components/ui";
export default function ProtectedLayout() {
  const { ready, session } = useSession();
  if (!ready) return <Loading fullScreen />;
  if (!session) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
