import { createContext, useContext, useState, useCallback, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { DB_KEYS, seedBooks, seedUsers } from '../storage.js';

const LibraryContext = createContext(null);

/* Holds all shared data (books, users, transactions, session),
   the toast message, and which record is being edited. */
export function LibraryProvider({ children }) {
  const [books, setBooks] = useLocalStorage(DB_KEYS.books, seedBooks);
  const [users, setUsers] = useLocalStorage(DB_KEYS.users, seedUsers);
  const [txns, setTxns] = useLocalStorage(DB_KEYS.txns, []);
  const [session, setSession] = useLocalStorage(DB_KEYS.session, null);

  const [editingBookId, setEditingBookId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const value = {
    books, setBooks, users, setUsers, txns, setTxns, session, setSession,
    editingBookId, setEditingBookId, editingUserId, setEditingUserId,
    toast, showToast,
    isAdmin: !!session && session.role === 'admin'
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  return useContext(LibraryContext);
}
