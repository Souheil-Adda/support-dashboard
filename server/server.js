const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5000;

// Create HTTP server
const httpServer = createServer(app);

// Configure Socket.io with CORS
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Change to your React app's port
        methods: ["GET", "POST"]
    }
});

// MongoDB Connection
mongoose.connect('mongodb+srv://souhailadda:lGm8ajt4Vyrf0sry@souheil33.vyhr2ru.mongodb.net/support-tickets?retryWrites=true&w=majority&appName=Souheil33')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Ticket Schema and Model
const ticketSchema = new mongoose.Schema({
    name: String,
    issue: String,
    priority: String,
    createdAt: String,
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Routes
app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

app.post('/api/tickets', async (req, res) => {
    try {
        const ticket = new Ticket({
            name: req.body.name,
            issue: req.body.issue,
            priority: req.body.priority,
            createdAt: new Date().toISOString(),
        });
        await ticket.save();

        // Emit the new ticket to all connected clients
        io.emit('newTicket', ticket);

        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});