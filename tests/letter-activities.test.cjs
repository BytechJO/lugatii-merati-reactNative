const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function localModule(relative, mocks = {}) {
  const file = path.resolve(__dirname, relative);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => mocks[id] ?? require(id) });
  return module.exports;
}
const design = { artwork: new Proxy({}, { get: (_, key) => String(key) }) };
const gameRules = localModule('../src/core/games.ts');
const gameCards = localModule('../src/data/game-cards.ts', { './design': design });
const positionQuestion = localModule('../src/components/PositionQuestion.tsx', {
  'react-native': { ImageBackground: 'ImageBackground', Pressable: 'Pressable', Text: 'Text', View: 'View', useWindowDimensions: () => ({ width: 390, height: 844 }) },
  'expo-linear-gradient': { LinearGradient: 'LinearGradient' },
  '../data/design': design,
  '../data/letters': { lettersComp: [{ arabic: 'ب', name: 'باء' }] },
});
const tashkeelQuestion = localModule('../src/components/TashkeelQuestion.tsx', {
  react: { useState: () => [null, () => {}] },
  'react-native': { ImageBackground: 'ImageBackground', Pressable: 'Pressable', Text: 'Text', View: 'View', useWindowDimensions: () => ({ width: 390, height: 844 }) },
  'expo-linear-gradient': { LinearGradient: 'LinearGradient' },
  '../data/design': design,
  '../data/letters': { lettersComp: [{ arabic: 'أ', name: 'ألف' }, { arabic: 'ب', name: 'باء' }] },
});

// Exercise screen handlers without a device, network, or learner database writes.
function screen(name, { teacher = false, data, component = name, ...overrides } = {}) {
  const values = []; let cursor = 0;
  let effects = [];
  const writes = []; const timers = []; const intervals = []; const audioEvents = [];
  const player = { volume: 1, pause() { audioEvents.push('pause'); }, seekTo: async () => {}, play() { audioEvents.push('play'); } };
  const react = {
    useState(initial) {
      const slot = cursor++;
      if (!(slot in values)) values[slot] = typeof initial === 'function' ? initial() : initial;
      return [values[slot], (next) => { values[slot] = typeof next === 'function' ? next(values[slot]) : next; }];
    },
    useRef(initial) {
      const slot = cursor++;
      if (!(slot in values)) values[slot] = { current: initial };
      return values[slot];
    },
    useEffect(callback) { effects.push(callback); },
    useMemo(callback) { return callback(); },
    useCallback(callback) { return callback; },
  };
  const filename = path.resolve(__dirname, '../src/components', name + '.tsx');
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mocks = {
    react,
    'react-native': { Image: 'Image', ImageBackground: 'ImageBackground', Modal: 'Modal', Pressable: 'Pressable', Text: 'Text', View: 'View', StyleSheet: { create: (styles) => styles }, useWindowDimensions: () => ({ width: 390, height: 844 }) },
    'expo-router': { router: { push: (url) => writes.push(['navigation', url]), replace: (url) => writes.push(['navigation', url]) } },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    'expo-linear-gradient': { LinearGradient: 'LinearGradient' },
    './ui': { Button: 'Button', Card: 'Card', Label: 'Label', Loading: 'Loading', Notice: 'Notice', colors: { purple: '#652B82', ink: '#28345F' } },
    './LessonVideo': { LessonVideo: 'LessonVideo' },
    './VerticalScrollView': { VerticalScrollView: 'VerticalScrollView' },
    './PositionQuestion': positionQuestion,
    './TashkeelQuestion': tashkeelQuestion,
    './PositionResult': { PositionResult: 'PositionResult' },
    './SortingBoard': { SortingBoard: 'SortingBoard' },
    './MemoryBoard': { MemoryBoard: 'MemoryBoard' },
    './BalloonBoard': { BalloonBoard: 'BalloonBoard' },
    './GameLoadingScreen': { GameLoadingScreen: 'GameLoadingScreen' },
    'expo-audio': { useAudioPlayer: () => player },
    '../core/useResource': { useResource: () => ({ data, loading: false, error: null, reload() {} }) },
    '../core/session': { useSession: () => ({ session: { user: { role: teacher ? 'teacher' : 'student' } } }) },
    '../core/types': { lessons: { position: 12, tashkeel: 3 } },
    '../core/api': {
      errorMessage: (error) => String(error),
      request: async (...args) => { writes.push(['answer', ...args]); return { data: { is_correct: true, score: 1 } }; },
      saveProgress: async (...args) => { writes.push(['progress', ...args]); },
    },
    '../data/design': design,
    '../data/game-cards': gameCards,
    '../data/letters': { lettersComp: [{ arabic: 'ب', name: 'باء' }, { arabic: 'ت', name: 'تاء' }] },
    '../core/games': gameRules,
    '../core/memory': localModule('../src/core/memory.ts', { './games': gameRules }),
    '../core/balloons': localModule('../src/core/balloons.ts', { './games': gameRules }),
    '../core/word-catch': localModule('../src/core/word-catch.ts', { './games': gameRules }),
    ...overrides,
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => mocks[id] ?? require(id), setTimeout: (callback) => { timers.push(callback); return timers.length; }, clearTimeout() {}, setInterval: (callback) => { intervals.push(callback); return intervals.length; }, clearInterval() {} });
  return { render(props = {}) { cursor = 0; effects = []; const tree = nodes(module.exports[component](props)); effects.forEach((callback) => callback()); return tree; }, writes, timers, intervals, audioEvents };
}
function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== 'object') return [];
  return [node, ...nodes(node.type === positionQuestion.PositionQuestion || node.type === tashkeelQuestion.TashkeelQuestion ? node.type(node.props) : node.props?.children)];
}
const settle = () => new Promise((resolve) => setImmediate(resolve));
const questions = [{ id: 11, question_text: '{"word":"one"}' }, { id: 12, question_text: '{"word":"two"}' }];

