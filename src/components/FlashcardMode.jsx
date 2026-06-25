import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/FlashcardMode.module.css';
import { useSpeech } from '../hooks/useSpeech';
import { readStoredProgress, saveProgress } from '../utils/storage';
import { PinyinHint } from './PinyinHint';

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export function FlashcardMode({ vocabulary, favorites, mastered, onToggleFavorite, onToggleMastered }) {
  const [deck, setDeck] = useState(() => shuffle(vocabulary));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState(() => readStoredProgress().flashcardStats || { learned: 0, review: 0 });
  const { speak, isSpeaking } = useSpeech();

  useEffect(() => {
    setDeck(shuffle(vocabulary));
    setIndex(0);
    setFlipped(false);
  }, [vocabulary]);

  useEffect(() => {
    saveProgress({ flashcardStats: stats });
  }, [stats]);

  const card = useMemo(() => deck[index] || null, [deck, index]);

  if (!card) {
    return <div className={styles.empty}>Tidak ada kata untuk mode ini.</div>;
  }

  const handleAdvance = (mode = 'review') => {
    setFlipped(false);
    setIndex((current) => (current + 1) % deck.length);
    setStats((current) => ({
      learned: current.learned + (mode === 'learned' ? 1 : 0),
      review: current.review + (mode === 'review' ? 1 : 0),
    }));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>{index + 1}/{deck.length}</span>
        <div className={styles.headerActions}>
          <span>✅ {stats.learned}</span>
          <span>🔁 {stats.review}</span>
          <button className={styles.speakerButton} onClick={() => speak(card.hanzi)} type="button" aria-label="Baca hanzi">
            {isSpeaking ? '⏹️' : '🔊'}
          </button>
          <span>{favorites.includes(card.id) ? '⭐ Favorit' : '☆ Favorit'}</span>
        </div>
      </div>

      <button className={`${styles.card} ${flipped ? styles.flipped : ''}`} onClick={() => setFlipped((value) => !value)} type="button">
        <div className={styles.badge}>{card.category}</div>
        {!flipped ? (
          <>
            <h3>{card.indonesian}</h3>
            <p>Ketuk untuk melihat hanzi</p>
          </>
        ) : (
          <>
            <h3>{card.hanzi}</h3>
            <PinyinHint pinyin={card.pinyin} />
            <p>{card.indonesian}</p>
          </>
        )}
      </button>

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={() => onToggleFavorite(card.id)} type="button">
          {favorites.includes(card.id) ? 'Hapus favorit' : 'Favorit'}
        </button>
        <button className={styles.secondary} onClick={() => onToggleMastered(card.id)} type="button">
          {mastered.includes(card.id) ? 'Ulangi' : 'Tandai hafal'}
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={() => handleAdvance('review')} type="button">Lewati</button>
        <button className={styles.primary} onClick={() => { onToggleMastered(card.id); handleAdvance('learned'); }} type="button">
          Sudah hafal
        </button>
      </div>
    </div>
  );
}
