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
  const { profiles, selectedUser, favorites, mastered, selectedMode, importVocabulary } = useUser();

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
              onClick={toggleTheme}
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className={styles.settingsWrap}>
              <button
                className={styles.iconButton}
                onClick={() => setSettingsOpen((value) => !value)}
                type="button"
                aria-label="Open settings"
              >
                ⚙️
              </button>
              {settingsOpen ? (
                <div className={styles.settingsMenu}>
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
                </div>
              ) : null}
            </div>
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
