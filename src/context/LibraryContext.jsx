
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect
} from 'react';

import useLocalStorage from '../hooks/useLocalStorage.js';
import { DB_KEYS, seedBooks, seedUsers } from '../storage.js';

const LibraryContext = createContext(null);
const API = 'http://localhost:5000';

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

  // Load books from MySQL.
  const loadBooks = useCallback(async () => {
    try {
      const response = await fetch(`${API}/books`);

      if (!response.ok) {
        throw new Error('Could not load books.');
      }

      setBooks(await response.json());
    } catch (error) {
      console.error(error.message);
      showToast('Could not load books. Check the backend.', true);
    }
  }, [setBooks, showToast]);

  // Load members from MySQL.
  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API}/users`);

      if (!response.ok) {
        throw new Error('Could not load members.');
      }

      const data = await response.json();

      setUsers(data.map(user => ({
        ...user,
        membershipId: user.membershipId ?? user.membership_id
      })));
    } catch (error) {
      console.error(error.message);
      showToast('Could not load members. Check the backend.', true);
    }
  }, [setUsers, showToast]);

  // Load transactions from MySQL.
  const loadTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API}/transactions`);

      if (!response.ok) {
        throw new Error('Could not load transaction history.');
      }

      const data = await response.json();

      setTxns(data.map(t => ({
        id: t.id,
        bookId: t.bookId,
        bookTitle: t.bookTitle,
        type: t.type,
        qty: Number(t.qty),
        date: new Date(t.date).getTime(),
        user: 'Database'
      })));
    } catch (error) {
      console.error(error.message);
      showToast('Could not load transaction history.', true);
    }
  }, [setTxns, showToast]);

  // Load database information when the app starts.
  useEffect(() => {
    loadBooks();
    loadUsers();
    loadTransactions();
  }, [loadBooks, loadUsers, loadTransactions]);

  // Add a member to MySQL.
  const addUser = useCallback(async (user) => {
    try {
      const response = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          membershipId: user.membershipId,
          role: user.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member.');
      }

      await loadUsers();
      showToast('Member added successfully.');
      return data;
    } catch (error) {
      showToast(error.message, true);
      return null;
    }
  }, [loadUsers, showToast]);

  // Update a member in MySQL.
  const updateUser = useCallback(async (id, changes) => {
    try {
      const response = await fetch(`${API}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: changes.name,
          membershipId: changes.membershipId,
          role: changes.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member.');
      }

      await loadUsers();
      showToast('Member updated successfully.');
      return true;
    } catch (error) {
      showToast(error.message, true);
      return false;
    }
  }, [loadUsers, showToast]);

  // Delete a member from MySQL.
  const deleteUser = useCallback(async (id) => {
    try {
      const response = await fetch(`${API}/users/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete member.');
      }

      setUsers(current =>
        current.filter(user => String(user.id) !== String(id))
      );

      showToast('Member removed.');
      return true;
    } catch (error) {
      showToast(error.message, true);
      return false;
    }
  }, [setUsers, showToast]);

  // Delete a book from MySQL.
  const deleteBook = useCallback(async (id) => {
    try {
      const response = await fetch(`${API}/books/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete book.');
      }

      setBooks(current =>
        current.filter(book => String(book.id) !== String(id))
      );

      showToast('Book deleted.');
      return true;
    } catch (error) {
      showToast(error.message, true);
      return false;
    }
  }, [setBooks, showToast]);

  const value = {
    books,
    setBooks,
    loadBooks,
    deleteBook,

    users,
    setUsers,
    loadUsers,
    addUser,
    updateUser,
    deleteUser,

    txns,
    setTxns,
    loadTransactions,

    session,
    setSession,

    editingBookId,
    setEditingBookId,

    editingUserId,
    setEditingUserId,

    toast,
    showToast,

    isAdmin: !!session && session.role === 'admin'
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}