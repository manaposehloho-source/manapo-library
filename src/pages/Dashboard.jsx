import { useLibrary } from '../context/LibraryContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import { byTitle, isLowStock } from '../storage.js';

export default function Dashboard() {
  const { books } = useLibrary();
  const totalCopies = books.reduce((sum, b) => sum + Number(b.quantity), 0);
  const lowStock = books.filter(isLowStock).length;
  const outOfStock = books.filter(b => Number(b.quantity) === 0).length;

  return (
    <section className="page">
      <PageHeader title="Dashboard" sub="Current standing of the collection." />
      <div className="stat-row">
        <StatCard label="Titles in catalogue" value={books.length} />
        <StatCard label="Total copies on shelf" value={totalCopies} />
        <StatCard label="Titles low on stock" value={lowStock} alert={lowStock > 0} />
        <StatCard label="Titles out of stock" value={outOfStock} alert={outOfStock > 0} />
      </div>
      <div className="panel">
        <div className="panel-head">
          <h2>Book availability</h2>
          <span className="tag tag-warning">Low stock: fewer than 2 copies</span>
        </div>
        <DataTable
          headers={['Title', 'Author', 'Genre', 'ISBN', 'Copies in stock']}
          empty={books.length === 0 && 'No books have been added to the catalogue yet.'}
        >
          {[...books].sort(byTitle).map(book => {
            const low = isLowStock(book);
            const qty = Number(book.quantity);
            return (
              <tr key={book.id} className={low ? 'row-low-stock' : ''}>
                <td>{book.title}</td><td>{book.author}</td><td>{book.genre}</td><td>{book.isbn}</td>
                <td>
                  <span className={'stock-pill' + (low ? ' low' : '')}>
                    {book.quantity + (low ? (qty === 0 ? ' · out of stock' : ' · low stock') : '')}
                  </span>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </section>
  );
}
