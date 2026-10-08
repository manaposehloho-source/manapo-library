import { NavLink, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', adminOnly: true },
  { to: '/books', label: 'Books', adminOnly: false },
  { to: '/transactions', label: 'Transactions', adminOnly: true },
  { to: '/members', label: 'Members', adminOnly: true },
  { to: '/forms', label: 'Forms', adminOnly: true }
];

export default function Sidebar() {
  const { session, setSession, isAdmin, setEditingBookId, setEditingUserId } = useLibrary();
  const navigate = useNavigate();

  const handleLogout = () => {
    setEditingBookId(null);
    setEditingUserId(null);
    setSession(null);
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">MSL</span>
        <div>
          <p className="brand-name">Manapo Sehloho</p>
          <p className="brand-sub">Community Library</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.filter(l => isAdmin || !l.adminOnly).map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <p className="current-user">{session.name} · {isAdmin ? 'Librarian' : 'Member'}</p>
        <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
      </div>
    </aside>
  );
}
