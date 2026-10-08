export default function PageHeader({ title, sub }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <p className="page-sub">{sub}</p>
    </header>
  );
}
