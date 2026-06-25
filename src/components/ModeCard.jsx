import styles from '../styles/ModeCard.module.css';

const modes = [
  { id: 'flashcard', label: 'Flashcard', description: 'Balik kartu untuk menghafal' },
  { id: 'typing', label: 'Typing', description: 'Tulis Hanzi dari arti Indonesia' },
  { id: 'quiz', label: 'Quiz', description: 'Jawab pilihan ganda singkat' },
  { id: 'vocab', label: 'Daftar Kata', description: 'Cari dan lihat semua kosakata' },
];

export function ModeCard({ selectedMode, onSelect }) {
  return (
    <div className={styles.grid}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          className={`${styles.card} ${selectedMode === mode.id ? styles.active : ''}`}
          onClick={() => onSelect(mode.id)}
        >
          <strong>{mode.label}</strong>
          <span>{mode.description}</span>
        </button>
      ))}
    </div>
  );
}
