import { normalizeEntries, readImportedVocabulary } from './vocabularyImport';

const vocabularyModules = import.meta.glob('../data/users/*.json', { eager: true });

export function importVocabularyByProfile(fileName, profileId = null) {
  const moduleEntry = vocabularyModules[`../data/users/${fileName}`];
  const data = moduleEntry?.default || moduleEntry || [];
  const baseItems = normalizeEntries(data);
  const importedItems = (profileId ? readImportedVocabulary(profileId) : []).map((item, index) => ({
    ...item,
    id: item.id ?? index + 1000000,
    favorite: Boolean(item.favorite),
    mastered: Boolean(item.mastered),
  }));

  return [...baseItems, ...importedItems];
}
