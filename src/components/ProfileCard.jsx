import styles from '../styles/ProfileCard.module.css';

export function ProfileCard({ profile, onSelect }) {
  return (
    <button className={styles.card} onClick={() => onSelect(profile.id)}>
      <span className={styles.avatar}>{profile.avatar}</span>
      <span className={styles.info}>
        <strong>{profile.name}</strong>
        <small>{profile.file}</small>
      </span>
    </button>
  );
}
