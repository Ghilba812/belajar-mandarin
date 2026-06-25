const vocabularyModules = import.meta.glob('../data/users/*.json', { eager: true });

export function importVocabularyByProfile(fileName) {
  const moduleEntry = vocabularyModules[`../data/users/${fileName}`];
  const data = moduleEntry?.default || moduleEntry || [];
  return data.map((item, index) => ({
    ...item,
    id: item.id ?? index + 1,
    favorite: Boolean(item.favorite),
    mastered: Boolean(item.mastered),
  }));
}
