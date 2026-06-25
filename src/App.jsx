import { useEffect, useMemo, useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { HomePage } from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';
import { useTheme } from './hooks/useTheme';
import { readStoredProgress, saveProgress } from './utils/storage';
import { parseVocabularyFile } from './utils/vocabularyImport';
import styles from './styles/App.module.css';

function AppContent() {
  const [view, setView] = useState(() => readStoredProgress().lastView || 'home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [targetProfileId, setTargetProfileId] = useState(() => readStoredProgress().lastImportProfile || 'feiza');
  const { theme, toggleTheme } = useTheme();
  const { profiles, selectedUser, favorites, mastered, selectedMode, setSelectedMode, selectUser, importVocabulary } = useUser();
  const studyModes = [
    { id: 'flashcard', label: 'Flashcard' },
    { id: 'typing', label: 'Typing' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'vocab', label: 'Daftar Kata' },
  ];

  useEffect(() => {
    saveProgress({ lastView: view });
  }, [view]);

  useEffect(() => {
    saveProgress({ lastOpenedMode: selectedMode });
  }, [selectedMode]);

  useEffect(() => {
    saveProgress({ lastImportProfile: targetProfileId });
  }, [targetProfileId]);

  const progressSummary = useMemo(() => {
    const favoriteCount = favorites.length;
    const masteredCount = mastered.length;
    return `${favoriteCount} favorit • ${masteredCount} hafal`;
  }, [favorites.length, mastered.length]);

  const handleResetProgress = () => {
    if (typeof window !== 'undefined' && window.confirm('Reset seluruh progress dan tema aplikasi?')) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  const handleVocabularyUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsedItems = parseVocabularyFile(text);

      if (!parsedItems.length) {
        setImportMessage('Format file tidak dikenali. Coba pakai format hanzi|pinyin|indonesian|category|level.');
        event.target.value = '';
        return;
      }

      const targetProfile = profiles.find((profile) => profile.id === targetProfileId) || selectedUser;
      const result = importVocabulary(parsedItems, targetProfileId);
      setImportMessage(`Berhasil menambahkan ${result.count} kosa kata baru untuk ${targetProfile?.name || 'profil ini'}.`);
    } catch {
      setImportMessage('Gagal membaca file. Coba file lain.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logo}>📘</div>
            <div>
              <h1 className={styles.title}>Belajar Mandarin</h1>
              <p className={styles.subtitle}>Belajar nyaman, modern, dan tersimpan otomatis.</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            {selectedUser && view === 'study' ? <span className={styles.userBadge}>{selectedUser.avatar} {selectedUser.name}</span> : null}
            <span className={styles.progressChip}>{progressSummary}</span>
            <button
              className={styles.iconButton}
              onClick={() => setSettingsOpen((value) => !value)}
              type="button"
              aria-label="Open settings"
            >
              ☰ Menu
            </button>
          </div>
        </header>

        {settingsOpen ? (
          <>
            <button className={styles.overlay} onClick={() => setSettingsOpen(false)} type="button" aria-label="Close menu" />
            <aside className={styles.drawer} role="dialog" aria-label="Settings menu">
              <div className={styles.drawerHeader}>
                <strong>Menu</strong>
                <button className={styles.closeButton} onClick={() => setSettingsOpen(false)} type="button" aria-label="Close menu">
                  ✕
                </button>
              </div>

              <button className={styles.drawerAction} onClick={toggleTheme} type="button">
                {theme === 'dark' ? '☀️ Ganti ke tema terang' : '🌙 Ganti ke tema gelap'}
              </button>

              <div className={styles.drawerSection}>
                <label className={styles.importLabel} htmlFor="profile-select">
                  <span>Profil</span>
                  <select
                    id="profile-select"
                    className={styles.importSelect}
                    value={selectedUser?.id || ''}
                    onChange={(event) => {
                      selectUser(event.target.value);
                      setView('study');
                    }}
                  >
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.drawerSection}>
                <p className={styles.drawerSectionTitle}>Mode belajar</p>
                <div className={styles.modeGrid}>
                  {studyModes.map((mode) => (
                    <button
                      key={mode.id}
                      className={`${styles.modeButton} ${selectedMode === mode.id ? styles.modeButtonActive : ''}`}
                      onClick={() => setSelectedMode(mode.id)}
                      type="button"
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.importPanel}>
                <label className={styles.importLabel} htmlFor="import-profile-select">
                  <span>Target upload</span>
                  <select
                    id="import-profile-select"
                    className={styles.importSelect}
                    value={targetProfileId}
                    onChange={(event) => setTargetProfileId(event.target.value)}
                  >
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.importLabel} htmlFor="vocabulary-upload">
                  <span>Upload kosa kata</span>
                  <input id="vocabulary-upload" className={styles.importInput} type="file" accept=".txt,.json" onChange={handleVocabularyUpload} />
                </label>
                <p className={styles.importHint}>Format: hanzi|pinyin|indonesian|category|level</p>
                <p className={styles.importExample}>Contoh: 学习|xuéxí|belajar|Daily|Beginner</p>
                <a className={styles.importLink} href="/sample-vocabulary.txt" download>
                  Unduh contoh format
                </a>
                {importMessage ? <p className={styles.importStatus}>{importMessage}</p> : null}
              </div>

              <button className={styles.resetButton} onClick={handleResetProgress} type="button">
                Reset Progress
              </button>
            </aside>
          </>
        ) : null}

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
