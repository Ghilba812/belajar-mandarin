import { useMemo, useState } from 'react';
import styles from '../styles/VocabularyList.module.css';

export function VocabularyList({ vocabulary, favorites, mastered, onToggleFavorite, onToggleMastered }) {
  const [query, setQuery] = useState('');

  const filteredVocabulary = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return vocabulary;
    return vocabulary.filter((item) =>
      [item.hanzi, item.pinyin, item.indonesian, item.category].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [query, vocabulary]);

  return (
    <div className={styles.wrapper}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={styles.search}
        placeholder="Cari kata..."
      />

      <div className={styles.list}>
        {filteredVocabulary.map((item) => (
          <article key={item.id} className={styles.item}>
            <div className={styles.itemMain}>
              <div>
                <strong>{item.hanzi}</strong>
                <p>{item.indonesian}</p>
              </div>
              <span className={styles.category}>{item.category}</span>
            </div>
            <div className={styles.meta}>{item.pinyin}</div>
            <div className={styles.actions}>
              <button className={styles.secondary} onClick={() => onToggleFavorite(item.id)}>
                {favorites.includes(item.id) ? '★' : '☆'}
              </button>
              <button className={styles.secondary} onClick={() => onToggleMastered(item.id)}>
                {mastered.includes(item.id) ? '✓' : '○'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
