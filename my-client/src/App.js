import React, { useState, useEffect } from 'react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ name: '', issue: '', priority: 'Low' });
  const [error, setError] = useState(null); // New state for errors
  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to submit ticket');
      setForm({ name: '', issue: '', priority: 'Low' });
      await fetchTickets();
    } catch (err) {
      setError(err.message); // Show error to user
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/tickets');
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Submit a Support Ticket</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
        <input name="issue" placeholder="Describe the issue" value={form.issue} onChange={handleChange} required />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <h3>Ticket List</h3>
      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <ul>
          {tickets.map((t) => (
            <li key={t.id}>
              <strong>{t.name}</strong>: {t.issue} ({t.priority})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;