test('balloons pop with sound once, stop accepting input while inactive and finish once at ten correct words', async () => {
  const app = screen('BalloonBoard'); const outcomes = [];
  const props = { config: { words: [{ word: 'بطة', startsWithTarget: true }], scorePerCorrect: 10 }, symbol: 'ب', active: true, onEnd: (result) => outcomes.push(result), onBack() {} };
  let tree = app.render(props);
  tree.find((node) => node.props.onLayout).props.onLayout({ nativeEvent: { layout: { width: 350, height: 600 } } });
  app.render(props); app.timers.shift()(); tree = app.render(props);
  let balloon = tree.find((node) => node.type?.name === 'FloatingBalloonCard');
  assert.equal(balloon.props.balloon.word, 'بطة');
  balloon.props.onResolve(true); balloon.props.onResolve(true); await settle();
  tree = app.render(props);
  balloon = tree.find((node) => node.type?.name === 'FloatingBalloonCard');
  assert.equal(balloon.props.balloon.popped, true);
  assert.equal(app.audioEvents.filter((event) => event === 'play').length, 1);
  balloon.props.onRemoved(); app.render(props);
  for (let i = 1; i < 10; i++) {
    app.intervals.at(-1)(); tree = app.render(props);
    balloon = tree.find((node) => node.type?.name === 'FloatingBalloonCard' && !node.props.balloon.popped);
    if (i === 1) {
      tree = app.render({ ...props, active: false });
      const paused = tree.find((node) => node.type?.name === 'FloatingBalloonCard' && !node.props.balloon.popped);
      assert.equal(paused.props.active, false); paused.props.onResolve(true);
      assert.equal(outcomes.length, 0); tree = app.render(props);
      balloon = tree.find((node) => node.type?.name === 'FloatingBalloonCard' && !node.props.balloon.popped);
    }
    balloon.props.onResolve(true); tree = app.render(props);
  }
  await settle();
  assert.equal(outcomes.length, 1); assert.equal(outcomes[0].won, true); assert.equal(outcomes[0].score, 100);
  assert.equal(app.audioEvents.filter((event) => event === 'play').length, 10);
});

test('balloons ignore escaping distractors and count repeated wrong-balloon taps only once', () => {
  const app = screen('BalloonBoard'); const outcomes = [];
  const props = { config: { words: [{ word: 'تمر', startsWithTarget: false }], maxMistakes: 2 }, active: true, onEnd: (result) => outcomes.push(result), onBack() {} };
  let tree = app.render(props);
  tree.find((node) => node.props.onLayout).props.onLayout({ nativeEvent: { layout: { width: 350, height: 600 } } });
  app.render(props); app.timers.shift()(); tree = app.render(props);
  let balloon = tree.find((node) => node.type?.name === 'FloatingBalloonCard');
  balloon.props.onResolve(false); tree = app.render(props);
  assert.equal(outcomes.length, 0);
  for (let i = 0; i < 2; i++) {
    app.intervals.at(-1)(); tree = app.render(props);
    balloon = tree.find((node) => node.type?.name === 'FloatingBalloonCard' && !node.props.balloon.popped);
    balloon.props.onResolve(true); balloon.props.onResolve(true); tree = app.render(props);
  }
  assert.equal(outcomes.length, 1); assert.equal(outcomes[0].won, false); assert.equal(outcomes[0].mistakes, 2); assert.equal(outcomes[0].score, 0);
});

