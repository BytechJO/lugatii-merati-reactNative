const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(name, globals = {}) {
  const filename = path.resolve(__dirname, '../src/core', name + '.ts');
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id === './types' ? load('types') : id === './games' ? load('games') : require(id), process: { env: {} }, AbortController, setTimeout, clearTimeout, ...globals });
  return module.exports;
}

test('letter game availability removes duplicate and unknown records in the shared four-game order', () => {
  const { availableGameTypes } = load('games');
  const rows = Array.from({ length: 28 }, () => [
    { game_type: 'sorting' }, { game_type: 'word_catch' },
    { game_type: 'balloon_pop' }, { game_type: 'memory_match' },
    { game_type: 'unknown' }, {},
  ]).flat();
  assert.deepEqual(Array.from(availableGameTypes(rows)), ['word_catch', 'sorting', 'memory_match', 'balloon_pop']);
  assert.deepEqual(Array.from(availableGameTypes([{ game_type: 'sorting' }, { game_type: 'sorting' }])), ['sorting']);
  assert.equal(availableGameTypes([]).length, 0);
});

test('word catch uses the reference batches and falling speed with current-letter words', () => {
  const { catchBatch } = load('word-catch');
  const config = { correctWords: ['target'], wrongWords: ['other'], minSpeed: 2, maxSpeed: 5 };
  const first = catchBatch(config, 0, 7, () => 0);
  assert.equal(first.length, 1);
  assert.equal(first[0].id, 7);
  assert.equal(first[0].word, 'target');
  assert.equal(first[0].duration, 10000);
  const batch = catchBatch(config, 9, 20, () => 0.999);
  assert.equal(batch.length, 3);
  assert.deepEqual(Array.from(batch, (word) => word.id), [20, 21, 22]);
  batch.forEach((word, lane) => {
    assert.equal(word.lane, lane); assert.equal(word.lanes, 3);
    assert.equal(word.word, 'other'); assert.equal(word.startsWithTarget, false);
    assert.ok(word.offset >= 0 && word.offset < 1);
    assert.ok(word.duration >= 10000 / 1.6 && word.duration <= 25000 / 1.6);
  });
  assert.equal(catchBatch({}, 0, 1).length, 0);
});

test('word catch counts each bubble once, ignores wrong-word misses and finishes at configured limits', () => {
  const { createCatchRound } = load('word-catch');
  const round = createCatchRound({ maxMistakes: 2, scorePerCorrect: 7 });
  assert.equal(round.resolve({ id: 1, startsWithTarget: false }, false).mistakes, 0);
  assert.equal(round.resolve({ id: 2, startsWithTarget: true }, true).score, 7);
  assert.equal(round.resolve({ id: 2, startsWithTarget: true }, false), null);
  assert.equal(round.resolve({ id: 3, startsWithTarget: true }, false).mistakes, 1);
  const end = round.resolve({ id: 4, startsWithTarget: false }, true).outcome;
  assert.equal(end.won, false); assert.equal(end.score, 7); assert.equal(end.mistakes, 2);
  assert.equal(round.resolve({ id: 5, startsWithTarget: true }, true), null);
  const winner = createCatchRound({ scorePerCorrect: 7 }); let result;
  for (let id = 0; id < 10; id++) result = winner.resolve({ id, startsWithTarget: true }, true);
  assert.equal(result.outcome.won, true); assert.equal(result.outcome.score, 70);
});

test('sorting uses window drop coordinates and ignores outside, missing and repeated placements', () => {
  const { sortingZoneAt, createSortingRound } = load('sorting');
  const zones = [{ x: 200, y: 300, width: 140, height: 220 }, { x: 20, y: 300, width: 140, height: 220 }];
  assert.equal(sortingZoneAt(zones, 220, 320), 0);
  assert.equal(sortingZoneAt(zones, 50, 320), 1);
  assert.equal(sortingZoneAt(zones, 180, 320), -1);
  assert.equal(sortingZoneAt([null, null], 20, 30), -1);
  const round = createSortingRound({ items: [{ word: 'target', startsWithTarget: true }, { word: 'other', startsWithTarget: false }], scorePerCorrect: 7, maxMistakes: 2 });
  assert.equal(round.drop(99, true), null);
  const wrong = round.drop(0, false);
  assert.equal(wrong.moves, 1); assert.equal(wrong.mistakes, 1); assert.equal(wrong.placed.length, 0);
  const correct = round.drop(0, true);
  assert.equal(correct.score, 7); assert.equal(correct.moves, 2);
  assert.equal(round.drop(0, true), null);
  const end = round.drop(1, false).outcome;
  assert.equal(end.won, true); assert.equal(end.score, 14); assert.equal(end.mistakes, 1);
  assert.equal(round.drop(1, false), null);
});

