import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import FormError from '../components/FormError.jsx';

export default function Login() {
  const { users, setSession } = useLibrary();
  const [membershipId, setMembershipId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = membershipId.trim().toLowerCase();
    const fullName = name.trim().toLowerCase();
    const match = users.find(u => u.membershipId.toLowerCase() === id && u.name.toLowerCase() === fullName);

    if (!match) {
      setError('We could not find a member with that ID and name. Check the details or ask a librarian to register you.');
      return;
    }
    setError('');
    setSession(match);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="login-mark">Manapo Sehloho Library</p>
        <h1 className="login-title">Sign in to the catalogue</h1>
        <p className="login-sub">Enter your membership ID and name to continue.</p>
        <form className="stacked-form" onSubmit={handleSubmit}>
          <label htmlFor="login-membership">Membership ID</label>
          <input type="text" id="login-membership" placeholder="e.g. ADM-001" required autoComplete="off"
            value={membershipId} onChange={e => setMembershipId(e.target.value)} />
          <label htmlFor="login-name">Full name</label>
          <input type="text" id="login-name" placeholder="e.g. Thabo Mokoena" required autoComplete="off"
            value={name} onChange={e => setName(e.target.value)} />
          <button type="submit" className="btn btn-primary">Sign in</button>
          <FormError message={error} />
        </form>
        <details className="login-help">
          <summary>New here or can't sign in?</summary>
          <p>Ask a librarian to register you, or use the starter admin account below on first run:</p>
          <p className="seed-hint">Membership ID <strong>ADM-001</strong> · Name <strong>Librarian</strong></p>
        </details>
      </div>
    </div>
  );
}
