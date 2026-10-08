import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

export default function Members() {
  const { users, setUsers, session, editingUserId, setEditingUserId, showToast } = useLibrary();
  const navigate = useNavigate();

  const startEdit = (id) => {
    setEditingUserId(id);
    navigate('/forms');
  };

  const remove = (user) => {
    if (user.id === session.id) return;
    if (!window.confirm('Remove ' + user.name + ' from the member list?')) return;
    setUsers(users.filter(u => u.id !== user.id));
    if (editingUserId === user.id) setEditingUserId(null);
    showToast('Member removed.');
  };

  return (
    <section className="page">
      <PageHeader title="Members" sub="Register library members and librarians, and keep their details current." />
      <div className="panel">
        <div className="panel-head"><h2>All members</h2></div>
        <DataTable
          headers={['Name', 'Membership ID', 'Role', '']}
          empty={users.length === 0 && 'No members registered yet.'}
        >
          {[...users].sort((a, b) => a.name.localeCompare(b.name)).map(u => {
            const isMe = u.id === session.id;
            return (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.membershipId}</td>
                <td>{u.role === 'admin' ? 'Librarian' : 'Member'}</td>
                <td>
                  <button className="btn-small" onClick={() => startEdit(u.id)}>Update</button>
                  <button className="btn-small danger" disabled={isMe}
                    title={isMe ? 'You cannot delete your own account while signed in.' : ''}
                    onClick={() => remove(u)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </section>
  );
}
