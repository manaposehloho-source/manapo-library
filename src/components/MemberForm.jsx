import { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from './Field.jsx';
import FormError from './FormError.jsx';

const EMPTY = {
  name: '',
  membershipId: '',
  role: 'member'
};

export default function MemberForm() {
  const {
    users,
    session,
    setSession,
    editingUserId,
    setEditingUserId,
    addUser,
    updateUser,
    showToast
  } = useLibrary();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = users.find(
      u => String(u.id) === String(editingUserId)
    );

    setForm(
      user
        ? {
            name: user.name,
            membershipId: user.membershipId || '',
            role: user.role
          }
        : EMPTY
    );

    setError('');
  }, [editingUserId, users]);

  const set = field => e => {
    setForm({
      ...form,
      [field]: e.target.value
    });
  };

  const reset = () => {
    setEditingUserId(null);
    setForm(EMPTY);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const membershipId = form.membershipId.trim();
    const role = form.role;

    if (!name || !membershipId || !role) {
      setError('Please fill in every field.');
      return;
    }

    const duplicate = users.find(
      u =>
        String(u.membershipId || '').toLowerCase() ===
          membershipId.toLowerCase() &&
        String(u.id) !== String(editingUserId)
    );

    if (duplicate) {
      setError(
        'Membership ID "' +
          membershipId +
          '" is already in use by ' +
          duplicate.name +
          '.'
      );
      return;
    }

    setSaving(true);

    try {
      if (editingUserId !== null && editingUserId !== undefined) {
        const success = await updateUser(editingUserId, {
          name,
          membershipId,
          role
        });

        if (!success) {
          setError('Could not update member. Please try again.');
          return;
        }

        if (
          session &&
          String(session.id) === String(editingUserId)
        ) {
          setSession({
            ...session,
            name,
            membershipId,
            role
          });
        }

        showToast('Member updated.');
      } else {
        const created = await addUser({
          name,
          membershipId,
          role
        });

        if (!created) {
          setError('Could not add member. Please try again.');
          return;
        }
      }

      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>{editingUserId ? 'Update member' : 'Add a member'}</h2>
      </div>

      <form className="grid-form" onSubmit={handleSubmit}>
        <Field id="user-name" label="Full name">
          <input
            type="text"
            id="user-name"
            required
            value={form.name}
            onChange={set('name')}
          />
        </Field>

        <Field id="user-membership" label="Membership ID">
          <input
            type="text"
            id="user-membership"
            required
            value={form.membershipId}
            onChange={set('membershipId')}
          />
        </Field>

        <Field id="user-role" label="Role">
          <select
            id="user-role"
            required
            value={form.role}
            onChange={set('role')}
          >
            <option value="member">Member</option>
            <option value="admin">Librarian</option>
          </select>
        </Field>

        <div className="field form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : editingUserId
                ? 'Save changes'
                : 'Add member'}
          </button>

          {editingUserId && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={reset}
              disabled={saving}
            >
              Cancel edit
            </button>
          )}
        </div>

        <FormError message={error} />
      </form>
    </div>
  );
}