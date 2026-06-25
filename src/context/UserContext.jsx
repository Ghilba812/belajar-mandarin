import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import profilesData from '../data/profiles.json';
import { importVocabularyByProfile } from '../utils/vocabulary';
import { readStoredProgress, saveProgress } from '../utils/storage';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profiles] = useState(profilesData);
  const [selectedUserId, setSelectedUserId] = useState(() => readStoredProgress().selectedUser || profilesData[0]?.id || '');
  const [selectedMode, setSelectedMode] = useState(() => readStoredProgress().lastOpenedMode || 'flashcard');
  const [vocabulary, setVocabulary] = useState([]);
  const [favorites, setFavorites] = useState(() => readStoredProgress().favorites || []);
  const [mastered, setMastered] = useState(() => readStoredProgress().mastered || []);

  const selectedUser = useMemo(
    () => profiles.find((profile) => profile.id === selectedUserId) || profiles[0] || null,
    [profiles, selectedUserId],
  );

  useEffect(() => {
    if (!selectedUser) return;
    const nextVocabulary = importVocabularyByProfile(selectedUser.file);
    setVocabulary(nextVocabulary);
  }, [selectedUser]);

  useEffect(() => {
    saveProgress({ selectedUser: selectedUserId, favorites, mastered, lastOpenedMode: selectedMode });
  }, [favorites, mastered, selectedMode, selectedUserId]);

  const selectUser = (userId) => {
    setSelectedUserId(userId);
    setSelectedMode('flashcard');
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleMastered = (id) => {
    setMastered((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const value = useMemo(
    () => ({
      profiles,
      selectedUser,
      selectedUserId,
      selectUser,
      vocabulary,
      favorites,
      mastered,
      toggleFavorite,
      toggleMastered,
      selectedMode,
      setSelectedMode,
    }),
    [favorites, mastered, profiles, selectedMode, selectedUser, selectedUserId, vocabulary],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