test('floating balloons render all original colors and disable input after popping', () => {
  const animation = () => ({ start() {}, stop() {} });
  const native = { Animated: { View: 'AnimatedView', Value: class { interpolate() { return {}; } stopAnimation(callback) { callback(0); } }, timing: animation, loop: animation, sequence: animation }, Easing: { linear() {}, sin() {}, inOut: (value) => value }, Image: 'Image', Text: 'Text', Pressable: 'Pressable', View: 'View' };
  const app = screen('BalloonBoard', { component: 'FloatingBalloonCard', 'react-native': native });
  let pressed = 0;
  const props = { balloon: { id: 1, word: 'بطة', startsWithTarget: true, image: 0, offset: 0.5, duration: 13700, popped: false }, field: { width: 350, height: 600 }, active: true, onResolve: () => pressed++, onRemoved() {} };
  const images = ['balloonRed', 'balloonPink', 'balloonYellow', 'balloonBlue'];
  for (let image = 0; image < images.length; image++) {
    const tree = app.render({ ...props, balloon: { ...props.balloon, image } });
    assert.equal(tree.find((node) => node.type === 'Image').props.source, images[image]);
    const button = tree.find((node) => node.type === 'Pressable');
    assert.equal(button.props.accessibilityLabel, 'بطة'); assert.equal(button.props.disabled, false);
  }
  let tree = app.render(props); tree.find((node) => node.type === 'Pressable').props.onPress(); assert.equal(pressed, 1);
  tree = app.render({ ...props, balloon: { ...props.balloon, popped: true } });
  assert.equal(tree.find((node) => node.type === 'Pressable').props.disabled, true);
  tree = app.render({ ...props, active: false });
  assert.equal(tree.find((node) => node.type === 'Pressable').props.disabled, true);
});

test('memory board flips two cards, locks extra choices, keeps matches and reports the final move count', () => {
  const app = screen('MemoryBoard'); const outcomes = [];
  const props = { config: { pairs: [{ letter: 'ب', word: 'بطة' }, { letter: 'ت', word: 'تمر' }] }, symbol: 'ب', active: true, onEnd: (result) => outcomes.push(result) };
  let tree = app.render(props);
  const card = (id) => tree.find((node) => node.type?.name === 'MemoryFlipCard' && node.props.card.id === id);
  card(0).props.onPress(); tree = app.render(props);
  assert.equal(card(0).props.visible, true);
  card(1).props.onPress(); tree = app.render(props);
  assert.ok(tree.filter((node) => node.type?.name === 'MemoryFlipCard').every((node) => node.props.disabled));
  card(2).props.onPress();
  app.timers.shift()(); tree = app.render(props);
  assert.equal(card(0).props.matched, true); assert.equal(card(1).props.matched, true);
  assert.equal(card(2).props.visible, false); assert.equal(outcomes.length, 0);
  card(2).props.onPress(); tree = app.render(props);
  app.timers.length = 0;
  card(3).props.onPress(); tree = app.render(props);
  app.timers.shift()();
  assert.equal(outcomes.length, 1); assert.equal(outcomes[0].won, true); assert.equal(outcomes[0].moves, 2); assert.equal(outcomes[0].score, 20);
});

test('memory card uses the original back, hides its accessible answer and shows matched styling after flipping', () => {
  const native = { Animated: { View: 'AnimatedView', Value: class { interpolate() { return {}; } }, spring: () => ({ start() {}, stop() {} }) }, Image: 'Image', Text: 'Text', Pressable: 'Pressable' };
  const app = screen('MemoryBoard', { component: 'MemoryFlipCard', 'react-native': native });
  const props = { card: { id: 0, content: 'بطة', type: 'word' }, size: 76, visible: false, matched: false, disabled: false, onPress() {} };
  let tree = app.render(props);
  assert.equal(tree[0].props.accessibilityLabel, 'بطاقة مقلوبة');
  assert.equal(tree.find((node) => node.type === 'Image').props.source, 'memoryBack');
  tree = app.render({ ...props, visible: true, matched: true, disabled: true });
  assert.ok(tree[0].props.accessibilityLabel.includes('بطة'));
  assert.ok(tree[0].props.disabled);
  assert.ok(tree.some((node) => node.props.style?.borderColor === '#FAD656'));
});

