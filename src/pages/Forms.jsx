import { useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import BookForm from '../components/BookForm.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import MemberForm from '../components/MemberForm.jsx';

export default function Forms() {
  const { setEditingBookId, setEditingUserId } = useLibrary();

  // Lifecycle (cleanup): leaving the page cancels any half-finished edit.
  useEffect(() => () => {
    setEditingBookId(null);
    setEditingUserId(null);
  }, [setEditingBookId, setEditingUserId]);

  return (
    <section className="page">
      <PageHeader title="Forms" sub="Use these forms to manage books, transactions and members." />
      <BookForm />
      <TransactionForm />
      <MemberForm />
    </section>
  );
}
