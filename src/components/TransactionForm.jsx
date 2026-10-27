import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from './Field.jsx';
import FormError from './FormError.jsx';
import { makeId, byTitle } from '../storage.js';

const API = 'http://localhost:5000';

export default function TransactionForm() {
  const {
    books,
    loadBooks,
    txns,
    setTxns,
    session,
    isAdmin,
    showToast
  } = useLibrary();

  const [bookId, setBookId] = useState('');
  const [type, setType] = useState(isAdmin ? 'add' : 'borrow');
  const [qty, setQty] = useState('1');
  const [error, setError] = useState('');

  const options = isAdmin
    ? [
        ['add', 'Add stock (arrival)'],
        ['borrow', 'Deduct stock (borrowed)'],
        ['return', 'Add stock (returned)']
      ]
    : [
        ['borrow', 'Borrow a book'],
        ['return', 'Return a book']
      ];

  const choices = books
    .filter(b => isAdmin || Number(b.quantity) > 0)
    .sort(byTitle);

  const selectedId = choices.some(
    b => String(b.id) === String(bookId)
  )
    ? bookId
    : choices.length > 0
      ? choices[0].id
      : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = Number(qty);

    if (!selectedId) {
      setError('Add a book to the catalogue before recording a transaction.');
      return;
    }

    if (!Number.isInteger(amount) || amount < 1) {
      setError('Quantity must be a whole number of at least 1.');
      return;
    }

    const book = books.find(
      b => String(b.id) === String(selectedId)
    );

    if (!book) {
      setError('That book could not be found. It may have been deleted.');
      return;
    }

    const current = Number(book.quantity);

    if (type === 'borrow' && amount > current) {
      setError(
        'Only ' + current + ' cop' +
        (current === 1 ? 'y' : 'ies') +
        ' of "' + book.title + '" left in stock.'
      );
      return;
    }

    try {
      const response = await fetch(`${API}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId: book.id,
          type,
          quantity: amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to record transaction.'
        );
      }

      await loadBooks();

      setTxns([
        ...txns,
        {
          id: makeId('t'),
          bookId: book.id,
          bookTitle: book.title,
          type,
          qty: amount,
          date: Date.now(),
          user: session?.name || 'Unknown'
        }
      ]);

      showToast('Transaction recorded.');
      setQty('1');
      setBookId('');
    } catch (error) {
      setError(
        error.message || 'Could not connect to the server.'
      );
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Record a transaction</h2>
      </div>

      <form className="grid-form" onSubmit={handleSubmit}>
        <Field id="txn-book" label="Book">
          <select
            id="txn-book"
            required
            value={selectedId}
            onChange={e => setBookId(e.target.value)}
          >
            {choices.length === 0 ? (
              <option value="">No books in catalogue yet</option>
            ) : (
              choices.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title + ' (' + b.quantity + ' in stock)'}
                </option>
              ))
            )}
          </select>
        </Field>

        <Field id="txn-type" label="Action">
          <select
            id="txn-type"
            required
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {options.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="txn-qty" label="Quantity">
          <input
            type="number"
            id="txn-qty"
            min="1"
            step="1"
            required
            value={qty}
            onChange={e => setQty(e.target.value)}
          />
        </Field>

        <div className="field form-actions">
          <button type="submit" className="btn btn-primary">
            Record transaction
          </button>
        </div>

        <FormError message={error} />
      </form>
    </div>
  );
}