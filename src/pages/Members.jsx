import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

export default function Members() {
  const {
    users,
    deleteUser,
    session,
    editingUserId,
    setEditingUserId
  } = useLibrary();

  const navigate = useNavigate();

  const startEdit = (id) => {
    setEditingUserId(id);
    navigate('/forms');
  };

  const remove = async (user) => {
    const isMe =
      session && String(user.id) === String(session.id);

    if (isMe) {
      return;
    }

    if (
      !window.confirm(
        'Remove ' + user.name + ' from the member list?'
      )
    ) {
      return;
    }

    // Delete the member from MySQL through the backend.
    const success = await deleteUser(user.id);

    if (!success) {
      return;
    }

    if (String(editingUserId) === String(user.id)) {
      setEditingUserId(null);
    }
  };

  return (
    <section className="page">
      <PageHeader
        title="Members"
        sub="Register library members and librarians, and keep their details current."
      />

      <div className="panel">
        <div className="panel-head">
          <h2>All members</h2>
        </div>

        <DataTable
          headers={['Name', 'Membership ID', 'Role', '']}
          empty={
            users.length === 0
              ? 'No members registered yet.'
              : false
          }
        >
          {[...users]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((u) => {
              const isMe =
                session &&
                String(u.id) === String(session.id);

              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.membershipId}</td>
                  <td>
                    {u.role === 'admin' ? 'Librarian' : 'Member'}
                  </td>

                  <td>
                    <button
                      className="btn-small"
                      onClick={() => startEdit(u.id)}
                    >
                      Update
                    </button>

                    <button
                      className="btn-small danger"
                      disabled={isMe}
                      title={
                        isMe
                          ? 'You cannot delete your own account while signed in.'
                          : ''
                      }
                      onClick={() => remove(u)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
        </DataTable>
      </div>
    </section>
  );
}