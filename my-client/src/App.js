import React, { useState, useEffect } from 'react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ name: '', issue: '', priority: 'Low' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', issue: '', priority: 'Low' });
      await fetchTickets();
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tickets');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🛠 Submit a Support Ticket</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} /><br />
        <input name="issue" placeholder="Describe the issue" value={form.issue} onChange={handleChange} /><br />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select><br />
        <button type="submit">Submit</button>
      </form>

      <hr />
      <h3>📋 Ticket List</h3>
      <ul>
        {tickets.map(t => (
          <li key={t.id}>
            <strong>{t.name}</strong>: {t.issue} ({t.priority})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;