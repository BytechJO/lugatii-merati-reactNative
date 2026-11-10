const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
// SDK 58 handles forwarded protocol chains without the SDK 57 compatibility shim.
const expoRequire = createRequire(require.resolve('expo/package.json'));
const cliRoot = path.dirname(expoRequire.resolve('@expo/cli/package.json'));
const { ExpoGoManifestHandlerMiddleware } = require(path.join(cliRoot,
  'build/src/start/server/middleware/ExpoGoManifestHandlerMiddleware.js'));
const middleware = Object.create(ExpoGoManifestHandlerMiddleware.prototype);

for (const [header, expected] of [
  ['https, https', 'https'], ['https,http', 'https'],
  ['https', 'https'], ['http', 'http'], [undefined, undefined],
]) {
  test('Expo manifest normalizes forwarded protocol: ' + String(header), () => {
    const headers = { host: 'example.exp.direct', 'expo-platform': 'ios', accept: 'application/expo+json' };
    if (header !== undefined) headers['x-forwarded-proto'] = header;
    const request = { headers, url: '/' };
    const options = middleware.getParsedHeaders(request);
    assert.equal(options.protocol, expected);
    assert.equal(options.platform, 'ios');
    if (expected) {
      const bundleUrl = options.protocol + '://example.exp.direct/entry.bundle';
      assert.ok(bundleUrl.match(/^https?:\/\/.*?\//));
      assert.equal(new URL(bundleUrl).protocol, expected + ':');
    }
    assert.equal(headers['x-forwarded-proto'], header, 'the original request is unchanged');
  });
}
