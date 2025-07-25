// server.js (minimal version)
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let tickets = [];

app.get('/api/tickets', (req, res) => {
    res.json(tickets);
});

app.post('/api/tickets', (req, res) => {
    const ticket = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    tickets.push(ticket);
    res.status(201).json(ticket);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});