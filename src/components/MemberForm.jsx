import { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from './Field.jsx';
import FormError from './FormError.jsx';
import { makeId } from '../storage.js';

const EMPTY = { name: '', membershipId: '', role: 'member' };

export default function MemberForm() {
  const { users, setUsers, session, setSession, editingUserId, setEditingUserId, showToast } = useLibrary();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = users.find(u => u.id === editingUserId);
    setForm(user ? { name: user.name, membershipId: user.membershipId, role: user.role } : EMPTY);
    setError('');
  }, [editingUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const reset = () => { setEditingUserId(null); setForm(EMPTY); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const membershipId = form.membershipId.trim();
    const role = form.role;

    if (!name || !membershipId || !role) {
      setError('Please fill in every field.');
      return;
    }
    const dup = users.find(u => u.membershipId.toLowerCase() === membershipId.toLowerCase() && u.id !== editingUserId);
    if (dup) {
      setError('Membership ID "' + membershipId + '" is already in use by ' + dup.name + '.');
      return;
    }

    if (editingUserId) {
      const updated = { ...users.find(u => u.id === editingUserId), name, membershipId, role };
      setUsers(users.map(u => u.id === editingUserId ? updated : u));
      if (session.id === editingUserId) setSession(updated);
      showToast('Member updated.');
    } else {
      setUsers([...users, { id: makeId('u'), name, membershipId, role }]);
      showToast('Member added.');
    }
    reset();
  };

  return (
    <div className="panel">
      <div className="panel-head"><h2>{editingUserId ? 'Update member' : 'Add a member'}</h2></div>
      <form className="grid-form" onSubmit={handleSubmit}>
        <Field id="user-name" label="Full name">
          <input type="text" id="user-name" required value={form.name} onChange={set('name')} />
        </Field>
        <Field id="user-membership" label="Membership ID">
          <input type="text" id="user-membership" required value={form.membershipId} onChange={set('membershipId')} />
        </Field>
        <Field id="user-role" label="Role">
          <select id="user-role" required value={form.role} onChange={set('role')}>
            <option value="member">Member</option>
            <option value="admin">Librarian</option>
          </select>
        </Field>
        <div className="field form-actions">
          <button type="submit" className="btn btn-primary">{editingUserId ? 'Save changes' : 'Add member'}</button>
          {editingUserId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel edit</button>}
        </div>
        <FormError message={error} />
      </form>
    </div>
  );
}
