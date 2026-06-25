import test from 'node:test';
import assert from 'node:assert/strict';
import { appendImportedVocabulary, parseVocabularyFile } from './vocabularyImport.js';

test('parseVocabularyFile parses delimited text entries', () => {
  const entries = parseVocabularyFile('学习|xuéxí|belajar|Daily|Beginner\n工作|gōngzuò|bekerja|Daily|Beginner');

  assert.equal(entries.length, 2);
  assert.equal(entries[0].hanzi, '学习');
  assert.equal(entries[0].pinyin, 'xuéxí');
  assert.equal(entries[0].category, 'Daily');
  assert.equal(entries[1].level, 'Beginner');
});

test('appendImportedVocabulary avoids duplicates', () => {
  const existing = [{ id: 1, hanzi: '学习', pinyin: 'xuéxí', indonesian: 'belajar', category: 'Daily', level: 'Beginner', favorite: false, mastered: false }];
  const next = appendImportedVocabulary(existing, [{ hanzi: '学习', pinyin: 'xuéxí', indonesian: 'belajar', category: 'Daily', level: 'Beginner' }]);

  assert.equal(next.length, 1);
});
