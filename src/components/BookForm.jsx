import { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from './Field.jsx';
import FormError from './FormError.jsx';
import { makeId } from '../storage.js';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

export default function BookForm() {
  const { books, setBooks, editingBookId, setEditingBookId, showToast } = useLibrary();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  // Lifecycle: fill the form when a book is chosen for editing, clear it otherwise.
  useEffect(() => {
    const book = books.find(b => b.id === editingBookId);
    setForm(book
      ? { title: book.title, author: book.author, genre: book.genre, isbn: book.isbn, quantity: String(book.quantity) }
      : EMPTY);
    setError('');
  }, [editingBookId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const reset = () => { setEditingBookId(null); setForm(EMPTY); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const author = form.author.trim();
    const genre = form.genre.trim();
    const isbn = form.isbn.trim();
    const quantity = Number(form.quantity);

    if (!title || !author || !genre || !isbn || form.quantity === '' || isNaN(quantity) || quantity < 0) {
      setError('Please fill in every field with a valid quantity of zero or more.');
      return;
    }
    const dup = books.find(b => b.isbn.toLowerCase() === isbn.toLowerCase() && b.id !== editingBookId);
    if (dup) {
      setError('A book with this ISBN already exists: "' + dup.title + '".');
      return;
    }

    if (editingBookId) {
      setBooks(books.map(b => b.id === editingBookId ? { ...b, title, author, genre, isbn, quantity } : b));
      showToast('Book updated.');
    } else {
      setBooks([...books, { id: makeId('b'), title, author, genre, isbn, quantity }]);
      showToast('Book added to the catalogue.');
    }
    reset();
  };

  return (
    <div className="panel">
      <div className="panel-head"><h2>{editingBookId ? 'Update book' : 'Add a new book'}</h2></div>
      <form className="grid-form" onSubmit={handleSubmit}>
        <Field id="book-title" label="Title">
          <input type="text" id="book-title" required value={form.title} onChange={set('title')} />
        </Field>
        <Field id="book-author" label="Author">
          <input type="text" id="book-author" required value={form.author} onChange={set('author')} />
        </Field>
        <Field id="book-genre" label="Genre">
          <input type="text" id="book-genre" required value={form.genre} onChange={set('genre')} />
        </Field>
        <Field id="book-isbn" label="ISBN">
          <input type="text" id="book-isbn" required value={form.isbn} onChange={set('isbn')} />
        </Field>
        <Field id="book-quantity" label="Initial quantity">
          <input type="number" id="book-quantity" min="0" required value={form.quantity} onChange={set('quantity')} />
        </Field>
        <div className="field form-actions">
          <button type="submit" className="btn btn-primary">{editingBookId ? 'Save changes' : 'Add book'}</button>
          {editingBookId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel edit</button>}
        </div>
        <FormError message={error} />
      </form>
    </div>
  );
}
