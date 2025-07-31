const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Create HTTP server
const httpServer = createServer(app);



// Configure CORS for both Express and Socket.io
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));



/// Configure Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true
    }
});


// MongoDB Connection
mongoose.connect('mongodb+srv://souhailadda:lGm8ajt4Vyrf0sry@souheil33.vyhr2ru.mongodb.net/support-tickets?retryWrites=true&w=majority&appName=Souheil33')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err)
    );


// WebSocket connection handler
io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
        console.log(`❌ Client disconnected (${socket.id}): ${reason}`);
    });

    socket.on('error', (err) => {
        console.error(`⚠️ Socket error (${socket.id}):`, err);
    });
});

// Ticket Schema and Model
const ticketSchema = new mongoose.Schema({
    name: String,
    issue: String,
    priority: String,
    category: String,     // Add this
    confidence: Number,   // Add this
    createdAt: {          // Add this
        type: Date,
        default: Date.now
    }
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
        // 1. Get NLP categorization
        const { data } = await axios.post('http://127.0.0.1:5001/categorize', {
            text: req.body.issue
        });

        // 2. Create complete ticket
        const ticket = new Ticket({
            name: req.body.name,
            issue: req.body.issue,
            priority: req.body.priority,
            category: data.category,          // From NLP
            confidence: data.confidence,      // From NLP
            createdAt: new Date()             // Explicit timestamp
        });

        // 3. Save and respond
        await ticket.save();
        io.emit('newTicket', ticket);
        res.status(201).json(ticket);

    } catch (err) {
        console.error('Failed:', err);
        res.status(500).json({
            error: 'Ticket creation failed',
            details: err.message
        });
    }
});
// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});