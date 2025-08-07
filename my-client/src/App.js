import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import useTicketStore from './store';
import CategoryChart from './CategoryChart';


function App() {
  const [form, setForm] = useState({ name: '', issue: '', priority: 'Low' });
  const {
    tickets,
    loading,
    error,
    setTickets,
    addTicket,
    setLoading,
    setError,
    setSocketStatus,
    updateTicket
  } = useTicketStore();

  // Initialize Socket.io connection
  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');
    const socket = io('http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
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
    socket.on('ticketUpdated', (ticket) => {
      console.log('🔄 Ticket updated:', ticket);
      updateTicket(ticket);
    });


    socket.on('newTicket', (ticket) => {
      console.log('📥 Received new ticket:', ticket);
      addTicket(ticket);
    });

    return () => {
      socket.disconnect();
    };
  }, [addTicket, setError, setSocketStatus]); // ✅ add these dependencies

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id, update) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });

      if (!res.ok) throw new Error('Failed to update ticket');
      const updated = await res.json();
      // Update local state if needed here
    } catch (err) {
      setError(err.message);
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tickets.map((t) => (
            <li
              key={t._id || t.id}
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <p><strong>Name:</strong> {t.name}</p>
              <p><strong>Issue:</strong> {t.issue}</p>
              <p><strong>Priority:</strong> {t.priority}</p>
              <p><strong>Category:</strong> {t.category} ({Math.round(t.confidence * 100)}%)</p>

              {t.sentimentLabel && (
                <p>
                  <strong>Sentiment:</strong>{' '}
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor:
                        t.sentimentLabel === 'positive'
                          ? '#d4edda'
                          : t.sentimentLabel === 'negative'
                            ? '#f8d7da'
                            : '#fff3cd',
                      color:
                        t.sentimentLabel === 'positive'
                          ? '#155724'
                          : t.sentimentLabel === 'negative'
                            ? '#721c24'
                            : '#856404',
                      fontWeight: 'bold'
                    }}
                  >
                    {t.sentimentLabel.toUpperCase()}
                  </span>{' '}
                  ({t.sentimentScore?.toFixed(2)})
                </p>

              )}
              <p><strong>Status:</strong> {t.status || 'open'}</p>
              <p><strong>Assigned To:</strong> {t.assignedTo || 'Unassigned'}</p>

              <input
                placeholder="Assign to agent..."
                value={t.assignedTo || ''}
                onChange={e => handleUpdate(t._id || t.id, { assignedTo: e.target.value })}
              />

              <select
                value={t.status || 'open'}
                onChange={e => handleUpdate(t._id || t.id, { status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

            </li>
          ))}
        </ul>

      )}
      <CategoryChart />
    </div>
  );
}

export default App;