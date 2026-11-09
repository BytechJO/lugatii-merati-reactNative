interface SecureStorage {
  isAvailableAsync: () => Promise<boolean>;
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}
interface BrowserStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export function createSessionStorage(platform: string, secure: SecureStorage, browser?: () => BrowserStorage | undefined) {
  // Memory supports environments without a browser window, including rendering.
  const memory = new Map<string, string>();
  const webStorage = () => { try { return browser?.(); } catch { return undefined; } };
  const checkNative = async () => {
    if (!await secure.isAvailableAsync()) {
      throw new Error('التخزين الآمن غير متوفر. حدّث Expo Go أو أعد بناء نسخة التطوير، ثم أعد المحاولة.');
    }
  };
  return {
    async getItem(key: string): Promise<string | null> {
      if (platform === 'web') return webStorage()?.getItem(key) ?? memory.get(key) ?? null;
      await checkNative();
      return secure.getItemAsync(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      if (platform === 'web') {
        const storage = webStorage();
        if (storage) storage.setItem(key, value);
        else memory.set(key, value);
        return;
      }
      await checkNative();
      await secure.setItemAsync(key, value);
    },
    async removeItem(key: string): Promise<void> {
      if (platform === 'web') { webStorage()?.removeItem(key); memory.delete(key); return; }
      await checkNative();
      await secure.deleteItemAsync(key);
    },
  };
}
