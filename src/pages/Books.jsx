import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import { byTitle, isLowStock } from '../storage.js';

export default function Books() {
  const { books, deleteBook, isAdmin, setEditingBookId, editingBookId, showToast } = useLibrary();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const visible = isAdmin ? books : books.filter(b => Number(b.quantity) > 0);
  const filtered = visible.filter(b =>
    !term ||
    b.title.toLowerCase().includes(term) ||
    b.author.toLowerCase().includes(term) ||
    b.isbn.toLowerCase().includes(term)
  );

  let empty = '';
  if (filtered.length === 0) {
    if (visible.length === 0) empty = isAdmin ? 'No books yet. Use the Forms page to add the first title.' : 'No books are currently available.';
    else empty = 'No books match that search.';
  }

  const startEdit = (id) => {
    setEditingBookId(id);
    navigate('/forms');
  };

  const remove = async (book) => {
  if (!window.confirm(`Delete "${book.title}"?`)) return;

  const success = await deleteBook(book.id);

  if (success && String(editingBookId) === String(book.id)) {
    setEditingBookId(null);
  }
};

  return (
    <section className="page">
      <PageHeader
        title="Books"
        sub={isAdmin ? 'View and maintain the complete book catalogue.' : 'Only books currently available to borrow are shown.'}
      />
      <div className="panel">
        <div className="panel-head">
          <h2>{isAdmin ? 'All books' : 'Available books'}</h2>
          <input type="search" className="search-box" placeholder="Search by title, author or ISBN"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DataTable headers={['Title', 'Author', 'Genre', 'ISBN', 'Stock', '']} empty={empty}>
          {[...filtered].sort(byTitle).map(book => {
            const low = isLowStock(book);
            return (
              <tr key={book.id} className={low ? 'row-low-stock' : ''}>
                <td>{book.title}</td><td>{book.author}</td><td>{book.genre}</td><td>{book.isbn}</td>
                <td><span className={'stock-pill' + (low ? ' low' : '')}>{String(book.quantity)}</span></td>
                <td>
                  {isAdmin && (
                    <>
                      <button className="btn-small" onClick={() => startEdit(book.id)}>Update</button>
                      <button className="btn-small danger" onClick={() => remove(book)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </section>
  );
}
