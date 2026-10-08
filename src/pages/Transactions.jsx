import { useLibrary } from '../context/LibraryContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

export const txnLabel = (type) =>
  ({ add: 'Stock arrived', borrow: 'Borrowed', return: 'Returned' }[type] || type);

export default function Transactions() {
  const { txns } = useLibrary();
  const sorted = [...txns].sort((a, b) => b.date - a.date);

  return (
    <section className="page">
      <PageHeader title="Transactions" sub="Record books arriving on the shelf or leaving with a borrower." />
      <div className="panel">
        <div className="panel-head"><h2>Transaction history</h2></div>
        <DataTable
          headers={['Date', 'Book', 'Action', 'Qty', 'Recorded by']}
          empty={txns.length === 0 && 'No transactions recorded yet.'}
        >
          {sorted.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleString()}</td>
              <td>{t.bookTitle}</td>
              <td>{txnLabel(t.type)}</td>
              <td>{(t.type === 'borrow' ? '-' : '+') + t.qty}</td>
              <td>{t.user}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </section>
  );
}
