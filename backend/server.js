require('dotenv').config();
const express = require('express');
const redisClient = require('./config/redis');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
// 👉 NAYE IMPORTS WEBSOCKET KE LIYE
const http = require('http'); 
const setupWebSocket = require('./socketServer'); // 👈 Apna naya module import kiya

const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
// 👉 FIX: Express app ko HTTP server mein wrap kiya
const server = http.createServer(app); 

// ==================
// Middleware
// ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], 
    credentials: true
}));

// ==================
// Routes
// ==================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
// 👉 FIX: Chat history aur messages ke liye naya route
app.use('/api/messages', require('./routes/messageRoutes')); 
app.use('/api/launchpad', require('./routes/launchpadRoutes'));

// ==================
// Root Route
// ==================
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Campus Connect API 🚀' });
});

// ==================
// 🟢 WEBSOCKET SETUP (LIVE CHAT)
// ==================
// 👈 Saara logic ab yahan ek simple line mein aa gaya!
setupWebSocket(server);

// ==================
// Server
// ==================
const PORT = process.env.PORT || 5000;

// 👉 FIX: Yahan 'app.listen' ki jagah 'server.listen' use hoga!
server.listen(PORT, () => {
  console.log(`🚀 Server & WebSocket running on http://localhost:${PORT}`);
});