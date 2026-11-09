const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moduleUnderTest = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/core/session-storage.ts'), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, { module: moduleUnderTest, exports: moduleUnderTest.exports });
const { createSessionStorage } = moduleUnderTest.exports;

test('web login, restoration and logout never call native SecureStore', async () => {
  const values = new Map();
  const browser = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  const native = new Proxy({}, { get() { assert.fail('Web accessed native SecureStore'); } });
  const storage = createSessionStorage('web', native, () => browser);
  await storage.setItem('session', 'fixture');
  assert.equal(await createSessionStorage('web', native, () => browser).getItem('session'), 'fixture');
  await storage.removeItem('session');
  assert.equal(await storage.getItem('session'), null);
});

test('web rendering without window storage uses memory', async () => {
  const storage = createSessionStorage('web', {}, () => undefined);
  await storage.setItem('session', 'fixture');
  assert.equal(await storage.getItem('session'), 'fixture');
  await storage.removeItem('session');
  assert.equal(await storage.getItem('session'), null);
});

test('Android and iOS continue storing sessions securely', async () => {
  for (const platform of ['android', 'ios']) {
    let saved = null;
    const secure = { isAvailableAsync: async () => true, getItemAsync: async () => saved, setItemAsync: async (_key, value) => { saved = value; }, deleteItemAsync: async () => { saved = null; } };
    const storage = createSessionStorage(platform, secure, () => { assert.fail('Native accessed web storage'); });
    await storage.setItem('session', 'fixture');
    assert.equal(await storage.getItem('session'), 'fixture');
    await storage.removeItem('session');
    assert.equal(saved, null);
  }
});

test('unavailable native module fails clearly without downgrading token storage', async () => {
  const storage = createSessionStorage('android', { isAvailableAsync: async () => false });
  await assert.rejects(storage.setItem('session', 'fixture'), /Expo Go/);
});
