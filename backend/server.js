const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// We will define these shortly
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/lookbooks', require('./routes/lookbooks'));
app.use('/api/wardrobe', require('./routes/wardrobe'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/trends', require('./routes/trends'));
app.use('/api/recommendations', require('./routes/recommendations'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
