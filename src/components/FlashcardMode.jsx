import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/FlashcardMode.module.css';
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

  useEffect(() => {
    setDeck(shuffle(vocabulary));
    setIndex(0);
    setFlipped(false);
  }, [vocabulary]);

  const card = useMemo(() => deck[index] || null, [deck, index]);

  if (!card) {
    return <div className={styles.empty}>Tidak ada kata untuk mode ini.</div>;
  }

  const handleAdvance = () => {
    setFlipped(false);
    setIndex((current) => (current + 1) % deck.length);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>{index + 1}/{deck.length}</span>
        <span>{favorites.includes(card.id) ? '⭐ Favorit' : '☆ Favorit'}</span>
      </div>

      <button className={`${styles.card} ${flipped ? styles.flipped : ''}`} onClick={() => setFlipped((value) => !value)}>
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
        <button className={styles.secondary} onClick={() => onToggleFavorite(card.id)}>
          {favorites.includes(card.id) ? 'Hapus favorit' : 'Favorit'}
        </button>
        <button className={styles.secondary} onClick={() => onToggleMastered(card.id)}>
          {mastered.includes(card.id) ? 'Ulangi' : 'Tandai hafal'}
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={handleAdvance}>Lewati</button>
        <button className={styles.primary} onClick={() => { onToggleMastered(card.id); handleAdvance(); }}>
          Sudah hafal
        </button>
      </div>
    </div>
  );
}
