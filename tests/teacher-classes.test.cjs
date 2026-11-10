const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadClasses(resource) {
  const values = []; let cursor = 0;
  const writes = [];
  const file = path.resolve(__dirname, '../src/app/(app)/classes/index.tsx');
  const moduleUnderTest = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const native = { Image: 'Image', KeyboardAvoidingView: 'KeyboardAvoidingView', Modal: 'Modal', Platform: { OS: 'ios' }, Pressable: 'Pressable', Text: 'Text', View: 'View', StyleSheet: { create: (value) => value, absoluteFill: {} }, useWindowDimensions: () => ({ width: 390 }) };
  const mocks = {
    react: { useState(initial) { const slot = cursor++; if (!(slot in values)) values[slot] = initial; return [values[slot], (next) => { values[slot] = next; }]; } },
    'react-native': native,
    '../../../components/HeaderSafeAreaView': { HeaderSafeAreaView: 'SafeAreaView' },
    'expo-linear-gradient': { LinearGradient: 'LinearGradient' },
    'react-native-svg': { __esModule: true, default: 'Svg', Path: 'Path' },
    'expo-router': { Redirect: 'Redirect', router: { push() {}, replace() {} } },
    '../../../components/VerticalScrollView': { VerticalScrollView: 'ScrollView' },
    '../../../components/ui': { Field: 'Field', Loading: 'Loading', Notice: 'Notice' },
    '../../../components/TeacherHero': { TeacherHero: 'TeacherHero' },
    '../../../core/api': { errorMessage: String, request: async (...args) => writes.push(args) },
    '../../../core/useResource': { useResource: () => ({ ...resource, reload() {} }) },
    '../../../core/session': { useSession: () => ({ session: { user: { role: 'teacher' } } }) },
    '../../../data/design': { artwork: new Proxy({}, { get: (_, key) => String(key) }) },
  };
  vm.runInNewContext(code + '\nmodule.exports.TeacherClasses = TeacherClasses;', { module: moduleUnderTest, exports: moduleUnderTest.exports, require: (id) => mocks[id] ?? require(id) });
  function nodes(node) {
    if (Array.isArray(node)) return node.flatMap(nodes);
    if (!node || typeof node !== 'object') return [];
    return [node, ...nodes(node.props?.children)];
  }
  return { writes, render() { cursor = 0; return nodes(moduleUnderTest.exports.TeacherClasses()); } };
}

for (const resource of [
  { loading: false, status: 404, data: null, error: 'Theres is no class' },
  { loading: false, status: null, data: { data: [] }, error: null },
]) {
  test('empty teacher classes show the centered create action and open its dialog: ' + String(resource.status), () => {
    const app = loadClasses(resource);
    let tree = app.render();
    assert.ok(tree.some((node) => node.type === 'Text' && node.props.children === 'لا يوجد صفوف'));
    assert.equal(tree.some((node) => node.type === 'Notice' && node.props.error), false);
    assert.equal(tree.find((node) => node.type === 'TeacherHero').props.action, undefined);
    tree.find((node) => node.type === 'Pressable' && node.props.accessibilityRole === 'button' && !node.props.accessibilityLabel).props.onPress();
    tree = app.render();
    assert.equal(tree.find((node) => node.type === 'Modal').props.visible, true);
    assert.ok(tree.some((node) => node.type === 'Field'));
    assert.equal(app.writes.length, 0, 'opening the dialog never creates a class');
  });
}

test('server failures remain retryable instead of appearing as no classes', () => {
  const tree = loadClasses({ loading: false, status: 500, data: null, error: 'Server error' }).render();
  assert.equal(tree.find((node) => node.type === 'Notice').props.error, 'Server error');
  assert.equal(tree.some((node) => node.type === 'Text' && node.props.children === 'لا يوجد صفوف'), false);
});

test('teachers with classes retain their class list and header create action', () => {
  const classes = [{ id: 8, name: 'Arabic', code: 'ABC123' }];
  const tree = loadClasses({ loading: false, status: null, data: { data: classes }, error: null }).render();
  assert.equal(tree.find((node) => node.type?.name === 'ClassList').props.items, classes);
  assert.ok(tree.find((node) => node.type === 'TeacherHero').props.action);
});
