// Copies/renders the existing web artwork. No replacement artwork is generated.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { Resvg } = require(process.env.RESVG_MODULE || path.join(os.tmpdir(), 'lugati-ui-tools/node_modules/@resvg/resvg-js'));
const root = path.resolve(__dirname, '../..');
const source = path.join(root, 'frontend/src/assets');
const output = path.join(root, 'mobile/assets/design');
fs.mkdirSync(output, { recursive: true });
const artwork = {
  splashBackground: 'splash_background.svg', splashPen: 'pen.svg',
  accountBackground: 'choose_account_type.svg', accountTeacher: 'teacher ChooseAccountType.png', accountStudent: 'student ChooseAccountType.png',
  loginBackground: 'login bg.svg', studentLoginBackground: 'background_img_login_page.jpg', headerDrops: 'drops_login (1).svg',
  loginTiger: 'tiger_login.svg', tiger: 'tiger.svg', dashboardTiger: 'tiger_dashborad.svg', classroomTiger: 'my-class-tiger.svg',
  user: 'Users.svg', accountUser: 'userIcon.svg', home: 'home_02.svg', logout: 'Log out.svg', back: 'back_icon.svg',
  accountArrowRight: 'ArrowRight.svg', accountArrowLeft: 'ArrowLeft.svg',
  teacherSparkle: 'teacher_sparckle.svg',
  classroomEmpty: 'write icon nave.svg',
  lettersSparkleLeft: 'sparckl_01.svg', lettersSparkleRight: 'sparckl_02.svg', activityAlphabet: 'abc.svg', videoCorner: 'vector_video.svg', quizRestart: 'Icon.svg', gameStart: 'game_botton.svg',
  progressHeader: 'headerBackground_Progress.svg', progressActivities: 'backgroundActivites.svg', progressFooter: 'footerProgress.svg', progressUser: 'Users (1).svg',
  progressLearn: 'Learn.svg', progressWrite: 'Write.svg', progressTashkeel: 'Tashkeel.svg', progressPosition: 'Position.svg', progressVideo: 'Video.svg', progressGame: 'Game.svg',
  alphabet: 'alphabet login.svg', letterBackground: 'background-letterdashboard.svg', activityBackground: 'background-learnLetter.svg',
  letterContainer: 'container_alphabet.svg', learn: 'learn_alphabet 2.svg', write: 'write_alphabet 2.svg',
  position: 'location_alphabet 2.svg', tashkeel: 'tashkeel_alphabet 2.svg', video: 'videos_alphabet 2.svg', game: 'games_alphabet 2.svg',
  learnNav: 'learn_alphabet.svg', writeNav: 'write_alphabet.svg', positionNav: 'location_alphabet.svg', tashkeelNav: 'tashkeel_alphabet (2).svg', videoNav: 'videos_alphabet.svg', gameNav: 'games_alphabet.svg',
  successBackground: 'successJoinBg.svg', successClass: 'success_joinClass.svg', star: 'star_02.svg', book: 'book.svg', pen: 'pen_02.svg',
  lamb: 'lamb.svg', ain: 'alainLetter.svg', teacherBackground: 'Backgroun_teacher.svg', teacherBooks: 'bookes2.svg', teacherLaptop: 'labtop_teacherDashborad.svg', teacherAlphabet: 'alphabet teacherDashboard.svg',
  catchCard: 'wordCatch.png', sortCard: 'sorting.png', memoryCard: 'wordMatch.png', balloonCard: 'balloon2.png',
  catchBackground: 'background-game-catch.png', catchLoading: 'background_catchLoader 2.png', sortingBackground: 'background-game-sort.png', sortingLoading: 'background_sorting.png', sortingWordCard: 'wordCard-sortGame.svg', memoryBackground: 'background-game-match.png', memoryLoading: 'background_wordMatch.png', memoryBack: 'background_imgMatch.svg', balloonBackground: 'background-game-balloon.png',
  balloonLoading: 'background_balloon.png', balloonRed: 'pink.svg', balloonPink: 'pink_balloon copy.svg', balloonYellow: 'yallow.svg', balloonBlue: 'blue_balloon copy.svg', balloonPopSound: 'balloon pop.mp3',
  questionBubble: 'vector_background.png', point: 'point_icon.svg', badge: 'badeg_end.svg', finishDecoration: 'vector_end.svg', lock: 'lockIcon.svg', check: 'check_icon.svg',
  resourceRawad: 'books_laibrarey.svg', resourceMirati: 'books_laibrarey 2.svg', resourceHeader: 'girl-2.svg',
  resourceCheatsheet: 'cheatsheet.svg', resourceAlphabet: 'alphabet Card.svg', resourceActivities: 'activeties.svg', resourcePlan: 'Plan_img.svg', resourceWords: 'Word_card.svg', resourceEvaluation: 'evaluation.svg',
};
const requires = [];
const manifest = [];
function convert(key, relative) {
  const input = path.join(source, relative);
  const svg = path.extname(input).toLowerCase() === '.svg';
  const filename = key + (svg ? '.png' : path.extname(input));
  const target = path.join(output, filename);
  if (svg) {
    const width = /Background|Drops/.test(key) ? 1600 : /Tiger|tiger|Class/.test(key) ? 700 : 500;
    const resvg = new Resvg(fs.readFileSync(input), { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true } });
    fs.writeFileSync(target, resvg.render().asPng());
  } else fs.copyFileSync(input, target);
  requires.push(`  ${JSON.stringify(key)}: require('../../assets/design/${filename}'),`);
  manifest.push({ key, source: path.relative(root, input).replaceAll('\\', '/'), output: `assets/design/${filename}` });
}
for (const [key, relative] of Object.entries(artwork)) convert(key, relative);
const cards = fs.readFileSync(path.join(root, 'frontend/src/data/letterCards.ts'), 'utf8');
const letters = [];
for (const match of cards.matchAll(/import (\w+) from "\.\.\/assets\/([^"]+)"/g)) {
  const key = `letter_${letters.length}`;
  convert(key, match[2]); letters.push(key);
}
fs.writeFileSync(path.join(root, 'mobile/src/data/design.ts'), `// Original frontend artwork. Regenerate with scripts/sync-design-assets.cjs.\nexport const artwork = {\n${requires.join('\n')}\n};\nexport const letterArtwork = [${letters.map(k => `artwork.${k}`).join(', ')}];\n`);
fs.writeFileSync(path.join(output, 'sources.json'), JSON.stringify(manifest, null, 2) + '\n');
const ts = require(path.join(root, 'mobile/node_modules/typescript'));
const resources = ts.createSourceFile('TeacherResources.tsx', fs.readFileSync(path.join(root, 'frontend/src/components/TeacherResources.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let resourceData = {};
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(resources) === 'resourcesByLibrary') {
    resourceData = Object.fromEntries(node.initializer.properties.map((library) => [library.name.getText(resources), library.initializer.elements.map((item) => Object.fromEntries(item.properties.map((property) => [property.name.getText(resources), ts.isStringLiteral(property.initializer) ? property.initializer.text : ts.isNumericLiteral(property.initializer) ? Number(property.initializer.text) : property.initializer.getText(resources)])))]));
  }
  ts.forEachChild(node, visit);
}
visit(resources);
fs.writeFileSync(path.join(root, 'mobile/src/data/resources.json'), JSON.stringify(resourceData, null, 2) + '\n');
console.log(`Prepared ${manifest.length} assets directly from frontend artwork.`);
