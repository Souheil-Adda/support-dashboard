const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;

// Connect to MongoDB (replace <password> with your actual password)
mongoose.connect('mongodb+srv://souhailadda:lGm8ajt4Vyrf0sry@souheil33.vyhr2ru.mongodb.net/?retryWrites=true&w=majority&appName=Souheil33')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Ticket Schema (structure of data)
const ticketSchema = new mongoose.Schema({
    name: String,
    issue: String,
    priority: String,
    createdAt: String,
});

// Create Model (like a table in SQL)
const Ticket = mongoose.model('Ticket', ticketSchema);

app.use(cors());
app.use(express.json());

// GET /api/tickets - Fetch all tickets from DB
app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find(); // Get all tickets from DB
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// POST /api/tickets - Save new ticket to DB
app.post('/api/tickets', async (req, res) => {
    try {
        const ticket = new Ticket({
            name: req.body.name,
            issue: req.body.issue,
            priority: req.body.priority,
            createdAt: new Date().toISOString(),
        });
        await ticket.save(); // Save to DB
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});