function sortingScreen(component = 'SortingBoard') {
  let handlers;
  const native = { ImageBackground: 'ImageBackground', Pressable: 'Pressable', Text: 'Text', View: 'View', useWindowDimensions: () => ({ width: 390, height: 844 }), Animated: { View: 'AnimatedView', ValueXY: class { setValue() {} getTranslateTransform() { return []; } } }, PanResponder: { create(config) { handlers = config; return { panHandlers: {} }; } } };
  const app = screen('SortingBoard', { component, 'react-native': native, '../core/sorting': localModule('../src/core/sorting.ts') });
  return { ...app, gestures: () => handlers };
}

test('sorting drag follows the finger after eight pixels and supports tap selection and cancellation', () => {
  const app = sortingScreen('SortingDraggable'); const calls = [];
  const props = { item: { id: 0, word: 'target', startsWithTarget: true }, size: 64, placed: false, selected: false, hidden: false, active: true, onSelect: () => calls.push('select'), onStart: (x, y) => calls.push(['start', x, y]), onMove: (x, y) => calls.push(['move', x, y]), onDrop: (x, y) => calls.push(['drop', x, y]), onCancel: () => calls.push('cancel') };
  app.render(props); const gesture = app.gestures();
  assert.equal(gesture.onStartShouldSetPanResponder(), true);
  gesture.onPanResponderGrant();
  gesture.onPanResponderMove(null, { dx: 3, dy: 2, moveX: 40, moveY: 60 });
  assert.equal(calls.length, 0);
  gesture.onPanResponderRelease(null, {});
  assert.deepEqual(calls, ['select']); calls.length = 0;
  gesture.onPanResponderGrant();
  gesture.onPanResponderMove(null, { dx: 9, dy: 2, moveX: 210, moveY: 320 });
  gesture.onPanResponderRelease(null, { moveX: 220, moveY: 330 });
  assert.deepEqual(calls, [['start', 210, 320], ['move', 210, 320], ['drop', 220, 330]]);
  gesture.onPanResponderGrant(); gesture.onPanResponderTerminate();
  assert.equal(calls.at(-1), 'cancel');
  app.render({ ...props, placed: true });
  assert.equal(gesture.onStartShouldSetPanResponder(), false);
  app.render({ ...props, active: false });
  assert.equal(gesture.onStartShouldSetPanResponder(), false);
});

test('sorting board measures native zones, returns outside drops and places a word once', () => {
  const app = sortingScreen(); const outcomes = [];
  const props = { config: { targetLetter: 'ب', items: [{ word: 'target', startsWithTarget: true }, { word: 'other', startsWithTarget: false }] }, symbol: 'ب', onEnd: (result) => outcomes.push(result) };
  let tree = app.render(props);
  const root = tree.find((node) => node.props.collapsable === false && typeof node.props.ref === 'object');
  root.props.ref.current = { measureInWindow(callback) { callback(20, 30, 350, 600); } };
  for (const button of tree.filter((node) => node.type === 'Pressable' && node.props.accessibilityHint)) {
    const target = button.props.accessibilityLabel === 'صندوق حرف ب';
    button.props.ref({ measureInWindow(callback) { callback(target ? 200 : 20, 300, 140, 230); } });
  }
  let card = tree.find((node) => node.type?.name === 'SortingDraggable' && node.props.item.startsWithTarget);
  card.props.onStart(80, 150);
  tree = app.render(props);
  assert.equal(tree.find((node) => node.type === 'VerticalScrollView').props.scrollEnabled, false);
  card.props.onDrop(180, 320);
  tree = app.render(props);
  card = tree.find((node) => node.type?.name === 'SortingDraggable' && node.props.item.startsWithTarget);
  assert.equal(card.props.placed, false);
  card.props.onStart(80, 150); card.props.onDrop(220, 320);
  tree = app.render(props);
  card = tree.find((node) => node.type?.name === 'SortingDraggable' && node.props.item.startsWithTarget);
  assert.equal(card.props.placed, true);
  card.props.onDrop(220, 320);
  const other = tree.find((node) => node.type?.name === 'SortingDraggable' && !node.props.item.startsWithTarget);
  other.props.onStart(80, 150); other.props.onDrop(50, 320);
  assert.equal(outcomes.length, 1); assert.equal(outcomes[0].score, 20); assert.equal(outcomes[0].won, true);
});

