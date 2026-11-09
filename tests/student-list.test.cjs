const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadStudentList() {
  const filename = path.resolve(__dirname, '../src/components/StudentList.tsx');
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => {
    if (id === 'react-native') return { View: 'View', Pressable: 'Pressable', Text: 'Text', StyleSheet: { create: (styles) => styles } };
    if (id === './StudentIcon') return { StudentIcon: () => null };
    return require(id);
  } });
  return module.exports.StudentList;
}
function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object') return [];
  return [node, ...elements(node.props?.children)];
}
for (const compact of [true, false]) {
  test(`student list loads, displays every student and opens the selected report (${compact ? 'phone' : 'wide'})`, () => {
    const StudentList = loadStudentList();
    const students = [
      { id: 7, username: 'First student', email: 'first@example.test' },
      { id: 9, username: 'Second student', email: 'second@example.test' },
    ];
    const opened = [];
    const tree = elements(StudentList({ students, compact, onOpen: (id) => opened.push(id) }));
    const text = JSON.stringify(tree.filter((node) => node.type === 'Text').map((node) => node.props.children));
    for (const student of students) {
      assert.ok(text.includes(student.username));
      assert.ok(text.includes(student.email));
      const button = tree.find((node) => node.type === 'Pressable' && node.props.accessibilityLabel?.includes(student.username));
      assert.ok(button, 'student report action is available');
      button.props.onPress();
    }
    assert.deepEqual(opened, [7, 9]);
  });
}
