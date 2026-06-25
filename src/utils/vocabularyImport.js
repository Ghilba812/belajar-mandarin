function cleanText(value) {
  return String(value ?? '').trim();
}

function normalizeVocabularyEntry(rawEntry, index, usedIds = new Set()) {
  const entry = rawEntry && typeof rawEntry === 'object' ? rawEntry : {};
  const hanzi = cleanText(entry.hanzi || entry.word || entry.term);
  if (!hanzi) {
    return null;
  }

  const pinyin = cleanText(entry.pinyin || entry.pronunciation || '');
  const indonesian = cleanText(entry.indonesian || entry.meaning || entry.translation || '');
  const category = cleanText(entry.category || entry.tag || 'General');
  const level = cleanText(entry.level || entry.difficulty || 'Beginner');

  let id = entry.id;
  if (typeof id === 'number' && Number.isFinite(id) && !usedIds.has(id)) {
    usedIds.add(id);
  } else {
    id = 1000000 + index;
    while (usedIds.has(id)) {
      id += 1;
    }
    usedIds.add(id);
  }

  return {
    id,
    hanzi,
    pinyin,
    indonesian,
    category,
    level,
    favorite: Boolean(entry.favorite),
    mastered: Boolean(entry.mastered),
  };
}

export function parseVocabularyFile(text) {
  const rawText = cleanText(text);
  if (!rawText) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) {
      return normalizeEntries(parsed);
    }
    if (parsed && Array.isArray(parsed.items)) {
      return normalizeEntries(parsed.items);
    }
  } catch {
    // Fallback to plain text parsing below.
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.split('#')[0].trim())
    .filter(Boolean);

  const usedIds = new Set();
  return lines
    .map((line, index) => {
      const parts = line
        .split(/\s*\|\s*|\s*\t\s*|\s*,\s*/)
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length < 3) {
        return null;
      }

      const [hanzi, pinyin, indonesian, category = 'General', level = 'Beginner'] = parts;
      return normalizeVocabularyEntry(
        { hanzi, pinyin, indonesian, category, level },
        index,
        usedIds,
      );
    })
    .filter(Boolean);
}

export function normalizeEntries(entries) {
  const usedIds = new Set();
  return (entries || [])
    .map((entry, index) => normalizeVocabularyEntry(entry, index, usedIds))
    .filter(Boolean);
}

export function appendImportedVocabulary(existingEntries = [], newEntries = []) {
  const merged = [...existingEntries];
  const signatures = new Set(merged.map((entry) => `${entry.hanzi}::${entry.pinyin}::${entry.indonesian}`));
  const usedIds = new Set(merged.map((entry) => entry.id));

  const normalizedNewEntries = normalizeEntries(newEntries);
  normalizedNewEntries.forEach((entry, index) => {
    const signature = `${entry.hanzi}::${entry.pinyin}::${entry.indonesian}`;
    if (signatures.has(signature)) {
      return;
    }

    const nextEntry = normalizeVocabularyEntry({ ...entry, id: undefined }, index + 100000, usedIds);
    if (nextEntry) {
      merged.push(nextEntry);
      signatures.add(signature);
    }
  });

  return merged;
}

const IMPORTED_VOCAB_STORAGE_KEY = 'mandarin-imported-vocabulary-v1';

export function readImportedVocabulary(profileId) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(`${IMPORTED_VOCAB_STORAGE_KEY}:${profileId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveImportedVocabulary(profileId, entries) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${IMPORTED_VOCAB_STORAGE_KEY}:${profileId}`, JSON.stringify(entries));
}