test('sorting ends at the configured mistake limit without reporting a completed board', () => {
  const { createSortingRound } = load('sorting');
  const round = createSortingRound({ maxMistakes: 2, items: [{ word: 'target', startsWithTarget: true }] });
  assert.equal(round.drop(0, false).outcome, null);
  const outcome = round.drop(0, false).outcome;
  assert.equal(outcome.won, false); assert.equal(outcome.mistakes, 2); assert.equal(outcome.score, 0);
  assert.equal(round.drop(0, true), null);
});

test('memory locks two flipped cards, rejects repeat taps and matches by the reference letter prefix rule', () => {
  const { createMemoryRound } = load('memory');
  const round = createMemoryRound({ pairs: [{ letter: 'ب', word: 'بطة' }, { letter: 'ب', word: 'باب' }], scorePerMatch: 9 });
  assert.equal(round.cards.length, 4);
  assert.equal(round.choose(99), null);
  assert.equal(round.choose(0).moves, 0);
  assert.equal(round.choose(0), null);
  assert.equal(round.choose(3).pending, true);
  assert.equal(round.choose(1), null);
  let result = round.settle();
  assert.equal(result.state.score, 9); assert.equal(result.state.matched.length, 2);
  assert.equal(round.choose(0), null);
  round.choose(1); round.choose(2); result = round.settle();
  assert.equal(result.outcome.won, true); assert.equal(result.outcome.moves, 2); assert.equal(result.outcome.score, 18);
  assert.equal(round.settle(), null); assert.equal(round.choose(1), null);
});

test('memory turns mismatches back over and gives the tenth successful move priority over the move limit', () => {
  const { createMemoryRound } = load('memory');
  const config = { pairs: [{ letter: 'ب', word: 'باب' }, { letter: 'ت', word: 'تمر' }] };
  const round = createMemoryRound(config);
  for (let i = 0; i < 8; i++) {
    round.choose(0); round.choose(3); const result = round.settle();
    assert.equal(result.state.flipped.length, 0); assert.equal(result.state.matched.length, 0); assert.equal(result.outcome, null);
  }
  round.choose(0); round.choose(1); assert.equal(round.settle().outcome, null);
  round.choose(2); round.choose(3); const won = round.settle().outcome;
  assert.equal(won.moves, 10); assert.equal(won.won, true); assert.equal(won.score, 20);
  const lost = createMemoryRound(config); let result;
  for (let i = 0; i < 10; i++) { lost.choose(0); lost.choose(3); result = lost.settle(); }
  assert.equal(result.outcome.won, false); assert.equal(result.outcome.moves, 10); assert.equal(result.outcome.score, 0);
});

test('balloon levels, appearance and spawn timing follow the reference and current-letter data', () => {
  const { balloonSettings, spawnBalloon } = load('balloons');
  const config = { words: [{ word: 'target', startsWithTarget: true }, { word: 'other', startsWithTarget: false }], spawn: { baseInterval: 1500, levelFactor: 100, minInterval: 800 } };
  assert.equal(balloonSettings(config, 0).level, 1);
  assert.equal(balloonSettings(config, 0).interval, 1400);
  assert.equal(balloonSettings(config, 0).duration, 13700);
  assert.equal(balloonSettings(config, 50).level, 2);
  assert.equal(balloonSettings(config, 50).interval, 1300);
  assert.equal(balloonSettings(config, 10000).interval, 800);
  assert.equal(balloonSettings(config, 10000).duration, 2000);
  const balloon = spawnBalloon(config, 50, 7, () => 0.999);
  assert.equal(balloon.id, 7); assert.equal(balloon.word, 'other'); assert.equal(balloon.startsWithTarget, false);
  assert.equal(balloon.image, 3); assert.ok(balloon.offset >= 0 && balloon.offset < 1); assert.equal(balloon.popped, false);
  const colors = [0, 0.25, 0.5, 0.75].map((value) => spawnBalloon(config, 0, 1, () => value).image);
  assert.deepEqual(colors, [0, 1, 2, 3]);
  assert.equal(spawnBalloon({}, 0, 1), null);
});

