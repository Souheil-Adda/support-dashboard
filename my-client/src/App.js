import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function App() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ name: '', issue: '', priority: 'Low' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');

  // Initialize Socket.io connection
  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');
    const socket = io('http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'], // Force WebSocket only
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setSocketStatus('connected');
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setSocketStatus('disconnected');
      setError('Realtime updates unavailable - attempting to reconnect...');
    });

    socket.on('newTicket', (ticket) => {
      console.log('📥 Received new ticket:', ticket);
      setTickets(prev => [...prev, ticket]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
    } catch (err) {
      setError(err.message);
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
            <li key={t._id || t.id}>
              <strong>{t.name}</strong>: {t.issue} ({t.priority})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;