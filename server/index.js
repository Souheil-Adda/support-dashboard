// backend/server.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let tickets = [];

app.post('/api/tickets', (req, res) => {
    console.log("Incoming ticket:", req.body); // 👈 log request body

    const { name, issue, priority } = req.body;

    if (!name || !issue || !priority) {
        console.log("Missing field(s)");
        return res.status(400).json({ error: "All fields required" });
    }

    const ticket = {
        id: Date.now(),
        name,
        issue,
        priority,
        createdAt: new Date().toISOString(),
    };

    tickets.push(ticket);
    res.status(201).json(ticket); // 👈 respond with JSON
});


// Handle GET request
app.get('/api/tickets', (req, res) => {
    res.json(tickets);
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
