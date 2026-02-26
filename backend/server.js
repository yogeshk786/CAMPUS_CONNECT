require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');


const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// ==================
// Middleware
// ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend URL (Vite default)
    credentials: true
  })
);

// ==================
// Routes
// ==================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

// ==================
// Root Route
// ==================
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Campus Connect API 🚀' });
});

// ==================
// Server
// ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});