/* Reusable table: headers = array of strings, children = <tr> rows.
   Shows a message row when `empty` is set. */
export default function DataTable({ headers, empty, children }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {empty ? (
            <tr className="empty-row"><td colSpan={headers.length}>{empty}</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}
