import styles from '../styles/PinyinHint.module.css';

export function PinyinHint({ pinyin }) {
  const syllables = pinyin.split(/[,\s]+/).filter(Boolean);

  if (!syllables.length) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      {syllables.map((syllable, index) => (
        <span key={`${syllable}-${index}`} className={styles.badge}>
          {syllable}
        </span>
      ))}
    </div>
  );
}
