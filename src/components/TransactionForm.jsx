import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from './Field.jsx';
import FormError from './FormError.jsx';
import { makeId, byTitle } from '../storage.js';

export default function TransactionForm() {
  const { books, setBooks, txns, setTxns, session, isAdmin, showToast } = useLibrary();
  const [bookId, setBookId] = useState('');
  const [type, setType] = useState(isAdmin ? 'add' : 'borrow');
  const [qty, setQty] = useState('1');
  const [error, setError] = useState('');

  const options = isAdmin
    ? [['add', 'Add stock (arrival)'], ['borrow', 'Deduct stock (borrowed)'], ['return', 'Add stock (returned)']]
    : [['borrow', 'Borrow a book'], ['return', 'Return a book']];
  const choices = books.filter(b => isAdmin || Number(b.quantity) > 0).sort(byTitle);
  // Selected book falls back to the first in the list (like a native <select>).
  const selectedId = choices.some(b => b.id === bookId) ? bookId : (choices[0] ? choices[0].id : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(qty);

    if (!selectedId) { setError('Add a book to the catalogue before recording a transaction.'); return; }
    if (isNaN(amount) || amount < 1) { setError('Quantity must be at least 1.'); return; }
    const book = books.find(b => b.id === selectedId);
    if (!book) { setError('That book could not be found. It may have been deleted.'); return; }

    const current = Number(book.quantity);
    if (type === 'borrow' && amount > current) {
      setError('Only ' + book.quantity + ' cop' + (current === 1 ? 'y' : 'ies') + ' of "' + book.title + '" left in stock.');
      return;
    }
    const quantity = type === 'borrow' ? current - amount : current + amount;

    setBooks(books.map(b => b.id === book.id ? { ...b, quantity } : b));
    setTxns([...txns, {
      id: makeId('t'), bookId: book.id, bookTitle: book.title,
      type, qty: amount, date: Date.now(), user: session.name
    }]);
    showToast('Transaction recorded.');
    setError('');
    setQty('1');
  };

  return (
    <div className="panel">
      <div className="panel-head"><h2>Record a transaction</h2></div>
      <form className="grid-form" onSubmit={handleSubmit}>
        <Field id="txn-book" label="Book">
          <select id="txn-book" required value={selectedId} onChange={e => setBookId(e.target.value)}>
            {choices.length === 0
              ? <option value="">No books in catalogue yet</option>
              : choices.map(b => <option key={b.id} value={b.id}>{b.title + ' (' + b.quantity + ' in stock)'}</option>)}
          </select>
        </Field>
        <Field id="txn-type" label="Action">
          <select id="txn-type" required value={type} onChange={e => setType(e.target.value)}>
            {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field id="txn-qty" label="Quantity">
          <input type="number" id="txn-qty" min="1" required value={qty} onChange={e => setQty(e.target.value)} />
        </Field>
        <div className="field form-actions">
          <button type="submit" className="btn btn-primary">Record transaction</button>
        </div>
        <FormError message={error} />
      </form>
    </div>
  );
}
