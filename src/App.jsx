import { Routes, Route, Navigate } from 'react-router-dom';
import { useLibrary } from './context/LibraryContext.jsx';
import Layout from './components/Layout.jsx';
import Toast from './components/Toast.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Transactions from './pages/Transactions.jsx';
import Members from './pages/Members.jsx';
import Forms from './pages/Forms.jsx';

/* Librarian-only pages redirect members to the catalogue. */
function AdminOnly({ children }) {
  const { isAdmin } = useLibrary();
  return isAdmin ? children : <Navigate to="/books" replace />;
}

export default function App() {
  const { session, isAdmin } = useLibrary();

  return (
    <>
      <Routes>
        {!session ? (
          <Route path="*" element={<Login />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<AdminOnly><Dashboard /></AdminOnly>} />
            <Route path="/books" element={<Books />} />
            <Route path="/transactions" element={<AdminOnly><Transactions /></AdminOnly>} />
            <Route path="/members" element={<AdminOnly><Members /></AdminOnly>} />
            <Route path="/forms" element={<AdminOnly><Forms /></AdminOnly>} />
            <Route path="*" element={<Navigate to={isAdmin ? '/dashboard' : '/books'} replace />} />
          </Route>
        )}
      </Routes>
      <Toast />
    </>
  );
}