function coloringScreen(teacher = false, saveProgress) {
  let handlers;
  const app = screen('Coloring', {
    teacher, component: 'ColoringBoard',
    'react-native': {
      View: 'View', Pressable: 'Pressable', Text: 'Text',
      useWindowDimensions: () => ({ width: 390, height: 844 }),
      PanResponder: { create(config) { handlers = config; return { panHandlers: {} }; } },
    },
    'react-native-svg': { __esModule: true, default: 'Svg', Defs: 'Defs', G: 'G', Image: 'SvgImage', Mask: 'Mask', Path: 'Path' },
    './ActivityVideoIntro': { ActivityVideoIntro: 'ActivityVideoIntro' },
    '../core/coloring': localModule('../src/core/coloring.ts'),
    '../data/letter-masks.json': { ب: [[0, 0]], ت: [[0, 0]] },
    '../data/letter-images': { letterImages: { ب: 1, ت: 2 } },
    './ui': { Button: 'Button', Card: 'Card', Label: 'Label', Notice: 'Notice', s: { row: {} } },
    ...(saveProgress ? { '../core/api': { saveProgress, errorMessage: (error) => String(error) } } : {}),
  });
  return { ...app, gestures: () => handlers };
}

for (const symbol of ['ب', 'ت']) {
  test(`completed coloring stays editable, accepts another color and resets without clearing saved progress (${symbol})`, async () => {
    const app = coloringScreen();
    const props = { letterId: 9, symbol };
    let tree = app.render(props);
    const touch = { nativeEvent: { locationX: 0, locationY: 0 } };
    const gestures = app.gestures();
    assert.equal(gestures.onStartShouldSetPanResponder(), true);
    gestures.onPanResponderGrant(touch); gestures.onPanResponderRelease();
    await settle();
    tree = app.render(props);
    assert.equal(app.writes.length, 1);
    assert.equal(gestures.onStartShouldSetPanResponder(), true);
    assert.equal(gestures.onMoveShouldSetPanResponder(), true);
    tree.find((node) => node.type === 'Pressable' && node.props.accessibilityLabel === 'لون أزرق').props.onPress();
    app.render(props);
    gestures.onPanResponderGrant(touch); gestures.onPanResponderRelease();
    tree = app.render(props);
    assert.ok(tree.some((node) => node.type === 'Path' && node.props.stroke === '#3b82f6'));
    const reset = tree.find((node) => node.type === 'Button' && node.props.label === 'إعادة التلوين');
    assert.ok(!reset.props.disabled);
    reset.props.onPress();
    tree = app.render(props);
    assert.equal(tree.filter((node) => node.type === 'Path' && node.props.stroke).length, 0);
    assert.ok(JSON.stringify(tree).includes('تم حفظ تقدمك'));
    gestures.onPanResponderGrant(touch); gestures.onPanResponderRelease();
    await settle();
    tree = app.render(props);
    assert.ok(tree.some((node) => node.type === 'Path' && node.props.stroke === '#3b82f6'));
    assert.equal(app.writes.length, 1, 'repainting does not submit duplicate completion');
  });
}

test('teacher coloring preview stays read-only', () => {
  const app = coloringScreen(true);
  const tree = app.render({ letterId: 9, symbol: 'ب' });
  assert.equal(app.gestures().onStartShouldSetPanResponder(), false);
  assert.equal(app.gestures().onMoveShouldSetPanResponder(), false);
  assert.equal(tree.filter((node) => node.type === 'Button' || node.type === 'Pressable').length, 0);
  assert.equal(app.writes.length, 0);
});

