import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { HomePage } from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';
import styles from './styles/App.module.css';

function AppContent() {
  const [view, setView] = useState('home');
  const { selectUser, selectedUser } = useUser();

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Belajar Mandarin</h1>
            <p className={styles.subtitle}>Data-driven dengan JSON dan context untuk banyak user.</p>
          </div>
          <div className={styles.headerActions}>
            {selectedUser && view === 'study' ? (
              <button className={styles.backLink} onClick={() => setView('home')} type="button">
                ← Pilih profil
              </button>
            ) : null}
            {selectedUser && view === 'study' ? <span className={styles.userBadge}>{selectedUser.avatar} {selectedUser.name}</span> : null}
          </div>
        </header>

        {view === 'home' ? <HomePage onSelectUser={() => setView('study')} /> : <StudyPage onBack={() => setView('home')} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
