import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/TypingMode.module.css';
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

export function TypingMode({ vocabulary, favorites, mastered, onToggleFavorite, onToggleMastered }) {
  const [queue, setQueue] = useState(() => shuffle(vocabulary));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showPinyin, setShowPinyin] = useState(false);
  const [stats, setStats] = useState(() => readStoredProgress().typingStats || { correct: 0, wrong: 0 });
  const { speak, isSpeaking } = useSpeech();
  const inputRef = useRef(null);

  useEffect(() => {
    setQueue(shuffle(vocabulary));
    setIndex(0);
    setAnswer('');
    setFeedback(null);
    setShowPinyin(false);
  }, [vocabulary]);

  useEffect(() => {
    saveProgress({ typingStats: stats });
  }, [stats]);

  const card = useMemo(() => queue[index] || null, [index, queue]);

  useEffect(() => {
    inputRef.current?.focus();
    setFeedback(null);
    setShowPinyin(false);
  }, [index]);

  if (!card) {
    return <div className={styles.empty}>Tidak ada kata untuk mode ini.</div>;
  }

  const handleCheck = () => {
    if (!answer.trim()) return;
    const correct = answer.trim() === card.hanzi;
    setFeedback(correct ? 'correct' : 'wrong');
    setStats((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
    }));
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback(null);
    setIndex((current) => (current + 1) % queue.length);
  };

  const accuracy = stats.correct + stats.wrong ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) : 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.meta}>{card.category}</div>
        <h3>{card.indonesian}</h3>
        <p>Tulis Hanzi yang sesuai.</p>
        <div className={styles.cardActions}>
          <button className={styles.speakerButton} onClick={() => speak(card.hanzi)} type="button" aria-label="Baca hanzi">
            {isSpeaking ? '⏹️' : '🔊'}
          </button>
          {showPinyin ? <PinyinHint pinyin={card.pinyin} /> : <button className={styles.secondary} onClick={() => setShowPinyin(true)} type="button">Lihat pinyin</button>}
        </div>
      </div>

      <input
        ref={inputRef}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        className={styles.input}
        placeholder="Ketik Hanzi"
      />

      <div className={styles.actionStack}>
        <div className={styles.actions}>
          <button className={styles.primary} onClick={handleCheck} type="button">Cek</button>
          <button className={styles.secondary} onClick={handleNext} type="button">Lanjut</button>
        </div>

        {feedback && (
          <div className={`${styles.feedback} ${feedback === 'correct' ? styles.correct : styles.wrong}`}>
            {feedback === 'correct' ? 'Benar! 🎉' : `Jawaban benar: ${card.hanzi}`}
          </div>
        )}

        <div className={styles.footerActions}>
          <button className={`${styles.iconButton} ${favorites.includes(card.id) ? styles.iconActive : ''}`} onClick={() => onToggleFavorite(card.id)} type="button" aria-label="Favorit">
            ★
          </button>
          <button className={`${styles.iconButton} ${mastered.includes(card.id) ? styles.iconActive : ''}`} onClick={() => onToggleMastered(card.id)} type="button" aria-label="Sudah hafal">
            ✓
          </button>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <span>Benar: {stats.correct}</span>
        <span>Salah: {stats.wrong}</span>
        <span>Akurasi: {accuracy}%</span>
      </div>
    </div>
  );
}