test('student report converts each lesson score unit and bounds progress bars', () => {
  const { activityPercentage } = load('student-progress');
  assert.equal(activityPercentage('learn', 1), 100);
  assert.equal(activityPercentage('write', 0), 0);
  assert.equal(activityPercentage('position', 3), 75);
  assert.equal(activityPercentage('tashkeel', 2), 50);
  assert.equal(activityPercentage('game', 67), 67);
  assert.equal(activityPercentage('game', 240), 100);
  assert.equal(activityPercentage('video', -1), 0);
  assert.equal(activityPercentage('learn', NaN), 0);
  assert.equal(activityPercentage('unknown', 3), 0);
});
test('login maps the existing backend userId and rejects the wrong account role', async () => {
  const api = load('api', { fetch: async () => ({ ok: true, status: 200, json: async () => ({ token: 'fixture', userId: 7, role: 2, username: 'Student' }) }) });
  const session = await api.signIn('test@example.com', 'fixture', 'student');
  assert.equal(session.user.id, 7);
  assert.equal(session.user.role, 'student');
  await assert.rejects(api.signIn('test@example.com', 'fixture', 'teacher'));
});
test('activity completion preserves all six shared lesson IDs and authentication', async () => {
  const requests = [];
  const api = load('api', { fetch: async (url, options) => { requests.push({ url, ...options }); return { ok: true, status: 200, json: async () => ({ success: true }) }; } });
  api.setApiToken('fixture');
  for (const [activity, lesson] of [['learn', 1], ['write', 2], ['position', 12], ['tashkeel', 3], ['video', 4], ['game', 5]]) {
    await api.saveProgress(activity, 9, 3);
    assert.equal(requests.at(-1).headers.Authorization, 'Bearer fixture');
    assert.deepEqual(JSON.parse(requests.at(-1).body), { letter_id: 9, lesson_id: lesson, lesson_type: activity, score: 3, completed: true });
  }
});
test('game result persists before counting played games and completing the shared lesson', async () => {
  const paths = [];
  const api = load('api', { fetch: async (url) => { paths.push(new URL(url).pathname); return { ok: true, status: 200, json: async () => url.endsWith('/progress') ? { totalGames: 4, playedGamesCount: 4 } : { success: true } }; } });
  await api.saveGame(6, 9, 30, 12);
  assert.deepEqual(paths, ['/lessons/saveGameResult', '/lessons/9/games/progress', '/progress/upsertProgress']);
});
test('failed API writes reject and do not mark games complete', async () => {
  let calls = 0;
  const api = load('api', { fetch: async () => { calls++; return { ok: false, status: 403, json: async () => ({ message: 'Forbidden' }) }; } });
  await assert.rejects(api.saveGame(6, 9, 30, 12), /Forbidden/);
  assert.equal(calls, 1);
});
test('memory matching follows the existing letter prefix rule', () => {
  const { memoryMatch, shuffle } = load('games');
  assert.equal(memoryMatch({ type: 'letter', content: 'ب' }, { type: 'word', content: 'بطة' }), true);
  assert.equal(memoryMatch({ type: 'letter', content: 'ب' }, { type: 'word', content: 'أسد' }), false);
  assert.equal(memoryMatch({ type: 'letter', content: 'ب' }, { type: 'letter', content: 'ب' }), false);
  const original = [1, 2, 3, 4]; assert.deepEqual(Array.from(shuffle(original)).sort(), original); assert.deepEqual(original, [1, 2, 3, 4]);
});
test('coloring counts only glyph samples and handles fast strokes and repeated painting', () => {
  const { markCoverage } = load('coloring'); const covered = new Set();
  const samples = [[1, 1], [5, 1], [9, 1], [5, 15]];
  assert.equal(markCoverage(samples, covered, [0, 1], [10, 1], 2), 75);
  assert.equal(markCoverage(samples, covered, [0, 1], [10, 1], 2), 75);
  assert.equal(markCoverage(samples, covered, [5, 15], [5, 15], 2), 100);
});
test('all 28 Arabic glyphs have mask assets and nonempty coverage samples', () => {
  const masks = require('../src/data/letter-masks.json');
  assert.equal(Object.keys(masks).length, 28);
  Object.values(masks).forEach((samples) => { assert(samples.length > 20); assert(samples.every(([x, y]) => x >= 0 && y >= 0 && x < 256 && y < 256)); });
  for (let index = 0; index < 28; index++) assert(fs.existsSync(path.resolve(__dirname, '../assets/letters', index + '.png')));
});
