import { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from './Field.jsx';
import FormError from './FormError.jsx';

const API = 'http://localhost:5000';

const EMPTY = {
  title: '',
  author: '',
  genre: '',
  isbn: '',
  quantity: ''
};

export default function BookForm() {
  const {
    books,
    loadBooks,
    editingBookId,
    setEditingBookId,
    showToast
  } = useLibrary();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const book = books.find(
      b => String(b.id) === String(editingBookId)
    );

    setForm(book ? {
      title: book.title,
      author: book.author,
      genre: book.genre || '',
      isbn: book.isbn || '',
      quantity: String(book.quantity)
    } : EMPTY);

    setError('');
  }, [editingBookId, books]);

  const set = field => e => {
    setForm(previous => ({
      ...previous,
      [field]: e.target.value
    }));
  };

  const reset = () => {
    setEditingBookId(null);
    setForm(EMPTY);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const title = form.title.trim();
    const author = form.author.trim();
    const genre = form.genre.trim();
    const isbn = form.isbn.trim();
    const quantity = Number(form.quantity);

    if (
      !title ||
      !author ||
      !genre ||
      !isbn ||
      form.quantity === '' ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError(
        'Please fill in every field with a valid whole quantity of zero or more.'
      );
      return;
    }

    const duplicate = books.find(
      b =>
        b.isbn.toLowerCase() === isbn.toLowerCase() &&
        String(b.id) !== String(editingBookId)
    );

    if (duplicate) {
      setError(
        'A book with this ISBN already exists: "' +
        duplicate.title + '".'
      );
      return;
    }

    setSaving(true);
    setError('');

    try {
      const isEditing = editingBookId !== null;
      const url = isEditing
        ? `${API}/books/${editingBookId}`
        : `${API}/books`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          author,
          genre,
          isbn,
          quantity
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Could not save the book.'
        );
      }

      await loadBooks();

      showToast(
        isEditing
          ? 'Book updated successfully.'
          : 'Book added successfully.'
      );

      reset();
    } catch (err) {
      setError(
        err.message ||
        'Could not connect to the backend. Check that it is running.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>
          {editingBookId ? 'Update book' : 'Add a new book'}
        </h2>
      </div>

      <form className="grid-form" onSubmit={handleSubmit}>
        <Field id="book-title" label="Title">
          <input
            type="text"
            id="book-title"
            required
            value={form.title}
            onChange={set('title')}
          />
        </Field>

        <Field id="book-author" label="Author">
          <input
            type="text"
            id="book-author"
            required
            value={form.author}
            onChange={set('author')}
          />
        </Field>

        <Field id="book-genre" label="Genre">
          <input
            type="text"
            id="book-genre"
            required
            value={form.genre}
            onChange={set('genre')}
          />
        </Field>

        <Field id="book-isbn" label="ISBN">
          <input
            type="text"
            id="book-isbn"
            required
            value={form.isbn}
            onChange={set('isbn')}
          />
        </Field>

        <Field id="book-quantity" label="Initial quantity">
          <input
            type="number"
            id="book-quantity"
            min="0"
            step="1"
            required
            value={form.quantity}
            onChange={set('quantity')}
          />
        </Field>

        <div className="field form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : editingBookId
                ? 'Save changes'
                : 'Add book'}
          </button>

          {editingBookId !== null && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={reset}
              disabled={saving}
            >
              Cancel edit
            </button>
          )}
        </div>

        <FormError message={error} />
      </form>
    </div>
  );
}
