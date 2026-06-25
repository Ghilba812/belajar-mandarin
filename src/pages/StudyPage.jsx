import { useEffect, useMemo, useState } from 'react';
import { FlashcardMode } from '../components/FlashcardMode';
import { QuizMode } from '../components/QuizMode';
import { TypingMode } from '../components/TypingMode';
import { VocabularyList } from '../components/VocabularyList';
import { useUser } from '../hooks/useUser';
import { readStoredProgress, saveProgress } from '../utils/storage';
import styles from '../styles/StudyPage.module.css';

export function StudyPage({ onBack }) {
  const { selectedUser, vocabulary, favorites, mastered, toggleFavorite, toggleMastered, selectedMode } = useUser();
  const [category, setCategory] = useState(() => readStoredProgress().lastCategory || 'All');

  useEffect(() => {
    const storedCategory = readStoredProgress().lastCategory || 'All';
    setCategory(storedCategory);
  }, [selectedUser?.id]);

  useEffect(() => {
    saveProgress({ lastCategory: category });
  }, [category]);

  const categories = useMemo(() => ['All', ...new Set(vocabulary.map((item) => item.category))], [vocabulary]);

  const filteredVocabulary = useMemo(() => {
    if (category === 'All') return vocabulary;
    return vocabulary.filter((item) => item.category === category);
  }, [category, vocabulary]);

  const renderMode = () => {
    if (selectedMode === 'flashcard') {
      return (
        <FlashcardMode
          key={`${selectedUser?.id || 'user'}-flashcard-${category}`}
          vocabulary={filteredVocabulary}
          favorites={favorites}
          mastered={mastered}
          onToggleFavorite={toggleFavorite}
          onToggleMastered={toggleMastered}
        />
      );
    }

    if (selectedMode === 'typing') {
      return (
        <TypingMode
          key={`${selectedUser?.id || 'user'}-typing-${category}`}
          vocabulary={filteredVocabulary}
          favorites={favorites}
          mastered={mastered}
          onToggleFavorite={toggleFavorite}
          onToggleMastered={toggleMastered}
        />
      );
    }

    if (selectedMode === 'quiz') {
      return <QuizMode key={`${selectedUser?.id || 'user'}-quiz-${category}`} vocabulary={filteredVocabulary} />;
    }

    return (
      <VocabularyList
        key={`${selectedUser?.id || 'user'}-vocab-${category}`}
        vocabulary={filteredVocabulary}
        favorites={favorites}
        mastered={mastered}
        onToggleFavorite={toggleFavorite}
        onToggleMastered={toggleMastered}
      />
    );
  };

  return (
    <section className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {categories.map((item) => (
            <button
              key={item}
              className={`${styles.filterButton} ${category === item ? styles.active : ''}`}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {renderMode()}

      <div className={styles.footerSummary}>Total kata: {filteredVocabulary.length}</div>
    </section>
  );
}
