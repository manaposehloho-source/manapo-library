import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import FormError from '../components/FormError.jsx';

export default function Login() {
  const { setSession } = useLibrary();

  const [membershipId, setMembershipId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          membershipId: membershipId.trim(),
          name: name.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to sign in. Please try again.'
        );
      }

      setSession(data);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Make sure your backend is running.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="login-mark">Manapo Sehloho Library</p>

        <h1 className="login-title">
          Sign in to the catalogue
        </h1>

        <p className="login-sub">
          Enter your membership ID and name to continue.
        </p>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label htmlFor="login-membership">
            Membership ID
          </label>

          <input
            type="text"
            id="login-membership"
            placeholder="e.g. ADM-001"
            required
            autoComplete="off"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
          />

          <label htmlFor="login-name">Full name</label>

          <input
            type="text"
            id="login-name"
            placeholder="e.g. Thabo Mokoena"
            required
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <FormError message={error} />
        </form>

        <details className="login-help">
          <summary>New here or can't sign in?</summary>

          <p>
            Ask a librarian to register you before signing in.
          </p>

          <p className="seed-hint">
            Your membership ID and registered name are required.
          </p>
        </details>
      </div>
    </div>
  );
}