test('word catch saves one result, keeps failed results for retry and replays only after saving', async () => {
  let resolveSave; let rejectSave; const submissions = [];
  const app = screen('WordCatchScreen', {
    component: 'CatchRound',
    'react-native': { Image: 'Image', ImageBackground: 'ImageBackground', Modal: 'Modal', Text: 'Text', View: 'View', AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    'expo-router': { useFocusEffect(callback) { callback(); } },
    './WordCatchGame': { WordCatchGame: 'WordCatchGame' },
    '../core/api': {
      saveGame(...args) { submissions.push(args); return new Promise((resolve, reject) => { resolveSave = resolve; rejectSave = reject; }); },
      errorMessage: (error) => String(error),
    },
  });
  const props = { game: { game_lesson_id: 17, letter_id: 9, data: { instruction: 'fixture' } }, letterId: 9, onBack() {} };
  let tree = app.render(props);
  const game = tree.find((node) => node.type === 'WordCatchGame');
  game.props.onEnd({ score: 40, won: false, mistakes: 3 });
  game.props.onEnd({ score: 40, won: false, mistakes: 3 });
  assert.equal(submissions.length, 1);
  assert.deepEqual(submissions[0].slice(0, 3), [17, 9, 40]);
  tree = app.render(props);
  assert.equal(tree.find((node) => node.type === 'WordCatchGame').props.active, false);
  let replay = tree.find((node) => node.type === 'Button' && node.props.label === 'العب مرة أخرى');
  assert.equal(replay.props.disabled, true);
  replay.props.onPress();
  rejectSave(new Error('offline')); await settle();
  tree = app.render(props);
  assert.ok(tree.find((node) => node.type === 'Notice').props.error);
  tree.find((node) => node.type === 'Notice').props.retry();
  assert.equal(submissions.length, 2);
  resolveSave(); await settle();
  tree = app.render(props);
  replay = tree.find((node) => node.type === 'Button' && node.props.label === 'العب مرة أخرى');
  assert.equal(replay.props.disabled, false);
  replay.props.onPress();
  tree = app.render(props);
  assert.equal(tree.filter((node) => node.type === 'Modal').length, 0);
  assert.equal(tree.find((node) => node.type === 'WordCatchGame').key, '1');
  assert.equal(submissions.length, 2);
});

for (const gameType of ['sorting', 'memory_match', 'balloon_pop']) {
for (const won of [true, false]) {
  test(`${gameType} result preserves completion saving and replay rules (${won ? 'completed board' : 'round limit'})`, async () => {
    const submissions = [];
    const app = screen('WordCatchScreen', {
      component: 'CatchRound',
      'react-native': { Image: 'Image', ImageBackground: 'ImageBackground', Modal: 'Modal', Text: 'Text', View: 'View', AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
      'expo-router': { useFocusEffect(callback) { callback(); } },
      './WordCatchGame': { WordCatchGame: 'WordCatchGame' },
      '../core/api': { saveGame: async (...args) => submissions.push(args), errorMessage: (error) => String(error) },
    });
    const engine = gameType === 'sorting' ? 'SortingBoard' : gameType === 'memory_match' ? 'MemoryBoard' : 'BalloonBoard';
    const props = { gameType, symbol: 'ب', game: { game_lesson_id: 18, letter_id: 9, data: { items: [{ word: 'target', startsWithTarget: true }] } }, letterId: 9, onBack() {} };
    let tree = app.render(props);
    const board = tree.find((node) => node.type === engine);
    assert.ok(board); assert.equal(board.props.symbol, 'ب');
    const result = { score: won ? 10 : 0, won, mistakes: won ? 0 : 3, moves: 10 };
    board.props.onEnd(result); board.props.onEnd(result); await settle();
    assert.equal(submissions.length, gameType !== 'sorting' || won ? 1 : 0);
    if (won) assert.deepEqual(submissions[0].slice(0, 3), [18, 9, 10]);
    tree = app.render(props);
    assert.equal(tree.find((node) => node.type === engine).props.active, false);
    if (gameType === 'memory_match') assert.ok(tree.filter((node) => node.type === 'Text').flatMap((node) => node.props.children).join('').includes('عدد الحركات: 10'));
    const replay = tree.find((node) => node.type === 'Button' && node.props.label === 'العب مرة أخرى');
    assert.equal(replay.props.disabled, false); replay.props.onPress();
    tree = app.render(props);
    assert.equal(tree.filter((node) => node.type === 'Modal').length, 0);
    assert.equal(tree.find((node) => node.type === engine).key, '1');
  });
}
}

test('coloring automatically saves before reset and preserves the drawing on save failure', async () => {
  let resolveSave; let rejectSave; let attempts = 0;
  const app = coloringScreen(false, () => {
    attempts++;
    return new Promise((resolve, reject) => { resolveSave = resolve; rejectSave = reject; });
  });
  const props = { letterId: 9, symbol: 'ب' };
  const resetButton = (tree) => tree.find((node) => node.type === 'Button' && node.props.label === 'إعادة التلوين');
  const strokes = (tree) => tree.filter((node) => node.type === 'Path' && node.props.stroke);
  app.render(props);
  app.gestures().onPanResponderGrant({ nativeEvent: { locationX: 0, locationY: 0 } });
  app.gestures().onPanResponderRelease();
  let tree = app.render(props);
  assert.equal(attempts, 1, 'saving starts on completing the drawing, before reset');
  assert.equal(resetButton(tree).props.disabled, true);
  resetButton(tree).props.onPress();
  tree = app.render(props);
  assert.equal(strokes(tree).length, 1);
  rejectSave(new Error('offline'));
  await settle();
  tree = app.render(props);
  assert.equal(resetButton(tree).props.disabled, true);
  resetButton(tree).props.onPress();
  tree = app.render(props);
  assert.equal(strokes(tree).length, 1, 'failed saving does not erase completed work');
  tree.find((node) => node.type === 'Notice').props.retry();
  assert.equal(attempts, 2);
  resolveSave();
  await settle();
  tree = app.render(props);
  assert.equal(resetButton(tree).props.disabled, false);
  assert.ok(JSON.stringify(tree).includes('تم حفظ تقدمك'));
  resetButton(tree).props.onPress();
  tree = app.render(props);
  assert.equal(strokes(tree).length, 0);
  assert.equal(attempts, 2);
});

for (const teacher of [true, false]) {
  test(`game catalog renders four shared cards despite duplicated backend rows (${teacher ? 'teacher' : 'student'})`, () => {
    const rows = Array.from({ length: 28 }, () => [
      { game_type: 'word_catch' }, { game_type: 'sorting' }, { game_type: 'memory_match' }, { game_type: 'invalid' },
    ]).flat();
    const app = screen('LetterGameCatalog', { teacher, data: { data: rows } });
    const tree = app.render({ letterId: 9, symbol: 'ب' });
    const buttons = tree.filter((node) => node.type === 'Pressable');
    assert.equal(buttons.length, 4);
    assert.equal(new Set(buttons.map((node) => node.key)).size, 4);
    assert.equal(buttons.filter((node) => !node.props.disabled).length, 3);
    for (const button of buttons) button.props.onPress();
    assert.equal(app.writes.length, 3);
    for (const [kind, url] of app.writes) {
      assert.equal(kind, 'navigation');
      assert.ok(url.includes('letterId=9'));
      assert.ok(url.includes(`symbol=${encodeURIComponent('ب')}`));
    }
    const next = app.render({ letterId: 10, symbol: 'ت' });
    next.find((node) => node.type === 'Pressable').props.onPress();
    assert.ok(app.writes.at(-1)[1].includes('letterId=10'));
    assert.ok(app.writes.at(-1)[1].includes(`symbol=${encodeURIComponent('ت')}`));
  });
}

test('teacher preview presents each game artwork and its current letter data without gameplay', () => {
  for (const gameType of gameRules.gameTypes) {
    const app = screen('GamePreview');
    let back = 0;
    const config = gameType === 'memory_match' ? { pairs: [{ letter: 'ب', word: 'بطة' }] } : { correctWords: ['بطة'], wrongWords: ['تمر'] };
    const tree = app.render({ gameType, symbol: 'ب', config, onBack() { back++; } });
    const images = tree.filter((node) => node.type === 'Image');
    assert.equal(images.length, 1);
    assert.equal(images[0].props.source, gameCards.gameCards[gameType].image);
    assert.ok(JSON.stringify(tree).includes('بطة'));
    const buttons = tree.filter((node) => node.type === 'Pressable');
    assert.equal(buttons.length, 1);
    buttons[0].props.onPress();
    assert.equal(back, 1);
    assert.equal(app.writes.length, 0);
  }
});

for (const kind of ['position', 'tashkeel']) {
  const answerLabel = kind === 'position' ? 'البداية' : 'فتحة';
  test(`${kind}: teacher can browse questions without submitting answers or progress`, async () => {
    const app = screen('Quiz', { teacher: true, data: { data: questions } });
    const props = { letterId: 7, symbol: 'x', kind };
    let tree = app.render(props);
    const choices = tree.filter((node) => node.type === 'Pressable' && node.props.accessibilityLabel === answerLabel);
    assert.equal(choices.length, 1);
    assert.equal(choices[0].props.disabled, true);
    for (const choice of choices) choice.props.onPress();
    await settle();
    tree.find((node) => node.props.accessibilityLabel === '\u0627\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629').props.onPress();
    tree = app.render(props);
    assert.ok(JSON.stringify(tree).includes('two'));
    assert.equal(app.writes.length, 0);
  });

  test(`${kind}: student submits once per answer and saves only after the final question`, async () => {
    const app = screen('Quiz', { data: { data: questions } });
    const props = { letterId: 7, symbol: 'x', kind };
    let tree = app.render(props);
    const choice = tree.find((node) => node.type === 'Pressable' && node.props.accessibilityLabel === answerLabel);
    choice.props.onPress(); choice.props.onPress();
    await settle();
    assert.equal(app.writes.length, 1);
    assert.equal(app.writes[0][2].body.lessons_id, kind === 'position' ? 12 : 3);
    app.timers.shift()();
    tree = app.render(props);
    tree.find((node) => node.type === 'Pressable' && node.props.accessibilityLabel === answerLabel).props.onPress();
    await settle();
    assert.equal(app.writes.filter(([type]) => type === 'answer').length, 2);
    const progress = app.writes.filter(([type]) => type === 'progress');
    assert.equal(progress.length, 1);
    assert.deepEqual(progress[0], ['progress', kind, 7, 2]);
  });
}

for (const kind of ['position', 'tashkeel']) {
test(`${kind} offers the expected answers and opens the next activity only after progress is saved`, async () => {
  let finishSave;
  const app = screen('Quiz', {
    data: { data: [questions[0]] },
    '../core/api': {
      request: async () => ({ data: { is_correct: true, score: 1 } }),
      saveProgress: () => new Promise((resolve) => { finishSave = resolve; }),
      errorMessage: (error) => String(error),
    },
  });
  const props = { letterId: 7, symbol: 'ب', kind };
  let tree = app.render(props);
  const text = tree.filter((node) => node.type === 'Text').flatMap((node) => node.props.children).join('');
  assert.ok(text.includes(kind === 'position' ? 'أين يقع حرف الباء' : 'ما هو تشكيل حرف الباء'));
  const labels = kind === 'position' ? ['البداية', 'الوسط', 'النهاية'] : ['فتحة', 'ضمة', 'كسرة', 'سكون'];
  const options = tree.filter((node) => node.type === 'Pressable' && labels.includes(node.props.accessibilityLabel));
  assert.equal(options.length, labels.length);
  options[0].props.onPress();
  await settle();
  tree = app.render(props);
  let result = tree.find((node) => node.type === 'PositionResult');
  assert.equal(result.props.saved, false);
  result.props.onNext();
  assert.equal(app.writes.length, 0);
  finishSave();
  await settle();
  tree = app.render(props);
  result = tree.find((node) => node.type === 'PositionResult');
  assert.equal(result.props.saved, true);
  result.props.onNext();
  assert.equal(app.writes.length, 1);
  assert.equal(app.writes[0][1], `/activity/${kind === 'position' ? 'tashkeel' : 'video'}?letterId=7&symbol=${encodeURIComponent('ب')}`);
});
}

test('tashkeel options display all four marks and use the correct alif form for kasra', () => {
  const answered = [];
  const tree = nodes(tashkeelQuestion.TashkeelQuestion({ symbol: 'أ', word: 'إِبْرَة', selected: null, feedback: null, disabled: false, teacher: false, onAnswer: (value) => answered.push(value) }));
  const options = tree.filter((node) => node.type === 'Pressable');
  assert.equal(options.length, 4);
  const letters = tree.filter((node) => node.type === 'Text').map((node) => node.props.children);
  for (const form of ['أَ', 'أُ', 'إِ', 'أْ']) assert.ok(letters.includes(form));
  for (const option of options) option.props.onPress();
  assert.deepEqual(answered, ['fatha', 'damma', 'kasra', 'sukun']);
});

for (const teacher of [true, false]) {
  test(`video cards save on playback completion only (${teacher ? 'teacher' : 'student'})`, async () => {
    const app = screen('Videos', { teacher, data: { data: [{ id: 1, video_title: 'Lesson title', youtube_url: 'https://example.test/video.mp4' }] } });
    let tree = app.render({ letterId: 7 });
    assert.ok(JSON.stringify(tree).includes('Lesson title'));
    assert.equal(tree.filter((node) => node.type === 'LessonVideo').length, 0);
    tree.find((node) => node.type === 'Pressable').props.onPress();
    tree = app.render({ letterId: 7 });
    assert.equal(app.writes.length, 0);
    tree.find((node) => node.type === 'LessonVideo').props.onEnded();
    await settle();
    assert.equal(app.writes.length, teacher ? 0 : 1);
    tree.find((node) => node.type === 'Modal').props.onRequestClose();
    tree = app.render({ letterId: 7 });
    assert.equal(tree.filter((node) => node.type === 'LessonVideo').length, 0);
  });
}

test('lesson intro waits for playback and allows missing-video previews without pretending playback ended', () => {
  let ended = 0;
  const props = { letterId: 7, lesson: 1, onContinue() {}, onEnded() { ended++; } };
  const app = screen('ActivityVideoIntro', { data: { data: [{ id: 1, youtube_url: 'https://example.test/video.mp4' }] } });
  let tree = app.render(props);
  assert.equal(tree.filter((node) => node.type === 'Button').length, 0);
  tree.find((node) => node.type === 'LessonVideo').props.onEnded();
  tree = app.render(props);
  assert.equal(tree.filter((node) => node.type === 'Button').length, 1);
  assert.equal(ended, 1);
  const missing = screen('ActivityVideoIntro', { data: { data: [] } });
  tree = missing.render(props);
  tree.find((node) => node.type === 'Button').props.onPress();
  assert.equal(ended, 1);
});
