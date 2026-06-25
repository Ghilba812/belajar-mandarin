import { ProfileCard } from '../components/ProfileCard';
import { useUser } from '../hooks/useUser';
import styles from '../styles/HomePage.module.css';

export function HomePage({ onSelectUser }) {
  const { profiles, selectUser } = useUser();

  const handleSelect = (userId) => {
    selectUser(userId);
    onSelectUser?.(userId);
  };

  return (
    <section className={styles.container}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Belajar Mandarin</p>
        <h1>Pilih Profil</h1>
        <p>Data dikemas dalam JSON sehingga aplikasi siap untuk banyak user tanpa mengubah source code.</p>
      </div>

      <div className={styles.grid}>
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} onSelect={handleSelect} />
        ))}
      </div>
    </section>
  );
}
