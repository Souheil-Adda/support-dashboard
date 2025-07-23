// Add this before your app.listen
app.post('/tickets', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tickets (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );

    const newTicket = result.rows[0];

    // Emit to all connected clients
    io.emit('new-ticket', newTicket);

    res.status(201).json(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
