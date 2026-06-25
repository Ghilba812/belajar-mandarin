import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/QuizMode.module.css';

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export function QuizMode({ vocabulary }) {
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    setIndex(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
  }, [vocabulary]);

  const question = useMemo(() => vocabulary[index] || null, [index, vocabulary]);

  if (!question) {
    return <div className={styles.empty}>Tidak ada kata untuk quiz.</div>;
  }

  const options = useMemo(() => {
    const pool = shuffle(vocabulary.filter((item) => item.id !== question.id)).slice(0, 3);
    return shuffle([question, ...pool]);
  }, [question, vocabulary]);

  const handleAnswer = (option) => {
    setSelectedAnswer(option.id);
    if (option.id === question.id) {
      setCorrectCount((value) => value + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIndex((value) => (value + 1) % vocabulary.length);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Skor: {correctCount}</div>
      <div className={styles.card}>
        <div className={styles.meta}>{question.category}</div>
        <h3>{question.indonesian}</h3>
        <p>Pilih Hanzi yang benar.</p>
      </div>

      <div className={styles.options}>
        {options.map((option) => (
          <button
            key={option.id}
            className={`${styles.option} ${selectedAnswer === option.id ? styles.selected : ''}`}
            onClick={() => handleAnswer(option)}
          >
            {option.hanzi}
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <div className={styles.feedback}>Jawaban benar: {question.hanzi}</div>
      )}

      <button className={styles.primary} onClick={handleNext}>Lanjut</button>
    </div>
  );
}
