import { useMemo, useState } from 'react';
import styles from '../styles/VocabularyList.module.css';
import { useSpeech } from '../hooks/useSpeech';

export function VocabularyList({ vocabulary, favorites, mastered, onToggleFavorite, onToggleMastered }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { speak, isSpeaking } = useSpeech();

  const filteredVocabulary = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let items = vocabulary;

    if (filter === 'favorite') {
      items = items.filter((item) => favorites.includes(item.id));
    }

    if (!needle) return items;

    return items.filter((item) =>
      [item.hanzi, item.pinyin, item.indonesian, item.category].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [filter, query, vocabulary, favorites]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={styles.search}
          placeholder="Cari kata..."
          aria-label="Cari kata"
        />
        <div className={styles.filterGroup}>
          <button className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')} type="button">
            Semua
          </button>
          <button className={`${styles.filterButton} ${filter === 'favorite' ? styles.active : ''}`} onClick={() => setFilter('favorite')} type="button">
            Favorit
          </button>
        </div>
      </div>

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
              <button
                className={styles.secondary}
                onClick={() => speak(item.hanzi)}
                type="button"
                aria-label={`Baca ${item.hanzi}`}
              >
                {isSpeaking ? '⏹️' : '🔊'}
              </button>
              <button className={styles.secondary} onClick={() => onToggleFavorite(item.id)} type="button" aria-label="Toggle favorite">
                {favorites.includes(item.id) ? '★' : '☆'}
              </button>
              <button className={styles.secondary} onClick={() => onToggleMastered(item.id)} type="button" aria-label="Toggle mastered">
                {mastered.includes(item.id) ? '✓' : '○'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
